import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { STRIPE_PLANS } from '@/lib/stripe/config';
import { redirectToCustomerPortal } from '@/lib/stripe/client';
import { useSubscription } from '@/lib/stripe/supabase';
import { format } from 'date-fns';

export function ManageSubscription() {
  const { data: subscription } = useSubscription();

  if (!subscription?.plan) {
    return null;
  }

  const plan = STRIPE_PLANS[subscription.plan];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">Current Plan</p>
          <p className="text-muted-foreground">{plan.name}</p>
        </div>
        {subscription.currentPeriodEnd && (
          <div>
            <p className="font-medium">Next Billing Date</p>
            <p className="text-muted-foreground">
              {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
            </p>
          </div>
        )}
        {subscription.isCanceled && (
          <div className="rounded-md bg-destructive/10 p-4">
            <p className="font-medium text-destructive">
              Your subscription will end on{' '}
              {subscription.currentPeriodEnd &&
                format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => redirectToCustomerPortal()}
        >
          Manage Subscription
        </Button>
      </CardFooter>
    </Card>
  );
}
