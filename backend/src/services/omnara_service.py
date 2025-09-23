"""
Omnara AI Agent Integration Service

This service integrates Omnara AI framework for managing and monitoring
AI trading agents within the TradePro AI platform.
"""

import os
import uuid
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from omnara import OmnaraClient

logger = logging.getLogger(__name__)

class OmnaraService:
    """Service for managing AI agents through Omnara framework."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Omnara service with API key."""
        self.api_key = api_key or os.environ.get('OMNARA_API_KEY')
        if not self.api_key:
            logger.warning("Omnara API key not provided. Some features may be limited.")
            self.client = None
        else:
            self.client = OmnaraClient(api_key=self.api_key)
        
        self.active_agents = {}  # Track active agent instances
    
    def create_trading_agent(self, agent_type: str, user_id: str, config: Dict[str, Any]) -> str:
        """Create a new trading agent instance."""
        try:
            instance_id = str(uuid.uuid4())
            
            # Store agent configuration
            agent_config = {
                'instance_id': instance_id,
                'agent_type': agent_type,
                'user_id': user_id,
                'created_at': datetime.utcnow().isoformat(),
                'status': 'initializing',
                'config': config
            }
            
            self.active_agents[instance_id] = agent_config
            
            if self.client:
                # Send initialization message to Omnara
                response = self.client.send_message(
                    agent_type=agent_type,
                    content=f"Initializing {agent_type} trading agent for user {user_id}",
                    agent_instance_id=instance_id,
                    requires_user_input=False
                )
                
                agent_config['omnara_response'] = response
            
            agent_config['status'] = 'active'
            
            logger.info(f"Created trading agent {instance_id} of type {agent_type}")
            return instance_id
            
        except Exception as e:
            logger.error(f"Failed to create trading agent: {str(e)}")
            raise
    
    def send_agent_message(self, instance_id: str, content: str, requires_input: bool = False) -> Dict[str, Any]:
        """Send a message to a specific agent instance."""
        try:
            if instance_id not in self.active_agents:
                raise ValueError(f"Agent instance {instance_id} not found")
            
            agent = self.active_agents[instance_id]
            
            if not self.client:
                # Simulate response when Omnara client is not available
                return {
                    'status': 'simulated',
                    'message': 'Omnara client not configured',
                    'timestamp': datetime.utcnow().isoformat()
                }
            
            response = self.client.send_message(
                agent_type=agent['agent_type'],
                content=content,
                agent_instance_id=instance_id,
                requires_user_input=requires_input
            )
            
            # Update agent status
            agent['last_message'] = {
                'content': content,
                'timestamp': datetime.utcnow().isoformat(),
                'requires_input': requires_input,
                'response': response
            }
            
            return response
            
        except Exception as e:
            logger.error(f"Failed to send message to agent {instance_id}: {str(e)}")
            raise
    
    def get_agent_status(self, instance_id: str) -> Dict[str, Any]:
        """Get the current status of an agent instance."""
        if instance_id not in self.active_agents:
            raise ValueError(f"Agent instance {instance_id} not found")
        
        return self.active_agents[instance_id]
    
    def list_user_agents(self, user_id: str) -> List[Dict[str, Any]]:
        """List all active agents for a specific user."""
        user_agents = []
        for instance_id, agent in self.active_agents.items():
            if agent['user_id'] == user_id:
                user_agents.append({
                    'instance_id': instance_id,
                    'agent_type': agent['agent_type'],
                    'status': agent['status'],
                    'created_at': agent['created_at'],
                    'last_message': agent.get('last_message')
                })
        
        return user_agents
    
    def stop_agent(self, instance_id: str) -> bool:
        """Stop and remove an agent instance."""
        try:
            if instance_id not in self.active_agents:
                raise ValueError(f"Agent instance {instance_id} not found")
            
            agent = self.active_agents[instance_id]
            
            if self.client:
                # Send termination message
                self.client.send_message(
                    agent_type=agent['agent_type'],
                    content="Terminating agent instance",
                    agent_instance_id=instance_id,
                    requires_user_input=False
                )
            
            # Remove from active agents
            del self.active_agents[instance_id]
            
            logger.info(f"Stopped agent instance {instance_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to stop agent {instance_id}: {str(e)}")
            return False
    
    def create_trading_analysis_agent(self, user_id: str, symbol: str, analysis_type: str) -> str:
        """Create a specialized trading analysis agent."""
        config = {
            'symbol': symbol,
            'analysis_type': analysis_type,
            'capabilities': ['technical_analysis', 'sentiment_analysis', 'risk_assessment']
        }
        
        return self.create_trading_agent(
            agent_type='trading-analyst',
            user_id=user_id,
            config=config
        )
    
    def create_portfolio_manager_agent(self, user_id: str, portfolio_id: str) -> str:
        """Create a portfolio management agent."""
        config = {
            'portfolio_id': portfolio_id,
            'capabilities': ['portfolio_optimization', 'risk_management', 'rebalancing']
        }
        
        return self.create_trading_agent(
            agent_type='portfolio-manager',
            user_id=user_id,
            config=config
        )
    
    def request_trading_decision(self, instance_id: str, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Request a trading decision from an agent."""
        content = f"""
        Market Analysis Request:
        
        Symbol: {market_data.get('symbol', 'N/A')}
        Current Price: {market_data.get('price', 'N/A')}
        Volume: {market_data.get('volume', 'N/A')}
        Market Trend: {market_data.get('trend', 'N/A')}
        
        Please provide your trading recommendation based on current market conditions.
        """
        
        return self.send_agent_message(
            instance_id=instance_id,
            content=content,
            requires_input=True
        )
    
    def get_agent_insights(self, instance_id: str) -> Dict[str, Any]:
        """Get insights and recommendations from an agent."""
        content = "Please provide your current market insights and any recommendations."
        
        return self.send_agent_message(
            instance_id=instance_id,
            content=content,
            requires_input=False
        )
    
    def health_check(self) -> Dict[str, Any]:
        """Check the health status of the Omnara service."""
        status = {
            'service': 'omnara',
            'status': 'healthy' if self.client else 'limited',
            'active_agents': len(self.active_agents),
            'api_key_configured': bool(self.api_key),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if self.client:
            try:
                # Test connection with a simple message
                test_response = self.client.send_message(
                    agent_type='health-check',
                    content='Health check ping',
                    agent_instance_id='health-check',
                    requires_user_input=False
                )
                status['connection_test'] = 'success'
                status['test_response'] = test_response
            except Exception as e:
                status['connection_test'] = 'failed'
                status['error'] = str(e)
        
        return status

# Global instance
omnara_service = OmnaraService()
