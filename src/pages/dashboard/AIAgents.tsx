/**
 * AI Agents Management Page
 * 
 * This page provides a comprehensive interface for managing AI trading agents,
 * including creation, monitoring, and interaction capabilities.
 */

import React, { useState } from 'react';
import { useAIAgents } from '@/contexts/AIAgentsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Bot, 
  Plus, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Brain, 
  BarChart3,
  Play,
  Square,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const AIAgents: React.FC = () => {
  const {
    agents,
    agentTypes,
    loading,
    error,
    createAgent,
    sendMessage,
    stopAgent,
    createTradingAnalysisAgent,
    createPortfolioManagerAgent,
  } = useAIAgents();

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [createAgentDialog, setCreateAgentDialog] = useState(false);
  const [newAgentType, setNewAgentType] = useState('');
  const [newAgentSymbol, setNewAgentSymbol] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [creatingAgent, setCreatingAgent] = useState(false);

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'trading-analyst':
        return <TrendingUp className="h-5 w-5" />;
      case 'portfolio-manager':
        return <BarChart3 className="h-5 w-5" />;
      case 'risk-manager':
        return <Shield className="h-5 w-5" />;
      case 'sentiment-analyst':
        return <Brain className="h-5 w-5" />;
      case 'technical-analyst':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <Bot className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'initializing':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleCreateAgent = async () => {
    if (!newAgentType) {
      toast({
        title: 'Error',
        description: 'Please select an agent type',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingAgent(true);
      
      let instanceId: string;
      
      if (newAgentType === 'trading-analyst' && newAgentSymbol) {
        instanceId = await createTradingAnalysisAgent(newAgentSymbol);
      } else if (newAgentType === 'portfolio-manager') {
        instanceId = await createPortfolioManagerAgent();
      } else {
        instanceId = await createAgent(newAgentType);
      }

      toast({
        title: 'Success',
        description: `${agentTypes[newAgentType]?.name || 'Agent'} created successfully`,
      });

      setCreateAgentDialog(false);
      setNewAgentType('');
      setNewAgentSymbol('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create agent',
        variant: 'destructive',
      });
    } finally {
      setCreatingAgent(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedAgent || !messageContent.trim()) return;

    try {
      setSendingMessage(true);
      await sendMessage(selectedAgent, messageContent);
      setMessageContent('');
      
      toast({
        title: 'Message Sent',
        description: 'Your message has been sent to the agent',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStopAgent = async (instanceId: string) => {
    try {
      await stopAgent(instanceId);
      toast({
        title: 'Agent Stopped',
        description: 'The agent has been stopped successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to stop agent',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Agents</h3>
              <p className="text-sm text-muted-foreground text-center">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground">
            Manage and interact with your AI trading agents
          </p>
        </div>
        
        <Dialog open={createAgentDialog} onOpenChange={setCreateAgentDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New AI Agent</DialogTitle>
              <DialogDescription>
                Choose an agent type and configure its settings
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-type">Agent Type</Label>
                <Select value={newAgentType} onValueChange={setNewAgentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select agent type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(agentTypes).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center space-x-2">
                          {getAgentIcon(key)}
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {newAgentType === 'trading-analyst' && (
                <div>
                  <Label htmlFor="symbol">Trading Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="e.g., AAPL, TSLA, BTC"
                    value={newAgentSymbol}
                    onChange={(e) => setNewAgentSymbol(e.target.value.toUpperCase())}
                  />
                </div>
              )}
              
              {newAgentType && agentTypes[newAgentType] && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground">
                    {agentTypes[newAgentType].description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {agentTypes[newAgentType].capabilities.map((capability) => (
                      <Badge key={capability} variant="secondary" className="text-xs">
                        {capability.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCreateAgentDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAgent}
                  disabled={!newAgentType || creatingAgent}
                >
                  {creatingAgent && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Agent
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && agents.length === 0 ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : agents.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Agents Created</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Create your first AI agent to start automated trading analysis
                </p>
                <Button onClick={() => setCreateAgentDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Agent
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          agents.map((agent) => (
            <Card key={agent.instance_id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getAgentIcon(agent.agent_type)}
                    <CardTitle className="text-lg">
                      {agentTypes[agent.agent_type]?.name || agent.agent_type}
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                    <Badge variant="outline" className="text-xs">
                      {agent.status}
                    </Badge>
                  </div>
                </div>
                <CardDescription>
                  Created {new Date(agent.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {agent.last_message && (
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm font-medium">Last Message</span>
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(agent.last_message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {agent.last_message.content.substring(0, 100)}
                      {agent.last_message.content.length > 100 && '...'}
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedAgent(agent.instance_id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStopAgent(agent.instance_id)}
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Message Dialog */}
      <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Message to Agent</DialogTitle>
            <DialogDescription>
              Communicate with your AI agent to get insights or request actions
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Ask your agent for market analysis, trading recommendations, or any other insights..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSelectedAgent(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || sendingMessage}
              >
                {sendingMessage && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIAgents;
