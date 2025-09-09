import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Brain, FileText, BookOpen, Target, Trash2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrainingDocument {
  id: string;
  name: string;
  type: 'pdf' | 'text' | 'csv';
  size: number;
  uploadedAt: Date;
  processed: boolean;
}

interface TrainingStrategy {
  id: string;
  name: string;
  description: string;
  documentsCount: number;
  accuracy?: number;
  lastTrained?: Date;
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
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [customStrategyName, setCustomStrategyName] = useState('');
  const [customStrategyDescription, setCustomStrategyDescription] = useState('');
  const [documents, setDocuments] = useState<TrainingDocument[]>([]);
  const [trainedStrategies, setTrainedStrategies] = useState<TrainingStrategy[]>([
    {
      id: '1',
      name: 'ICT Concepts',
      description: 'Inner Circle Trader methodology',
      documentsCount: 5,
      accuracy: 87,
      lastTrained: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Elliott Wave Analysis',
      description: 'Wave pattern recognition',
      documentsCount: 3,
      accuracy: 72,
      lastTrained: new Date('2024-01-10')
    }
  ]);
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

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

        // Simulate file processing (in real app, you'd upload to Supabase Storage)
        const newDoc: TrainingDocument = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : file.type.includes('csv') ? 'csv' : 'text',
          size: file.size,
          uploadedAt: new Date(),
          processed: false
        };

        setDocuments(prev => [...prev, newDoc]);

        // Simulate processing
        setTimeout(() => {
          setDocuments(prev => 
            prev.map(doc => 
              doc.id === newDoc.id ? { ...doc, processed: true } : doc
            )
          );
        }, 2000);
      }

      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const startTraining = async () => {
    if (!selectedStrategy) {
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
      // Simulate training progress
      const interval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      const strategyName = selectedStrategy === 'custom' 
        ? customStrategyName 
        : predefinedStrategies.find(s => s.id === selectedStrategy)?.name || 'Unknown Strategy';

      // Use Gemini AI for training analysis
      const { data, error } = await supabase.functions.invoke('gemini-ai-analysis', {
        body: {
          type: 'training',
          data: documents.filter(d => d.processed),
          prompt: `Train AI strategy for ${strategyName}: ${selectedStrategy === 'custom' ? customStrategyDescription : predefinedStrategies.find(s => s.id === selectedStrategy)?.description}`
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const newStrategy: TrainingStrategy = {
        id: Math.random().toString(36).substr(2, 9),
        name: strategyName,
        description: selectedStrategy === 'custom' 
          ? customStrategyDescription 
          : predefinedStrategies.find(s => s.id === selectedStrategy)?.description || '',
        documentsCount: documents.filter(d => d.processed).length,
        lastTrained: new Date()
      };

      setTrainedStrategies(prev => [...prev, newStrategy]);
      setDocuments([]);
      setSelectedStrategy('');
      setCustomStrategyName('');
      setCustomStrategyDescription('');
      
      toast.success('AI training completed successfully!');
    } catch (error) {
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
              <div className="space-y-4">
                {trainedStrategies.map((strategy) => (
                  <Card key={strategy.id}>
                    <CardContent className="p-6">
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
                            Retrain
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};