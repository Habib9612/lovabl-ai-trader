import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  BookOpen, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar as CalendarIcon,
  Filter,
  Download,
  BarChart3,
  Target,
  DollarSign,
  Percent,
  Clock,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface JournalEntry {
  id: string;
  date: Date;
  symbol: string;
  strategy: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  pnl?: number;
  pnlPercent?: number;
  status: 'open' | 'closed' | 'cancelled';
  setup: string;
  reasoning: string;
  outcome: string;
  lessons: string;
  emotions: string;
  rating: number;
  screenshots?: string[];
  tags?: string[];
}

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    symbol: 'AAPL',
    strategy: 'ICT Breakout',
    direction: 'long',
    entryPrice: 175.50,
    exitPrice: 182.25,
    quantity: 100,
    pnl: 675,
    pnlPercent: 3.85,
    status: 'closed',
    setup: 'Break of structure after liquidity sweep',
    reasoning: 'Clear BOS with strong momentum and volume confirmation',
    outcome: 'Target hit perfectly, clean execution',
    lessons: 'Trust the setup when all confluences align',
    emotions: 'Confident and disciplined',
    rating: 5,
    tags: ['BOS', 'liquidity', 'momentum']
  },
  {
    id: '2',
    date: new Date('2024-01-12'),
    symbol: 'TSLA',
    strategy: 'Support/Resistance',
    direction: 'short',
    entryPrice: 248.75,
    exitPrice: 245.20,
    quantity: 50,
    pnl: 177.50,
    pnlPercent: 1.43,
    status: 'closed',
    setup: 'Rejection at key resistance level',
    reasoning: 'Multiple touches of resistance, showing weakness',
    outcome: 'Modest profit, could have held longer',
    lessons: 'Consider wider profit targets at strong levels',
    emotions: 'Impatient, took profit too early',
    rating: 3,
    tags: ['resistance', 'reversal']
  }
];

