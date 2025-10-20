@echo off
echo Setting up Bonus Codes collection...

REM Create the collection
appwrite databases create-collection --database-id "investflow-db" --collection-id "bonus-codes" --name "Bonus Codes" --document-security false

REM Add attributes
echo Adding attributes...

REM Code (string, required, unique)
appwrite databases create-string-attribute --database-id "investflow-db" --collection-id "bonus-codes" --key "code" --size 50 --required true

REM Description (string, optional)
appwrite databases create-string-attribute --database-id "investflow-db" --collection-id "bonus-codes" --key "description" --size 255 --required false

REM Daily Rate (float, required)
appwrite databases create-float-attribute --database-id "investflow-db" --collection-id "bonus-codes" --key "dailyRate" --required true

REM Monthly Rate (float, required)
appwrite databases create-float-attribute --database-id "investflow-db" --collection-id "bonus-codes" --key "monthlyRate" --required true

REM Is Active (boolean, required)
appwrite databases create-boolean-attribute --database-id "investflow-db" --collection-id "bonus-codes" --key "isActive" --required true

REM Usage Limit (integer, optional)
appwrite databases create-integer-attribute --database-id "investflow-db" --collection-id "bonus-codes" --key "usageLimit" --required false

REM Usage Count (integer, required)
appwrite databases create-integer-attribute --database-id "investflow-db" --collection-id "bonus-codes" --key "usageCount" --required true

REM Expiry Date (datetime, optional)
appwrite databases create-datetime-attribute --database-id "investflow-db" --collection-id "bonus-codes" --key "expiryDate" --required false

REM Created By (string, required)
appwrite databases create-string-attribute --database-id "investflow-db" --collection-id "bonus-codes" --key "createdBy" --size 255 --required true

REM Created At (datetime, required)
appwrite databases create-datetime-attribute --database-id "investflow-db" --collection-id "bonus-codes" --key "createdAt" --required true

REM Updated At (datetime, required)
appwrite databases create-datetime-attribute --database-id "investflow-db" --collection-id "bonus-codes" --key "updatedAt" --required true

REM Add indexes
echo Adding indexes...

REM Index on code for fast lookups
appwrite databases create-index --database-id "investflow-db" --collection-id "bonus-codes" --key "code_unique" --type "unique" --attributes "code"

REM Index on isActive for filtering active codes
appwrite databases create-index --database-id "investflow-db" --collection-id "bonus-codes" --key "isActive" --type "key" --attributes "isActive"

REM Set permissions
echo Setting permissions...

REM Allow users to read active bonus codes
appwrite databases update-collection --database-id "investflow-db" --collection-id "bonus-codes" --name "Bonus Codes" --document-security false --permissions "read(\"any\")" --permissions "create(\"users\")" --permissions "update(\"users\")" --permissions "delete(\"users\")"

echo Bonus Codes collection setup complete!
pause
