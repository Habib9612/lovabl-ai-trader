import json
import sys

def simulate_lstm_predictions(data_json):
    data = json.loads(data_json)
    
    # Extract close prices directly from the JSON data
    close_prices = data.get("close", [])
    
    # For simulation, we'll just return a simple projection based on the last few closing prices
    if len(close_prices) < 5:
        # Not enough data to even simulate a trend, return a placeholder
        return [close_prices[-1]] * 5 if close_prices else [100.0, 101.0, 102.0, 103.0, 104.0]

    last_prices = close_prices[-5:]
    
    # Simple linear projection for demonstration
    simulated_predictions = []
    # Calculate average change from the last few prices
    if len(last_prices) > 1:
        avg_change = sum(last_prices[i] - last_prices[i-1] for i in range(1, len(last_prices))) / (len(last_prices) - 1)
    else:
        avg_change = 1.0 # Default if only one price point

    for i in range(1, 6): # Predict 5 future points
        next_pred = last_prices[-1] + (avg_change * i)
        simulated_predictions.append(float(next_pred))
        
    return simulated_predictions

if __name__ == "__main__":
    if len(sys.argv) > 1:
        data_json = sys.argv[1]
        try:
            predictions = simulate_lstm_predictions(data_json)
            print(json.dumps({"predictions": predictions}))
        except Exception as e:
            print(json.dumps({"error": str(e)}), file=sys.stderr)
            sys.exit(1)
    else:
        print(json.dumps({"error": "No data provided for LSTM."}), file=sys.stderr)
        sys.exit(1)

