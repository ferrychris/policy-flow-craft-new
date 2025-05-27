import { useState } from 'react';
import { Check, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { STRIPE_PLANS } from '@/lib/stripe/config';
import { redirectToCheckout } from '@/lib/stripe/client';
import { useSubscription } from '@/lib/stripe/supabase';
import { cn } from '@/lib/utils';

export function PricingCards() {
  const [isYearly, setIsYearly] = useState(false);
  const { data: subscription } = useSubscription();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    try {
      setIsLoading(priceId);
      await redirectToCheckout({ priceId });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {Object.entries(STRIPE_PLANS).map(([key, plan]) => {
        const price = isYearly ? plan.price * 10 : plan.price;
        const isCurrentPlan = subscription?.plan === key;

        return (
          <Card 
            key={key}
            className={cn(
              "flex flex-col",
              key === 'OPERATIONAL' && "border-primary shadow-lg"
            )}
          >
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">${price}</span>
                <span className="text-muted-foreground">/{isYearly ? 'year' : 'month'}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={key === 'OPERATIONAL' ? 'default' : 'outline'}
                disabled={isLoading !== null || isCurrentPlan}
                onClick={() => handleSubscribe(plan.id)}
              >
                {isLoading === plan.id ? (
                  'Processing...'
                ) : isCurrentPlan ? (
                  'Current Plan'
                ) : (
                  'Subscribe'
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
