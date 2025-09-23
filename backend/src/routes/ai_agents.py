"""
AI Agents API Routes

This module provides REST API endpoints for managing AI trading agents
through the Omnara framework integration.
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import logging

from src.services.omnara_service import omnara_service
from src.models.auth_user import db, User

ai_agents_bp = Blueprint('ai_agents', __name__)
logger = logging.getLogger(__name__)

@ai_agents_bp.route('/health', methods=['GET'])
def health_check():
    """Check the health status of AI agents service."""
    try:
        health_status = omnara_service.health_check()
        return jsonify(health_status), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'service': 'ai_agents',
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@ai_agents_bp.route('/agents', methods=['POST'])
@jwt_required()
def create_agent():
    """Create a new AI trading agent."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        agent_type = data.get('agent_type')
        config = data.get('config', {})
        
        if not agent_type:
            return jsonify({'error': 'Agent type is required'}), 400
        
        # Validate agent type
        valid_agent_types = [
            'trading-analyst',
            'portfolio-manager',
            'risk-manager',
            'sentiment-analyst',
            'technical-analyst'
        ]
        
        if agent_type not in valid_agent_types:
            return jsonify({
                'error': f'Invalid agent type. Must be one of: {", ".join(valid_agent_types)}'
            }), 400
        
        # Create the agent
        instance_id = omnara_service.create_trading_agent(
            agent_type=agent_type,
            user_id=str(user_id),
            config=config
        )
        
        return jsonify({
            'message': 'Agent created successfully',
            'instance_id': instance_id,
            'agent_type': agent_type,
            'status': 'active'
        }), 201
        
    except Exception as e:
        logger.error(f"Failed to create agent: {str(e)}")
        return jsonify({'error': 'Failed to create agent'}), 500

