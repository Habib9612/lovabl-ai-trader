import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_cors import CORS

from src.config import Config
from src.models.auth_user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp, mail

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
mail.init_app(app)
CORS(app, origins=["*"])  # Allow all origins for development

# Register blueprints BEFORE catch-all routes
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

from src.routes.trading import trading_bp
from src.routes.ai_agents import ai_agents_bp
app.register_blueprint(trading_bp, url_prefix='/api/trading')
app.register_blueprint(ai_agents_bp, url_prefix='/api/ai')

# Create database tables
with app.app_context():
    db.create_all()

# API health check endpoint
@app.route('/api/health')
def health_check():
    return {"status": "healthy", "message": "API is running"}, 200

# Catch-all route for serving static files (MUST be last)
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    # Skip API routes - they should be handled by blueprints above
    if path.startswith('api/'):
        return {"error": "API endpoint not found"}, 404
        
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
