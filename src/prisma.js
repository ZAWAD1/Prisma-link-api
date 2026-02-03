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