# TradePro AI Backend

This directory contains the Flask backend for TradePro AI, which replaces the previous Supabase integration.

## Features

- **Authentication System**: JWT-based authentication with user registration, login, and token refresh
- **AI Agents Management**: Create and manage AI trading agents using the Omnara framework
- **Email Services**: Comprehensive email functionality for user verification and notifications
- **Trading API**: Endpoints for trading analysis and portfolio management
- **Database Integration**: PostgreSQL database with SQLAlchemy ORM

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
export DATABASE_URL="postgresql://username:password@localhost/tradepro_ai"
export JWT_SECRET_KEY="your-secret-key"
export SMTP_SERVER="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USERNAME="your-email@gmail.com"
export SMTP_PASSWORD="your-app-password"
export OMNARA_API_KEY="your-omnara-api-key"  # Optional
```

4. Initialize the database:
```bash
python -c "from src.main import app, db; app.app_context().push(); db.create_all()"
```

5. Run the server:
```bash
python src/main.py
```

The server will start on `http://localhost:5000`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### AI Agents
- `GET /api/ai/health` - Check AI service health
- `GET /api/ai/agent-types` - Get available agent types
- `POST /api/ai/agents` - Create a new AI agent
- `GET /api/ai/agents` - List user's AI agents
- `GET /api/ai/agents/{id}` - Get agent details
- `POST /api/ai/agents/{id}/message` - Send message to agent
- `POST /api/ai/agents/{id}/stop` - Stop an agent
- `POST /api/ai/agents/trading-analysis` - Create trading analysis agent
- `POST /api/ai/agents/portfolio-manager` - Create portfolio manager agent
- `POST /api/ai/agents/{id}/trading-decision` - Request trading decision
- `GET /api/ai/agents/{id}/insights` - Get agent insights

## Testing

Run the test suite:
```bash
python tests/test_api_endpoints.py
```

Or run simple tests:
```bash
python tests/simple_test.py
```

## Architecture

- **Flask Application**: Main application in `src/main.py`
- **Models**: Database models in `src/models/`
- **Routes**: API endpoints in `src/routes/`
- **Services**: Business logic in `src/services/`
- **Configuration**: App configuration in `src/config.py`

## Integration with Frontend

The backend is designed to work with the React frontend located in the parent directory. The frontend uses the API service (`src/services/api.ts`) to communicate with this backend.

## AI Agents

The backend integrates with the Omnara AI framework to provide intelligent trading agents. Currently supported agent types:

- **Trading Analyst**: Performs technical and fundamental analysis
- **Portfolio Manager**: Manages portfolio allocation and optimization
- **Risk Manager**: Monitors and manages trading risks
- **Sentiment Analyst**: Analyzes market sentiment from news and social media
- **Technical Analyst**: Performs technical analysis using charts and indicators

## Email Services

The backend includes comprehensive email functionality:

- User registration verification
- Password reset emails
- Trading alerts and notifications
- Portfolio updates

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Rate limiting (recommended for production)

## Production Deployment

For production deployment, consider:

1. Use a production WSGI server (e.g., Gunicorn)
2. Set up proper environment variables
3. Configure a reverse proxy (e.g., Nginx)
4. Set up SSL/TLS certificates
5. Configure database connection pooling
6. Set up logging and monitoring
7. Implement rate limiting and security headers
