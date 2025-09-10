import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OandaAccount {
  id: string;
  currency: string;
  balance: number;
  unrealizedPL: number;
  nav: number;
  marginUsed: number;
  marginAvailable: number;
}

interface OandaInstrument {
  name: string;
  type: string;
  displayName: string;
  pipLocation: number;
  displayPrecision: number;
}

interface OandaPrice {
  instrument: string;
  time: string;
  bids: Array<{ price: string; liquidity: number }>;
  asks: Array<{ price: string; liquidity: number }>;
}

interface OandaPosition {
  instrument: string;
  long: {
    units: string;
    averagePrice?: string;
    pl: string;
    unrealizedPL: string;
  };
  short: {
    units: string;
    averagePrice?: string;
    pl: string;
    unrealizedPL: string;
  };
}

interface OandaTrade {
  id: string;
  instrument: string;
  price: string;
  openTime: string;
  initialUnits: string;
  currentUnits: string;
  state: string;
  unrealizedPL: string;
}

interface PlaceOrderParams {
  accountId: string;
  instrument: string;
  units: number;
  type?: 'MARKET' | 'LIMIT' | 'STOP';
  price?: number;
  timeInForce?: 'FOK' | 'IOC' | 'GTC' | 'DAY';
}

export const useOandaTrading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<OandaAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<OandaAccount | null>(null);
  const [instruments, setInstruments] = useState<OandaInstrument[]>([]);
  const [positions, setPositions] = useState<OandaPosition[]>([]);
  const [trades, setTrades] = useState<OandaTrade[]>([]);
  const { toast } = useToast();

  const callOandaFunction = async (action: string, params: any = {}) => {
    const { data, error } = await supabase.functions.invoke('oanda-trading', {
      body: { action, ...params }
    });

    if (error) {
      console.error('OANDA function error:', error);
      throw new Error(error.message || 'Failed to call OANDA API');
    }

    if (!data.success) {
      throw new Error(data.error || 'OANDA API request failed');
    }

    return data.data;
  };

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const result = await callOandaFunction('getAccounts');
      const accountsData = result.accounts.map((acc: any) => ({
        id: acc.id,
        currency: acc.currency,
        balance: parseFloat(acc.balance),
        unrealizedPL: parseFloat(acc.unrealizedPL),
        nav: parseFloat(acc.NAV),
        marginUsed: parseFloat(acc.marginUsed),
        marginAvailable: parseFloat(acc.marginAvailable)
      }));
      
      setAccounts(accountsData);
      
      if (accountsData.length > 0) {
        setSelectedAccount(accountsData[0]);
        await loadAccountData(accountsData[0].id);
      }
      
      toast({
        title: "Success",
        description: `Loaded ${accountsData.length} OANDA demo account(s)`
      });
    } catch (error) {
      console.error('Error loading accounts:', error);
      let errorMessage = `Failed to load accounts: ${error.message}`;
      
      if (error.message.includes('Unauthorized')) {
        errorMessage = 'Invalid OANDA token. Please check your OANDA_DEMO_TOKEN secret and ensure you have a valid demo account token.';
      }
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAccountData = async (accountId: string) => {
    try {
      // Load instruments
      const instrumentsResult = await callOandaFunction('getInstruments', { accountId });
      setInstruments(instrumentsResult.instruments);

      // Load positions
      const positionsResult = await callOandaFunction('getPositions', { accountId });
      setPositions(positionsResult.positions);

      // Load trades
      const tradesResult = await callOandaFunction('getTrades', { accountId });
      setTrades(tradesResult.trades);
    } catch (error) {
      console.error('Error loading account data:', error);
      toast({
        title: "Error",
        description: `Failed to load account data: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const getPrice = async (accountId: string, instrument: string): Promise<OandaPrice | null> => {
    try {
      const result = await callOandaFunction('getPricing', { accountId, instrument });
      return result.prices[0] || null;
    } catch (error) {
      console.error('Error getting price:', error);
      return null;
    }
  };

  const placeOrder = async (params: PlaceOrderParams) => {
    setIsLoading(true);
    try {
      const result = await callOandaFunction('placeOrder', params);
      
      toast({
        title: "Order Placed",
        description: `Successfully placed ${params.type || 'MARKET'} order for ${params.instrument}`
      });

      // Refresh account data
      await loadAccountData(params.accountId);
      
      return result;
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: `Failed to place order: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccountData = async () => {
    if (selectedAccount) {
      await loadAccountData(selectedAccount.id);
    }
  };

  return {
    isLoading,
    accounts,
    selectedAccount,
    instruments,
    positions,
    trades,
    loadAccounts,
    setSelectedAccount,
    getPrice,
    placeOrder,
    refreshAccountData
  };
};