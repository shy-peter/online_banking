@echo off
echo Setting up environment variables for Payment Method Types...

echo.
echo Please enter your Appwrite project details:
echo.

set /p DATABASE_ID="Enter your DATABASE_ID: "
set /p PROJECT_ID="Enter your PROJECT_ID: "
set /p API_ENDPOINT="Enter your API_ENDPOINT (e.g., https://fra.cloud.appwrite.io/v1): "

echo.
echo Creating .env file...

echo DATABASE_ID=%DATABASE_ID% > .env
echo PROJECT_ID=%PROJECT_ID% >> .env
echo API_ENDPOINT=%API_ENDPOINT% >> .env

echo.
echo ✅ Environment variables set successfully!
echo.
echo You can now run:
echo   setup-payment-method-types.bat
echo.
pause
