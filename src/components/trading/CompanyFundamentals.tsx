import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useFMPData, FMPCompanyProfile, FMPFinancialRatios, FMPKeyMetrics, FMPIncomeStatement } from '@/hooks/useFMPData';
import { TrendingUp, TrendingDown, Building2, DollarSign, BarChart3, Users, Calendar, Target } from 'lucide-react';

interface CompanyFundamentalsProps {
  symbol: string;
  demoMode?: boolean;
}

export const CompanyFundamentals = ({ symbol, demoMode = false }: CompanyFundamentalsProps) => {
  const { 
    loading, 
    error, 
    getCompanyProfile, 
    getFinancialRatios, 
    getKeyMetrics, 
    getIncomeStatement,
    getDCFValuation,
    getCompanyRating
  } = useFMPData();

  const [profile, setProfile] = useState<FMPCompanyProfile | null>(null);
  const [ratios, setRatios] = useState<FMPFinancialRatios[]>([]);
  const [keyMetrics, setKeyMetrics] = useState<FMPKeyMetrics[]>([]);
  const [incomeStatement, setIncomeStatement] = useState<FMPIncomeStatement[]>([]);
  const [dcf, setDcf] = useState<any>(null);
  const [rating, setRating] = useState<any>(null);

  // Demo data generator
  const generateDemoData = () => {
    return {
      profile: {
        symbol,
        companyName: `${symbol} Inc.`,
        price: 150.25,
        beta: 1.2,
        mktCap: 2500000000,
        description: `${symbol} is a leading technology company.`,
        ceo: 'John Doe',
        sector: 'Technology',
        industry: 'Software',
        exchange: 'NASDAQ',
        website: `https://www.${symbol.toLowerCase()}.com`,
        fullTimeEmployees: '50000',
        country: 'US',
        volAvg: 45000000,
        lastDiv: 0.25,
        range: '$130.50 - $175.80',
        changes: 2.45,
        changesPercentage: 1.65,
        currency: 'USD',
        ipoDate: '2010-12-13',
        image: null
      } as FMPCompanyProfile,
      ratios: [{
        currentRatio: 2.1,
        quickRatio: 1.8,
        returnOnEquity: 0.18,
        returnOnAssets: 0.12,
        debtEquityRatio: 0.3,
        grossProfitMargin: 0.38,
        operatingProfitMargin: 0.25,
        netProfitMargin: 0.21,
        debtRatio: 0.25,
        interestCoverage: 12.5,
        cashRatio: 0.85
      } as FMPFinancialRatios],
      keyMetrics: [{
        peRatio: 25.5,
        pbRatio: 3.2,
        priceToSalesRatio: 6.8,
        enterpriseValueOverEBITDA: 18.2,
        revenuePerShare: 22.15,
        bookValuePerShare: 47.30,
        freeCashFlowPerShare: 6.85,
        cashPerShare: 12.40,
        roic: 0.15,
        roe: 0.18,
        marketCap: 2500000000,
        dividendYield: 0.0167
      } as FMPKeyMetrics],
      incomeStatement: [{
        revenue: 365000000000,
        grossProfit: 152000000000,
        netIncome: 95000000000,
        eps: 6.05,
        date: '2023-12-31',
        symbol,
        period: 'FY'
      } as FMPIncomeStatement],
      dcf: { dcf: 165.50 },
      rating: { 
        rating: 'A+',
        ratingScore: 4.5,
        ratingRecommendation: 'Strong Buy'
      }
    };
  };

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      if (demoMode) {
        const demoData = generateDemoData();
        setProfile(demoData.profile);
        setRatios(demoData.ratios);
        setKeyMetrics(demoData.keyMetrics);
        setIncomeStatement(demoData.incomeStatement);
        setDcf(demoData.dcf);
        setRating(demoData.rating);
        return;
      }

      try {
        const [profileData, ratiosData, metricsData, incomeData, dcfData, ratingData] = await Promise.all([
          getCompanyProfile(symbol),
          getFinancialRatios(symbol),
          getKeyMetrics(symbol),
          getIncomeStatement(symbol),
          getDCFValuation(symbol),
          getCompanyRating(symbol)
        ]);

        setProfile(profileData?.[0] || null);
        setRatios(ratiosData || []);
        setKeyMetrics(metricsData || []);
        setIncomeStatement(incomeData || []);
        setDcf(dcfData?.[0] || null);
        setRating(ratingData?.[0] || null);
      } catch (err) {
        console.error('Error fetching fundamentals:', err);
      }
    };

    fetchData();
  }, [symbol, demoMode]);

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value?.toFixed(2) || 0}`;
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatNumber = (value: number) => value?.toFixed(2) || 'N/A';

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive">Error loading fundamentals: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const currentRatio = ratios[0];
  const currentMetrics = keyMetrics[0];
  const currentIncome = incomeStatement[0];

  return (
    <div className="space-y-6">
      {/* Company Overview */}
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile.image && (
                <img src={profile.image} alt={profile.companyName} className="w-12 h-12 rounded-lg" />
              )}
              <div>
                <CardTitle className="text-xl">{profile.companyName}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {profile.sector} • {profile.industry}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(profile.price)}</div>
              <div className={`flex items-center gap-1 ${profile.changes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profile.changes >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatCurrency(profile.changes)} ({formatPercentage(profile.changesPercentage / 100)})
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="font-semibold">{formatCurrency(profile.mktCap)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Volume (Avg)</p>
                <p className="font-semibold">{(profile.volAvg / 1e6).toFixed(1)}M</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="font-semibold">{profile.fullTimeEmployees || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">IPO Date</p>
                <p className="font-semibold">{profile.ipoDate || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Data Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ratios">Ratios</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="valuation">Valuation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Stock Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">52W Range</span>
                    <span className="text-sm font-medium">{profile.range}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Beta</span>
                    <span className="text-sm font-medium">{formatNumber(profile.beta)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Dividend</span>
                    <span className="text-sm font-medium">{formatCurrency(profile.lastDiv)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {rating && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Analyst Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rating</span>
                      <Badge variant={rating.ratingRecommendation === 'Strong Buy' ? 'default' : 'secondary'}>
                        {rating.ratingRecommendation}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Score</span>
                      <span className="text-sm font-medium">{rating.ratingScore}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {dcf && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    DCF Valuation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fair Value</span>
                      <span className="text-sm font-medium">{formatCurrency(dcf.dcf)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">vs Current</span>
                      <span className={`text-sm font-medium ${dcf.dcf > profile.price ? 'text-green-600' : 'text-red-600'}`}>
                        {((dcf.dcf - profile.price) / profile.price * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="ratios" className="space-y-4">
          {currentRatio && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Liquidity Ratios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Ratio</span>
                      <span className="text-sm font-medium">{formatNumber(currentRatio.currentRatio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Quick Ratio</span>
                      <span className="text-sm font-medium">{formatNumber(currentRatio.quickRatio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cash Ratio</span>
                      <span className="text-sm font-medium">{formatNumber(currentRatio.cashRatio)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Profitability Ratios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Gross Margin</span>
                      <span className="text-sm font-medium">{formatPercentage(currentRatio.grossProfitMargin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Operating Margin</span>
                      <span className="text-sm font-medium">{formatPercentage(currentRatio.operatingProfitMargin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Net Margin</span>
                      <span className="text-sm font-medium">{formatPercentage(currentRatio.netProfitMargin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">ROE</span>
                      <span className="text-sm font-medium">{formatPercentage(currentRatio.returnOnEquity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">ROA</span>
                      <span className="text-sm font-medium">{formatPercentage(currentRatio.returnOnAssets)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Leverage Ratios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Debt/Equity</span>
                      <span className="text-sm font-medium">{formatNumber(currentRatio.debtEquityRatio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Debt Ratio</span>
                      <span className="text-sm font-medium">{formatNumber(currentRatio.debtRatio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Interest Coverage</span>
                      <span className="text-sm font-medium">{formatNumber(currentRatio.interestCoverage)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          {currentMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Valuation Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">P/E Ratio</span>
                      <span className="text-sm font-medium">{formatNumber(currentMetrics.peRatio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">P/B Ratio</span>
                      <span className="text-sm font-medium">{formatNumber(currentMetrics.pbRatio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">P/S Ratio</span>
                      <span className="text-sm font-medium">{formatNumber(currentMetrics.priceToSalesRatio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">EV/EBITDA</span>
                      <span className="text-sm font-medium">{formatNumber(currentMetrics.enterpriseValueOverEBITDA)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Per Share Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue/Share</span>
                      <span className="text-sm font-medium">{formatCurrency(currentMetrics.revenuePerShare)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Book Value/Share</span>
                      <span className="text-sm font-medium">{formatCurrency(currentMetrics.bookValuePerShare)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">FCF/Share</span>
                      <span className="text-sm font-medium">{formatCurrency(currentMetrics.freeCashFlowPerShare)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cash/Share</span>
                      <span className="text-sm font-medium">{formatCurrency(currentMetrics.cashPerShare)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Growth & Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">ROIC</span>
                      <span className="text-sm font-medium">{formatPercentage(currentMetrics.roic)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Income Quality</span>
                      <span className="text-sm font-medium">{formatNumber(currentMetrics.incomeQuality)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payout Ratio</span>
                      <span className="text-sm font-medium">{formatPercentage(currentMetrics.payoutRatio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Dividend Yield</span>
                      <span className="text-sm font-medium">{formatPercentage(currentMetrics.dividendYield)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Efficiency Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Receivables TO</span>
                      <span className="text-sm font-medium">{formatNumber(currentMetrics.receivablesTurnover)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Inventory TO</span>
                      <span className="text-sm font-medium">{formatNumber(currentMetrics.inventoryTurnover)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payables TO</span>
                      <span className="text-sm font-medium">{formatNumber(currentMetrics.payablesTurnover)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          {currentIncome && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Revenue & Profitability</CardTitle>
                  <CardDescription>Latest: {currentIncome.period} {currentIncome.calendarYear}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue</span>
                      <span className="text-sm font-medium">{formatCurrency(currentIncome.revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Gross Profit</span>
                      <span className="text-sm font-medium">{formatCurrency(currentIncome.grossProfit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Operating Income</span>
                      <span className="text-sm font-medium">{formatCurrency(currentIncome.operatingIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Net Income</span>
                      <span className="text-sm font-medium">{formatCurrency(currentIncome.netIncome)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Margins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Gross Margin</span>
                      <span className="text-sm font-medium">{formatPercentage(currentIncome.grossProfitRatio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Operating Margin</span>
                      <span className="text-sm font-medium">{formatPercentage(currentIncome.operatingIncomeRatio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Pre-tax Margin</span>
                      <span className="text-sm font-medium">{formatPercentage(currentIncome.incomeBeforeTaxRatio)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Net Margin</span>
                      <span className="text-sm font-medium">{formatPercentage(currentIncome.netIncomeRatio)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Per Share Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">EPS</span>
                      <span className="text-sm font-medium">{formatCurrency(currentIncome.eps)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">EPS Diluted</span>
                      <span className="text-sm font-medium">{formatCurrency(currentIncome.epsdiluted)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Shares Outstanding</span>
                      <span className="text-sm font-medium">{(currentIncome.weightedAverageShsOut / 1e6).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Diluted Shares</span>
                      <span className="text-sm font-medium">{(currentIncome.weightedAverageShsOutDil / 1e6).toFixed(1)}M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="valuation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dcf && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">DCF Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fair Value</span>
                      <span className="text-sm font-medium">{formatCurrency(dcf.dcf)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Price</span>
                      <span className="text-sm font-medium">{formatCurrency(profile.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Upside/Downside</span>
                      <span className={`text-sm font-medium ${dcf.dcf > profile.price ? 'text-green-600' : 'text-red-600'}`}>
                        {((dcf.dcf - profile.price) / profile.price * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {rating && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Analyst Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Recommendation</span>
                      <Badge variant={rating.ratingRecommendation === 'Strong Buy' ? 'default' : 'secondary'}>
                        {rating.ratingRecommendation}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rating Score</span>
                      <span className="text-sm font-medium">{rating.ratingScore}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Details</span>
                      <span className="text-sm font-medium">{rating.ratingDetailsDCFScore}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};