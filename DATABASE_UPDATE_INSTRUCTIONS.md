# Database Update Instructions

## Issue
The profile picture upload is failing because the `profilePicture` attribute doesn't exist in the users collection in your Appwrite database.

## Temporary Fix Applied
I've implemented a temporary fix that stores profile pictures in localStorage until the database is updated.

## Permanent Solution - Add Database Attributes

### Step 1: Go to Appwrite Console
1. Open your browser and go to: https://cloud.appwrite.io
2. Sign in to your account
3. Select your project

### Step 2: Navigate to Database
1. Click on "Databases" in the left sidebar
2. Click on "investflow-db"
3. Click on "Collections"
4. Click on "users" collection

### Step 3: Add New Attributes
Click "Create Attribute" and add these attributes one by one:

#### 1. profilePicture
- **Type**: String
- **Key**: `profilePicture`
- **Size**: 255
- **Required**: No
- **Default**: (leave empty)
- **Array**: No

#### 2. secretPhrase
- **Type**: String
- **Key**: `secretPhrase`
- **Size**: 10
- **Required**: No
- **Default**: (leave empty)
- **Array**: No

#### 3. documents
- **Type**: String
- **Key**: `documents`
- **Size**: 2000
- **Required**: No
- **Default**: (leave empty)
- **Array**: No

#### 4. personalInfo
- **Type**: String
- **Key**: `personalInfo`
- **Size**: 2000
- **Required**: No
- **Default**: (leave empty)
- **Array**: No

### Step 4: Test the Application
After adding all attributes:
1. Try uploading a profile picture
2. Test the enhanced signup process
3. Verify that profile pictures are saved to the database instead of localStorage

## Current Status
- ✅ Profile picture upload works (stored in localStorage temporarily)
- ✅ Enhanced signup form is ready
- ✅ Secret phrase system is ready
- ⏳ Database attributes need to be added manually

## After Database Update
Once you've added the attributes to the database, the application will automatically start using the database instead of localStorage for storing profile pictures and other enhanced signup data.

## Troubleshooting
If you encounter any issues:
1. Make sure all 4 attributes are added exactly as specified
2. Check that the attribute keys match exactly (case-sensitive)
3. Ensure the collection ID is "users" and database ID is "investflow-db"
4. Try refreshing the application after adding the attributes
