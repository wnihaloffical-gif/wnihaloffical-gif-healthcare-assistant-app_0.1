# Database Setup Instructions - AarogyaGuard

## Critical Issue
The Prisma schema has been changed from MongoDB to MySQL, but the migrations haven't been applied and the seed script hasn't been run. This is why login is failing - there are no users in the database.

## Step-by-Step Fix

### 1. Ensure MySQL is Running
Make sure MySQL is running on localhost:3306. You can verify with:
```bash
mysql -u root -p -e "SELECT 1"
```

### 2. Create the Database (if it doesn't exist)
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS aarogyaguard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. Regenerate Prisma Client
```bash
npx prisma generate
```

### 4. Apply Database Migrations
```bash
npx prisma migrate dev --name init
```
This will:
- Create all MySQL tables (users, consultations, blockchain_records, etc.)
- Generate the Prisma client for MySQL
- You may see warnings - these are normal and safe to ignore

### 5. Seed the Database with Test Users
```bash
npm run db:seed
```
This creates 3 test users:
- patient@example.com / patient123
- doctor@example.com / doctor123
- admin@example.com / admin123

### 6. Start the Application
```bash
npm run dev
```

### 7. Login
Navigate to http://localhost:3000 and login with one of the credentials above.

## Troubleshooting

**Error: "Unknown authentication plugin sha256_password"**
- This is already fixed in `.env` with `authPlugin=mysql_native_password`
- Make sure `.env` file exists and has the correct DATABASE_URL

**Error: "user not found or role mismatch"**
- This means the seed script hasn't been run
- Run `npm run db:seed` again

**Error: "Cannot find module prisma"**
- Run `npm install` to install all dependencies

**Tables don't exist**
- Run `npx prisma migrate dev --name init` to create all tables

## Expected Output After Setup

After running all commands, you should see:
```
[SEED] Starting database seeding...
[SEED] Cleared existing data
[SEED] Created patient user: patient@example.com
[SEED] Created doctor user: doctor@example.com
[SEED] Created admin user: admin@example.com
[SEED] Database seeding completed successfully!

--- Login Credentials ---
Patient: patient@example.com / patient123
Doctor: doctor@example.com / doctor123
Admin: admin@example.com / admin123
```

Then you can login and use the application!
