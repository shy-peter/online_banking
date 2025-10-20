# Storage Bucket Setup Instructions

## Issue
The error "Storage bucket with the requested ID could not be found" occurs because the `files` bucket doesn't exist in your Appwrite project.

## Manual Setup Required

### Step 1: Go to Appwrite Console
1. Open your browser and go to: https://cloud.appwrite.io
2. Sign in to your account
3. Select your project

### Step 2: Create Storage Bucket
1. Click on "Storage" in the left sidebar
2. Click "Create Bucket" button
3. Fill in the bucket details:

   **Bucket ID**: `files`
   **Name**: `Files`
   **File Security**: ✅ Enabled
   **Maximum File Size**: `10485760` (10MB)
   **Allowed File Extensions**: `jpg,jpeg,png,gif,webp,pdf,doc,docx,txt`
   **Encryption**: ❌ Disabled
   **Antivirus**: ❌ Disabled

4. Click "Create"

### Step 3: Set Bucket Permissions
1. After creating the bucket, click on it to open settings
2. Go to the "Settings" tab
3. In the "Permissions" section, add these permissions:
   - `read("any")`
   - `create("any")`
   - `update("any")`
   - `delete("any")`

4. Click "Update"

### Step 4: Test the Application
After setting up the bucket:
1. Try the enhanced signup process
2. Test ID document upload functionality
3. Verify that files are being stored correctly

## Enhanced Signup Features

### ✅ New Features Added:

**1. Separate Name Fields:**
- First Name and Last Name are now separate fields
- Better data organization and validation

**2. ID Type Selection:**
- Users can select from: Driver's License, Passport, State ID, National ID
- Each ID type has specific upload requirements

**3. Document Upload by ID Type:**
- **Driver's License**: Front and Back required
- **Passport**: Photo page and Data page required
- **State ID**: Front and Back required
- **National ID**: Front and Back required

**4. SSN for US Users:**
- SSN field appears only when country is set to "US"
- Auto-formats as XXX-XX-XXXX
- Validates format before submission
- Encrypted and stored securely

**5. Enhanced Validation:**
- Validates required documents based on ID type
- SSN format validation for US users
- Better error messages and user guidance

## Current Status
- ✅ Enhanced signup form with ID type selection
- ✅ Separate first/last name fields
- ✅ SSN field for US users
- ✅ Document upload by ID type
- ⏳ Storage bucket needs to be created manually

## After Bucket Setup
Once you've created the storage bucket:
1. The document upload functionality will work
2. Users can complete the enhanced signup process
3. All documents will be stored securely in the bucket
4. The application will be fully functional

## Troubleshooting
If you still encounter issues:
1. Verify the bucket ID is exactly `files`
2. Check that all permissions are set correctly
3. Ensure the bucket allows the file types you're uploading
4. Check the browser console for any additional error messages
