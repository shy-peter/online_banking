@echo off
REM Add preferences attribute to users collection
REM This script adds a preferences field to store user preferences like dark mode, currency, etc.

echo Adding preferences attribute to users collection...

REM Add preferences attribute as a JSON object
appwrite databases create-string-attribute --database-id investflow-db --collection-id users --key preferences --size 1000 --required false --array false

echo Preferences attribute added successfully!
echo Users can now store preferences like dark mode, currency, and other settings.
pause
