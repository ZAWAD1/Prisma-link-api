import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import prisma from "./prisma.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany();
    if(!users){
        return res.status(404).json({error: "No users found"});
    }
    res.json(users);
});

app.post("/users", async (req, res) => {
    const user = await prisma.user.create({
        data: req.body,
    });
    res.json(user);
});

await prisma.$connect();
console.log("Connected to the database");

app.listen(5001, () => {
    console.log("Server is running on http://localhost:5001");
});