from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import subprocess
import json
import os
import sys
from datetime import datetime

from src.models.auth_user import db, User, Asset, Portfolio, Trade

trading_bp = Blueprint('trading', __name__)

def run_python_script(script_path, *args):
    """Run a Python script and return the output."""
    try:
        # Get the virtual environment Python path
        venv_python = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'scripts_venv', 'bin', 'python')
        
        # Prepare command
        cmd = [venv_python, script_path] + list(args)
        
        # Run the script
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
            cwd=os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        )
        
        if result.returncode == 0:
            return True, result.stdout.strip()
        else:
            current_app.logger.error(f"Script error: {result.stderr}")
            return False, result.stderr.strip()
            
    except subprocess.TimeoutExpired:
        return False, "Script execution timed out"
    except Exception as e:
        current_app.logger.error(f"Script execution error: {str(e)}")
        return False, str(e)

@trading_bp.route('/historical-data', methods=['POST'])
@jwt_required()
def fetch_historical_data():
    """Fetch historical stock data."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        symbol = data.get('symbol', '').strip().upper()
        period = data.get('period', '1y')
        
        if not symbol:
            return jsonify({'error': 'Symbol is required'}), 400
        
        # Run the Python script to fetch historical data
        script_path = os.path.join('scripts', 'fetch_stock_data.py')
        success, output = run_python_script(script_path, symbol, period)
        
        if not success:
            return jsonify({'error': f'Failed to fetch data: {output}'}), 500
        
        try:
            historical_data = json.loads(output)
            return jsonify({
                'symbol': symbol,
                'period': period,
                'data': historical_data
            }), 200
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid response from data service'}), 500
        
    except Exception as e:
        current_app.logger.error(f"Historical data error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@trading_bp.route('/ict-analysis', methods=['POST'])
@jwt_required()
def ict_analysis():
    """Perform ICT (Inner Circle Trader) analysis."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        symbol = data.get('symbol', '').strip().upper()
        timeframe = data.get('timeframe', '1d')
        
        if not symbol:
            return jsonify({'error': 'Symbol is required'}), 400
        
        # Run the Python script for ICT analysis
        script_path = os.path.join('scripts', 'run_ict_analysis.py')
        success, output = run_python_script(script_path, symbol, timeframe)
        
        if not success:
            return jsonify({'error': f'ICT analysis failed: {output}'}), 500
        
        try:
            analysis_result = json.loads(output)
            return jsonify({
                'symbol': symbol,
                'timeframe': timeframe,
                'analysis': analysis_result
            }), 200
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid response from ICT analysis service'}), 500
        
    except Exception as e:
        current_app.logger.error(f"ICT analysis error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@trading_bp.route('/lstm-prediction', methods=['POST'])
@jwt_required()
def lstm_prediction():
    """Generate LSTM price predictions."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        symbol = data.get('symbol', '').strip().upper()
        days = data.get('days', 5)
        
        if not symbol:
            return jsonify({'error': 'Symbol is required'}), 400
        
        # Run the Python script for LSTM prediction
        script_path = os.path.join('scripts', 'run_lstm_model.py')
        success, output = run_python_script(script_path, symbol, str(days))
        
        if not success:
            return jsonify({'error': f'LSTM prediction failed: {output}'}), 500
        
        try:
            prediction_result = json.loads(output)
            return jsonify({
                'symbol': symbol,
                'days': days,
                'predictions': prediction_result
            }), 200
        except json.JSONDecodeError:
            return jsonify({'error': 'Invalid response from LSTM prediction service'}), 500
        
    except Exception as e:
        current_app.logger.error(f"LSTM prediction error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@trading_bp.route('/chart-analysis', methods=['POST'])
@jwt_required()
def chart_analysis():
    """Analyze uploaded trading charts using AI."""
    try:
        # Check if file is uploaded
        if 'chart' not in request.files:
            return jsonify({'error': 'No chart file uploaded'}), 400
        
        file = request.files['chart']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save uploaded file temporarily
        upload_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = f"chart_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        filepath = os.path.join(upload_dir, filename)
        file.save(filepath)
        
        try:
            # For now, return a simulated analysis
            # In a real implementation, this would use AI vision models
            analysis_result = {
                'trend': 'bullish',
                'support_levels': [150.25, 148.50],
                'resistance_levels': [155.75, 158.20],
                'patterns': ['ascending triangle', 'higher lows'],
                'recommendation': 'Consider long position with stop loss at 148.00',
                'confidence': 0.78
            }
            
            return jsonify({
                'filename': filename,
                'analysis': analysis_result
            }), 200
            
        finally:
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
        
    except Exception as e:
        current_app.logger.error(f"Chart analysis error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@trading_bp.route('/assets', methods=['GET'])
@jwt_required()
def get_assets():
    """Get list of available trading assets."""
    try:
        assets = Asset.query.filter_by(is_active=True).all()
        
        return jsonify({
            'assets': [asset.to_dict() for asset in assets]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get assets error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@trading_bp.route('/assets', methods=['POST'])
@jwt_required()
def create_asset():
    """Create a new trading asset."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        symbol = data.get('symbol', '').strip().upper()
        name = data.get('name', '').strip()
        asset_type = data.get('asset_type', '').strip().lower()
        exchange = data.get('exchange', '').strip()
        sector = data.get('sector', '').strip()
        
        if not symbol or not name or not asset_type:
            return jsonify({'error': 'Symbol, name, and asset_type are required'}), 400
        
        if asset_type not in ['stock', 'crypto', 'forex', 'commodity', 'option']:
            return jsonify({'error': 'Invalid asset_type'}), 400
        
        # Check if asset already exists
        existing_asset = Asset.query.filter_by(symbol=symbol).first()
        if existing_asset:
            return jsonify({'error': 'Asset with this symbol already exists'}), 409
        
        # Create new asset
        asset = Asset(
            symbol=symbol,
            name=name,
            asset_type=asset_type,
            exchange=exchange,
            sector=sector
        )
        
        db.session.add(asset)
        db.session.commit()
        
        return jsonify({
            'message': 'Asset created successfully',
            'asset': asset.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create asset error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@trading_bp.route('/portfolios', methods=['GET'])
@jwt_required()
def get_portfolios():
    """Get user's portfolios."""
    try:
        current_user_id = get_jwt_identity()
        
        portfolios = Portfolio.query.filter_by(user_id=current_user_id).all()
        
        return jsonify({
            'portfolios': [portfolio.to_dict() for portfolio in portfolios]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get portfolios error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@trading_bp.route('/portfolios', methods=['POST'])
@jwt_required()
def create_portfolio():
    """Create a new portfolio."""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        name = data.get('name', '').strip()
        initial_balance = data.get('initial_balance', 10000.00)
        
        if not name:
            return jsonify({'error': 'Portfolio name is required'}), 400
        
        # Create new portfolio
        portfolio = Portfolio(
            user_id=current_user_id,
            name=name,
            initial_balance=initial_balance,
            current_balance=initial_balance,
            is_default=False  # Only first portfolio is default
        )
        
        db.session.add(portfolio)
        db.session.commit()
        
        return jsonify({
            'message': 'Portfolio created successfully',
            'portfolio': portfolio.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create portfolio error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@trading_bp.route('/trades', methods=['GET'])
@jwt_required()
def get_trades():
    """Get user's trades."""
    try:
        current_user_id = get_jwt_identity()
        
        trades = Trade.query.filter_by(user_id=current_user_id).order_by(Trade.created_at.desc()).all()
        
        return jsonify({
            'trades': [trade.to_dict() for trade in trades]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get trades error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@trading_bp.route('/trades', methods=['POST'])
@jwt_required()
def create_trade():
    """Create a new trade."""
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        portfolio_id = data.get('portfolio_id')
        asset_id = data.get('asset_id')
        trade_type = data.get('trade_type', '').strip().lower()
        order_type = data.get('order_type', '').strip().lower()
        quantity = data.get('quantity')
        price = data.get('price')
        
        if not all([portfolio_id, asset_id, trade_type, order_type, quantity, price]):
            return jsonify({'error': 'All trade fields are required'}), 400
        
        if trade_type not in ['buy', 'sell']:
            return jsonify({'error': 'Invalid trade_type'}), 400
        
        if order_type not in ['market', 'limit', 'stop_loss', 'stop_limit']:
            return jsonify({'error': 'Invalid order_type'}), 400
        
        # Verify portfolio belongs to user
        portfolio = Portfolio.query.filter_by(id=portfolio_id, user_id=current_user_id).first()
        if not portfolio:
            return jsonify({'error': 'Portfolio not found'}), 404
        
        # Verify asset exists
        asset = Asset.query.get(asset_id)
        if not asset:
            return jsonify({'error': 'Asset not found'}), 404
        
        # Calculate total amount
        total_amount = float(quantity) * float(price)
        fees = total_amount * 0.001  # 0.1% fee
        
        # Create new trade
        trade = Trade(
            user_id=current_user_id,
            portfolio_id=portfolio_id,
            asset_id=asset_id,
            trade_type=trade_type,
            order_type=order_type,
            quantity=quantity,
            price=price,
            total_amount=total_amount,
            fees=fees
        )
        
        db.session.add(trade)
        
        # Update portfolio balance
        if trade_type == 'buy':
            portfolio.current_balance -= (total_amount + fees)
        else:  # sell
            portfolio.current_balance += (total_amount - fees)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Trade created successfully',
            'trade': trade.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Create trade error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
