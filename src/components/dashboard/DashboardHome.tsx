import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useSubscription } from '@/lib/stripe/supabase';
import { STRIPE_PLANS } from '@/lib/stripe/config';

export function DashboardHome() {
  const [activeTab, setActiveTab] = useState('policies');
  const { data: subscription } = useSubscription();

  const isAllowed = (feature: string) => {
    if (!subscription?.plan) return false;
    const currentPlan = STRIPE_PLANS[subscription.plan];
    return currentPlan.features.some(f => f.toLowerCase().includes(feature.toLowerCase()));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {subscription?.plan ? (
              `${STRIPE_PLANS[subscription.plan].name} Plan`
            ) : (
              'No active subscription'
            )}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="policies">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Policies</h2>
            {/* Policy list component will go here */}
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Team Management</h2>
            {isAllowed('team members') ? (
              <div>{/* Team management component will go here */}</div>
            ) : (
              <p className="text-muted-foreground">
                Upgrade your plan to access team management features.
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
