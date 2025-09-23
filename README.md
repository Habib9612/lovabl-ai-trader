# TradePro AI - Smart Trading Platform

A comprehensive AI-powered trading platform featuring advanced market analysis, ICT (Inner Circle Trader) concepts, LSTM predictions, and real-time data integration.

## 🚀 Features

### Smart Trade Analytics
- **Real-time Data Integration**: Live historical stock data from Yahoo Finance API
- **ICT Analysis**: Advanced Inner Circle Trader concepts including:
  - Order Blocks (Bullish/Bearish)
  - Fair Value Gaps (FVG)
  - Market Structure Analysis (BOS/CHOCH)
  - Liquidity Zones and Sweeps
- **LSTM Predictions**: Machine learning-based price forecasting
- **Chart Analysis**: AI-powered chart analysis with vision capabilities
- **Multi-timeframe Analysis**: Support for various intervals (1m, 5m, 1h, 1d, etc.)

### Modern UI/UX
- **Professional Design**: Clean, modern interface with smooth animations
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Interactive Charts**: Real-time data visualization with Recharts
- **Dark Theme**: Professional trading interface design
- **Intuitive Navigation**: Streamlined sidebar with organized sections

### Core Functionality
- **Portfolio Management**: Track and manage trading positions
- **Trading Analysis**: Comprehensive market analysis tools
- **Community Features**: Connect with other traders
- **Educational Resources**: Learn trading strategies and concepts
- **Watchlist**: Monitor favorite stocks and assets

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Deno** runtime for serverless functions
- **Supabase** for database and authentication
- **Python** for machine learning and data analysis
- **smartmoneyconcepts** library for ICT analysis

### APIs & Data
- **Yahoo Finance API** for real-time stock data
- **OpenRouter API** for AI-powered analysis
- **Custom Python scripts** for LSTM and ICT analysis

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Deno runtime

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/Habib9612/lovabl-ai-trader.git
   cd lovabl-ai-trader
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Set up Python environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install smartmoneyconcepts numpy==1.24.3 pandas==2.0.2
   ```

4. **Configure environment variables**
   ```bash
   export OPENROUTER_API_KEY="your_openrouter_api_key"
   ```

5. **Start the backend services**
   ```bash
   # Start the Deno server
   deno run --allow-net --allow-env --allow-run supabase/functions/smart-trade-analysis/index.ts
   ```

6. **Start the frontend development server**
   ```bash
   npm run dev
   ```

## 🔧 Usage

### Analyzing Stocks

1. **Navigate to Smart Trade Analytics**
2. **Enter a stock symbol** (e.g., AAPL, GOOGL, TSLA)
3. **Click "Analyze"** to fetch real data and perform analysis
4. **View results** in different tabs:
   - **LSTM Predictions**: Future price forecasts
   - **ICT Analysis**: Order blocks, fair value gaps, market structure
   - **Chart Analysis**: Upload charts for AI analysis

### Chart Analysis

1. **Go to the Chart Analysis tab**
2. **Upload a trading chart image**
3. **Receive detailed AI analysis** with:
   - Entry and exit points
   - Risk management recommendations
   - ICT-based insights
   - Market structure analysis

### Real-time Data

The platform automatically fetches real historical data for any valid stock symbol, supporting:
- **Intervals**: 1m, 2m, 5m, 15m, 30m, 60m, 1d, 1wk, 1mo
- **Ranges**: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max

## 🧠 AI Models & Analysis

### ICT (Inner Circle Trader) Concepts
- **Order Blocks**: Institutional buying/selling zones
- **Fair Value Gaps**: Price imbalances that often get filled
- **Market Structure**: Trend changes and breakouts
- **Liquidity Analysis**: Stop-loss hunting and liquidity pools

### LSTM Predictions
- **Time-series forecasting** based on historical price data
- **5-day price predictions** with confidence intervals
- **Trend analysis** and momentum indicators

### Chart Analysis
- **AI-powered visual analysis** of trading charts
- **Pattern recognition** and technical analysis
- **Entry/exit recommendations** with risk management
- **Multi-timeframe confluence** analysis

## 📊 API Endpoints

### Smart Trade Analysis API (Port 8000)

- **POST /** - Main analysis endpoint
  - `fetch_historical_data`: Get real stock data
  - `ict_analysis`: Perform ICT analysis
  - `lstm_prediction`: Generate LSTM predictions
  - `chart_analysis`: Analyze uploaded charts

### Example Request
```javascript
// Fetch historical data
const response = await fetch('http://localhost:8000', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'fetch_historical_data',
    symbol: 'AAPL',
    interval: '1d',
    range: '1mo'
  })
});
```

## 🔒 Security & Authentication

- **Supabase Authentication**: Secure user management
- **Protected Routes**: Dashboard access requires authentication
- **API Key Management**: Secure handling of external API keys
- **CORS Configuration**: Proper cross-origin resource sharing

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

### Backend Deployment
- Deploy Deno functions to Supabase Edge Functions
- Configure environment variables in production
- Set up Python environment on the server

## 📈 Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Memoization**: Optimized React components
- **Efficient Data Fetching**: Minimal API calls
- **Responsive Design**: Optimized for all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **smartmoneyconcepts** library for ICT analysis
- **Yahoo Finance** for real-time market data
- **OpenRouter** for AI capabilities
- **Supabase** for backend infrastructure
- **shadcn/ui** for beautiful UI components

## 📞 Support

For support, email support@tradepro-ai.com or join our Discord community.

---

**Built with ❤️ for traders, by traders**

## Original Lovable Project Info

**URL**: https://lovable.dev/projects/309f2267-c1ab-47e3-a6bd-113716b48d10

This project was enhanced and improved using the Lovable platform. You can continue editing via [Lovable Project](https://lovable.dev/projects/309f2267-c1ab-47e3-a6bd-113716b48d10) or use your preferred IDE locally.
