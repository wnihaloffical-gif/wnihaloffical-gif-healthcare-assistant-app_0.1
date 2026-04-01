import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setupDatabase() {
  let connection;
  try {
    console.log('[v0] Connecting to MySQL database...');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      port: 1396,
      database: 'aarogyaguard'
    });

    console.log('[v0] Connected to database');

    // Read and execute the SQL migration
    const sqlFile = path.join(__dirname, '01_create_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      try {
        console.log(`[v0] Executing: ${statement.substring(0, 50)}...`);
        await connection.execute(statement);
      } catch (err) {
        // Ignore "table already exists" errors
        if (!err.message.includes('already exists')) {
          console.error(`[v0] Error executing statement: ${err.message}`);
        }
      }
    }

    console.log('[v0] Database tables created successfully');

    // Seed test data
    console.log('[v0] Seeding test data...');
    
    // Check if test data already exists
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    if (users[0].count === 0) {
      console.log('[v0] Creating test users...');
      
      // Create test doctor
      await connection.execute(
        'INSERT INTO users (email, name, passwordHash, role, specialization) VALUES (?, ?, ?, ?, ?)',
        [
          'doctor@example.com',
          'Dr. Raj Kumar',
          '$2a$10$YIjlrHmVRHnP8H8dJRnFwua6bVHYiDz0G0SpALyS2Z8zHJdMKYVZi', // password: password123
          'DOCTOR',
          'General Medicine'
        ]
      );

      // Create test patient
      await connection.execute(
        'INSERT INTO users (email, name, passwordHash, role) VALUES (?, ?, ?, ?)',
        [
          'patient@example.com',
          'Arjun Singh',
          '$2a$10$YIjlrHmVRHnP8H8dJRnFwua6bVHYiDz0G0SpALyS2Z8zHJdMKYVZi', // password: password123
          'PATIENT'
        ]
      );

      console.log('[v0] Test users created');
    } else {
      console.log('[v0] Test data already exists, skipping seed');
    }

    console.log('[v0] Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[v0] Database setup failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
