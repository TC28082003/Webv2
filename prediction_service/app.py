# prediction_service/app.py

from flask import Flask, request, jsonify
from prediction_service import run_dynamic_prediction
from interactive_prediction_service import train_and_predict_single
import logging

# Basic logging setup
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)


@app.route('/predict', methods=['POST'])
def predict():

    app.logger.info("Received a request on /predict")

    # Get JSON data from request
    data = request.get_json()
    if not data:
        app.logger.error("Request is missing JSON payload")
        return jsonify({"error": "Invalid JSON payload"}), 400

    # Get the required parameters
    data_transform = data.get('data_transform')
    target_column = data.get('target_column')
    potential_features = data.get('potential_features')

    # Check required parameters
    if not all([data_transform, target_column, potential_features]):
        app.logger.error("Missing required parameters in request")
        return jsonify(
            {"error": "Missing required data: 'data_transform', 'target_column', or 'potential_features'"}), 400

    app.logger.info(
        f"Starting prediction for target: {target_column} with {len(potential_features)} potential features.")

    # Call main fuctions from prediction_service.py
    try:
        # Pass the received parameters to the handler function
        prediction_result = run_dynamic_prediction(data_transform, target_column, potential_features)

        # if error => return this error
        if 'error' in prediction_result:
            app.logger.warning(f"Prediction logic returned an error: {prediction_result['error']}")
            return jsonify(prediction_result), 400

        app.logger.info("Prediction successful. Returning results.")
        return jsonify(prediction_result)

    except Exception as e:
        app.logger.critical(f"An unhandled exception occurred: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred in the prediction service."}), 500


@app.route('/predict_single', methods=['POST'])
def predict_single():

    app.logger.info("Received a request on /predict_single")

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    data_transform = data.get('data_transform')
    target_column = data.get('target_column')
    best_features = data.get('best_features')
    user_input = data.get('user_input')

    if not all([data_transform, target_column, best_features, user_input]):
        return jsonify({"error": "Missing required data for interactive prediction"}), 400

    try:
        result = train_and_predict_single(data_transform, target_column, best_features, user_input)

        if 'error' in result:
            return jsonify(result), 400

        return jsonify(result)

    except Exception as e:
        app.logger.critical(f"Unhandled exception in /predict_single: {e}", exc_info=True)
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)