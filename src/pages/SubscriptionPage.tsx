import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { subscriptionApi, Plan, Subscription, Usage } from '@/lib/api';
import { CheckCircle, Zap, Crown, Rocket } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data for demo
const mockSubscription: Subscription = {
  id: '1',
  plan_id: 'pro',
  plan_name: 'Professional',
  status: 'active',
  current_period_start: '2024-01-01',
  current_period_end: '2024-02-01',
  features: ['Unlimited projects', 'Unlimited tasks', 'Advanced analytics', 'Priority support'],
  max_projects: 20,
  task_per_day: 100,
  export_allowed: true,
};

const mockUsage: Usage = {
  projects_used: 5,
  projects_limit: -1,
  tasks_used: 47,
  tasks_limit: -1,
  storage_used: 256,
  storage_limit: 5120,
};

const mockPlans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    duration_days: 30,
    max_projects: 3,
    task_per_day: 20,
    export_allowed: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 19,
    duration_days: 30,
    max_projects: 20,
    task_per_day: 100,
    export_allowed: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49,
    duration_days: 30,
    max_projects: -1,
    task_per_day: -1,
    export_allowed: true,
  },
];

const planIcons = {
  starter: Zap,
  pro: Crown,
  enterprise: Rocket,
};

const SubscriptionPage = () => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [subRes, usageRes, plansRes] = await Promise.all([
        subscriptionApi.getCurrent(),
        subscriptionApi.getUsage(),
        subscriptionApi.getPlans(),
      ]);

      setSubscription(subRes.data || mockSubscription);
      setUsage(usageRes.data || mockUsage);
      setPlans(plansRes.data || mockPlans);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(planId);
    const { data, error } = await subscriptionApi.upgrade(planId);
    setIsUpgrading(null);

    if (data || !error) {
      // Demo: update locally
      const plan = plans.find((p) => p.id === planId);
      if (plan) {
        setSubscription({
          ...mockSubscription,
          plan_id: planId,
          plan_name: plan.name,
        });
        toast({ title: `Successfully upgraded to ${plan.name}!` });
      }
    } else {
      toast({ title: 'Failed to upgrade', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const currentPlan = plans.find((p) => p.id === subscription?.plan_id) || mockPlans[1];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and view usage
          </p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-accent rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{subscription?.plan_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {subscription?.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ${currentPlan.price}/month
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Current period:</p>
                <p className="font-medium text-foreground">
                  {new Date(subscription?.current_period_start || '').toLocaleDateString()} -{' '}
                  {new Date(subscription?.current_period_end || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Projects</span>
                  <span className="font-medium text-foreground">
                    {usage?.projects_used}
                    {usage?.projects_limit === -1 ? ' / Unlimited' : ` / ${usage?.projects_limit}`}
                  </span>
                </div>
                <Progress
                  value={usage?.projects_limit === -1 ? 30 : (usage?.projects_used! / usage?.projects_limit!) * 100}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tasks</span>
                  <span className="font-medium text-foreground">
                    {usage?.tasks_used}
                    {usage?.tasks_limit === -1 ? ' / Unlimited' : ` / ${usage?.tasks_limit}`}
                  </span>
                </div>
                <Progress
                  value={usage?.tasks_limit === -1 ? 25 : (usage?.tasks_used! / usage?.tasks_limit!) * 100}
                  className="h-2"
                />
              </div>

              
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = planIcons[plan.id as keyof typeof planIcons] || Zap;
              const isCurrent = plan.id === subscription?.plan_id;
              const isPro = plan.id === 'pro';

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative',
                    isPro && 'border-primary shadow-lg',
                    isCurrent && 'ring-2 ring-primary'
                  )}
                >
                  {isPro && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Current Plan</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pt-8">
                    <div className="mx-auto p-3 bg-primary/10 rounded-lg w-fit mb-2">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold text-foreground">INR {plan.price}</span>
                      {/* <span className="text-muted-foreground">/{plan.interval}</span> */}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      
                        <li  className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">Max Projects: {plan?.max_projects}</span>
                        </li>
                        <li  className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">Task Per Project: {plan?.task_per_day}</span>
                        </li>
                        <li  className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">Export Allowed: {plan?.export_allowed ? 'Yes' : 'No'}</span>
                        </li>
                      
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrent ? 'outline' : isPro ? 'default' : 'outline'}
                      disabled={isCurrent || isUpgrading === plan.id}
                      onClick={() => handleUpgrade(plan.id)}
                    >
                      {isUpgrading === plan.id && <LoadingSpinner size="sm" className="mr-2" />}
                      {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionPage;
