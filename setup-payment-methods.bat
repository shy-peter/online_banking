@echo off
REM Payment Methods Collection Setup Script for Appwrite CLI (Windows)
REM This script adds the payment-methods collection to your existing InvestFlow database

echo 🚀 Adding Payment Methods Collection
echo ==========================

REM Check if .env file exists
if not exist .env (
    echo ❌ Error: .env file not found
    echo Please create a .env file with your Appwrite project configuration
    echo See .env.example for reference
    pause
    exit /b 1
)

REM Load environment variables from .env file
for /f "usebackq tokens=1,2 delims==" %%a in (.env) do (
    if "%%a"=="VITE_APPWRITE_PROJECT_ID" set PROJECT_ID=%%b
    if "%%a"=="VITE_APPWRITE_DATABASE_ID" set DATABASE_ID=%%b
)

if "%DATABASE_ID%"=="" set DATABASE_ID=investflow-db

if "%PROJECT_ID%"=="" (
    echo ❌ Error: VITE_APPWRITE_PROJECT_ID not found in .env file
    echo Please create a .env file with your Appwrite project configuration
    echo See .env.example for reference
    pause
    exit /b 1
)

echo Project: %PROJECT_ID%
echo Database: %DATABASE_ID%
echo.

echo 🔧 Please ensure you're logged in to Appwrite CLI
echo If not logged in, run: appwrite login
echo.

REM Set the project context
echo 🔧 Setting project context...
appwrite client --project-id %PROJECT_ID%

echo.
echo Press Enter when ready to continue...
pause >nul

echo 💳 Creating Payment Methods collection...
appwrite databases create-collection --database-id %DATABASE_ID% --collection-id "payment-methods" --name "Payment Methods" --document-security true

REM Add attributes to Payment Methods collection
echo Adding attributes to Payment Methods collection...

appwrite databases create-string-attribute --database-id %DATABASE_ID% --collection-id "payment-methods" --key "userId" --size 255 --required true
appwrite databases create-string-attribute --database-id %DATABASE_ID% --collection-id "payment-methods" --key "type" --size 50 --required true
appwrite databases create-string-attribute --database-id %DATABASE_ID% --collection-id "payment-methods" --key "name" --size 255 --required true
appwrite databases create-string-attribute --database-id %DATABASE_ID% --collection-id "payment-methods" --key "accountNumber" --size 255 --required true
appwrite databases create-boolean-attribute --database-id %DATABASE_ID% --collection-id "payment-methods" --key "isDefault" --required true
appwrite databases create-string-attribute --database-id %DATABASE_ID% --collection-id "payment-methods" --key "status" --size 50 --required true
appwrite databases create-string-attribute --database-id %DATABASE_ID% --collection-id "payment-methods" --key "email" --size 255 --required false
appwrite databases create-string-attribute --database-id %DATABASE_ID% --collection-id "payment-methods" --key "username" --size 255 --required false
appwrite databases create-string-attribute --database-id %DATABASE_ID% --collection-id "payment-methods" --key "phoneNumber" --size 50 --required false
appwrite databases create-string-attribute --database-id %DATABASE_ID% --collection-id "payment-methods" --key "address" --size 500 --required false

echo 🔗 Creating performance indexes...
appwrite databases create-index --database-id %DATABASE_ID% --collection-id "payment-methods" --key "userId-index" --type "key" --attributes "userId"
appwrite databases create-index --database-id %DATABASE_ID% --collection-id "payment-methods" --key "userId-isDefault-index" --type "key" --attributes userId --attributes isDefault

echo 🔐 Setting up permissions...
appwrite databases update-collection --database-id "%DATABASE_ID%" --collection-id "payment-methods" --name "Payment Methods" --permissions "read(\"any\")" --permissions "create(\"any\")" --permissions "update(\"any\")" --permissions "delete(\"any\")"

echo.
echo 🎉 Payment Methods collection setup completed successfully!
echo.
echo ✅ Created collection: payment-methods
echo ✅ Added all required attributes
echo ✅ Set up permissions and indexes
echo.
echo 🚀 Payment methods functionality is now ready!
echo    You can now add, edit, and manage payment methods in your app
echo.
pause
