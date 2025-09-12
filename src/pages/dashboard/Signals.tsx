import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Users, Target, Plus, Heart, MessageCircle, Share, Filter, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Signal {
  id: string;
  user_id: string;
  asset_id: string;
  signal_type: 'BUY' | 'SELL' | 'HOLD';
  entry_price: number;
  target_price: number;
  stop_loss: number;
  confidence_level: number;
  reasoning: string;
  status: 'active' | 'completed' | 'cancelled';
  followers_count: number;
  success_rate: number;
  created_at: string;
  expires_at: string;
  profiles?: any;
  assets?: any;
  signal_followers?: any[];
}

const Signals = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [mySignals, setMySignals] = useState<Signal[]>([]);
  const [followedSignals, setFollowedSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [newSignal, setNewSignal] = useState({
    asset_symbol: '',
    signal_type: 'BUY' as const,
    entry_price: '',
    target_price: '',
    stop_loss: '',
    confidence_level: 5,
    reasoning: ''
  });

  useEffect(() => {
    fetchSignals();
    if (user) {
      fetchMySignals();
      fetchFollowedSignals();
    }
  }, [user]);

  const fetchSignals = async () => {
    try {
      const { data, error } = await supabase
        .from('signals')
        .select(`
          *,
          assets!fk_signals_asset_id(symbol, name),
          signal_followers!fk_signal_followers_signal_id(follower_id)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSignals((data || []) as Signal[]);
    } catch (error) {
      console.error('Error fetching signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMySignals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('signals')
        .select(`
          *,
          assets!fk_signals_asset_id(symbol, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMySignals((data || []) as any);
    } catch (error) {
      console.error('Error fetching my signals:', error);
    }
  };

  const fetchFollowedSignals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('signal_followers')
        .select(`
          signals!fk_signal_followers_signal_id(
            *,
            assets!fk_signals_asset_id(symbol, name)
          )
        `)
        .eq('follower_id', user.id);

      if (error) throw error;
      setFollowedSignals((data?.map(item => item.signals).filter(Boolean) || []) as any);
    } catch (error) {
      console.error('Error fetching followed signals:', error);
    }
  };

  const createSignal = async () => {
    if (!user) return;

    try {
      // First, get or create asset
      let { data: asset } = await supabase
        .from('assets')
        .select('id')
        .eq('symbol', newSignal.asset_symbol.toUpperCase())
        .single();

      if (!asset) {
        const { data: newAsset, error: assetError } = await supabase
          .from('assets')
          .insert({
            symbol: newSignal.asset_symbol.toUpperCase(),
            name: newSignal.asset_symbol.toUpperCase(),
            asset_type: 'stock'
          })
          .select('id')
          .single();

        if (assetError) throw assetError;
        asset = newAsset;
      }

      const { error } = await supabase
        .from('signals')
        .insert({
          user_id: user.id,
          asset_id: asset.id,
          signal_type: newSignal.signal_type,
          entry_price: parseFloat(newSignal.entry_price),
          target_price: newSignal.target_price ? parseFloat(newSignal.target_price) : null,
          stop_loss: newSignal.stop_loss ? parseFloat(newSignal.stop_loss) : null,
          confidence_level: newSignal.confidence_level,
          reasoning: newSignal.reasoning
        });

      if (error) throw error;

      toast({
        title: "Signal Created",
        description: "Your trading signal has been published successfully.",
      });

      setShowCreateDialog(false);
      setNewSignal({
        asset_symbol: '',
        signal_type: 'BUY',
        entry_price: '',
        target_price: '',
        stop_loss: '',
        confidence_level: 5,
        reasoning: ''
      });

      fetchSignals();
      fetchMySignals();
    } catch (error) {
      console.error('Error creating signal:', error);
      toast({
        title: "Error",
        description: "Failed to create signal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const followSignal = async (signalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('signal_followers')
        .insert({
          signal_id: signalId,
          follower_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Following Signal",
        description: "You're now following this signal.",
      });

      fetchSignals();
      fetchFollowedSignals();
    } catch (error) {
      console.error('Error following signal:', error);
    }
  };

  const unfollowSignal = async (signalId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('signal_followers')
        .delete()
        .eq('signal_id', signalId)
        .eq('follower_id', user.id);

      if (error) throw error;

      toast({
        title: "Unfollowed Signal",
        description: "You're no longer following this signal.",
      });

      fetchSignals();
      fetchFollowedSignals();
    } catch (error) {
      console.error('Error unfollowing signal:', error);
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'BUY':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'SELL':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Target className="h-4 w-4 text-warning" />;
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'bg-success text-success-foreground';
      case 'SELL':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-warning text-warning-foreground';
    }
  };

  const isFollowing = (signalId: string) => {
    return followedSignals.some(signal => signal.id === signalId);
  };

  const SignalCard = ({ signal, showActions = true }: { signal: Signal; showActions?: boolean }) => (
    <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5 border-primary/10 hover:shadow-xl hover:border-primary/30 transition-all group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                {signal.profiles?.display_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{signal.profiles?.display_name || 'Anonymous'}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(signal.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getSignalColor(signal.signal_type)}>
              {getSignalIcon(signal.signal_type)}
              <span className="ml-1">{signal.signal_type}</span>
            </Badge>
          </div>
        </div>
        
        <div>
          <CardTitle className="text-lg group-hover:text-primary transition-colors">
            {signal.assets?.symbol} - {signal.assets?.name}
          </CardTitle>
          <CardDescription>
            Confidence: {signal.confidence_level}/10 | Followers: {signal.followers_count}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Entry Price</p>
            <p className="font-semibold">${signal.entry_price}</p>
          </div>
          {signal.target_price && (
            <div>
              <p className="text-xs text-muted-foreground">Target Price</p>
              <p className="font-semibold text-success">${signal.target_price}</p>
            </div>
          )}
          {signal.stop_loss && (
            <div>
              <p className="text-xs text-muted-foreground">Stop Loss</p>
              <p className="font-semibold text-destructive">${signal.stop_loss}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Success Rate</p>
            <p className="font-semibold">{signal.success_rate}%</p>
          </div>
        </div>
        
        {signal.reasoning && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Analysis</p>
            <p className="text-sm bg-background/50 p-3 rounded-lg border">{signal.reasoning}</p>
          </div>
        )}
        
        {showActions && user && signal.user_id !== user.id && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            {isFollowing(signal.id) ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => unfollowSignal(signal.id)}
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-2" />
                Following
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => followSignal(signal.id)}
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform"
              >
                <Users className="h-4 w-4 mr-2" />
                Follow
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
              Trading Signals
            </h1>
            <p className="text-muted-foreground mt-2">
              Follow expert traders and share your own signals
            </p>
          </div>
          
          {user && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Signal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Trading Signal</DialogTitle>
                  <DialogDescription>
                    Share your trading signal with the community
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Asset Symbol (e.g., AAPL)"
                    value={newSignal.asset_symbol}
                    onChange={(e) => setNewSignal({...newSignal, asset_symbol: e.target.value.toUpperCase()})}
                  />
                  
                  <Select value={newSignal.signal_type} onValueChange={(value: any) => setNewSignal({...newSignal, signal_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Signal Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUY">Buy</SelectItem>
                      <SelectItem value="SELL">Sell</SelectItem>
                      <SelectItem value="HOLD">Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Entry Price"
                      type="number"
                      value={newSignal.entry_price}
                      onChange={(e) => setNewSignal({...newSignal, entry_price: e.target.value})}
                    />
                    <Input
                      placeholder="Target Price"
                      type="number"
                      value={newSignal.target_price}
                      onChange={(e) => setNewSignal({...newSignal, target_price: e.target.value})}
                    />
                  </div>
                  
                  <Input
                    placeholder="Stop Loss"
                    type="number"
                    value={newSignal.stop_loss}
                    onChange={(e) => setNewSignal({...newSignal, stop_loss: e.target.value})}
                  />
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Confidence Level: {newSignal.confidence_level}/10
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newSignal.confidence_level}
                      onChange={(e) => setNewSignal({...newSignal, confidence_level: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                  
                  <Textarea
                    placeholder="Reasoning and analysis..."
                    value={newSignal.reasoning}
                    onChange={(e) => setNewSignal({...newSignal, reasoning: e.target.value})}
                    rows={3}
                  />
                  
                  <Button onClick={createSignal} className="w-full">
                    Publish Signal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Signals</p>
                  <p className="text-2xl font-bold text-primary">{signals.length}</p>
                </div>
                <Target className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-success/5 border-success/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Buy Signals</p>
                  <p className="text-2xl font-bold text-success">
                    {signals.filter(s => s.signal_type === 'BUY').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-destructive/5 border-destructive/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sell Signals</p>
                  <p className="text-2xl font-bold text-destructive">
                    {signals.filter(s => s.signal_type === 'SELL').length}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-accent/5 border-accent/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Following</p>
                  <p className="text-2xl font-bold text-accent">{followedSignals.length}</p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border-primary/20">
            <TabsTrigger value="discover" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Discover
            </TabsTrigger>
            <TabsTrigger value="following" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Following
            </TabsTrigger>
            <TabsTrigger value="my-signals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              My Signals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {signals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {followedSignals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} showActions={false} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-signals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mySignals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} showActions={false} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Signals;