@ai_agents_bp.route('/agents', methods=['GET'])
@jwt_required()
def list_agents():
    """List all active agents for the current user."""
    try:
        user_id = get_jwt_identity()
        
        agents = omnara_service.list_user_agents(str(user_id))
        
        return jsonify({
            'agents': agents,
            'count': len(agents)
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to list agents: {str(e)}")
        return jsonify({'error': 'Failed to list agents'}), 500

@ai_agents_bp.route('/agents/<instance_id>', methods=['GET'])
@jwt_required()
def get_agent_status(instance_id):
    """Get the status of a specific agent."""
    try:
        user_id = get_jwt_identity()
        
        agent_status = omnara_service.get_agent_status(instance_id)
        
        # Verify the agent belongs to the current user
        if agent_status['user_id'] != str(user_id):
            return jsonify({'error': 'Agent not found'}), 404
        
        return jsonify({
            'agent': agent_status
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to get agent status: {str(e)}")
        return jsonify({'error': 'Failed to get agent status'}), 500

@ai_agents_bp.route('/agents/<instance_id>/message', methods=['POST'])
@jwt_required()
def send_agent_message(instance_id):
    """Send a message to a specific agent."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        content = data.get('content')
        requires_input = data.get('requires_input', False)
        
        if not content:
            return jsonify({'error': 'Message content is required'}), 400
        
        # Verify the agent belongs to the current user
        agent_status = omnara_service.get_agent_status(instance_id)
        if agent_status['user_id'] != str(user_id):
            return jsonify({'error': 'Agent not found'}), 404
        
        response = omnara_service.send_agent_message(
            instance_id=instance_id,
            content=content,
            requires_input=requires_input
        )
        
        return jsonify({
            'message': 'Message sent successfully',
            'response': response
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to send message to agent: {str(e)}")
        return jsonify({'error': 'Failed to send message'}), 500

@ai_agents_bp.route('/agents/<instance_id>/stop', methods=['POST'])
@jwt_required()
def stop_agent(instance_id):
    """Stop and remove an agent instance."""
    try:
        user_id = get_jwt_identity()
        
        # Verify the agent belongs to the current user
        agent_status = omnara_service.get_agent_status(instance_id)
        if agent_status['user_id'] != str(user_id):
            return jsonify({'error': 'Agent not found'}), 404
        
        success = omnara_service.stop_agent(instance_id)
        
        if success:
            return jsonify({
                'message': 'Agent stopped successfully'
            }), 200
        else:
            return jsonify({'error': 'Failed to stop agent'}), 500
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to stop agent: {str(e)}")
        return jsonify({'error': 'Failed to stop agent'}), 500

@ai_agents_bp.route('/agents/trading-analysis', methods=['POST'])
@jwt_required()
def create_trading_analysis_agent():
    """Create a specialized trading analysis agent."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        symbol = data.get('symbol')
        analysis_type = data.get('analysis_type', 'comprehensive')
        
        if not symbol:
            return jsonify({'error': 'Symbol is required'}), 400
        
        instance_id = omnara_service.create_trading_analysis_agent(
            user_id=str(user_id),
            symbol=symbol,
            analysis_type=analysis_type
        )
        
        return jsonify({
            'message': 'Trading analysis agent created successfully',
            'instance_id': instance_id,
            'symbol': symbol,
            'analysis_type': analysis_type
        }), 201
        
    except Exception as e:
        logger.error(f"Failed to create trading analysis agent: {str(e)}")
        return jsonify({'error': 'Failed to create trading analysis agent'}), 500

@ai_agents_bp.route('/agents/portfolio-manager', methods=['POST'])
@jwt_required()
def create_portfolio_manager_agent():
    """Create a portfolio management agent."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        portfolio_id = data.get('portfolio_id', 'default')
        
        instance_id = omnara_service.create_portfolio_manager_agent(
            user_id=str(user_id),
            portfolio_id=portfolio_id
        )
        
        return jsonify({
            'message': 'Portfolio manager agent created successfully',
            'instance_id': instance_id,
            'portfolio_id': portfolio_id
        }), 201
        
    except Exception as e:
        logger.error(f"Failed to create portfolio manager agent: {str(e)}")
        return jsonify({'error': 'Failed to create portfolio manager agent'}), 500

@ai_agents_bp.route('/agents/<instance_id>/trading-decision', methods=['POST'])
@jwt_required()
def request_trading_decision(instance_id):
    """Request a trading decision from an agent."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Verify the agent belongs to the current user
        agent_status = omnara_service.get_agent_status(instance_id)
        if agent_status['user_id'] != str(user_id):
            return jsonify({'error': 'Agent not found'}), 404
        
        market_data = data.get('market_data', {})
        
        response = omnara_service.request_trading_decision(
            instance_id=instance_id,
            market_data=market_data
        )
        
        return jsonify({
            'message': 'Trading decision requested',
            'response': response
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to request trading decision: {str(e)}")
        return jsonify({'error': 'Failed to request trading decision'}), 500

@ai_agents_bp.route('/agents/<instance_id>/insights', methods=['GET'])
@jwt_required()
def get_agent_insights(instance_id):
    """Get insights and recommendations from an agent."""
    try:
        user_id = get_jwt_identity()
        
        # Verify the agent belongs to the current user
        agent_status = omnara_service.get_agent_status(instance_id)
        if agent_status['user_id'] != str(user_id):
            return jsonify({'error': 'Agent not found'}), 404
        
        insights = omnara_service.get_agent_insights(instance_id)
        
        return jsonify({
            'insights': insights
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to get agent insights: {str(e)}")
        return jsonify({'error': 'Failed to get agent insights'}), 500

@ai_agents_bp.route('/agent-types', methods=['GET'])
def get_agent_types():
    """Get available agent types and their descriptions."""
    agent_types = {
        'trading-analyst': {
            'name': 'Trading Analyst',
            'description': 'Analyzes market conditions and provides trading recommendations',
            'capabilities': ['technical_analysis', 'sentiment_analysis', 'risk_assessment']
        },
        'portfolio-manager': {
            'name': 'Portfolio Manager',
            'description': 'Manages portfolio allocation and optimization',
            'capabilities': ['portfolio_optimization', 'risk_management', 'rebalancing']
        },
        'risk-manager': {
            'name': 'Risk Manager',
            'description': 'Monitors and manages trading risks',
            'capabilities': ['risk_assessment', 'position_sizing', 'stop_loss_management']
        },
        'sentiment-analyst': {
            'name': 'Sentiment Analyst',
            'description': 'Analyzes market sentiment from news and social media',
            'capabilities': ['sentiment_analysis', 'news_analysis', 'social_media_monitoring']
        },
        'technical-analyst': {
            'name': 'Technical Analyst',
            'description': 'Performs technical analysis using charts and indicators',
            'capabilities': ['chart_analysis', 'indicator_analysis', 'pattern_recognition']
        }
    }
    
    return jsonify({
        'agent_types': agent_types
    }), 200
