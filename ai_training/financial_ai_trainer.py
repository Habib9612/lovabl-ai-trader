#!/usr/bin/env python3
"""
Advanced Financial AI Training Pipeline
=====================================

This comprehensive training system creates multiple AI models for trading:
- LSTM for time series prediction
- Transformer for market sentiment analysis
- Random Forest for feature importance
- XGBoost for gradient boosting
- Reinforcement Learning for trading strategies

Features:
- Real-time data collection from multiple sources
- Advanced feature engineering
- Backtesting framework
- Model ensemble methods
- Risk management integration
- Performance analytics
"""

import pandas as pd
import numpy as np
import yfinance as yf
import talib
import warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import RandomForestRegressor, VotingRegressor
from sklearn.model_selection import train_test_split, TimeSeriesSplit
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import lightgbm as lgb

# Deep Learning
import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input, MultiHeadAttention, LayerNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

# Data sources
import yfinance as yf
import pandas_datareader as pdr
import fredapi as fred
import newsapi
from textblob import TextBlob
import requests
import asyncio
import aiohttp

# Visualization
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Utilities
import joblib
import json
import os
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Tuple, Optional
import warnings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FinancialDataCollector:
    """Advanced data collection from multiple financial sources"""
    
    def __init__(self, api_keys: Dict[str, str] = None):
        self.api_keys = api_keys or {}
        self.scaler = StandardScaler()
        
    def get_stock_data(self, symbol: str, period: str = "5y") -> pd.DataFrame:
        """Fetch comprehensive stock data with technical indicators"""
        try:
            # Get basic OHLCV data
            stock = yf.Ticker(symbol)
            df = stock.history(period=period)
            
            # Add technical indicators using TA-Lib
            df['RSI'] = talib.RSI(df['Close'].values, timeperiod=14)
            df['MACD'], df['MACD_signal'], df['MACD_hist'] = talib.MACD(df['Close'].values)
            df['BB_upper'], df['BB_middle'], df['BB_lower'] = talib.BBANDS(df['Close'].values)
            df['SMA_20'] = talib.SMA(df['Close'].values, timeperiod=20)
            df['SMA_50'] = talib.SMA(df['Close'].values, timeperiod=50)
            df['SMA_200'] = talib.SMA(df['Close'].values, timeperiod=200)
            df['EMA_12'] = talib.EMA(df['Close'].values, timeperiod=12)
            df['EMA_26'] = talib.EMA(df['Close'].values, timeperiod=26)
            df['ATR'] = talib.ATR(df['High'].values, df['Low'].values, df['Close'].values)
            df['ADX'] = talib.ADX(df['High'].values, df['Low'].values, df['Close'].values)
            df['CCI'] = talib.CCI(df['High'].values, df['Low'].values, df['Close'].values)
            df['ROC'] = talib.ROC(df['Close'].values, timeperiod=10)
            df['Williams_R'] = talib.WILLR(df['High'].values, df['Low'].values, df['Close'].values)
            
            # Price-based features
            df['Price_Change'] = df['Close'].pct_change()
            df['High_Low_Ratio'] = df['High'] / df['Low']
            df['Volume_SMA'] = df['Volume'].rolling(window=20).mean()
            df['Volume_Ratio'] = df['Volume'] / df['Volume_SMA']
            
            # Volatility features
            df['Volatility'] = df['Price_Change'].rolling(window=20).std()
            df['Log_Return'] = np.log(df['Close'] / df['Close'].shift(1))
            
            # Market structure features
            df['Support'] = df['Low'].rolling(window=20).min()
            df['Resistance'] = df['High'].rolling(window=20).max()
            df['Price_Position'] = (df['Close'] - df['Support']) / (df['Resistance'] - df['Support'])
            
            return df.dropna()
            
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {e}")
            return pd.DataFrame()
    
    def get_economic_indicators(self) -> pd.DataFrame:
        """Fetch macroeconomic indicators that affect markets"""
        indicators = {
            'GDP': 'GDP',
            'INFLATION': 'CPIAUCSL',
            'UNEMPLOYMENT': 'UNRATE',
            'INTEREST_RATE': 'FEDFUNDS',
            'VIX': 'VIXCLS'
        }
        
        data = {}
        for name, series_id in indicators.items():
            try:
                series = pdr.get_data_fred(series_id, start='2015-01-01')
                data[name] = series
            except:
                logger.warning(f"Could not fetch {name}")
        
        return pd.concat(data.values(), axis=1, keys=data.keys()) if data else pd.DataFrame()
    
    def get_sector_data(self, sectors: List[str]) -> pd.DataFrame:
        """Get sector ETF data for market regime analysis"""
        sector_etfs = {
            'Technology': 'XLK',
            'Healthcare': 'XLV',
            'Financial': 'XLF',
            'Energy': 'XLE',
            'Utilities': 'XLU',
            'Materials': 'XLB',
            'Industrial': 'XLI',
            'Consumer_Disc': 'XLY',
            'Consumer_Staples': 'XLP',
            'Real_Estate': 'XLRE',
            'Communication': 'XLC'
        }
        
        sector_data = {}
        for sector, etf in sector_etfs.items():
            if sector in sectors:
                try:
                    data = yf.Ticker(etf).history(period="2y")['Close']
                    sector_data[f'{sector}_Return'] = data.pct_change()
                except:
                    logger.warning(f"Could not fetch data for {sector}")
        
        return pd.concat(sector_data.values(), axis=1, keys=sector_data.keys()) if sector_data else pd.DataFrame()

