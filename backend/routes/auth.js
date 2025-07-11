// backend/routes/auth.js (Phiên bản cho PostgreSQL)

const express = require('express');
const bcrypt = require('bcrypt');
const jwt =require('jsonwebtoken');
const pool = require('../db'); // Database connection pool
require('dotenv').config();

const router = express.Router();
const saltRounds = 10;

// --- Registration ---
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    let client;
    try {
        client = await pool.connect(); // Lấy một client từ pool

        // Kiểm tra người dùng đã tồn tại chưa
        const { rows: existingUsers } = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: "Email address is already registered." });
        }

        const passwordHash = await bcrypt.hash(password, saltRounds);

        await client.query('BEGIN'); // Bắt đầu transaction

        // Thêm người dùng mới, RETURNING id để lấy lại ID vừa tạo
        const { rows: newUserRows } = await client.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
            [email, passwordHash]
        );
        const newUserId = newUserRows[0].id;

        // Tạo bản ghi dữ liệu người dùng
        await client.query(
            'INSERT INTO user_data (user_id, saved_profiles, saved_profiles_parent, last_visited_profile, virtual_profiles, virtual_profiles_data) VALUES ($1, $2, $3, $4, $5, $6)',
            [newUserId, '{}', '{}', '', '{}', '{}']
        );

        await client.query('COMMIT'); // Hoàn tất transaction

        console.log(`User registered successfully: ${email} (ID: ${newUserId})`);
        res.status(201).json({ message: "User registered successfully. You can now log in." });

    } catch (error) {
        if (client) await client.query('ROLLBACK'); // Hoàn tác nếu có lỗi
        console.error("Registration Error:", error);
        res.status(500).json({ message: "An internal server error occurred during registration." });
    } finally {
        if (client) client.release(); // Luôn giải phóng client về pool
    }
});

// --- Login ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Tìm người dùng bằng email
        const { rows: users } = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);

        if (users.length === 0) {
            console.log(`Login attempt failed for email: ${email} (User not found)`);
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const user = users[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordMatch) {
            console.log(`Login attempt failed for email: ${email} (Incorrect password)`);
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const jwtPayload = { id: user.id, email: user.email };
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log(`User logged in successfully: ${email} (ID: ${user.id})`);
        res.json({
            message: "Login successful!",
            token: token,
            user: { id: user.id, email: user.email }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "An internal server error occurred during login." });
    }
});

const authenticateToken = require('../middleware/authMiddleware');

router.get('/status', authenticateToken, async (req, res) => {
    try {
        const { rows: users } = await pool.query('SELECT id, email FROM users WHERE id = $1', [req.userId]);

        if (users.length === 0) {
            console.warn(`Auth Status Check: User ID ${req.userId} from valid token not found in DB.`);
            return res.status(404).json({ message: "User associated with token not found." });
        }
        
        res.json({
            isLoggedIn: true,
            user: { id: users[0].id, email: users[0].email }
        });
    } catch (error) {
        console.error("Auth Status Check Error:", error);
        res.status(500).json({ message: "Internal server error checking authentication status." });
    }
});

module.exports = router;
