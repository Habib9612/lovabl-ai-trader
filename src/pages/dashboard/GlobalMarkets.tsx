import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, Globe, DollarSign, BarChart3, Activity, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GlobalMarket {
  id: string;
  symbol: string;
  name: string;
  market_type: 'forex' | 'commodities' | 'index' | 'crypto';
  current_price: number;
  change_24h: number;
  change_percentage_24h: number;
  volume_24h?: number;
  market_cap?: number;
  last_updated: string;
  metadata?: any;
}

const GlobalMarkets = () => {
  const [markets, setMarkets] = useState<GlobalMarket[]>([]);
  const [filteredMarkets, setFilteredMarkets] = useState<GlobalMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchGlobalMarkets();
  }, []);

  useEffect(() => {
    filterMarkets();
  }, [markets, activeTab, searchQuery]);

  const fetchGlobalMarkets = async () => {
    try {
      const { data, error } = await supabase
        .from('global_markets')
        .select('*')
        .order('current_price', { ascending: false });

      if (error) throw error;
      setMarkets((data || []) as GlobalMarket[]);
    } catch (error) {
      console.error('Error fetching global markets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch market data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMarkets = () => {
    let filtered = markets;

    if (activeTab !== 'all') {
      filtered = markets.filter(market => market.market_type === activeTab);
    }

    if (searchQuery) {
      filtered = filtered.filter(market =>
        market.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMarkets(filtered);
  };

  const getMarketIcon = (marketType: string) => {
    switch (marketType) {
      case 'forex':
        return <DollarSign className="h-5 w-5" />;
      case 'commodities':
        return <BarChart3 className="h-5 w-5" />;
      case 'index':
        return <Activity className="h-5 w-5" />;
      case 'crypto':
        return <Globe className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getMarketTypeColor = (marketType: string) => {
    switch (marketType) {
      case 'forex':
        return 'bg-primary text-primary-foreground';
      case 'commodities':
        return 'bg-warning text-warning-foreground';
      case 'index':
        return 'bg-accent text-accent-foreground';
      case 'crypto':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const formatPrice = (price: number, marketType: string) => {
    if (marketType === 'forex') {
      return price.toFixed(4);
    } else if (price >= 1000) {
      return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return price.toFixed(2);
    }
  };

  const formatVolume = (volume?: number) => {
    if (!volume) return 'N/A';
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toString();
  };

  const getMarketStats = () => {
    const forex = markets.filter(m => m.market_type === 'forex').length;
    const commodities = markets.filter(m => m.market_type === 'commodities').length;
    const indices = markets.filter(m => m.market_type === 'index').length;
    const crypto = markets.filter(m => m.market_type === 'crypto').length;

    return { forex, commodities, indices, crypto };
  };

  const stats = getMarketStats();

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
              Global Markets
            </h1>
            <p className="text-muted-foreground mt-2">
              Real-time data from forex, commodities, indices, and cryptocurrency markets
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Forex Pairs</p>
                  <p className="text-2xl font-bold text-primary">{stats.forex}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-warning/5 border-warning/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commodities</p>
                  <p className="text-2xl font-bold text-warning">{stats.commodities}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-accent/5 border-accent/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Market Indices</p>
                  <p className="text-2xl font-bold text-accent">{stats.indices}</p>
                </div>
                <Activity className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card to-success/5 border-success/20 hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Markets</p>
                  <p className="text-2xl font-bold text-success">{markets.length}</p>
                </div>
                <Globe className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Categories */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-card border-primary/20">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All Markets
            </TabsTrigger>
            <TabsTrigger value="forex" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Forex
            </TabsTrigger>
            <TabsTrigger value="commodities" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Commodities
            </TabsTrigger>
            <TabsTrigger value="index" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Indices
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Crypto
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Markets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMarkets.map((market) => (
                <Card key={market.id} className="bg-gradient-to-br from-card via-card/95 to-primary/5 border-primary/10 hover:shadow-xl hover:border-primary/30 transition-all group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getMarketTypeColor(market.market_type)}`}>
                          {getMarketIcon(market.market_type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {market.symbol}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {market.name}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getMarketTypeColor(market.market_type)}>
                        {market.market_type.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {market.market_type === 'forex' ? '' : '$'}{formatPrice(market.current_price, market.market_type)}
                      </span>
                      <div className={`flex items-center gap-1 ${market.change_percentage_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {market.change_percentage_24h >= 0 ? 
                          <TrendingUp className="h-4 w-4" /> : 
                          <TrendingDown className="h-4 w-4" />
                        }
                        <span className="font-medium">
                          {market.change_percentage_24h?.toFixed(2) || '0.00'}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">24h Change</p>
                        <p className={`font-medium ${market.change_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {market.change_24h >= 0 ? '+' : ''}{market.change_24h?.toFixed(4) || '0.0000'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Volume</p>
                        <p className="font-medium">{formatVolume(market.volume_24h)}</p>
                      </div>
                    </div>
                    
                    {market.market_cap && (
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Market Cap</span>
                          <span className="font-medium">${formatVolume(market.market_cap)}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        Last updated: {new Date(market.last_updated).toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMarkets.length === 0 && (
              <Card className="bg-gradient-to-br from-card to-muted/20 border-dashed border-2 border-muted">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Markets Found</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    {searchQuery 
                      ? 'No markets match your search criteria.' 
                      : `No ${activeTab} markets available at the moment.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Market News & Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Market Highlights</CardTitle>
              <CardDescription>Top performing markets today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {markets
                .sort((a, b) => (b.change_percentage_24h || 0) - (a.change_percentage_24h || 0))
                .slice(0, 5)
                .map((market) => (
                  <div key={market.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`p-1 rounded ${getMarketTypeColor(market.market_type)}`}>
                        {getMarketIcon(market.market_type)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{market.symbol}</p>
                        <p className="text-xs text-muted-foreground">{market.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {market.market_type === 'forex' ? '' : '$'}{formatPrice(market.current_price, market.market_type)}
                      </p>
                      <p className={`text-xs ${market.change_percentage_24h >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {market.change_percentage_24h >= 0 ? '+' : ''}{market.change_percentage_24h?.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card via-card/95 to-warning/5 border-warning/10">
            <CardHeader>
              <CardTitle className="text-lg">Market Status</CardTitle>
              <CardDescription>Current trading session information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-background/50 rounded-lg border">
                  <p className="text-sm font-medium text-green-600">• Forex Markets</p>
                  <p className="text-xs text-muted-foreground">24/7 Trading</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border">
                  <p className="text-sm font-medium text-blue-600">• US Markets</p>
                  <p className="text-xs text-muted-foreground">9:30 AM - 4:00 PM EST</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border">
                  <p className="text-sm font-medium text-orange-600">• European Markets</p>
                  <p className="text-xs text-muted-foreground">8:00 AM - 4:30 PM CET</p>
                </div>
                <div className="p-3 bg-background/50 rounded-lg border">
                  <p className="text-sm font-medium text-purple-600">• Asian Markets</p>
                  <p className="text-xs text-muted-foreground">9:00 AM - 3:00 PM JST</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Data refreshed every 5 minutes during trading hours
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GlobalMarkets;