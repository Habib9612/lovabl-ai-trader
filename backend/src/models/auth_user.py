from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import bcrypt

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    profile = db.relationship('Profile', backref='user', uselist=False, cascade='all, delete-orphan')
    portfolios = db.relationship('Portfolio', backref='user', cascade='all, delete-orphan')
    trades = db.relationship('Trade', backref='user', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set the user's password."""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, password):
        """Check if the provided password matches the user's password."""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """Convert user object to dictionary for JSON serialization."""
        return {
            'id': str(self.id),
            'email': self.email,
            'email_verified': self.email_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class EmailVerificationToken(db.Model):
    __tablename__ = 'email_verification_tokens'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='email_verification_tokens')

class PasswordResetToken(db.Model):
    __tablename__ = 'password_reset_tokens'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='password_reset_tokens')

class Profile(db.Model):
    __tablename__ = 'profiles'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False, unique=True)
    display_name = db.Column(db.String(255))
    avatar_url = db.Column(db.String(500))
    bio = db.Column(db.Text)
    experience_level = db.Column(db.String(50), default='beginner')
    risk_tolerance = db.Column(db.String(50), default='moderate')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'display_name': self.display_name,
            'avatar_url': self.avatar_url,
            'bio': self.bio,
            'experience_level': self.experience_level,
            'risk_tolerance': self.risk_tolerance,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Portfolio(db.Model):
    __tablename__ = 'portfolios'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False, default='Main Portfolio')
    initial_balance = db.Column(db.Numeric(15, 2), nullable=False, default=10000.00)
    current_balance = db.Column(db.Numeric(15, 2), nullable=False, default=10000.00)
    total_profit_loss = db.Column(db.Numeric(15, 2), nullable=False, default=0.00)
    is_default = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'name': self.name,
            'initial_balance': float(self.initial_balance),
            'current_balance': float(self.current_balance),
            'total_profit_loss': float(self.total_profit_loss),
            'is_default': self.is_default,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Asset(db.Model):
    __tablename__ = 'assets'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    asset_type = db.Column(db.String(50), nullable=False)
    exchange = db.Column(db.String(100))
    sector = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'symbol': self.symbol,
            'name': self.name,
            'asset_type': self.asset_type,
            'exchange': self.exchange,
            'sector': self.sector,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Trade(db.Model):
    __tablename__ = 'trades'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    portfolio_id = db.Column(UUID(as_uuid=True), db.ForeignKey('portfolios.id'), nullable=False)
    asset_id = db.Column(UUID(as_uuid=True), db.ForeignKey('assets.id'), nullable=False)
    trade_type = db.Column(db.String(10), nullable=False)  # 'buy' or 'sell'
    order_type = db.Column(db.String(20), nullable=False)  # 'market', 'limit', etc.
    quantity = db.Column(db.Numeric(15, 8), nullable=False)
    price = db.Column(db.Numeric(15, 8), nullable=False)
    total_amount = db.Column(db.Numeric(15, 2), nullable=False)
    fees = db.Column(db.Numeric(15, 2), default=0.00)
    status = db.Column(db.String(20), default='completed')
    executed_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    portfolio = db.relationship('Portfolio', backref='trades')
    asset = db.relationship('Asset', backref='trades')
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'user_id': str(self.user_id),
            'portfolio_id': str(self.portfolio_id),
            'asset_id': str(self.asset_id),
            'trade_type': self.trade_type,
            'order_type': self.order_type,
            'quantity': float(self.quantity),
            'price': float(self.price),
            'total_amount': float(self.total_amount),
            'fees': float(self.fees),
            'status': self.status,
            'executed_at': self.executed_at.isoformat() if self.executed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
