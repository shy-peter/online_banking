@echo off
echo Fixing notifications collection permissions...

REM Update collection permissions to allow users to create notifications
appwrite databases update-collection --database-id "investflow-db" --collection-id "notifications" --name "Notifications" --document-security false --permissions "read(\"any\")" --permissions "create(\"users\")" --permissions "update(\"users\")" --permissions "delete(\"users\")"

echo Notifications collection permissions updated successfully!
pause
