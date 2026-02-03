// prisma.js is same as db.js, only better. It gives the prisma client instance to interact with the database.
// No multi-instance issues like in db.js
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const {Pool} = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:true,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
    adapter: adapter,
});

export default prisma;