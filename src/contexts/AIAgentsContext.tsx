/**
 * AI Agents Context for TradePro AI
 * 
 * Provides AI agents state management and operations
 * for the entire application.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { aiAgentsApi, AIAgent, AgentType } from '../services/api';
import { useAuth } from '@/hooks/useAuth';

interface AIAgentsContextType {
  agents: AIAgent[];
  agentTypes: Record<string, AgentType>;
  loading: boolean;
  error: string | null;
  createAgent: (agentType: string, config?: any) => Promise<string>;
  sendMessage: (instanceId: string, content: string, requiresInput?: boolean) => Promise<any>;
  stopAgent: (instanceId: string) => Promise<void>;
  refreshAgents: () => Promise<void>;
  getAgentInsights: (instanceId: string) => Promise<any>;
  createTradingAnalysisAgent: (symbol: string, analysisType?: string) => Promise<string>;
  createPortfolioManagerAgent: (portfolioId?: string) => Promise<string>;
  requestTradingDecision: (instanceId: string, marketData: any) => Promise<any>;
}

const AIAgentsContext = createContext<AIAgentsContextType | undefined>(undefined);

export const useAIAgents = () => {
  const context = useContext(AIAgentsContext);
  if (context === undefined) {
    throw new Error('useAIAgents must be used within an AIAgentsProvider');
  }
  return context;
};

interface AIAgentsProviderProps {
  children: ReactNode;
}

export const AIAgentsProvider: React.FC<AIAgentsProviderProps> = ({ children }) => {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [agentTypes, setAgentTypes] = useState<Record<string, AgentType>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Load agent types on mount
  useEffect(() => {
    loadAgentTypes();
  }, []);

  // Load user agents when authenticated
  useEffect(() => {
    if (user) {
      refreshAgents();
    } else {
      setAgents([]);
    }
  }, [user]);

  const loadAgentTypes = async () => {
    try {
      const response = await aiAgentsApi.getAgentTypes();
      setAgentTypes(response.agent_types);
    } catch (error) {
      console.error('Failed to load agent types:', error);
      setError('Failed to load agent types');
    }
  };

  const refreshAgents = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await aiAgentsApi.listAgents();
      setAgents(response.agents);
    } catch (error) {
      console.error('Failed to refresh agents:', error);
      setError('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async (agentType: string, config: any = {}): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiAgentsApi.createAgent(agentType, config);
      
      // Refresh agents list to include the new agent
      await refreshAgents();
      
      return response.instance_id;
    } catch (error) {
      console.error('Failed to create agent:', error);
      setError('Failed to create agent');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (
    instanceId: string,
    content: string,
    requiresInput: boolean = false
  ): Promise<any> => {
    try {
      setError(null);
      const response = await aiAgentsApi.sendMessage(instanceId, content, requiresInput);
      
      // Update the agent's last message in the local state
      setAgents(prevAgents =>
        prevAgents.map(agent =>
          agent.instance_id === instanceId
            ? {
                ...agent,
                last_message: {
                  content,
                  timestamp: new Date().toISOString(),
                  requires_input: requiresInput,
                  response: response.response,
                },
              }
            : agent
        )
      );
      
      return response.response;
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
      throw error;
    }
  };

  const stopAgent = async (instanceId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await aiAgentsApi.stopAgent(instanceId);
      
      // Remove the agent from local state
      setAgents(prevAgents =>
        prevAgents.filter(agent => agent.instance_id !== instanceId)
      );
    } catch (error) {
      console.error('Failed to stop agent:', error);
      setError('Failed to stop agent');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAgentInsights = async (instanceId: string): Promise<any> => {
    try {
      setError(null);
      const response = await aiAgentsApi.getAgentInsights(instanceId);
      return response.insights;
    } catch (error) {
      console.error('Failed to get agent insights:', error);
      setError('Failed to get agent insights');
      throw error;
    }
  };

  const createTradingAnalysisAgent = async (
    symbol: string,
    analysisType: string = 'comprehensive'
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiAgentsApi.createTradingAnalysisAgent(symbol, analysisType);
      
      // Refresh agents list
      await refreshAgents();
      
      return response.instance_id;
    } catch (error) {
      console.error('Failed to create trading analysis agent:', error);
      setError('Failed to create trading analysis agent');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createPortfolioManagerAgent = async (
    portfolioId: string = 'default'
  ): Promise<string> => {
    try {
      setLoading(true);
      setError(null);
      const response = await aiAgentsApi.createPortfolioManagerAgent(portfolioId);
      
      // Refresh agents list
      await refreshAgents();
      
      return response.instance_id;
    } catch (error) {
      console.error('Failed to create portfolio manager agent:', error);
      setError('Failed to create portfolio manager agent');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const requestTradingDecision = async (
    instanceId: string,
    marketData: any
  ): Promise<any> => {
    try {
      setError(null);
      const response = await aiAgentsApi.requestTradingDecision(instanceId, marketData);
      return response.response;
    } catch (error) {
      console.error('Failed to request trading decision:', error);
      setError('Failed to request trading decision');
      throw error;
    }
  };

  const value: AIAgentsContextType = {
    agents,
    agentTypes,
    loading,
    error,
    createAgent,
    sendMessage,
    stopAgent,
    refreshAgents,
    getAgentInsights,
    createTradingAnalysisAgent,
    createPortfolioManagerAgent,
    requestTradingDecision,
  };

  return (
    <AIAgentsContext.Provider value={value}>
      {children}
    </AIAgentsContext.Provider>
  );
};
