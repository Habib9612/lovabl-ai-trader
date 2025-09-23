# Backend Architecture and Database Schema Design (Supabase-Free)

This document outlines the proposed architecture for rebuilding the backend and database of the TradePro AI platform, replacing all Supabase dependencies with self-hosted or alternative services. The goal is to create a robust, scalable, and maintainable system that supports all existing functionalities, including user accounts, trading analytics, and email services.

## 1. Overall Architecture

The new backend will follow a **monolithic service architecture** initially, with clear separation of concerns, allowing for future migration to microservices if scalability demands it. It will consist of:

*   **Web Server/API Gateway**: A central application handling all incoming API requests, routing them to appropriate handlers, and managing authentication.
*   **Database**: A relational database for storing user data, trading data, and application configurations.
*   **Authentication Service**: A module within the web server responsible for user registration, login, session management, and JWT issuance.
*   **Email Service**: An external service integrated for sending transactional emails (e.g., account verification, password reset).
*   **Background Task Processor**: For asynchronous tasks like complex model training or data synchronization.

## 2. Technology Stack Choices

### 2.1. Backend Framework: Python with Flask

Given the existing Python scripts for ICT analysis and simulated LSTM models, **Python with Flask** is chosen as the primary backend framework. This choice offers:

*   **Seamless Integration**: Direct execution and management of existing Python-based trading models.
*   **Rapid Development**: Flask is a lightweight and flexible micro-framework suitable for building RESTful APIs quickly.
*   **Extensibility**: A rich ecosystem of libraries for database interaction, authentication, and other utilities.

### 2.2. Database: PostgreSQL

**PostgreSQL** will be used as the relational database. This is a natural choice as Supabase itself uses PostgreSQL, making schema migration straightforward. Key advantages include:

*   **Robustness and Reliability**: Enterprise-grade features, ACID compliance.
*   **Scalability**: Supports various scaling strategies.
*   **Rich Feature Set**: Advanced indexing, JSONB support, and extensibility.

### 2.3. Authentication: Custom JWT-based System

A **custom JWT (JSON Web Token) based authentication system** will be implemented. This will involve:

*   **User Registration/Login**: API endpoints for creating new users and authenticating existing ones.
*   **Password Hashing**: Using secure hashing algorithms (e.g., bcrypt) for storing passwords.
*   **JWT Issuance**: Generating short-lived access tokens and longer-lived refresh tokens upon successful login.
*   **Middleware**: Protecting API routes by validating JWTs in incoming requests.
*   **Session Management**: Storing refresh tokens securely (e.g., in an HTTP-only cookie or a dedicated Redis instance for blacklisting).

### 2.4. Email Service: SendGrid (or similar SMTP provider)

For transactional emails, an external **SMTP service like SendGrid, Mailgun, or AWS SES** will be integrated. This offloads email delivery complexities and ensures high deliverability rates. The backend will send requests to this service for:

*   Account verification emails.
*   Password reset emails.
*   Notifications (e.g., trading alerts).

### 2.5. File Storage: Local Filesystem (for now), Cloud Storage (future)

Initially, file storage (e.g., for uploaded chart images) will be handled by the **local filesystem** of the backend server. For future scalability and robustness, integration with cloud storage solutions like **AWS S3 or Google Cloud Storage** would be considered.

## 3. Database Schema Design

The existing Supabase `migrations` directory provides a good starting point for the database schema. We will extract and adapt these SQL migration files to define the tables for the new PostgreSQL database. Key tables will include:

*   `users`: Stores user authentication details (email, hashed password, roles, etc.).
*   `user_profiles`: Stores additional user-specific information (name, preferences, etc.).
*   `trading_data`: Stores historical market data, user-specific trading logs, and analysis results.
*   `watchlists`: Stores user-defined watchlists for monitoring assets.
*   `email_verification_tokens`: For managing email confirmation flows.
*   `password_reset_tokens`: For managing password reset flows.

Each table will be designed with appropriate primary keys, foreign keys, indexes, and constraints to ensure data integrity and efficient querying.

## 4. API Endpoints (Flask)

The Flask application will expose RESTful API endpoints to replace the functionality of the Supabase Edge Functions. Examples include:

*   `/api/auth/register` (POST): User registration.
*   `/api/auth/login` (POST): User login and JWT issuance.
*   `/api/auth/refresh` (POST): Refresh access token.
*   `/api/auth/logout` (POST): User logout.
*   `/api/auth/verify-email` (GET): Email verification.
*   `/api/auth/reset-password` (POST): Password reset initiation.
*   `/api/trade/historical-data` (POST): Fetch historical stock data.
*   `/api/trade/ict-analysis` (POST): Perform ICT analysis.
*   `/api/trade/lstm-prediction` (POST): Get LSTM predictions.
*   `/api/trade/chart-analysis` (POST): Analyze uploaded charts.
*   `/api/user/profile` (GET/PUT): Manage user profiles.

## 5. Migration Strategy

1.  **Schema Extraction**: Convert existing Supabase migration SQL files into a format compatible with a standalone PostgreSQL database.
2.  **Data Migration**: If there's existing user data in the Supabase database, a script will be developed to export this data and import it into the new PostgreSQL database.
3.  **Function Conversion**: Convert Deno functions (`.ts` files) into Python Flask routes or utility functions. This will involve adapting the TypeScript code to Python, especially for external API calls and data processing.

This detailed design will guide the implementation in the subsequent phases.
