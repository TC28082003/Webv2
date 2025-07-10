# prediction_service.py

import pandas as pd
from itertools import combinations, islice
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score
import warnings
from tqdm import tqdm

# Suppress unnecessary warnings from scikit-learn
warnings.filterwarnings('ignore', category=UserWarning)


def run_dynamic_prediction(data_transform, target_column, potential_features, num_features_in_combo=5,
                           num_combinations_to_check=300):
    try:
        # --- Stage 1: Convert input data to DataFrame ---
        header = data_transform[0]
        data = data_transform[1:]
        df = pd.DataFrame(data, columns=header)

        # --- Stage 2: Prepare data ---
        # Keep only necessary columns (user selected features + target)
        columns_to_use = potential_features + [target_column]
        df_subset = df[columns_to_use]

        # Convert to numeric, invalid values will be NaN
        df_numeric = df_subset.apply(pd.to_numeric, errors='coerce')

        # --- Stage 3: Create Feature Combinations ---
        # Check if there are enough features to create a combination
        if len(potential_features) < num_features_in_combo:
            return {
                "error": f"Please select at least {num_features_in_combo} features. You selected {len(potential_features)}."}

        print(
            f"Generating combinations of {num_features_in_combo} features from the {len(potential_features)} provided.")

        # Create an iterator for the combinations
        comb_iterator = combinations(potential_features, num_features_in_combo)

        # Limit the number of combinations to check to avoid long waiting times
        combinations_to_process = islice(comb_iterator, num_combinations_to_check)

        # --- Stage 4: Iterate through the combinations, train and find the best model ---
        best_r2 = -float('inf')
        best_features_combo = None
        best_predictions_sample = None
        best_model_data_points = 0

        print(f"Starting to process up to {num_combinations_to_check} feature combinations...")
        # Use tqdm to monitor progress on server console
        for feature_combo in tqdm(list(combinations_to_process), desc="Analyzing Feature Combos"):
            current_cols = list(feature_combo) + [target_column]
            df_cleaned = df_numeric[current_cols].dropna()

            if len(df_cleaned) < 20:
                continue

            X = df_cleaned[list(feature_combo)]
            y = df_cleaned[target_column]

            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

            if len(X_test) == 0:
                continue

            model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=2)
            model.fit(X_train, y_train)

            y_pred = model.predict(X_test)
            current_r2 = r2_score(y_test, y_pred)

            if current_r2 > best_r2:
                best_r2 = current_r2
                best_features_combo = feature_combo
                best_model_data_points = len(df_cleaned)

                # Save a few predictions from the best model
                predictions_df = pd.DataFrame({'Actual': y_test, 'Predicted': y_pred})
                best_predictions_sample = predictions_df.head(100).to_dict('records')

        # --- Stage 5: Returns the result of the best combination ---
        if best_features_combo is None:
            return {"error": "Could not find any valid feature combination with enough data to train a model."}

        print(f"\n--- BEST COMBINATION FOUND ---")
        print(f"Features: {list(best_features_combo)}")
        print(f"R-squared: {best_r2:.4f}")

        result = {
            "r2_score": best_r2,
            "data_points_used": best_model_data_points,
            "best_features": list(best_features_combo),  # This is the best combination of children
            "predictions": best_predictions_sample
        }

        return result

    except KeyError as e:
        return {"error": f"Invalid column name provided: {e}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred during prediction: {str(e)}"}