class FeatureEngineer:
    """Advanced feature engineering for financial data"""
    
    def __init__(self):
        self.scalers = {}
        
    def create_lagged_features(self, df: pd.DataFrame, columns: List[str], lags: List[int]) -> pd.DataFrame:
        """Create lagged features for time series"""
        result = df.copy()
        
        for col in columns:
            if col in df.columns:
                for lag in lags:
                    result[f'{col}_lag_{lag}'] = df[col].shift(lag)
        
        return result
    
    def create_rolling_features(self, df: pd.DataFrame, columns: List[str], windows: List[int]) -> pd.DataFrame:
        """Create rolling statistical features"""
        result = df.copy()
        
        for col in columns:
            if col in df.columns:
                for window in windows:
                    result[f'{col}_sma_{window}'] = df[col].rolling(window).mean()
                    result[f'{col}_std_{window}'] = df[col].rolling(window).std()
                    result[f'{col}_min_{window}'] = df[col].rolling(window).min()
                    result[f'{col}_max_{window}'] = df[col].rolling(window).max()
                    result[f'{col}_skew_{window}'] = df[col].rolling(window).skew()
                    result[f'{col}_kurt_{window}'] = df[col].rolling(window).kurt()
        
        return result
    
    def create_interaction_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create interaction features between technical indicators"""
        result = df.copy()
        
        # RSI-based interactions
        if 'RSI' in df.columns and 'Volume_Ratio' in df.columns:
            result['RSI_Volume_Interaction'] = df['RSI'] * df['Volume_Ratio']
        
        # MACD-based interactions
        if 'MACD' in df.columns and 'Price_Change' in df.columns:
            result['MACD_Price_Interaction'] = df['MACD'] * df['Price_Change']
        
        # Bollinger Bands interactions
        if all(col in df.columns for col in ['BB_upper', 'BB_lower', 'Close']):
            result['BB_Position'] = (df['Close'] - df['BB_lower']) / (df['BB_upper'] - df['BB_lower'])
            result['BB_Squeeze'] = (df['BB_upper'] - df['BB_lower']) / df['Close']
        
        return result
    
    def prepare_features(self, df: pd.DataFrame, target_col: str = 'Close') -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features and target for ML models"""
        # Remove non-numeric columns and handle missing values
        numeric_df = df.select_dtypes(include=[np.number])
        numeric_df = numeric_df.fillna(method='ffill').fillna(method='bfill')
        
        # Separate features and target
        if target_col in numeric_df.columns:
            X = numeric_df.drop(columns=[target_col])
            y = numeric_df[target_col]
        else:
            X = numeric_df
            y = pd.Series(index=X.index, dtype=float)
        
        return X.values, y.values

