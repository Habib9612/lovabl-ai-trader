# Financial AI Training Pipeline

This comprehensive Python system trains advanced AI models for financial trading and market analysis. It includes multiple machine learning approaches, feature engineering, backtesting, and model evaluation.

## 🚀 Features

### Data Collection
- **Real-time Market Data**: Yahoo Finance, Alpha Vantage, Finnhub
- **Economic Indicators**: FRED (Federal Reserve Economic Data)
- **News Sentiment**: NewsAPI integration with TextBlob analysis
- **Technical Indicators**: 20+ technical analysis indicators using TA-Lib

### AI Models
- **LSTM Networks**: Deep learning for time series prediction
- **Transformer Models**: Attention-based market analysis
- **Ensemble Methods**: Random Forest, XGBoost, LightGBM
- **Reinforcement Learning**: Q-learning for trading strategies

### Advanced Features
- **Feature Engineering**: 50+ engineered features including lagged variables, rolling statistics, and interaction terms
- **Backtesting Engine**: Comprehensive performance evaluation with risk metrics
- **Model Ensemble**: Weighted combination of multiple algorithms
- **Risk Management**: Drawdown analysis, Sharpe ratio, volatility metrics

## 📦 Installation

```bash
# Create virtual environment
python -m venv financial_ai_env
source financial_ai_env/bin/activate  # On Windows: financial_ai_env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install TA-Lib (requires compilation)
# On Ubuntu/Debian:
sudo apt-get install ta-lib
# On macOS:
brew install ta-lib
# On Windows: Download from https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib
```

## 🔧 Configuration

1. **API Keys**: Update the `API_KEYS` dictionary in `main()` with your keys:
   ```python
   API_KEYS = {
       'finnhub': 'your_finnhub_key',
       'alpha_vantage': 'your_alpha_vantage_key', 
       'news_api': 'your_news_api_key'
   }
   ```

2. **Symbols**: Modify the `SYMBOLS` list to train on your preferred stocks:
   ```python
   SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
   ```

## 🏃‍♂️ Usage

### Basic Training
```bash
python financial_ai_trainer.py
```

### Custom Training
```python
from financial_ai_trainer import FinancialAITrainer

# Initialize with custom symbols
trainer = FinancialAITrainer(['AAPL', 'TSLA'], api_keys)

# Collect data
data = trainer.collect_all_data()

# Train models
trainer.train_all_models(data)

# Generate predictions
signals = trainer.generate_trading_signals('AAPL')
print(signals)
```

## 📊 Model Architecture

### 1. LSTM Network
```
Input(60, features) → LSTM(50) → Dropout(0.2) → 
LSTM(50) → Dropout(0.2) → LSTM(50) → Dense(25) → Dense(1)
```

### 2. Transformer Model
```
Input → MultiHeadAttention → LayerNorm → 
FeedForward → LayerNorm → GlobalAvgPool → Dense(1)
```

### 3. Ensemble Methods
- Random Forest (100 estimators)
- XGBoost with early stopping
- LightGBM with optimized parameters
- Weighted voting based on validation performance

## 🎯 Feature Engineering

### Technical Indicators
- Moving Averages (SMA, EMA): 20, 50, 200 periods
- Momentum: RSI, MACD, ROC, Williams %R
- Volatility: Bollinger Bands, ATR
- Trend: ADX, CCI

### Custom Features
- Price position in range
- Volume ratios and patterns
- Lagged variables (1, 2, 3, 5, 10 days)
- Rolling statistics (mean, std, skew, kurtosis)
- Interaction terms between indicators

### Market Structure
- Support/resistance levels
- Market regime indicators
- Sector rotation signals
- Economic indicator correlations

## 📈 Backtesting Results

The system provides comprehensive backtesting with metrics:
- **Total Return**: Absolute performance
- **Sharpe Ratio**: Risk-adjusted returns
- **Maximum Drawdown**: Worst peak-to-trough decline
- **Volatility**: Annualized standard deviation
- **Win Rate**: Percentage of profitable trades

Example output:
```json
{
  "total_return": 15.4,
  "annualized_return": 12.3,
  "sharpe_ratio": 1.8,
  "max_drawdown": 8.2,
  "volatility": 18.5
}
```

## 🔮 Integration with Web App

### Export Models
The system exports trained models in multiple formats:
- Pickle files for sklearn models
- TensorFlow SavedModel for deep learning
- JSON results for easy API integration

### Real-time Predictions
Use the exported models in your Supabase edge functions:
```javascript
// Example edge function integration
const prediction = await supabase.functions.invoke('ai-prediction', {
  body: { symbol: 'AAPL', model_type: 'ensemble' }
});
```

## 🔄 Automated Training

Set up automated retraining with cron jobs:
```bash
# Daily retraining at 6 PM EST
0 18 * * * cd /path/to/ai_training && python financial_ai_trainer.py
```

## 📊 Performance Monitoring

### Model Drift Detection
- Track prediction accuracy over time
- Monitor feature importance changes
- Alert on significant performance degradation

### A/B Testing
- Compare multiple model versions
- Gradual rollout of new models
- Performance comparison metrics

## 🛡️ Risk Management

### Position Sizing
- Kelly Criterion for optimal bet sizing
- Maximum position limits
- Correlation-based diversification

### Stop Losses
- Technical stop losses based on ATR
- Time-based exits
- Volatility-adjusted stops

## 🚀 Advanced Usage

### Hyperparameter Optimization
```python
import optuna

def objective(trial):
    # Hyperparameter tuning with Optuna
    n_estimators = trial.suggest_int('n_estimators', 50, 200)
    max_depth = trial.suggest_int('max_depth', 3, 20)
    # ... train model and return metric
    
study = optuna.create_study()
study.optimize(objective, n_trials=100)
```

### Custom Indicators
```python
def custom_indicator(df):
    # Implement your own technical indicator
    return df['Close'].rolling(20).apply(lambda x: x[-1] / x.mean())

# Add to feature engineering pipeline
df['Custom_Indicator'] = custom_indicator(df)
```

## 📈 Results Interpretation

### Signal Strength
- **Strong Buy**: Confidence > 80%, Signal > 2%
- **Buy**: Confidence > 60%, Signal > 1%
- **Hold**: -1% < Signal < 1%
- **Sell**: Confidence > 60%, Signal < -1%
- **Strong Sell**: Confidence > 80%, Signal < -2%

### Model Confidence
Based on:
- Ensemble agreement between models
- Historical prediction accuracy
- Market volatility conditions
- Feature importance stability

## 🔧 Troubleshooting

### Common Issues
1. **TA-Lib Installation**: Requires system-level libraries
2. **API Rate Limits**: Implement exponential backoff
3. **Memory Usage**: Use batch processing for large datasets
4. **GPU Support**: Install CUDA for TensorFlow acceleration

### Performance Optimization
- Use multiprocessing for data collection
- Implement data caching with Redis
- Optimize feature selection with importance scores
- Use early stopping in neural networks

## 📚 Further Reading

- [Quantitative Trading Strategies](https://www.quantstart.com/)
- [Machine Learning for Trading](https://github.com/stefan-jansen/machine-learning-for-trading)
- [TA-Lib Documentation](https://ta-lib.org/)
- [Backtrader Framework](https://www.backtrader.com/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add comprehensive tests
4. Submit pull request with performance benchmarks

## ⚠️ Disclaimer

This system is for educational and research purposes. Past performance does not guarantee future results. Always conduct thorough testing before using in live trading.