// backend/routes/prediction.js
const express = require('express');
const axios = require('axios');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

// Address of the Python service, Docker Compose will resolve 'prediction_service'
const PREDICTION_SERVICE_URL = 'http://prediction_service:5001/predict';

router.post('/', authenticateToken, async (req, res) => {
    const { data_transform, target_column, potential_features } = req.body;

    // Updated validation to check 'potential features' as well
    if (!data_transform || !target_column || !potential_features) {
        return res.status(400).json({ message: 'Data (data_transform), target column (target_column), and list of features (potential_features) are required.' });
    }

    console.log(`[Backend] Get prediction request column: ${target_column}`);

    try {
        // Forward requests to Python service
        const predictionResponse = await axios.post(PREDICTION_SERVICE_URL, {
            data_transform: data_transform,
            target_column: target_column,
            potential_features: potential_features
        }, {
            timeout: 180000 // max 3 min
        });

        // Return results from Python service to client
        console.log('[Backend] Received results from prediction service, sent to client.');
        res.json(predictionResponse.data);

    } catch (error) {
        console.error('[Backend] Error calling prediction service:', error.message);

        if (error.response) {
            console.error('Error from prediction service:', error.response.data);
            return res.status(error.response.status).json({
                message: 'Service predicts return error.',
                details: error.response.data
            });
        } else if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ message: 'Unable to connect to the prediction service. The service may be down..' });
        } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
            return res.status(504).json({ message: 'The request to the prediction service has timed out. The task may be too complex or taking longer than expected..' });
        }
        else {
            return res.status(500).json({ message: 'Internal error of backend when communicating with prediction service.' });
        }
    }
});

module.exports = router;