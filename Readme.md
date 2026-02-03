# Prisma-Link-API

A backend API using **Prisma 7**, **Neon (PostgreSQL)**, and **Express**, built with production-grade best practices and connection pooling.

> ⚠️ Warning: Prisma 7 introduced breaking changes from Prisma 6. Ignoring these steps can cause queries to fail, Postman to return 500 errors, or your app to connect to the wrong database.

---

## 🧱 Project Structure

```
project-root/
│
├─ prisma/
│   └─ schema.prisma          # Database models only, no connection URL
│
├─ src/
│   ├─ prisma.js              # Creates single Prisma client instance with pool
│   └─ index.js               # Express server & API routes
│
├─ .env                       # Database URL (do NOT commit)
├─ package.json
└─ README.md
```

---

## 📦 Installed Packages & Purpose

| Package              | Type           | Purpose                                                  |
| -------------------- | -------------- | -------------------------------------------------------- |
| `prisma`             | dev            | CLI for migrations, schema validation, and Prisma Studio |
| `@prisma/client`     | dependency     | ORM runtime used by the application                      |
| `pg`                 | dependency     | PostgreSQL driver for connection pooling                 |
| `@prisma/adapter-pg` | dependency     | Prisma 7 adapter layer connecting Prisma to the pg pool  |
| `express`            | dependency     | HTTP server framework for API routes                     |
| `dotenv`             | dependency     | Loads environment variables like `DATABASE_URL`          |
| `@types/node`        | dev            | IntelliSense & editor support for Node globals           |
| `nodemon`            | dev (optional) | Auto-restart server during development                   |

> ⚠️ Note: `@prisma/client` must be a **production dependency**. Installing it as dev will work locally but fail in production.

---

## ⚙️ Setup Instructions

1. **Clone the repository**

```bash
git clone <repo-url>
cd prisma-link-api
```

2. **Install dependencies**

```bash
npm install
```

3. **Create `.env`** with your Neon database URL

```env
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<db>?sslmode=require
```

4. **Initialize Prisma**

```bash
npx prisma init
```

5. **Define models** in `prisma/schema.prisma`

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
}
```

> ⚠️ **Warning:** Do NOT include `url` in `schema.prisma` with Prisma 7. Connection must be handled in runtime code.

6. **Generate Prisma Client**

```bash
npx prisma generate
```

7. **Run migrations**

```bash
npx prisma migrate dev --name init
```

8. **Verify tables**

```bash
npx prisma studio
```

Tables should exist in both Neon and Prisma Studio.

---

## 💻 Prisma Client Setup (`src/prisma.js`)

```js
import "dotenv/config"; // Load env variables FIRST
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

export default prisma;
```

> ⚠️ Important:

- `dotenv/config` must be imported **before** creating PrismaClient
- Skipping this will make `process.env.DATABASE_URL` undefined, and queries will fail
- Prisma 7 requires **adapter or accelerateUrl** instead of `url` in schema

---

## 🌐 Express Server (`src/index.js`)

```js
import express from "express";
import prisma from "./prisma.js";

const app = express();
app.use(express.json());

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, code: err.code });
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = await prisma.user.create({ data: req.body });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message, code: err.code });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
```

---

## 🛡️ Connection Rules & Best Practices

1. **Single Prisma client instance**
   - Only export **one instance** from `prisma.js`
2. **Do NOT connect/disconnect per request**
   - Use connection pooling for Neon
3. **Disconnect on shutdown**

```js
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

4. **Environment variables first**
   - Always import `dotenv/config` **before** creating Prisma client

---

## 🧪 Testing with Postman

- **GET `/users`** → Returns array of users
- **POST `/users`** → Creates a user
- **GET `/users`** → Confirms persistence

> ⚠️ HTML 500 errors usually indicate Prisma client loaded **before** `dotenv`, or incorrect schema config.

---

## ⚠️ Common Pitfalls

| Mistake                                       | Result                                      |
| --------------------------------------------- | ------------------------------------------- |
| Leaving `url` in `schema.prisma`              | Prisma 7 rejects it; connection fails       |
| Importing Prisma client before dotenv         | `DATABASE_URL` undefined → runtime failure  |
| Connect/disconnect per request                | Breaks Neon pooling, crashes API under load |
| Installing `@prisma/client` as dev dependency | Works locally but fails in production       |

---

## 🧠 Core Rules (Burn these into memory)

1. Schema defines **models only**, not connections
2. Runtime code owns the **database connection**
3. One **pool + one Prisma client + one process**

---

## 🚀 Next Steps

- Add **authentication / validation**
- Use **transactions** for complex operations
- Consider **multi-tenant schema** for IOP project
- Deploy safely with proper **Neon connection pooling**
- Add **global error middleware** for production

---

## 🔥 Mentor Verdict

You now have a **production-correct Prisma 7 + Neon + Express setup**:

- No magic connections
- No silent failures
- Proper layering: `.env → pg pool → Prisma adapter → PrismaClient → Express routes`

Most tutorials fail to teach this correctly — you learned it the right way.