export const TradingJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>(mockEntries);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [filterStrategy, setFilterStrategy] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    symbol: '',
    strategy: '',
    direction: 'long' as 'long' | 'short',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    setup: '',
    reasoning: '',
    outcome: '',
    lessons: '',
    emotions: '',
    rating: 3,
    tags: ''
  });

  const resetForm = () => {
    setFormData({
      symbol: '',
      strategy: '',
      direction: 'long',
      entryPrice: '',
      exitPrice: '',
      quantity: '',
      setup: '',
      reasoning: '',
      outcome: '',
      lessons: '',
      emotions: '',
      rating: 3,
      tags: ''
    });
    setSelectedDate(undefined);
  };

  const handleAddEntry = () => {
    if (!formData.symbol || !formData.strategy || !formData.entryPrice || !selectedDate) {
      return;
    }

    const entryPrice = parseFloat(formData.entryPrice);
    const exitPrice = formData.exitPrice ? parseFloat(formData.exitPrice) : undefined;
    const quantity = parseInt(formData.quantity);

    let pnl: number | undefined;
    let pnlPercent: number | undefined;
    let status: 'open' | 'closed' = 'open';

    if (exitPrice) {
      const direction = formData.direction === 'long' ? 1 : -1;
      pnl = (exitPrice - entryPrice) * quantity * direction;
      pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100 * direction;
      status = 'closed';
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      symbol: formData.symbol.toUpperCase(),
      strategy: formData.strategy,
      direction: formData.direction,
      entryPrice,
      exitPrice,
      quantity,
      pnl,
      pnlPercent,
      status,
      setup: formData.setup,
      reasoning: formData.reasoning,
      outcome: formData.outcome,
      lessons: formData.lessons,
      emotions: formData.emotions,
      rating: formData.rating,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
    };

    setEntries([newEntry, ...entries]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const filteredEntries = entries.filter(entry => {
    if (filterStrategy !== 'all' && entry.strategy !== filterStrategy) return false;
    if (filterStatus !== 'all' && entry.status !== filterStatus) return false;
    return true;
  });

  const totalTrades = entries.length;
  const winningTrades = entries.filter(e => e.pnl && e.pnl > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnL = entries.reduce((sum, entry) => sum + (entry.pnl || 0), 0);
  const averageRating = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length 
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPnLColor = (pnl?: number) => {
    if (!pnl) return 'text-muted-foreground';
    return pnl > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrades}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{winningTrades}/{totalTrades} wins</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPnLColor(totalPnL)}`}>
              ${totalPnL.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Net profit/loss</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">Trade quality</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Trading Journal
            </CardTitle>
            <div className="flex items-center gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Entry
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Journal Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !selectedDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Symbol</Label>
                        <Input
                          placeholder="e.g., AAPL"
                          value={formData.symbol}
                          onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Strategy</Label>
                        <Input
                          placeholder="e.g., ICT Breakout"
                          value={formData.strategy}
                          onChange={(e) => setFormData({...formData, strategy: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Direction</Label>
                        <Select value={formData.direction} onValueChange={(value: 'long' | 'short') => setFormData({...formData, direction: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="long">Long</SelectItem>
                            <SelectItem value="short">Short</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Entry Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.entryPrice}
                          onChange={(e) => setFormData({...formData, entryPrice: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Exit Price (optional)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.exitPrice}
                          onChange={(e) => setFormData({...formData, exitPrice: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={formData.quantity}
                          onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Setup Description</Label>
                      <Textarea
                        placeholder="Describe the trade setup..."
                        value={formData.setup}
                        onChange={(e) => setFormData({...formData, setup: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Entry Reasoning</Label>
                      <Textarea
                        placeholder="Why did you enter this trade?"
                        value={formData.reasoning}
                        onChange={(e) => setFormData({...formData, reasoning: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Outcome & Lessons</Label>
                      <Textarea
                        placeholder="What was the outcome and what did you learn?"
                        value={formData.lessons}
                        onChange={(e) => setFormData({...formData, lessons: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Emotions</Label>
                      <Textarea
                        placeholder="How did you feel during this trade?"
                        value={formData.emotions}
                        onChange={(e) => setFormData({...formData, emotions: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Trade Rating (1-5)</Label>
                        <Select value={formData.rating.toString()} onValueChange={(value) => setFormData({...formData, rating: parseInt(value)})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Poor</SelectItem>
                            <SelectItem value="2">2 - Below Average</SelectItem>
                            <SelectItem value="3">3 - Average</SelectItem>
                            <SelectItem value="4">4 - Good</SelectItem>
                            <SelectItem value="5">5 - Excellent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tags (comma separated)</Label>
                        <Input
                          placeholder="e.g., BOS, momentum, liquidity"
                          value={formData.tags}
                          onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddEntry}>
                        Add Entry
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label>Filters:</Label>
            </div>
            <Select value={filterStrategy} onValueChange={setFilterStrategy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Strategies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strategies</SelectItem>
                <SelectItem value="ICT Breakout">ICT Breakout</SelectItem>
                <SelectItem value="Support/Resistance">Support/Resistance</SelectItem>
                <SelectItem value="Momentum">Momentum</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Journal Entries */}
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{entry.symbol}</span>
                            <Badge variant="outline">{entry.strategy}</Badge>
                            <Badge className={getStatusColor(entry.status)}>{entry.status}</Badge>
                            <Badge variant={entry.direction === 'long' ? 'default' : 'destructive'}>
                              {entry.direction === 'long' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                              {entry.direction.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {format(entry.date, 'PPP')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {entry.pnl && (
                          <div className={`text-lg font-bold ${getPnLColor(entry.pnl)}`}>
                            ${entry.pnl.toFixed(2)}
                          </div>
                        )}
                        {entry.pnlPercent && (
                          <div className={`text-sm ${getPnLColor(entry.pnl)}`}>
                            {entry.pnlPercent > 0 ? '+' : ''}{entry.pnlPercent.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Trade Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <span className="text-sm text-muted-foreground">Entry Price</span>
                        <div className="font-semibold">${entry.entryPrice}</div>
                      </div>
                      {entry.exitPrice && (
                        <div>
                          <span className="text-sm text-muted-foreground">Exit Price</span>
                          <div className="font-semibold">${entry.exitPrice}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-muted-foreground">Quantity</span>
                        <div className="font-semibold">{entry.quantity}</div>
                      </div>
                    </div>

                    {/* Analysis */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Setup:</span>
                        <p className="mt-1">{entry.setup}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Reasoning:</span>
                        <p className="mt-1">{entry.reasoning}</p>
                      </div>
                      {entry.lessons && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Lessons:</span>
                          <p className="mt-1">{entry.lessons}</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < entry.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            {entry.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Trade #{entry.id}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};