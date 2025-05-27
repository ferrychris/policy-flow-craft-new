#!/bin/bash

# Create products
foundational_product=$(stripe products create \
  --name="Foundational Plan" \
  --description="Basic policy templates and single user access")

operational_product=$(stripe products create \
  --name="Operational Plan" \
  --description="Advanced policy templates and team access")

strategic_product=$(stripe products create \
  --name="Strategic Plan" \
  --description="Enterprise-grade templates and unlimited access")

# Create prices (monthly)
foundational_price=$(stripe prices create \
  --product="$foundational_product" \
  --unit-amount=4900 \
  --currency=usd \
  --recurring-interval=month)

operational_price=$(stripe prices create \
  --product="$operational_product" \
  --unit-amount=9900 \
  --currency=usd \
  --recurring-interval=month)

strategic_price=$(stripe prices create \
  --product="$strategic_product" \
  --unit-amount=19900 \
  --currency=usd \
  --recurring-interval=month)

# Create prices (yearly)
foundational_yearly=$(stripe prices create \
  --product="$foundational_product" \
  --unit-amount=49000 \
  --currency=usd \
  --recurring-interval=year)

operational_yearly=$(stripe prices create \
  --product="$operational_product" \
  --unit-amount=99000 \
  --currency=usd \
  --recurring-interval=year)

strategic_yearly=$(stripe prices create \
  --product="$strategic_product" \
  --unit-amount=199000 \
  --currency=usd \
  --recurring-interval=year)

echo "Created products and prices successfully!"
echo "Monthly Price IDs:"
echo "Foundational: $foundational_price"
echo "Operational: $operational_price"
echo "Strategic: $strategic_price"
echo ""
echo "Yearly Price IDs:"
echo "Foundational: $foundational_yearly"
echo "Operational: $operational_yearly"
echo "Strategic: $strategic_yearly"
