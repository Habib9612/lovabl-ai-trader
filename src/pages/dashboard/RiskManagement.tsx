import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, AlertTriangle, TrendingDown, Target, Plus, Settings, PieChart, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface RiskRule {
  id: string;
  user_id: string;
  portfolio_id: string;
  rule_type: 'position_size' | 'stop_loss' | 'daily_loss_limit' | 'sector_allocation';
  rule_value: number;
  is_active: boolean;
  created_at: string;
  portfolios: any;
}

interface Portfolio {
  id: string;
  name: string;
  current_balance: number;
  total_profit_loss: number;
}

const RiskManagement = () => {
  const [riskRules, setRiskRules] = useState<RiskRule[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [newRule, setNewRule] = useState({
    portfolio_id: '',
    rule_type: 'position_size' as string,
    rule_value: 0
  });

  useEffect(() => {
    if (user) {
      fetchRiskRules();
      fetchPortfolios();
    }
  }, [user]);

  const fetchRiskRules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('risk_management_rules')
        .select(`
          *,
          portfolios:portfolio_id (name, current_balance, total_profit_loss)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRiskRules((data || []) as RiskRule[]);
    } catch (error) {
      console.error('Error fetching risk rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolios = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    }
  };

  const createRiskRule = async () => {
    if (!user || !newRule.portfolio_id) return;

    try {
      const { error } = await supabase
        .from('risk_management_rules')
        .insert({
          user_id: user.id,
          portfolio_id: newRule.portfolio_id,
          rule_type: newRule.rule_type,
          rule_value: newRule.rule_value
        });

      if (error) throw error;

      toast({
        title: "Risk Rule Created",
        description: "Your risk management rule has been added successfully.",
      });

      setShowCreateDialog(false);
      setNewRule({
        portfolio_id: '',
        rule_type: 'position_size',
        rule_value: 0
      });

      fetchRiskRules();
    } catch (error) {
      console.error('Error creating risk rule:', error);
      toast({
        title: "Error",
        description: "Failed to create risk rule. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleRuleStatus = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('risk_management_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;

      setRiskRules(prev => prev.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: isActive } : rule
      ));

      toast({
        title: isActive ? "Rule Activated" : "Rule Deactivated",
        description: `Risk rule has been ${isActive ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      console.error('Error updating rule status:', error);
    }
  };

  const getRuleIcon = (ruleType: string) => {
    switch (ruleType) {
      case 'position_size':
        return <PieChart className="h-5 w-5" />;
      case 'stop_loss':
        return <TrendingDown className="h-5 w-5" />;
      case 'daily_loss_limit':
        return <AlertTriangle className="h-5 w-5" />;
      case 'sector_allocation':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getRuleColor = (ruleType: string) => {
    switch (ruleType) {
      case 'position_size':
        return 'text-primary';
      case 'stop_loss':
        return 'text-destructive';
      case 'daily_loss_limit':
        return 'text-warning';
      case 'sector_allocation':
        return 'text-accent';
      default:
        return 'text-muted-foreground';
    }
  };

  const getRuleDescription = (ruleType: string) => {
    switch (ruleType) {
      case 'position_size':
        return 'Maximum percentage of portfolio for a single position';
      case 'stop_loss':
        return 'Automatic stop loss percentage';
      case 'daily_loss_limit':
        return 'Maximum daily loss limit';
      case 'sector_allocation':
        return 'Maximum allocation per sector';
      default:
        return 'Risk management rule';
    }
  };

  const formatRuleValue = (ruleType: string, value: number) => {
    switch (ruleType) {
      case 'position_size':
      case 'stop_loss':
      case 'sector_allocation':
        return `${value}%`;
      case 'daily_loss_limit':
        return `$${value.toLocaleString()}`;
      default:
        return value.toString();
    }
  };

  const calculateRiskScore = () => {
    const activeRules = riskRules.filter(rule => rule.is_active);
    const riskFactors = {
      position_size: activeRules.find(r => r.rule_type === 'position_size')?.rule_value || 100,
      stop_loss: activeRules.find(r => r.rule_type === 'stop_loss')?.rule_value || 100,
      daily_loss_limit: activeRules.find(r => r.rule_type === 'daily_loss_limit') ? 20 : 100,
      sector_allocation: activeRules.find(r => r.rule_type === 'sector_allocation')?.rule_value || 100
    };

    const avgRisk = Object.values(riskFactors).reduce((acc, val) => acc + val, 0) / 4;
    return Math.max(0, Math.min(100, 100 - avgRisk));
  };

  const riskScore = calculateRiskScore();

  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Low', color: 'text-success', bgColor: 'bg-success' };
    if (score >= 60) return { level: 'Moderate', color: 'text-warning', bgColor: 'bg-warning' };
    if (score >= 40) return { level: 'High', color: 'text-destructive', bgColor: 'bg-destructive' };
    return { level: 'Very High', color: 'text-destructive', bgColor: 'bg-destructive' };
  };

  const riskLevel = getRiskLevel(riskScore);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Risk Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Protect your capital with automated risk controls
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Risk Rule</DialogTitle>
                <DialogDescription>
                  Set up automated risk management for your portfolio
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={newRule.portfolio_id} onValueChange={(value) => setNewRule({...newRule, portfolio_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Portfolio" />
                  </SelectTrigger>
                  <SelectContent>
                    {portfolios.map((portfolio) => (
                      <SelectItem key={portfolio.id} value={portfolio.id}>
                        {portfolio.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={newRule.rule_type} onValueChange={(value: any) => setNewRule({...newRule, rule_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rule Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="position_size">Position Size Limit</SelectItem>
                    <SelectItem value="stop_loss">Stop Loss</SelectItem>
                    <SelectItem value="daily_loss_limit">Daily Loss Limit</SelectItem>
                    <SelectItem value="sector_allocation">Sector Allocation</SelectItem>
                  </SelectContent>
                </Select>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {newRule.rule_type === 'daily_loss_limit' ? 'Amount ($)' : 'Percentage (%)'}
                  </label>
                  <Input
                    type="number"
                    placeholder={newRule.rule_type === 'daily_loss_limit' ? '1000' : '5'}
                    value={newRule.rule_value || ''}
                    onChange={(e) => setNewRule({...newRule, rule_value: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <Button onClick={createRiskRule} className="w-full">
                  Create Rule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-2 bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Overall Risk Score
              </CardTitle>
              <CardDescription>Automated assessment of your risk exposure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{Math.round(riskScore)}/100</span>
                  <Badge className={`${riskLevel.bgColor} text-white`}>
                    {riskLevel.level} Risk
                  </Badge>
                </div>
                <Progress value={riskScore} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  Based on your active risk management rules and portfolio allocation
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-success/5 border-success/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Rules</p>
                  <p className="text-2xl font-bold text-success">
                    {riskRules.filter(rule => rule.is_active).length}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-warning/5 border-warning/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Rules</p>
                  <p className="text-2xl font-bold text-warning">{riskRules.length}</p>
                </div>
                <Settings className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Rules */}
        <Card className="bg-gradient-to-r from-card/50 to-card border-primary/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Risk Rules
            </CardTitle>
            <CardDescription>
              Manage your automated risk management rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg bg-primary/10 ${getRuleColor(rule.rule_type)}`}>
                      {getRuleIcon(rule.rule_type)}
                    </div>
                    <div>
                      <h3 className="font-medium capitalize">
                        {rule.rule_type.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getRuleDescription(rule.rule_type)}
                      </p>
                      <p className="text-sm font-medium text-primary">
                        {rule.portfolios?.name} • {formatRuleValue(rule.rule_type, rule.rule_value)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge variant={rule.is_active ? "default" : "secondary"}>
                      {rule.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => toggleRuleStatus(rule.id, checked)}
                    />
                  </div>
                </div>
              ))}
              
              {riskRules.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Risk Rules</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start protecting your capital by creating risk management rules
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Rule
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Risk Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Risk Management Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <p className="font-medium">Position Sizing</p>
                  <p className="text-sm text-muted-foreground">
                    Never risk more than 2-5% of your portfolio on a single trade
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <p className="font-medium">Stop Losses</p>
                  <p className="text-sm text-muted-foreground">
                    Set stop losses at 1-3% below your entry point
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <p className="font-medium">Diversification</p>
                  <p className="text-sm text-muted-foreground">
                    Spread risk across different sectors and asset classes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <p className="font-medium">Daily Limits</p>
                  <p className="text-sm text-muted-foreground">
                    Set maximum daily loss limits to prevent emotional trading
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card/95 to-warning/5 border-warning/10">
            <CardHeader>
              <CardTitle className="text-lg">Risk Warnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium">High Concentration Risk</p>
                  <p className="text-sm text-muted-foreground">
                    Your portfolio may be too concentrated in specific sectors
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium">Missing Stop Losses</p>
                  <p className="text-sm text-muted-foreground">
                    Some positions don't have protective stop loss orders
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="font-medium">Large Position Sizes</p>
                  <p className="text-sm text-muted-foreground">
                    Consider reducing position sizes to lower overall risk
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RiskManagement;