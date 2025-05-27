import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.VITE_STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export const createPortalSession = async (req: Request) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return new Response('No subscription found', { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.VITE_APP_URL}/dashboard`,
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return new Response('Error creating portal session', { status: 500 });
  }
};
