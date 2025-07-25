// backend/routes/userData.js (Phiên bản cho PostgreSQL)

const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// --- GET User Profile Data ---
router.get('/profile', authenticateToken, async (req, res) => {
    const userId = req.userId;
    console.log(`Fetching profile data for user ID: ${userId}`);

    try {
        // PostgreSQL trả về kiểu JSONB trực tiếp, không cần parse
        const { rows } = await pool.query('SELECT * FROM user_data WHERE user_id = $1', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: `No data found for user ID: ${userId}`});
        }

        const userData = rows[0];

        // Trả về dữ liệu, nếu một trường là null, trả về object rỗng
        res.json({
            savedProfiles: userData.saved_profiles || {},
            savedprofilesparent: userData.saved_profiles_parent || {},
            lastVisitedProfile: userData.last_visited_profile || '',
            virtualProfiles: userData.virtual_profiles || {},
            virtualProfilesData: userData.virtual_profiles_data || {}
        });

    } catch (error) {
        console.error(`Error fetching profile data for user ${userId}:`, error);
        res.status(500).json({ message: "Internal server error fetching user profile data." });
    }
});

// --- PUT (Update) User Profile Data ---
router.put('/profile', authenticateToken, async (req, res) => {
    const userId = req.userId;
    console.log(`Updating profile data for user ID: ${userId}`);

    const {
        savedProfiles,
        savedprofilesparent,
        lastVisitedProfile,
        virtualProfiles,
        virtualProfilesData
     } = req.body;

     if (savedProfiles === undefined || savedprofilesparent === undefined ||
         lastVisitedProfile === undefined || virtualProfiles === undefined ||
         virtualProfilesData === undefined) {
        return res.status(400).json({ message: "Invalid request body: Missing required user data fields." });
     }

    try {
        // Cú pháp INSERT ... ON CONFLICT của PostgreSQL (UPSERT)
        const sql = `
            INSERT INTO user_data (
                user_id, saved_profiles, saved_profiles_parent,
                last_visited_profile, virtual_profiles, virtual_profiles_data
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id) DO UPDATE SET
                saved_profiles = EXCLUDED.saved_profiles,
                saved_profiles_parent = EXCLUDED.saved_profiles_parent,
                last_visited_profile = EXCLUDED.last_visited_profile,
                virtual_profiles = EXCLUDED.virtual_profiles,
                virtual_profiles_data = EXCLUDED.virtual_profiles_data,
                updated_at = CURRENT_TIMESTAMP
        `;

        const values = [
            userId,
            savedProfiles || {},
            savedprofilesparent || {},
            lastVisitedProfile || '',
            virtualProfiles || {},
            virtualProfilesData || {}
        ];

        await pool.query(sql, values);

        console.log(`User data updated successfully for user ${userId}.`);
        res.json({ message: "User data updated successfully." });

    } catch (error) {
        console.error(`Error updating profile data for user ${userId}:`, error);
        res.status(500).json({ message: "Internal server error updating user profile data." });
    }
});

module.exports = router;
