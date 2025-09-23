"""
Enhanced Email Service

This service provides comprehensive email functionality including
verification, password reset, trading alerts, and notifications.
"""

import os
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from flask import current_app
from flask_mail import Message, Mail
from jinja2 import Template

logger = logging.getLogger(__name__)

class EmailService:
    """Enhanced email service for the trading platform."""
    
    def __init__(self, mail_instance: Mail):
        """Initialize email service with Flask-Mail instance."""
        self.mail = mail_instance
        self.templates = self._load_email_templates()
    
    def _load_email_templates(self) -> Dict[str, str]:
        """Load email templates."""
        return {
            'verification': """
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 Welcome to TradePro AI!</h1>
                    </div>
                    <div class="content">
                        <h2>Verify Your Email Address</h2>
                        <p>Thank you for joining TradePro AI, the next-generation AI-powered trading platform!</p>
                        <p>To complete your registration and start your trading journey, please verify your email address by clicking the button below:</p>
                        <p style="text-align: center;">
                            <a href="{{ verification_url }}" class="button">Verify Email Address</a>
                        </p>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">{{ verification_url }}</p>
                        <p><strong>This link will expire in 24 hours.</strong></p>
                        <p>Once verified, you'll have access to:</p>
                        <ul>
                            <li>🤖 AI-powered trading agents</li>
                            <li>📊 Advanced market analytics</li>
                            <li>💼 Portfolio management tools</li>
                            <li>📱 Real-time notifications</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>If you didn't create an account with TradePro AI, please ignore this email.</p>
                        <p>© 2024 TradePro AI. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            
            'password_reset': """
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>We received a request to reset your password for your TradePro AI account.</p>
                        <p>Click the button below to create a new password:</p>
                        <p style="text-align: center;">
                            <a href="{{ reset_url }}" class="button">Reset Password</a>
                        </p>
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">{{ reset_url }}</p>
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong>
                            <ul>
                                <li>This link will expire in 1 hour</li>
                                <li>If you didn't request this reset, please ignore this email</li>
                                <li>Your password will remain unchanged until you create a new one</li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer">
                        <p>For security questions, contact our support team.</p>
                        <p>© 2024 TradePro AI. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            
            'trading_alert': """
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .alert-box { background: white; border-left: 4px solid #2ecc71; padding: 20px; margin: 20px 0; border-radius: 5px; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    .data-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .data-table th, .data-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    .data-table th { background-color: #f2f2f2; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📈 Trading Alert</h1>
                    </div>
                    <div class="content">
                        <div class="alert-box">
                            <h2>{{ alert_type }} Alert</h2>
                            <p><strong>Symbol:</strong> {{ symbol }}</p>
                            <p><strong>Alert Time:</strong> {{ timestamp }}</p>
                            <p><strong>Message:</strong> {{ message }}</p>
                        </div>
                        
                        {% if market_data %}
                        <h3>Market Data</h3>
                        <table class="data-table">
                            {% for key, value in market_data.items() %}
                            <tr>
                                <th>{{ key|title }}</th>
                                <td>{{ value }}</td>
                            </tr>
                            {% endfor %}
                        </table>
                        {% endif %}
                        
                        {% if recommendation %}
                        <div class="alert-box">
                            <h3>AI Recommendation</h3>
                            <p>{{ recommendation }}</p>
                        </div>
                        {% endif %}
                    </div>
                    <div class="footer">
                        <p>This is an automated alert from your TradePro AI system.</p>
                        <p>© 2024 TradePro AI. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            
            'welcome': """
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .feature-box { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to TradePro AI!</h1>
                    </div>
                    <div class="content">
                        <h2>Your Account is Ready!</h2>
                        <p>Congratulations! Your email has been verified and your TradePro AI account is now active.</p>
                        
                        <h3>What's Next?</h3>
                        
                        <div class="feature-box">
                            <h4>🤖 Set Up Your AI Agents</h4>
                            <p>Create specialized AI agents for trading analysis, portfolio management, and risk assessment.</p>
                        </div>
                        
                        <div class="feature-box">
                            <h4>📊 Configure Your Dashboard</h4>
                            <p>Customize your trading dashboard with real-time market data and analytics.</p>
                        </div>
                        
                        <div class="feature-box">
                            <h4>💼 Build Your Portfolio</h4>
                            <p>Start building and managing your investment portfolio with AI-powered insights.</p>
                        </div>
                        
                        <p style="text-align: center;">
                            <a href="{{ dashboard_url }}" class="button">Go to Dashboard</a>
                        </p>
                    </div>
                    <div class="footer">
                        <p>Need help? Contact our support team or check our documentation.</p>
                        <p>© 2024 TradePro AI. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        }
    
    def send_verification_email(self, user_email: str, user_name: str, verification_url: str) -> bool:
        """Send email verification email with enhanced template."""
        try:
            template = Template(self.templates['verification'])
            html_content = template.render(
                user_name=user_name,
                verification_url=verification_url
            )
            
            msg = Message(
                subject='🚀 Verify Your TradePro AI Account',
                recipients=[user_email],
                html=html_content
            )
            
            self.mail.send(msg)
            logger.info(f"Verification email sent to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {user_email}: {str(e)}")
            return False
    
    def send_password_reset_email(self, user_email: str, user_name: str, reset_url: str) -> bool:
        """Send password reset email with enhanced template."""
        try:
            template = Template(self.templates['password_reset'])
            html_content = template.render(
                user_name=user_name,
                reset_url=reset_url
            )
            
            msg = Message(
                subject='🔐 Reset Your TradePro AI Password',
                recipients=[user_email],
                html=html_content
            )
            
            self.mail.send(msg)
            logger.info(f"Password reset email sent to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send password reset email to {user_email}: {str(e)}")
            return False
    
    def send_welcome_email(self, user_email: str, user_name: str, dashboard_url: str) -> bool:
        """Send welcome email after successful verification."""
        try:
            template = Template(self.templates['welcome'])
            html_content = template.render(
                user_name=user_name,
                dashboard_url=dashboard_url
            )
            
            msg = Message(
                subject='🎉 Welcome to TradePro AI - Your Account is Ready!',
                recipients=[user_email],
                html=html_content
            )
            
            self.mail.send(msg)
            logger.info(f"Welcome email sent to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {user_email}: {str(e)}")
            return False
    
    def send_trading_alert(self, user_email: str, alert_data: Dict[str, Any]) -> bool:
        """Send trading alert email."""
        try:
            template = Template(self.templates['trading_alert'])
            html_content = template.render(**alert_data)
            
            subject = f"📈 Trading Alert: {alert_data.get('symbol', 'Market Update')}"
            
            msg = Message(
                subject=subject,
                recipients=[user_email],
                html=html_content
            )
            
            self.mail.send(msg)
            logger.info(f"Trading alert sent to {user_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send trading alert to {user_email}: {str(e)}")
            return False
    
    def send_bulk_notification(self, recipients: List[str], subject: str, content: str) -> Dict[str, Any]:
        """Send bulk notification to multiple recipients."""
        results = {
            'sent': 0,
            'failed': 0,
            'errors': []
        }
        
        for recipient in recipients:
            try:
                msg = Message(
                    subject=subject,
                    recipients=[recipient],
                    html=content
                )
                
                self.mail.send(msg)
                results['sent'] += 1
                
            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'recipient': recipient,
                    'error': str(e)
                })
                logger.error(f"Failed to send notification to {recipient}: {str(e)}")
        
        return results
    
    def test_email_configuration(self) -> Dict[str, Any]:
        """Test email configuration and connectivity."""
        try:
            # Try to send a test email to the configured sender
            test_email = current_app.config.get('MAIL_DEFAULT_SENDER')
            
            if not test_email:
                return {
                    'status': 'error',
                    'message': 'No default sender configured'
                }
            
            msg = Message(
                subject='TradePro AI Email Service Test',
                recipients=[test_email],
                body='This is a test email to verify email service configuration.',
                html='<p>This is a test email to verify email service configuration.</p>'
            )
            
            self.mail.send(msg)
            
            return {
                'status': 'success',
                'message': 'Email service is working correctly',
                'test_recipient': test_email
            }
            
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Email service test failed: {str(e)}'
            }

# Global email service instance
email_service = None

def init_email_service(mail_instance: Mail):
    """Initialize the global email service instance."""
    global email_service
    email_service = EmailService(mail_instance)
    return email_service
