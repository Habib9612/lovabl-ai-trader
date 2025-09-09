import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Video, FileText, Award, Clock, Users, PlayCircle, CheckCircle } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: "Technical Analysis Fundamentals",
    description: "Learn the basics of chart patterns, indicators, and market analysis",
    level: "Beginner",
    duration: "4 hours",
    progress: 75,
    lessons: 12,
    completed: 9,
    type: "video"
  },
  {
    id: 2,
    title: "ICT Trading Strategy",
    description: "Master Inner Circle Trader concepts and smart money trading",
    level: "Advanced",
    duration: "6 hours",
    progress: 30,
    lessons: 18,
    completed: 5,
    type: "video"
  },
  {
    id: 3,
    title: "Risk Management Essentials",
    description: "Protect your capital with proper risk management techniques",
    level: "Intermediate",
    duration: "3 hours",
    progress: 0,
    lessons: 8,
    completed: 0,
    type: "article"
  },
  {
    id: 4,
    title: "Options Trading Mastery",
    description: "Advanced options strategies for income generation",
    level: "Advanced",
    duration: "8 hours",
    progress: 60,
    lessons: 20,
    completed: 12,
    type: "video"
  }
];

const articles = [
  {
    id: 1,
    title: "Understanding Market Structure",
    description: "How to identify trends and market phases",
    readTime: "8 min read",
    category: "Technical Analysis",
    difficulty: "Beginner"
  },
  {
    id: 2,
    title: "Psychology of Trading",
    description: "Managing emotions and developing discipline",
    readTime: "12 min read",
    category: "Trading Psychology",
    difficulty: "Intermediate"
  },
  {
    id: 3,
    title: "Liquidity and Order Flow",
    description: "Advanced concepts in market microstructure",
    readTime: "15 min read",
    category: "Advanced Trading",
    difficulty: "Advanced"
  }
];

const webinars = [
  {
    id: 1,
    title: "Live Market Analysis",
    presenter: "John Smith, CFA",
    date: "Today, 2:00 PM EST",
    duration: "60 minutes",
    registered: 342,
    status: "upcoming"
  },
  {
    id: 2,
    title: "Q4 Market Outlook",
    presenter: "Sarah Johnson, CMT",
    date: "Tomorrow, 4:00 PM EST",
    duration: "45 minutes",
    registered: 189,
    status: "upcoming"
  },
  {
    id: 3,
    title: "Options Strategies Workshop",
    presenter: "Mike Davis",
    date: "Last Week",
    duration: "90 minutes",
    registered: 256,
    status: "recorded"
  }
];

export default function Education() {
  const [selectedLevel, setSelectedLevel] = useState('all');

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalLessons = courses.reduce((sum, course) => sum + course.lessons, 0);
  const completedLessons = courses.reduce((sum, course) => sum + course.completed, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Education Center</h1>
          <p className="text-muted-foreground">Enhance your trading skills with our comprehensive learning resources</p>
        </div>
      </div>

      {/* Learning Progress */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLessons}</div>
            <p className="text-xs text-muted-foreground">of {totalLessons} lessons</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.filter(c => c.progress > 0 && c.progress < 100).length}</div>
            <p className="text-xs text-muted-foreground">in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5h</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList>
          <TabsTrigger value="courses">Video Courses</TabsTrigger>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="webinars">Webinars</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filter by level:</span>
            <div className="flex gap-2">
              {['all', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <Button
                  key={level}
                  variant={selectedLevel === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel(level)}
                >
                  {level === 'all' ? 'All Levels' : level}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses
              .filter(course => selectedLevel === 'all' || course.level === selectedLevel)
              .map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {course.type === 'video' ? <Video className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                        <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                      </div>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{course.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {course.completed}/{course.lessons} lessons</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} />
                    </div>

                    <Button className="w-full flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      {course.progress === 0 ? 'Start Course' : 'Continue Learning'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="articles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{article.category}</Badge>
                    <Badge className={getLevelColor(article.difficulty)}>{article.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </span>
                    <Button variant="outline" size="sm">Read Article</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webinars" className="space-y-4">
          <div className="space-y-4">
            {webinars.map((webinar) => (
              <Card key={webinar.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{webinar.title}</h3>
                        <Badge variant={webinar.status === 'upcoming' ? 'default' : 'secondary'}>
                          {webinar.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">Presented by {webinar.presenter}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {webinar.date}
                        </span>
                        <span>{webinar.duration}</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {webinar.registered} registered
                        </span>
                      </div>
                    </div>
                    <Button>
                      {webinar.status === 'upcoming' ? 'Register' : 'Watch Recording'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">First Course Completed</h3>
                <p className="text-sm text-muted-foreground">Completed your first trading course</p>
                <Badge className="mt-2 bg-yellow-100 text-yellow-800">Earned</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Knowledge Seeker</h3>
                <p className="text-sm text-muted-foreground">Read 10 educational articles</p>
                <Badge className="mt-2 bg-blue-100 text-blue-800">Earned</Badge>
              </CardContent>
            </Card>

            <Card className="opacity-50">
              <CardContent className="p-6 text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Video Master</h3>
                <p className="text-sm text-muted-foreground">Complete 5 video courses</p>
                <Badge variant="secondary" className="mt-2">Progress: 2/5</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}