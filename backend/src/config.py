import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'tradepro-ai-secret-key-2024'
    
    # PostgreSQL Database Configuration
    POSTGRES_HOST = os.environ.get('POSTGRES_HOST') or 'localhost'
    POSTGRES_PORT = os.environ.get('POSTGRES_PORT') or '5432'
    POSTGRES_DB = os.environ.get('POSTGRES_DB') or 'tradepro_ai'
    POSTGRES_USER = os.environ.get('POSTGRES_USER') or 'tradepro_user'
    POSTGRES_PASSWORD = os.environ.get('POSTGRES_PASSWORD') or 'tradepro_password'
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI') or f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string-tradepro-ai'
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour
    JWT_REFRESH_TOKEN_EXPIRES = 2592000  # 30 days
    
    # Email Configuration (using SendGrid as example)
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.sendgrid.net'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME') or 'apikey'
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or ''  # SendGrid API key
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or 'noreply@tradepro-ai.com'
    
    # Application Configuration
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:3000'
    BACKEND_URL = os.environ.get('BACKEND_URL') or 'http://localhost:5000'
