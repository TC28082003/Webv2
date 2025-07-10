// backend/routes/interactivePrediction.js
const express = require('express');
const axios = require('axios');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Python service for interactive prediction
const PREDICTION_SERVICE_URL = 'http://prediction_service:5001/predict_single';

router.post('/', authenticateToken, async (req, res) => {
    const { data_transform, target_column, best_features, user_input } = req.body;

    // Validation
    if (!data_transform || !target_column || !best_features || !user_input) {
        return res.status(400).json({ message: 'Missing required fields for interactive prediction.' });
    }

    console.log('[Backend] Forwarding interactive prediction request to Python service.');

    try {
        // Forward requests to Python service
        const predictionResponse = await axios.post(PREDICTION_SERVICE_URL, {
            data_transform,
            target_column,
            best_features,
            user_input
        });

        // Return results from Python to frontend
        res.json(predictionResponse.data);

    } catch (error) {
        console.error('[Backend] Error calling interactive prediction service:', error.message);
        if (error.response) {
            return res.status(error.response.status).json({
                message: 'Prediction service returned an error.',
                details: error.response.data
            });
        }
        return res.status(500).json({ message: 'Internal backend error.' });
    }
});

module.exports = router;