import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Brain, FileText, BookOpen, Target, Trash2, Download, Play, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface TrainingDocument {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'csv';
  size: number;
  uploadedAt: Date;
  processed: boolean;
  content?: string;
}

interface TrainingStrategy {
  id: string;
  model_id?: string;
  name: string;
  description: string;
  documentsCount: number;
  accuracy?: number;
  lastTrained?: Date;
  performance_metrics?: {
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
    avg_return: number;
  };
  predictions?: Array<{
    symbol: string;
    signal: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    target_price: number;
    stop_loss: number;
  }>;
}

const predefinedStrategies = [
  { id: 'scalping', name: 'Scalping Strategy', description: 'Quick profits from small price movements' },
  { id: 'swing', name: 'Swing Trading', description: 'Medium-term trades lasting days to weeks' },
  { id: 'momentum', name: 'Momentum Trading', description: 'Following strong price movements' },
  { id: 'mean-reversion', name: 'Mean Reversion', description: 'Trading oversold/overbought conditions' },
  { id: 'breakout', name: 'Breakout Trading', description: 'Trading price breaks through key levels' },
  { id: 'custom', name: 'Custom Strategy', description: 'Create your own trading strategy' }
];

export const AITraining = () => {
  const { user } = useAuth();
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [customStrategyName, setCustomStrategyName] = useState('');
  const [customStrategyDescription, setCustomStrategyDescription] = useState('');
  const [documents, setDocuments] = useState<TrainingDocument[]>([]);
  const [trainedStrategies, setTrainedStrategies] = useState<TrainingStrategy[]>([]);
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadTrainedModels();
    }
  }, [user]);

  const loadTrainedModels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_training_models')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const strategies: TrainingStrategy[] = data.map(model => ({
        id: model.id,
        model_id: model.model_id,
        name: model.strategy_name,
        description: `${model.strategy_type} strategy`,
        documentsCount: model.document_count || 0,
        accuracy: model.accuracy ? Math.round(model.accuracy * 100) : undefined,
        lastTrained: new Date(model.created_at),
        performance_metrics: model.performance_metrics as any,
        predictions: model.predictions as any
      }));

      setTrainedStrategies(strategies);
    } catch (error) {
      console.error('Error loading trained models:', error);
      toast.error('Failed to load trained models');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        const allowedTypes = ['application/pdf', 'text/plain', 'text/csv', 'application/vnd.ms-excel'];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File ${file.name} is not supported. Please upload PDF, TXT, or CSV files.`);
          continue;
        }

        // Read file content for processing
        const content = await readFileContent(file);
        
        const newDoc: TrainingDocument = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : file.type.includes('csv') ? 'csv' : 'text',
          size: file.size,
          uploadedAt: new Date(),
          processed: false,
          content: content
        };

        setDocuments(prev => [...prev, newDoc]);

        // Store document in database
        const { error } = await supabase
          .from('training_documents')
          .insert({
            user_id: user.id,
            name: file.name,
            file_type: newDoc.type,
            file_size: file.size,
            content_summary: content.substring(0, 500),
            processed: true
          });

        if (error) {
          console.error('Error storing document:', error);
        }

        // Mark as processed
        setTimeout(() => {
          setDocuments(prev => 
            prev.map(doc => 
              doc.id === newDoc.id ? { ...doc, processed: true } : doc
            )
          );
        }, 1000);
      }

      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content || '');
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const startTraining = async () => {
    if (!selectedStrategy || !user) {
      toast.error('Please select a strategy');
      return;
    }

    if (documents.filter(d => d.processed).length === 0) {
      toast.error('Please upload and process documents first');
      return;
    }

    setTraining(true);
    setTrainingProgress(0);

    try {
      // Progress simulation
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const strategyName = selectedStrategy === 'custom' 
        ? customStrategyName 
        : predefinedStrategies.find(s => s.id === selectedStrategy)?.name || 'Unknown Strategy';

      const strategyDescription = selectedStrategy === 'custom' 
        ? customStrategyDescription 
        : predefinedStrategies.find(s => s.id === selectedStrategy)?.description || '';

      // Prepare training data
      const trainingData = {
        documents: documents.filter(d => d.processed).map(doc => ({
          id: doc.id,
          name: doc.name,
          content: doc.content || '',
          type: doc.type
        })),
        strategy: {
          name: strategyName,
          type: selectedStrategy,
          description: strategyDescription
        }
      };

      // Call AI training function
      const { data, error } = await supabase.functions.invoke('ai-training', {
        body: {
          action: 'train',
          data: trainingData
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Training failed');
      }

      clearInterval(interval);
      setTrainingProgress(100);

      // Store training result in database
      const { error: dbError } = await supabase
        .from('ai_training_models')
        .insert({
          user_id: user.id,
          model_id: data.result.model_id,
          strategy_name: strategyName,
          strategy_type: selectedStrategy,
          accuracy: data.result.accuracy,
          parameters: data.result.parameters,
          features: data.result.features,
          performance_metrics: data.result.performance_metrics,
          predictions: data.result.predictions,
          document_count: documents.filter(d => d.processed).length
        });

      if (dbError) {
        console.error('Error storing training result:', dbError);
      }

      // Refresh trained models
      await loadTrainedModels();
      
      // Reset form
      setDocuments([]);
      setSelectedStrategy('');
      setCustomStrategyName('');
      setCustomStrategyDescription('');
      
      toast.success(`AI model trained successfully! Accuracy: ${Math.round(data.result.accuracy * 100)}%`);
    } catch (error) {
      console.error('Training error:', error);
      toast.error('Training failed. Please try again.');
    } finally {
      setTraining(false);
      setTrainingProgress(0);
    }
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Strategy Training
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Documents</TabsTrigger>
              <TabsTrigger value="train">Train Strategy</TabsTrigger>
              <TabsTrigger value="manage">Manage Strategies</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="space-y-4">
                <Label>Upload Training Documents</Label>
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Upload training documents</p>
                      <p className="text-sm text-muted-foreground">
                        PDF, TXT, or CSV files up to 10MB each
                      </p>
                    </div>
                  </div>
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading files...</span>
                  </div>
                  <Progress value={undefined} className="animate-pulse" />
                </div>
              )}

              {documents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatFileSize(doc.size)} • {doc.type.toUpperCase()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={doc.processed ? "default" : "secondary"}>
                              {doc.processed ? "Processed" : "Processing..."}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDocument(doc.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="train" className="space-y-6">
              <div className="space-y-4">
                <Label>Select Trading Strategy</Label>
                <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a strategy to train" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedStrategies.map((strategy) => (
                      <SelectItem key={strategy.id} value={strategy.id}>
                        {strategy.name} - {strategy.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStrategy === 'custom' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Custom Strategy Name</Label>
                    <Input
                      value={customStrategyName}
                      onChange={(e) => setCustomStrategyName(e.target.value)}
                      placeholder="Enter strategy name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Strategy Description</Label>
                    <Textarea
                      value={customStrategyDescription}
                      onChange={(e) => setCustomStrategyDescription(e.target.value)}
                      placeholder="Describe your trading strategy"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Training Data Summary</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {documents.filter(d => d.processed).length} processed documents ready for training
                </div>
              </div>

              <Button
                onClick={startTraining}
                disabled={!selectedStrategy || documents.filter(d => d.processed).length === 0 || training}
                className="w-full"
                size="lg"
              >
                {training ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Training AI... {trainingProgress}%
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Start Training
                  </>
                )}
              </Button>

              {training && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Training AI model...</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <Progress value={trainingProgress} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {trainedStrategies.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No trained models yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Upload some documents and train your first AI trading strategy.
                        </p>
                        <Button onClick={() => {
                          const uploadTab = document.querySelector('[value="upload"]') as HTMLElement;
                          uploadTab?.click();
                        }}>
                          <Upload className="h-4 w-4 mr-2" />
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    trainedStrategies.map((strategy) => (
                      <Card key={strategy.id}>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg">{strategy.name}</h3>
                                  {strategy.accuracy && (
                                    <Badge variant="outline">
                                      {strategy.accuracy}% accuracy
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground">{strategy.description}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{strategy.documentsCount} documents</span>
                                  {strategy.lastTrained && (
                                    <span>Last trained: {strategy.lastTrained.toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-1" />
                                  Export
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Play className="h-4 w-4 mr-1" />
                                  Deploy
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {strategy.performance_metrics && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                                <div className="text-center">
                                  <div className="text-sm text-muted-foreground">Win Rate</div>
                                  <div className="font-semibold">{Math.round(strategy.performance_metrics.win_rate * 100)}%</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                                  <div className="font-semibold">{strategy.performance_metrics.sharpe_ratio.toFixed(2)}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-muted-foreground">Max Drawdown</div>
                                  <div className="font-semibold">{Math.round(strategy.performance_metrics.max_drawdown * 100)}%</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-muted-foreground">Avg Return</div>
                                  <div className="font-semibold">{Math.round(strategy.performance_metrics.avg_return * 100)}%</div>
                                </div>
                              </div>
                            )}

                            {strategy.predictions && strategy.predictions.length > 0 && (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4" />
                                  <span className="font-medium">Latest Predictions</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {strategy.predictions.slice(0, 6).map((prediction, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                      <span className="font-mono text-sm">{prediction.symbol}</span>
                                      <div className="flex items-center gap-2">
                                        <Badge 
                                          variant={prediction.signal === 'BUY' ? 'default' : prediction.signal === 'SELL' ? 'destructive' : 'secondary'}
                                          className="text-xs"
                                        >
                                          {prediction.signal}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                          {Math.round(prediction.confidence * 100)}%
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};