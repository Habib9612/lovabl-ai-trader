import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

interface Portfolio {
  cash: number;
  market_value: number;
  total_value: number;
  total_pnl: number;
  total_pnl_percent: number;
  initial_cash: number;
  positions: any[];
}

interface Order {
  id: string;
  symbol: string;
  quantity: number;
  side: 'BUY' | 'SELL';
  price: number;
  status: string;
  created_at: string;
}

export const useDemoTrading = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio>({
    cash: 0,
    market_value: 0,
    total_value: 0,
    total_pnl: 0,
    total_pnl_percent: 0,
    initial_cash: 100000,
    positions: []
  });
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  const callDemoTradingFunction = async (action: string, params: any = {}) => {
    const { data, error } = await supabase.functions.invoke('demo-trading', {
      body: { action, ...params }
    });

    if (error) {
      console.error('Demo trading function error:', error);
      throw new Error(error.message || 'Failed to call demo trading API');
    }

    if (!data.success) {
      throw new Error(data.error || 'Demo trading API request failed');
    }

    return data.data;
  };

  const loadMarketData = async () => {
    try {
      const data = await callDemoTradingFunction('getMarketData');
      setMarketData(data);
    } catch (error) {
      console.error('Error loading market data:', error);
      toast({
        title: "Error",
        description: "Failed to load market data",
        variant: "destructive"
      });
    }
  };

  const loadPortfolio = async () => {
    try {
      const data = await callDemoTradingFunction('getPortfolio');
      setPortfolio(data);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio",
        variant: "destructive"
      });
    }
  };

  const loadOrderHistory = async () => {
    try {
      const data = await callDemoTradingFunction('getOrderHistory');
      setOrderHistory(data);
    } catch (error) {
      console.error('Error loading order history:', error);
      toast({
        title: "Error",
        description: "Failed to load order history",
        variant: "destructive"
      });
    }
  };

  const placeOrder = async (symbol: string, quantity: number, side: 'BUY' | 'SELL') => {
    setLoading(true);
    try {
      const result = await callDemoTradingFunction('placeOrder', {
        symbol,
        quantity,
        side
      });

      toast({
        title: "Order Executed",
        description: result.message,
      });

      // Reload data
      await Promise.all([loadPortfolio(), loadOrderHistory()]);

      return result;
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createDemoAccount = async () => {
    try {
      await callDemoTradingFunction('createDemoAccount');
      toast({
        title: "Demo Account Created",
        description: "Your demo trading account has been set up with $100,000",
      });
      await loadPortfolio();
    } catch (error) {
      console.error('Error creating demo account:', error);
      toast({
        title: "Error",
        description: "Failed to create demo account",
        variant: "destructive"
      });
    }
  };

  const refreshData = async () => {
    await Promise.all([
      loadMarketData(),
      loadPortfolio(),
      loadOrderHistory()
    ]);
  };

  useEffect(() => {
    refreshData();

    // Set up periodic refresh for market data
    const interval = setInterval(() => {
      loadMarketData();
      loadPortfolio(); // Update portfolio with new prices
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    marketData,
    portfolio,
    orderHistory,
    loading,
    placeOrder,
    createDemoAccount,
    refreshData,
    loadMarketData,
    loadPortfolio,
    loadOrderHistory
  };
};