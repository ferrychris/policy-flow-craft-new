import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);

export const redirectToCheckout = async ({
  priceId,
  successUrl = `${window.location.origin}/dashboard?checkout=success`,
  cancelUrl = `${window.location.origin}/pricing?checkout=cancelled`,
}: {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to initialize');

    const { error } = await stripe.redirectToCheckout({
      mode: 'subscription',
      lineItems: [{ price: priceId, quantity: 1 }],
      successUrl,
      cancelUrl,
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};

export const redirectToCustomerPortal = async () => {
  try {
    const response = await fetch('/api/stripe/create-portal-session', {
      method: 'POST',
    });
    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error redirecting to customer portal:', error);
    throw error;
  }
};
