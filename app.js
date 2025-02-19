import { db } from "./db.js";
import dotenv from "dotenv";
import express from "express";

dotenv.config()

async function main() {
    await db.referral.create({
        data: {
            yourName: "ram rahim",
            yourEmail: "ram rahim@gmail.com",
            friendName: "Someone",
            friendEmail: "someone@email.com",
            program: "Web Development",
          },
    })

}


main().catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });


const app = express();

app.listen(3001, ()=>{
    console.log("running on server 3001 hello from gaurav, whatever bro")
})