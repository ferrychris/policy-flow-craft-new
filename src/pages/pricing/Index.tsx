import { PricingCards } from "@/components/pricing/pricing-cards";

export default function PricingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Pricing</h1>
      <PricingCards />
    </div>
  );
}