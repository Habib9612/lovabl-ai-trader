import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FMPCompanyProfile {
  symbol: string;
  companyName: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  changesPercentage: number;
  currency: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  dcf: number;
  dcfDiff: number;
  image: string;
  ipoDate: string;
  isActivelyTrading: boolean;
}

export interface FMPFinancialRatios {
  symbol: string;
  date: string;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  daysOfSalesOutstanding: number;
  daysOfInventoryOutstanding: number;
  operatingCycle: number;
  daysOfPayablesOutstanding: number;
  cashConversionCycle: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  pretaxProfitMargin: number;
  netProfitMargin: number;
  effectiveTaxRate: number;
  returnOnAssets: number;
  returnOnEquity: number;
  returnOnCapitalEmployed: number;
  netIncomePerEBT: number;
  ebtPerEbit: number;
  ebitPerRevenue: number;
  debtRatio: number;
  debtEquityRatio: number;
  longTermDebtToCapitalization: number;
  totalDebtToCapitalization: number;
  interestCoverage: number;
  cashFlowToDebtRatio: number;
  companyEquityMultiplier: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  fixedAssetTurnover: number;
  assetTurnover: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  payoutRatio: number;
  operatingCashFlowSalesRatio: number;
  freeCashFlowOperatingCashFlowRatio: number;
  cashFlowCoverageRatios: number;
  shortTermCoverageRatios: number;
  capitalExpenditureCoverageRatio: number;
  dividendPaidAndCapexCoverageRatio: number;
  priceBookValueRatio: number;
  priceToBookRatio: number;
  priceToSalesRatio: number;
  priceEarningsRatio: number;
  priceToFreeCashFlowsRatio: number;
  priceToOperatingCashFlowsRatio: number;
  priceCashFlowRatio: number;
  priceEarningsToGrowthRatio: number;
  priceSalesRatio: number;
  dividendYield: number;
  enterpriseValueMultiple: number;
  priceFairValue: number;
}

export interface FMPKeyMetrics {
  symbol: string;
  date: string;
  period: string;
  revenuePerShare: number;
  netIncomePerShare: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  bookValuePerShare: number;
  tangibleBookValuePerShare: number;
  shareholdersEquityPerShare: number;
  interestDebtPerShare: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  priceToSalesRatio: number;
  pocfratio: number;
  pfcfRatio: number;
  pbRatio: number;
  ptbRatio: number;
  evToSales: number;
  enterpriseValueOverEBITDA: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  earningsYield: number;
  freeCashFlowYield: number;
  debtToEquity: number;
  debtToAssets: number;
  netDebtToEBITDA: number;
  currentRatio: number;
  interestCoverage: number;
  incomeQuality: number;
  dividendYield: number;
  payoutRatio: number;
  salesGeneralAndAdministrativeToRevenue: number;
  researchAndDdevelopementToRevenue: number;
  intangiblesToTotalAssets: number;
  capexToOperatingCashFlow: number;
  capexToRevenue: number;
  capexToDepreciation: number;
  stockBasedCompensationToRevenue: number;
  grahamNumber: number;
  roic: number;
  returnOnTangibleAssets: number;
  grahamNetNet: number;
  workingCapital: number;
  tangibleAssetValue: number;
  netCurrentAssetValue: number;
  investedCapital: number;
  averageReceivables: number;
  averagePayables: number;
  averageInventory: number;
  daysSalesInReceivables: number;
  daysPayablesOutstanding: number;
  daysOfInventoryOnHand: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  roe: number;
  capexPerShare: number;
}

export interface FMPIncomeStatement {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  grossProfitRatio: number;
  researchAndDevelopmentExpenses: number;
  generalAndAdministrativeExpenses: number;
  sellingAndMarketingExpenses: number;
  sellingGeneralAndAdministrativeExpenses: number;
  otherExpenses: number;
  operatingExpenses: number;
  costAndExpenses: number;
  interestIncome: number;
  interestExpense: number;
  depreciationAndAmortization: number;
  ebitda: number;
  ebitdaratio: number;
  operatingIncome: number;
  operatingIncomeRatio: number;
  totalOtherIncomeExpensesNet: number;
  incomeBeforeTax: number;
  incomeBeforeTaxRatio: number;
  incomeTaxExpense: number;
  netIncome: number;
  netIncomeRatio: number;
  eps: number;
  epsdiluted: number;
  weightedAverageShsOut: number;
  weightedAverageShsOutDil: number;
  link: string;
  finalLink: string;
}

export const useFMPData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFMPData = async (endpoint: string, symbol: string, options: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('fmp-data', {
        body: { endpoint, symbol, ...options }
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCompanyProfile = async (symbol: string): Promise<FMPCompanyProfile[]> => {
    return fetchFMPData('profile', symbol);
  };

  const getIncomeStatement = async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5): Promise<FMPIncomeStatement[]> => {
    return fetchFMPData('income-statement', symbol, { period, limit });
  };

  const getBalanceSheet = async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5) => {
    return fetchFMPData('balance-sheet', symbol, { period, limit });
  };

  const getCashFlow = async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5) => {
    return fetchFMPData('cash-flow', symbol, { period, limit });
  };

  const getFinancialRatios = async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5): Promise<FMPFinancialRatios[]> => {
    return fetchFMPData('ratios', symbol, { period, limit });
  };

  const getKeyMetrics = async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5): Promise<FMPKeyMetrics[]> => {
    return fetchFMPData('key-metrics', symbol, { period, limit });
  };

  const getGrowthMetrics = async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5) => {
    return fetchFMPData('growth', symbol, { period, limit });
  };

  const getDCFValuation = async (symbol: string) => {
    return fetchFMPData('dcf', symbol);
  };

  const getCompanyRating = async (symbol: string) => {
    return fetchFMPData('rating', symbol);
  };

  const getInsiderTrading = async (symbol: string, limit: number = 100) => {
    return fetchFMPData('insider-trading', symbol, { limit });
  };

  const getInstitutionalHolders = async (symbol: string) => {
    return fetchFMPData('institutional-holders', symbol);
  };

  const getAnalystEstimates = async (symbol: string, period: 'annual' | 'quarter' = 'annual', limit: number = 5) => {
    return fetchFMPData('analyst-estimates', symbol, { period, limit });
  };

  const getPriceTarget = async (symbol: string) => {
    return fetchFMPData('price-target', symbol);
  };

  const getEarningsCalendar = async (symbol: string) => {
    return fetchFMPData('earnings-calendar', symbol);
  };

  const getStockNews = async (symbol: string, limit: number = 50) => {
    return fetchFMPData('news', symbol, { limit });
  };

  return {
    loading,
    error,
    getCompanyProfile,
    getIncomeStatement,
    getBalanceSheet,
    getCashFlow,
    getFinancialRatios,
    getKeyMetrics,
    getGrowthMetrics,
    getDCFValuation,
    getCompanyRating,
    getInsiderTrading,
    getInstitutionalHolders,
    getAnalystEstimates,
    getPriceTarget,
    getEarningsCalendar,
    getStockNews
  };
};