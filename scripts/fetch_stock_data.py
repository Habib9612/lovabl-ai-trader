import sys
sys.path.append("/opt/.manus/.sandbox-runtime")
from data_api import ApiClient
import json
import pandas as pd

def fetch_stock_data(symbol, interval, range_val):
    client = ApiClient()
    try:
        response = client.call_api("YahooFinance/get_stock_chart", query={
            "symbol": symbol,
            "region": "US",
            "interval": interval,
            "range": range_val,
            "includeAdjustedClose": True
        })
        
        if response and "chart" in response and "result" in response["chart"]:
            result = response["chart"]["result"][0]
            timestamps = result["timestamp"]
            quotes = result["indicators"]["quote"][0]
            
            data = {
                "timestamp": timestamps,
                "open": quotes["open"],
                "high": quotes["high"],
                "low": quotes["low"],
                "close": quotes["close"],
                "volume": quotes["volume"],
            }
            
            df = pd.DataFrame(data)
            # Drop rows with NaN values that might appear if data is incomplete
            df = df.dropna()
            
            # Convert timestamps to datetime objects if needed for further processing
            # df["timestamp"] = pd.to_datetime(df["timestamp"], unit="s")
            
            return df.to_json(orient="records")
        else:
            return json.dumps({"error": "No data found for the given symbol and range."})
            
    except Exception as e:
        return json.dumps({"error": str(e)})

if __name__ == "__main__":
    if len(sys.argv) > 3:
        symbol = sys.argv[1]
        interval = sys.argv[2]
        range_val = sys.argv[3]
        
        data = fetch_stock_data(symbol, interval, range_val)
        print(data)
    else:
        print(json.dumps({"error": "Usage: python fetch_stock_data.py <symbol> <interval> <range>"}), file=sys.stderr)
        sys.exit(1)

