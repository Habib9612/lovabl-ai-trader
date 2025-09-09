import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Heart, Share, Plus, Users, TrendingUp, BarChart3, Filter, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface CommunityMessage {
  id: string;
  user_id: string;
  content: string;
  message_type: 'general' | 'signal' | 'analysis' | 'question';
  asset_id?: string;
  likes_count: number;
  replies_count: number;
  parent_message_id?: string;
  created_at: string;
  profiles: any;
  assets?: any;
  replies?: CommunityMessage[];
}

const Community = () => {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const [newMessage, setNewMessage] = useState({
    content: '',
    message_type: 'general' as string,
    asset_symbol: ''
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          *,
          profiles:user_id (display_name),
          assets:asset_id (symbol, name)
        `)
        .is('parent_message_id', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages((data || []) as CommunityMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMessage = async () => {
    if (!user || !newMessage.content.trim()) return;

    try {
      let assetId = null;
      
      if (newMessage.asset_symbol) {
        // Get or create asset
        let { data: asset } = await supabase
          .from('assets')
          .select('id')
          .eq('symbol', newMessage.asset_symbol.toUpperCase())
          .single();

        if (!asset) {
          const { data: newAsset, error: assetError } = await supabase
            .from('assets')
            .insert({
              symbol: newMessage.asset_symbol.toUpperCase(),
              name: newMessage.asset_symbol.toUpperCase(),
              asset_type: 'stock'
            })
            .select('id')
            .single();

          if (assetError) throw assetError;
          asset = newAsset;
        }
        
        assetId = asset.id;
      }

      const { error } = await supabase
        .from('community_messages')
        .insert({
          user_id: user.id,
          content: newMessage.content,
          message_type: newMessage.message_type,
          asset_id: assetId
        });

      if (error) throw error;

      toast({
        title: "Message Posted",
        description: "Your message has been shared with the community.",
      });

      setShowCreateDialog(false);
      setNewMessage({
        content: '',
        message_type: 'general',
        asset_symbol: ''
      });

      fetchMessages();
    } catch (error) {
      console.error('Error creating message:', error);
      toast({
        title: "Error",
        description: "Failed to post message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const likeMessage = async (messageId: string) => {
    if (!user) return;

    try {
      // In a real app, you'd have a likes table to track individual likes
      // For now, we'll just increment the counter
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const { error } = await supabase
        .from('community_messages')
        .update({ likes_count: message.likes_count + 1 })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => prev.map(m => 
        m.id === messageId 
          ? { ...m, likes_count: m.likes_count + 1 }
          : m
      ));
    } catch (error) {
      console.error('Error liking message:', error);
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'signal':
        return <TrendingUp className="h-4 w-4" />;
      case 'analysis':
        return <BarChart3 className="h-4 w-4" />;
      case 'question':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'signal':
        return 'bg-success text-success-foreground';
      case 'analysis':
        return 'bg-primary text-primary-foreground';
      case 'question':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesType = selectedType === 'all' || message.message_type === selectedType;
    const matchesSearch = message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.assets?.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-secondary/20 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Trading Community
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect with traders, share insights, and learn together
            </p>
          </div>
          
          {user && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-transform">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share with Community</DialogTitle>
                  <DialogDescription>
                    Share your thoughts, analysis, or questions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Select value={newMessage.message_type} onValueChange={(value: any) => setNewMessage({...newMessage, message_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Post Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Discussion</SelectItem>
                      <SelectItem value="signal">Trading Signal</SelectItem>
                      <SelectItem value="analysis">Market Analysis</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {(['signal', 'analysis'].includes(newMessage.message_type)) && (
                    <Input
                      placeholder="Asset Symbol (e.g., AAPL)"
                      value={newMessage.asset_symbol}
                      onChange={(e) => setNewMessage({...newMessage, asset_symbol: e.target.value.toUpperCase()})}
                    />
                  )}
                  
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    rows={4}
                  />
                  
                  <Button onClick={createMessage} className="w-full">
                    Post Message
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
                  <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold text-primary">{messages.length}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-success/5 border-success/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Signals</p>
                  <p className="text-2xl font-bold text-success">
                    {messages.filter(m => m.message_type === 'signal').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-warning/5 border-warning/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Analysis</p>
                  <p className="text-2xl font-bold text-warning">
                    {messages.filter(m => m.message_type === 'analysis').length}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-accent/5 border-accent/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-accent">
                    {new Set(messages.map(m => m.user_id)).size}
                  </p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-to-r from-card/50 to-card border-primary/10 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts, users, or symbols..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50 border-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-48 bg-background/50 border-primary/20">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="signal">Signals</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                  <SelectItem value="question">Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages Feed */}
        <div className="space-y-6">
          {filteredMessages.map((message) => (
            <Card key={message.id} className="bg-gradient-to-br from-card via-card/95 to-primary/5 border-primary/10 hover:shadow-xl hover:border-primary/30 transition-all group">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                        {message.profiles?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-sm">{message.profiles?.display_name || 'Anonymous'}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getMessageTypeColor(message.message_type)}>
                      {getMessageTypeIcon(message.message_type)}
                      <span className="ml-1 capitalize">{message.message_type}</span>
                    </Badge>
                    {message.assets && (
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        ${message.assets.symbol}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{message.content}</p>
                
                <div className="flex items-center gap-4 pt-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likeMessage(message.id)}
                    className="hover:bg-accent/20 hover:text-accent"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    {message.likes_count}
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-primary/20 hover:text-primary">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {message.replies_count}
                  </Button>
                  <Button variant="ghost" size="sm" className="hover:bg-secondary/20">
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <Card className="bg-gradient-to-br from-card to-muted/20 border-dashed border-2 border-muted">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Posts Found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {searchQuery || selectedType !== 'all' 
                  ? 'No posts match your search criteria.' 
                  : 'Be the first to start a conversation in the community!'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Community;