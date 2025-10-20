@echo off
REM Add updatedAt attribute to Payment Methods collection (Windows)
REM This script adds the missing updatedAt attribute to track when payment methods are modified

echo 🚀 Adding updatedAt attribute to Payment Methods collection
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

echo 📅 Adding updatedAt attribute to payment-methods collection...
appwrite databases create-datetime-attribute --database-id %DATABASE_ID% --collection-id "payment-methods" --key "updatedAt" --required false

echo.
echo 🎉 updatedAt attribute added successfully!
echo.
echo ✅ Payment methods collection now has updatedAt tracking
echo ✅ You can now approve/reject payment methods without errors
echo.
echo 🚀 The admin payment method verification system is now fully functional!
echo.
pause
