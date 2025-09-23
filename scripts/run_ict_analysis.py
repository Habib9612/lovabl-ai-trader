import pandas as pd
from smartmoneyconcepts import smc
import sys
import json

def run_ict_analysis(ohlc_data_json):
    ohlc_data = json.loads(ohlc_data_json)
    df = pd.DataFrame(ohlc_data)

    # Ensure datetime index for proper time-series analysis if needed by smc
    # For simplicity, assuming data is already ordered by time.
    # If not, you might need to add a 'timestamp' column and set it as index:
    # df['timestamp'] = pd.to_datetime(df['timestamp'])
    # df = df.set_index('timestamp')

    # Calculate Swing Highs and Lows
    swing_highs_lows = smc.swing_highs_lows(df.copy(), swing_length=2)

    # Detect Order Blocks
    ob_df = smc.ob(df.copy(), swing_highs_lows)
    order_blocks = ob_df.dropna().to_dict(orient='records')

    # Detect Fair Value Gaps
    fvg_df = smc.fvg(df.copy())
    fair_value_gaps = fvg_df.dropna().to_dict(orient='records')

    # Detect Liquidity
    liquidity_df = smc.liquidity(df.copy(), swing_highs_lows)
    liquidity_zones = liquidity_df.dropna().to_dict(orient='records')

    # Detect Market Structure Shift (BOS & CHoCH)
    bos_choch_df = smc.bos_choch(df.copy(), swing_highs_lows)
    market_structure_shifts = bos_choch_df.dropna().to_dict(orient='records')

    return {
        "order_blocks": order_blocks,
        "fair_value_gaps": fair_value_gaps,
        "liquidity_zones": liquidity_zones,
        "market_structure_shifts": market_structure_shifts
    }

if __name__ == "__main__":
    # The script expects a single JSON string as an argument
    if len(sys.argv) > 1:
        ohlc_data_json = sys.argv[1]
        try:
            result = run_ict_analysis(ohlc_data_json)
            print(json.dumps(result))
        except Exception as e:
            print(json.dumps({"error": str(e)}), file=sys.stderr)
            sys.exit(1)
    else:
        print(json.dumps({"error": "No OHLC data provided."}), file=sys.stderr)
        sys.exit(1)

