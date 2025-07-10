# prediction_service/interactive_prediction_service.py
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import warnings

warnings.filterwarnings('ignore', category=UserWarning)


def train_and_predict_single(data_transform, target_column, best_features, user_input):
    """
    Retrain the model on all clean data with the best features and predict a new data point provided by the user.
    """
    try:
        # --- Stage 1: Prepare data from data_transform ---
        header = data_transform[0]
        data = data_transform[1:]
        df = pd.DataFrame(data, columns=header)
        df.columns = df.columns.str.strip()

        # Use only the necessary columns
        columns_to_use = best_features + [target_column]
        df_subset = df[columns_to_use]

        # Convert to numbers and remove invalid lines (Nan)
        df_cleaned = df_subset.apply(pd.to_numeric, errors='coerce').dropna()

        if len(df_cleaned) < 10:
            return {"error": "Not enough clean data to build a reliable model."}

        # --- Stage 2: Train the model in-place on ALL clean data ---
        X_train = df_cleaned[best_features]
        y_train = df_cleaned[target_column]

        model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=2)
        model.fit(X_train, y_train)

        # --- Stage 3: Input Data Preparation and Prediction ---
        # Convert user input dictionary to DataFrame
        input_df = pd.DataFrame([user_input])

        # Make sure the columns in input_df are in the same order as when training
        input_df = input_df[best_features]

        # Convert input data type and check for errors
        input_df = input_df.apply(pd.to_numeric, errors='coerce')
        if input_df.isnull().values.any():
            return {"error": "Invalid input values. Please ensure all inputs are numbers."}

        # Make predictions
        prediction = model.predict(input_df)

        return {"predicted_value": prediction[0]}

    except KeyError as e:
        return {"error": f"A feature name mismatch occurred: {e}"}
    except Exception as e:
        return {"error": f"An unexpected server error occurred: {str(e)}"}