import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
const db = new PrismaClient();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendEmail = async (recipient, subject, text) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipient,
    subject,
    text,
  });
};


app.post(
  "/api/referrals",
  [
    body("yourName").notEmpty().withMessage("Your name is required"),
    body("yourEmail").isEmail().withMessage("Invalid email"),
    body("friendEmail").isEmail().withMessage("Invalid friend's email"),
    body("program").notEmpty().withMessage("Program is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { yourName, yourEmail, friendName, friendEmail, program } = req.body;
      const existingReferral = await db.referral.findFirst({
        where: { yourEmail },
      });

      if (existingReferral) {
        return res.status(400).json({ error: "Referral already exists." });
      }

      const newReferral = await db.referral.create({
        data: { yourName, yourEmail, friendName, friendEmail, program },
      });

      await sendEmail(
        friendEmail,
        "You Have Been Referred!",
        `Hi ${friendName},\n\n${yourName} has referred you for the ${program} program!`
      );

      res.status(201).json({ message: "Referral created successfully!", referral: newReferral });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

app.get("/api/referrals", async (req, res) => {
  try {
    const referralData = await db.referral.findMany();
    res.status(200).json(referralData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to retrieve referrals." });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
