import pandas as pd
from smartmoneyconcepts import smc

# Sample data (replace with actual market data)
data = {
    'open': [100, 102, 101, 103, 105, 104, 106, 107, 108, 109, 110, 112, 111, 113, 115, 114, 116, 117, 118, 119, 120],
    'high': [103, 104, 103, 105, 107, 106, 108, 109, 110, 111, 112, 114, 113, 115, 117, 116, 118, 119, 120, 121, 122],
    'low': [99, 100, 99, 101, 103, 102, 104, 105, 106, 107, 108, 110, 109, 111, 113, 112, 114, 115, 116, 117, 118],
    'close': [102, 101, 103, 105, 104, 106, 107, 108, 109, 110, 111, 113, 112, 114, 115, 116, 117, 118, 119, 120, 121],
    'volume': [1000, 1200, 1100, 1300, 1500, 1400, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000]
}
df = pd.DataFrame(data)

# Calculate Swing Highs and Lows first, as it's a dependency for other functions
swing_highs_lows = smc.swing_highs_lows(df.copy(), swing_length=2)
print("Swing Highs and Lows:")
print(swing_highs_lows)

# Detect Order Blocks
ob_df = smc.ob(df.copy(), swing_highs_lows)
print("\nOrder Blocks:")
print(ob_df)

# Detect Fair Value Gaps
fvg_df = smc.fvg(df.copy())
print("\nFair Value Gaps:")
print(fvg_df)

# Detect Liquidity
liquidity_df = smc.liquidity(df.copy(), swing_highs_lows)
print("\nLiquidity:")
print(liquidity_df)

# Detect Market Structure Shift (BOS & CHoCH)
bos_choch_df = smc.bos_choch(df.copy(), swing_highs_lows)
print("\nBreak of Structure (BOS) & Change of Character (CHoCH):")
print(bos_choch_df)

# To integrate this with Deno, we would typically run this script as a subprocess
# and pass data to it, then capture its output.

