from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, get_jwt
from flask_mail import Message, Mail
from datetime import datetime, timedelta
import uuid
import secrets
import re

from src.models.auth_user import db, User, EmailVerificationToken, PasswordResetToken, Profile, Portfolio

auth_bp = Blueprint('auth', __name__)
mail = Mail()

def is_valid_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_valid_password(password):
    """Validate password strength."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    return True, "Password is valid"

def send_verification_email(user, token):
    """Send email verification email."""
    try:
        verification_url = f"{current_app.config['FRONTEND_URL']}/verify-email?token={token}"
        
        msg = Message(
            subject='Verify Your TradePro AI Account',
            recipients=[user.email],
            html=f"""
            <h2>Welcome to TradePro AI!</h2>
            <p>Thank you for registering with TradePro AI. Please click the link below to verify your email address:</p>
            <p><a href="{verification_url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{verification_url}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with TradePro AI, please ignore this email.</p>
            """
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send verification email: {str(e)}")
        return False

def send_password_reset_email(user, token):
    """Send password reset email."""
    try:
        reset_url = f"{current_app.config['FRONTEND_URL']}/reset-password?token={token}"
        
        msg = Message(
            subject='Reset Your TradePro AI Password',
            recipients=[user.email],
            html=f"""
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password for your TradePro AI account. Click the link below to reset your password:</p>
            <p><a href="{reset_url}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{reset_url}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            """
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send password reset email: {str(e)}")
        return False

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        display_name = data.get('display_name', '').strip()
        
        # Validate input
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        if not is_valid_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        is_valid, password_message = is_valid_password(password)
        if not is_valid:
            return jsonify({'error': password_message}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 409
        
        # Create new user
        user = User(email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.flush()  # Get the user ID
        
        # Create user profile
        profile = Profile(
            user_id=user.id,
            display_name=display_name or email.split('@')[0]
        )
        db.session.add(profile)
        
        # Create default portfolio
        portfolio = Portfolio(
            user_id=user.id,
            name='Main Portfolio',
            is_default=True
        )
        db.session.add(portfolio)
        
        # Create email verification token
        verification_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=24)
        
        email_token = EmailVerificationToken(
            user_id=user.id,
            token=verification_token,
            expires_at=expires_at
        )
        db.session.add(email_token)
        
        db.session.commit()
        
        # Send verification email
        email_sent = send_verification_email(user, verification_token)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'email_verification_sent': email_sent
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT tokens."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create JWT tokens
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(seconds=current_app.config['JWT_ACCESS_TOKEN_EXPIRES'])
        )
        refresh_token = create_refresh_token(
            identity=user.id,
            expires_delta=timedelta(seconds=current_app.config['JWT_REFRESH_TOKEN_EXPIRES'])
        )
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token using refresh token."""
    try:
        current_user_id = get_jwt_identity()
        
        # Verify user still exists
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Create new access token
        access_token = create_access_token(
            identity=current_user_id,
            expires_delta=timedelta(seconds=current_app.config['JWT_ACCESS_TOKEN_EXPIRES'])
        )
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Token refresh error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    """Verify user email using verification token."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        token = data.get('token', '').strip()
        
        if not token:
            return jsonify({'error': 'Verification token is required'}), 400
        
        # Find verification token
        email_token = EmailVerificationToken.query.filter_by(
            token=token,
            used=False
        ).first()
        
        if not email_token:
            return jsonify({'error': 'Invalid or expired verification token'}), 400
        
        if email_token.expires_at < datetime.utcnow():
            return jsonify({'error': 'Verification token has expired'}), 400
        
        # Mark user as verified
        user = User.query.get(email_token.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.email_verified = True
        email_token.used = True
        
        db.session.commit()
        
        return jsonify({
            'message': 'Email verified successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Email verification error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset email."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email', '').strip().lower()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        if not is_valid_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        # Always return success to prevent email enumeration
        if not user:
            return jsonify({
                'message': 'If an account with this email exists, a password reset link has been sent'
            }), 200
        
        # Create password reset token
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.utcnow() + timedelta(hours=1)
        
        password_token = PasswordResetToken(
            user_id=user.id,
            token=reset_token,
            expires_at=expires_at
        )
        db.session.add(password_token)
        db.session.commit()
        
        # Send password reset email
        send_password_reset_email(user, reset_token)
        
        return jsonify({
            'message': 'If an account with this email exists, a password reset link has been sent'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Forgot password error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset user password using reset token."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        token = data.get('token', '').strip()
        new_password = data.get('password', '')
        
        if not token or not new_password:
            return jsonify({'error': 'Token and new password are required'}), 400
        
        is_valid, password_message = is_valid_password(new_password)
        if not is_valid:
            return jsonify({'error': password_message}), 400
        
        # Find reset token
        reset_token = PasswordResetToken.query.filter_by(
            token=token,
            used=False
        ).first()
        
        if not reset_token:
            return jsonify({'error': 'Invalid or expired reset token'}), 400
        
        if reset_token.expires_at < datetime.utcnow():
            return jsonify({'error': 'Reset token has expired'}), 400
        
        # Update user password
        user = User.query.get(reset_token.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.set_password(new_password)
        reset_token.used = True
        
        db.session.commit()
        
        return jsonify({
            'message': 'Password reset successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Password reset error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user information."""
    try:
        current_user_id = get_jwt_identity()
        
        user = User.query.get(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user profile
        profile = Profile.query.filter_by(user_id=user.id).first()
        
        user_data = user.to_dict()
        if profile:
            user_data['profile'] = profile.to_dict()
        
        return jsonify({
            'user': user_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get current user error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client-side token removal)."""
    return jsonify({
        'message': 'Logout successful'
    }), 200
