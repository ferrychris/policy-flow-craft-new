import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

const upsertSubscriptionRecord = async (subscription: Stripe.Subscription) => {
  const customer = subscription.customer as string;
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customer)
    .single();

  if (userError || !userData) {
    console.error('Error finding user:', userError);
    return;
  }

  const subscriptionData = {
    id: subscription.id,
    user_id: userData.id,
    stripe_customer_id: customer,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    quantity: subscription.items.data[0].quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    created_at: new Date(subscription.created * 1000).toISOString(),
    ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    interval: subscription.items.data[0].price.recurring?.interval || 'month',
  };

  const { error: upsertError } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'stripe_subscription_id' });

  if (upsertError) {
    console.error('Error upserting subscription:', upsertError);
  }
};

export const handleStripeWebhook = async (req: Request) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.VITE_STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscriptionRecord(subscription);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
};
