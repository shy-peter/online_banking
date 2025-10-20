#!/bin/bash

# Add bonus code attributes to investments collection
echo "Adding bonus code attributes to investments collection..."

# Add bonusCodeId attribute (string, optional)
echo "Adding bonusCodeId attribute..."
appwrite databases create-string-attribute \
  --database-id "investflow-db" \
  --collection-id "investments" \
  --key "bonusCodeId" \
  --size 255 \
  --required false

# Add bonusCode attribute (string, optional) - stores the actual code used
echo "Adding bonusCode attribute..."
appwrite databases create-string-attribute \
  --database-id "investflow-db" \
  --collection-id "investments" \
  --key "bonusCode" \
  --size 50 \
  --required false

# Add dailyRate attribute (float, optional) - stores the daily rate from bonus code
echo "Adding dailyRate attribute..."
appwrite databases create-float-attribute \
  --database-id "investflow-db" \
  --collection-id "investments" \
  --key "dailyRate" \
  --required false

# Add monthlyRate attribute (float, optional) - stores the monthly rate from bonus code
echo "Adding monthlyRate attribute..."
appwrite databases create-float-attribute \
  --database-id "investflow-db" \
  --collection-id "investments" \
  --key "monthlyRate" \
  --required false

echo "Bonus code attributes added to investments collection successfully!"