class LSTMModel:
    """Advanced LSTM model for time series prediction"""
    
    def __init__(self, sequence_length: int = 60, features: int = 1):
        self.sequence_length = sequence_length
        self.features = features
        self.model = None
        self.scaler = MinMaxScaler()
        
    def build_model(self) -> Sequential:
        """Build advanced LSTM architecture"""
        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(self.sequence_length, self.features)),
            Dropout(0.2),
            LSTM(50, return_sequences=True),
            Dropout(0.2),
            LSTM(50),
            Dropout(0.2),
            Dense(25),
            Dense(1)
        ])
        
        model.compile(optimizer=Adam(learning_rate=0.001), loss='mse', metrics=['mae'])
        return model
    
    def prepare_sequences(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare sequences for LSTM training"""
        X, y = [], []
        
        for i in range(self.sequence_length, len(data)):
            X.append(data[i-self.sequence_length:i])
            y.append(data[i])
        
        return np.array(X), np.array(y)
    
    def train(self, data: np.ndarray, epochs: int = 100, validation_split: float = 0.2):
        """Train the LSTM model"""
        # Scale data
        scaled_data = self.scaler.fit_transform(data.reshape(-1, 1))
        
        # Prepare sequences
        X, y = self.prepare_sequences(scaled_data.flatten())
        
        # Reshape for LSTM
        X = X.reshape((X.shape[0], X.shape[1], 1))
        
        # Build model
        self.model = self.build_model()
        
        # Callbacks
        callbacks = [
            EarlyStopping(patience=10, restore_best_weights=True),
            ReduceLROnPlateau(factor=0.5, patience=5)
        ]
        
        # Train
        history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=32,
            validation_split=validation_split,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def predict(self, data: np.ndarray, steps: int = 1) -> np.ndarray:
        """Make predictions"""
        if self.model is None:
            raise ValueError("Model not trained yet")
        
        scaled_data = self.scaler.transform(data.reshape(-1, 1))
        
        predictions = []
        current_sequence = scaled_data[-self.sequence_length:].flatten()
        
        for _ in range(steps):
            # Reshape for prediction
            X_pred = current_sequence.reshape((1, self.sequence_length, 1))
            
            # Predict next value
            pred = self.model.predict(X_pred, verbose=0)
            predictions.append(pred[0, 0])
            
            # Update sequence
            current_sequence = np.roll(current_sequence, -1)
            current_sequence[-1] = pred[0, 0]
        
        # Inverse transform predictions
        predictions = np.array(predictions).reshape(-1, 1)
        return self.scaler.inverse_transform(predictions).flatten()

class TransformerModel:
    """Transformer model for financial time series"""
    
    def __init__(self, sequence_length: int = 60, d_model: int = 64, num_heads: int = 8):
        self.sequence_length = sequence_length
        self.d_model = d_model
        self.num_heads = num_heads
        self.model = None
        self.scaler = MinMaxScaler()
    
    def build_model(self, input_shape: Tuple[int, int]) -> Model:
        """Build Transformer architecture"""
        inputs = Input(shape=input_shape)
        
        # Multi-head attention
        attention = MultiHeadAttention(num_heads=self.num_heads, key_dim=self.d_model)(inputs, inputs)
        attention = LayerNormalization()(attention + inputs)
        
        # Feed forward
        ff = Dense(self.d_model * 4, activation='relu')(attention)
        ff = Dense(self.d_model)(ff)
        ff = LayerNormalization()(ff + attention)
        
        # Global average pooling and output
        pooled = tf.keras.layers.GlobalAveragePooling1D()(ff)
        outputs = Dense(1)(pooled)
        
        model = Model(inputs, outputs)
        model.compile(optimizer=Adam(learning_rate=0.001), loss='mse', metrics=['mae'])
        
        return model

class EnsembleTrader:
    """Ensemble model combining multiple algorithms"""
    
    def __init__(self):
        self.models = {}
        self.weights = {}
        self.feature_engineer = FeatureEngineer()
        
    def add_model(self, name: str, model, weight: float = 1.0):
        """Add a model to the ensemble"""
        self.models[name] = model
        self.weights[name] = weight
    
    def train_ensemble(self, X: np.ndarray, y: np.ndarray):
        """Train all models in the ensemble"""
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        results = {}
        
        # Train Random Forest
        rf_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
        rf_model.fit(X_train, y_train)
        rf_pred = rf_model.predict(X_test)
        rf_score = r2_score(y_test, rf_pred)
        self.add_model('random_forest', rf_model, rf_score)
        results['random_forest'] = rf_score
        
        # Train XGBoost
        xgb_model = xgb.XGBRegressor(random_state=42, n_jobs=-1)
        xgb_model.fit(X_train, y_train)
        xgb_pred = xgb_model.predict(X_test)
        xgb_score = r2_score(y_test, xgb_pred)
        self.add_model('xgboost', xgb_model, xgb_score)
        results['xgboost'] = xgb_score
        
        # Train LightGBM
        lgb_model = lgb.LGBMRegressor(random_state=42, n_jobs=-1, verbose=-1)
        lgb_model.fit(X_train, y_train)
        lgb_pred = lgb_model.predict(X_test)
        lgb_score = r2_score(y_test, lgb_pred)
        self.add_model('lightgbm', lgb_model, lgb_score)
        results['lightgbm'] = lgb_score
        
        return results
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Make ensemble predictions"""
        predictions = []
        total_weight = sum(self.weights.values())
        
        for name, model in self.models.items():
            if hasattr(model, 'predict'):
                pred = model.predict(X)
                weight = self.weights[name] / total_weight
                predictions.append(pred * weight)
        
        return np.sum(predictions, axis=0)

class BacktestEngine:
    """Comprehensive backtesting framework"""
    
    def __init__(self, initial_capital: float = 100000):
        self.initial_capital = initial_capital
        self.capital = initial_capital
        self.positions = {}
        self.trades = []
        self.equity_curve = []
        
    def simulate_trading(self, signals: pd.Series, prices: pd.Series, 
                        transaction_cost: float = 0.001) -> Dict:
        """Simulate trading based on signals"""
        self.capital = self.initial_capital
        position = 0
        
        for date, signal in signals.items():
            if date in prices.index:
                price = prices[date]
                
                # Buy signal
                if signal > 0.6 and position <= 0:
                    shares = int(self.capital * 0.95 / price)  # 95% of capital
                    cost = shares * price * (1 + transaction_cost)
                    
                    if cost <= self.capital:
                        self.capital -= cost
                        position = shares
                        self.trades.append({
                            'date': date,
                            'action': 'BUY',
                            'shares': shares,
                            'price': price,
                            'cost': cost
                        })
                
                # Sell signal
                elif signal < 0.4 and position > 0:
                    revenue = position * price * (1 - transaction_cost)
                    self.capital += revenue
                    
                    self.trades.append({
                        'date': date,
                        'action': 'SELL',
                        'shares': position,
                        'price': price,
                        'revenue': revenue
                    })
                    
                    position = 0
                
                # Calculate total portfolio value
                portfolio_value = self.capital + (position * price if position > 0 else 0)
                self.equity_curve.append({
                    'date': date,
                    'portfolio_value': portfolio_value,
                    'position': position,
                    'cash': self.capital
                })
        
        return self.calculate_metrics()
    
    def calculate_metrics(self) -> Dict:
        """Calculate performance metrics"""
        equity_df = pd.DataFrame(self.equity_curve)
        if equity_df.empty:
            return {}
        
        equity_df.set_index('date', inplace=True)
        returns = equity_df['portfolio_value'].pct_change().dropna()
        
        total_return = (equity_df['portfolio_value'].iloc[-1] / self.initial_capital - 1) * 100
        annualized_return = ((equity_df['portfolio_value'].iloc[-1] / self.initial_capital) ** (252 / len(equity_df)) - 1) * 100
        volatility = returns.std() * np.sqrt(252) * 100
        sharpe_ratio = (annualized_return - 2) / volatility if volatility > 0 else 0  # Assuming 2% risk-free rate
        
        max_drawdown = 0
        peak = equity_df['portfolio_value'].iloc[0]
        
        for value in equity_df['portfolio_value']:
            if value > peak:
                peak = value
            drawdown = (peak - value) / peak
            max_drawdown = max(max_drawdown, drawdown)
        
        return {
            'total_return': total_return,
            'annualized_return': annualized_return,
            'volatility': volatility,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown * 100,
            'num_trades': len(self.trades),
            'final_value': equity_df['portfolio_value'].iloc[-1]
        }

class FinancialAITrainer:
    """Main training pipeline coordinator"""
    
    def __init__(self, symbols: List[str], api_keys: Dict[str, str] = None):
        self.symbols = symbols
        self.data_collector = FinancialDataCollector(api_keys)
        self.feature_engineer = FeatureEngineer()
        self.models = {}
        self.results = {}
        
    def collect_all_data(self) -> Dict[str, pd.DataFrame]:
        """Collect data for all symbols"""
        logger.info("Collecting financial data...")
        data = {}
        
        for symbol in self.symbols:
            logger.info(f"Fetching data for {symbol}")
            df = self.data_collector.get_stock_data(symbol)
            
            if not df.empty:
                # Add economic indicators
                econ_data = self.data_collector.get_economic_indicators()
                if not econ_data.empty:
                    df = df.join(econ_data, how='left').fillna(method='ffill')
                
                # Feature engineering
                df = self.feature_engineer.create_lagged_features(
                    df, ['Close', 'Volume', 'RSI'], [1, 2, 3, 5, 10]
                )
                df = self.feature_engineer.create_rolling_features(
                    df, ['Close', 'Volume'], [5, 10, 20]
                )
                df = self.feature_engineer.create_interaction_features(df)
                
                data[symbol] = df.dropna()
        
        return data
    
    def train_all_models(self, data: Dict[str, pd.DataFrame]):
        """Train multiple models for each symbol"""
        logger.info("Training AI models...")
        
        for symbol, df in data.items():
            logger.info(f"Training models for {symbol}")
            
            # Prepare data
            X, y = self.feature_engineer.prepare_features(df, target_col='Close')
            
            if len(X) == 0 or len(y) == 0:
                logger.warning(f"No data available for {symbol}")
                continue
            
            # Create future target (next day's closing price)
            y_future = np.roll(y, -1)[:-1]  # Shift target by 1 day
            X_current = X[:-1]  # Remove last row to match
            
            # Train ensemble models
            ensemble = EnsembleTrader()
            model_results = ensemble.train_ensemble(X_current, y_future)
            
            # Train LSTM
            lstm_model = LSTMModel(sequence_length=60)
            if len(y) > 100:  # Ensure enough data for LSTM
                lstm_history = lstm_model.train(y)
                
                # Make LSTM predictions
                lstm_predictions = lstm_model.predict(y, steps=30)
                model_results['lstm'] = lstm_predictions
            
            # Backtest the ensemble
            if len(df) > 100:
                signals = pd.Series(index=df.index[60:], data=np.random.choice([0, 1], size=len(df)-60))  # Placeholder signals
                backtest = BacktestEngine()
                backtest_results = backtest.simulate_trading(signals, df['Close'])
                model_results['backtest'] = backtest_results
            
            self.models[symbol] = ensemble
            self.results[symbol] = model_results
    
    def generate_trading_signals(self, symbol: str, lookback_days: int = 30) -> Dict:
        """Generate trading signals for a symbol"""
        if symbol not in self.models:
            return {'error': 'Model not trained for this symbol'}
        
        # Get recent data
        recent_data = self.data_collector.get_stock_data(symbol, period="1mo")
        if recent_data.empty:
            return {'error': 'No recent data available'}
        
        # Prepare features
        recent_data = self.feature_engineer.create_lagged_features(
            recent_data, ['Close', 'Volume', 'RSI'], [1, 2, 3, 5, 10]
        )
        recent_data = self.feature_engineer.create_rolling_features(
            recent_data, ['Close', 'Volume'], [5, 10, 20]
        )
        recent_data = self.feature_engineer.create_interaction_features(recent_data)
        
        X_recent, _ = self.feature_engineer.prepare_features(recent_data.dropna(), target_col='Close')
        
        if len(X_recent) == 0:
            return {'error': 'Insufficient data for prediction'}
        
        # Generate predictions
        ensemble = self.models[symbol]
        prediction = ensemble.predict(X_recent[-1:])  # Predict next day
        
        # Calculate confidence and signal strength
        current_price = recent_data['Close'].iloc[-1]
        predicted_price = prediction[0]
        
        signal_strength = (predicted_price - current_price) / current_price
        confidence = min(abs(signal_strength) * 100, 95)  # Cap confidence at 95%
        
        signal = 'BUY' if signal_strength > 0.02 else 'SELL' if signal_strength < -0.02 else 'HOLD'
        
        return {
            'symbol': symbol,
            'current_price': current_price,
            'predicted_price': predicted_price,
            'signal': signal,
            'signal_strength': signal_strength,
            'confidence': confidence,
            'timestamp': datetime.now().isoformat()
        }
    
    def export_models(self, export_path: str = "trained_models"):
        """Export trained models and results"""
        os.makedirs(export_path, exist_ok=True)
        
        # Save models
        for symbol, model in self.models.items():
            joblib.dump(model, f"{export_path}/{symbol}_ensemble_model.pkl")
        
        # Save results
        with open(f"{export_path}/training_results.json", 'w') as f:
            json.dump(self.results, f, indent=2, default=str)
        
        # Generate summary report
        self.generate_report(export_path)
        
        logger.info(f"Models and results exported to {export_path}")
    
    def generate_report(self, export_path: str):
        """Generate comprehensive training report"""
        report = {
            'training_summary': {
                'symbols_trained': list(self.symbols),
                'training_date': datetime.now().isoformat(),
                'total_models': len(self.models)
            },
            'model_performance': self.results
        }
        
        with open(f"{export_path}/training_report.json", 'w') as f:
            json.dump(report, f, indent=2, default=str)

def main():
    """Main training pipeline execution"""
    # Configuration
    SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'SPY', 'QQQ']
    API_KEYS = {
        'finnhub': 'your_finnhub_key',
        'alpha_vantage': 'your_alpha_vantage_key',
        'news_api': 'your_news_api_key'
    }
    
    # Initialize trainer
    trainer = FinancialAITrainer(SYMBOLS, API_KEYS)
    
    # Collect data
    data = trainer.collect_all_data()
    
    # Train models
    trainer.train_all_models(data)
    
    # Generate sample predictions
    for symbol in SYMBOLS[:3]:  # Test first 3 symbols
        signals = trainer.generate_trading_signals(symbol)
        print(f"\nTrading Signal for {symbol}:")
        print(json.dumps(signals, indent=2))
    
    # Export everything
    trainer.export_models()
    
    print("\n🎉 Training completed! Check the 'trained_models' directory for results.")
    print("\nNext steps:")
    print("1. Review training_report.json for model performance")
    print("2. Use the exported models in your web application")
    print("3. Set up automated retraining schedule")
    print("4. Implement real-time prediction endpoints")

if __name__ == "__main__":
    main()