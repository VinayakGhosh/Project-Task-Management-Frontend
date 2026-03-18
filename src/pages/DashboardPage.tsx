import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { subscriptionApi, Usage, Subscription } from '@/lib/api';
import {
  FolderKanban,
  CheckCircle,
  Clock,
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Mock data for demo purposes
const mockUsage: Usage = {
  projects_used: 5,
  projects_limit: 10,
  tasks_used: 47,
  tasks_limit: 100,
  storage_used: 256,
  storage_limit: 1024,
};

const mockSubscription: Subscription = {
  id: '1',
  plan_id: 'pro',
  plan_name: 'Professional',
  status: 'Active',
  current_period_start: '2024-01-01',
  current_period_end: '2024-02-01',
  features: ['Unlimited projects', 'Unlimited tasks', 'Advanced analytics'],
  max_projects: -1,
  task_per_day: -1,
  export_allowed: true,
};

const DashboardPage = () => {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usageRes, subRes] = await Promise.all([
          subscriptionApi.getUsage(),
          subscriptionApi.getCurrent(),
        ]);

        // Use mock data if API fails (for demo)
        setUsage(usageRes.data || mockUsage);
        setSubscription(subRes.data || mockSubscription);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to mock data on error
        setUsage(mockUsage);
        setSubscription(mockSubscription);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const projectProgress = usage ? (usage.projects_used / usage.projects_limit) * 100 : 0;
  const taskProgress = usage ? (usage.tasks_used / usage.tasks_limit) * 100 : 0;

  const stats = [
    {
      title: 'Active Projects',
      value: usage?.projects_used || 0,
      limit: usage?.projects_limit,
      icon: FolderKanban,
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10',
    },
    {
      title: 'Total Tasks',
      value: usage?.tasks_used || 0,
      limit: usage?.tasks_limit,
      icon: CheckCircle,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
    },
    {
      title: 'In Progress',
      value: 12,
      icon: Clock,
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10',
    },
    {
      title: 'Completed Today',
      value: 8,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's an overview of your workspace.
            </p>
          </div>
          <Link to="/projects">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {stat.value}
                        {stat.limit && (
                          <span className="text-base font-normal text-muted-foreground">
                            /{stat.limit}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Usage & Subscription */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Usage Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Resource Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projects</span>
                  <span className="font-medium text-foreground">
                    {usage?.projects_used} / {usage?.projects_limit}
                  </span>
                </div>
                <Progress value={projectProgress} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tasks</span>
                  <span className="font-medium text-foreground">
                    {usage?.tasks_used} / {usage?.tasks_limit}
                  </span>
                </div>
                <Progress value={taskProgress} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-medium text-foreground">
                    {usage?.storage_used} MB / {usage?.storage_limit} MB
                  </span>
                </div>
                <Progress
                  value={usage ? (usage.storage_used / usage.storage_limit) * 100 : 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div>
                    <p className="font-semibold text-foreground">{subscription?.plan_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      Status: {subscription?.status}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    Active
                  </div>
                </div>

                <div className="space-y-2 ">
                  <p className="text-sm font-medium text-foreground">Plan Features:</p>
                  <ul className="space-y-2">

                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Total Projects: {subscription?.max_projects}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Tasks Per Project: {subscription?.task_per_day}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Export Allowed: {subscription?.export_allowed ? 'Yes' : 'No'}
                    </li>
                  </ul>
                </div>
                <div>
                  <Link to="/subscription">
                    <Button variant="outline" className="w-full">
                      Manage Subscription
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/projects">
                <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
                  <FolderKanban className="h-6 w-6 text-primary" />
                  <span>View Projects</span>
                </Button>
              </Link>
              <Link to="/subscription">
                <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <span>Upgrade Plan</span>
                </Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" className="w-full h-auto py-6 flex-col gap-2">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <span>Account Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
