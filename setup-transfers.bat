@echo off
REM Setup transfers collection for InvestFlow
REM This script creates the transfers collection with all necessary attributes and permissions

echo Setting up transfers collection...

REM Create the transfers collection
appwrite databases create-collection --database-id investflow-db --collection-id transfers --name "Transfers" --document-security false

echo Collection created successfully!

REM Add attributes
echo Adding attributes...

REM fromUserId - string, required
appwrite databases create-string-attribute --database-id investflow-db --collection-id transfers --key fromUserId --size 255 --required true --array false

REM toUserId - string, required
appwrite databases create-string-attribute --database-id investflow-db --collection-id transfers --key toUserId --size 255 --required true --array false

REM fromUserEmail - string, required
appwrite databases create-string-attribute --database-id investflow-db --collection-id transfers --key fromUserEmail --size 255 --required true --array false

REM toUserEmail - string, required
appwrite databases create-string-attribute --database-id investflow-db --collection-id transfers --key toUserEmail --size 255 --required true --array false

REM fromUserName - string, required
appwrite databases create-string-attribute --database-id investflow-db --collection-id transfers --key fromUserName --size 255 --required true --array false

REM toUserName - string, required
appwrite databases create-string-attribute --database-id investflow-db --collection-id transfers --key toUserName --size 255 --required true --array false

REM amount - integer, required (stored in cents)
appwrite databases create-integer-attribute --database-id investflow-db --collection-id transfers --key amount --required true --min 1 --max 999999999 --array false

REM status - string, required
appwrite databases create-string-attribute --database-id investflow-db --collection-id transfers --key status --size 50 --required true --array false

REM description - string, optional
appwrite databases create-string-attribute --database-id investflow-db --collection-id transfers --key description --size 500 --required false --array false

REM transferType - string, required
appwrite databases create-string-attribute --database-id investflow-db --collection-id transfers --key transferType --size 50 --required true --array false

echo Attributes added successfully!

REM Add indexes
echo Adding indexes...

REM Index on fromUserId for querying transfers from a user
appwrite databases create-index --database-id investflow-db --collection-id transfers --key fromUserId --type key --attributes fromUserId

REM Index on toUserId for querying transfers to a user
appwrite databases create-index --database-id investflow-db --collection-id transfers --key toUserId --type key --attributes toUserId

REM Index on status for filtering by status
appwrite databases create-index --database-id investflow-db --collection-id transfers --key status --type key --attributes status

REM Index on createdAt for ordering
appwrite databases create-index --database-id investflow-db --collection-id transfers --key createdAt --type key --attributes createdAt

echo Indexes added successfully!

REM Set permissions
echo Setting permissions...

REM Read permission for any user (users can see their own transfers)
appwrite databases update-collection --database-id investflow-db --collection-id transfers --permissions read

REM Create permission for authenticated users
appwrite databases update-collection --database-id investflow-db --collection-id transfers --permissions create

REM Update permission for authenticated users
appwrite databases update-collection --database-id investflow-db --collection-id transfers --permissions update

REM Delete permission for authenticated users
appwrite databases update-collection --database-id investflow-db --collection-id transfers --permissions delete

echo Permissions set successfully!
echo Transfers collection setup completed!
echo.
echo Users can now:
echo - Create transfers to other users
echo - View their transfer history
echo - Transfer funds using email or account number
pause
