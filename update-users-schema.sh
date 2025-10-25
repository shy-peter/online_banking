#!/bin/bash

# Script to update the users collection schema in Appwrite
# This adds the missing fields needed for enhanced signup functionality

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Updating Appwrite Users Collection Schema${NC}"
echo "=================================================="

# Check if Appwrite CLI is installed
if ! command -v appwrite &> /dev/null; then
    echo -e "${RED}❌ Appwrite CLI is not installed.${NC}"
    echo -e "${YELLOW}Please install it first:${NC}"
    echo "npm install -g appwrite-cli"
    echo "or"
    echo "curl -sL https://appwrite.io/cli/install.sh | bash"
    exit 1
fi

# Check if user is logged in
if ! appwrite account get &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Appwrite CLI.${NC}"
    echo -e "${YELLOW}Please login first:${NC}"
    echo "appwrite login"
    exit 1
fi

echo -e "${GREEN}✅ Appwrite CLI is ready${NC}"

# Database and Collection IDs (update these if different)
DATABASE_ID="investflow-db"
COLLECTION_ID="users"

echo -e "${BLUE}📋 Adding new attributes to users collection...${NC}"

# Add secretPhrase attribute (string)
echo -e "${YELLOW}Adding secretPhrase (string)...${NC}"
appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="$COLLECTION_ID" \
    --key="secretPhrase" \
    --size=255 \
    --required=false \
    --default="" \
    --array=false

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ secretPhrase attribute added${NC}"
else
    echo -e "${RED}❌ Failed to add secretPhrase attribute${NC}"
fi

# Add documents attribute (object)
echo -e "${YELLOW}Adding documents (object)...${NC}"
appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="$COLLECTION_ID" \
    --key="documents" \
    --size=10000 \
    --required=false \
    --default="{}" \
    --array=false

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ documents attribute added${NC}"
else
    echo -e "${RED}❌ Failed to add documents attribute${NC}"
fi

# Add personalInfo attribute (object)
echo -e "${YELLOW}Adding personalInfo (object)...${NC}"
appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="$COLLECTION_ID" \
    --key="personalInfo" \
    --size=10000 \
    --required=false \
    --default="{}" \
    --array=false

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ personalInfo attribute added${NC}"
else
    echo -e "${RED}❌ Failed to add personalInfo attribute${NC}"
fi

# Add isVerified attribute (boolean)
echo -e "${YELLOW}Adding isVerified (boolean)...${NC}"
appwrite databases createBooleanAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="$COLLECTION_ID" \
    --key="isVerified" \
    --required=false \
    --default=false \
    --array=false

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ isVerified attribute added${NC}"
else
    echo -e "${RED}❌ Failed to add isVerified attribute${NC}"
fi

# Add verificationStatus attribute (string with enum)
echo -e "${YELLOW}Adding verificationStatus (string)...${NC}"
appwrite databases createStringAttribute \
    --databaseId="$DATABASE_ID" \
    --collectionId="$COLLECTION_ID" \
    --key="verificationStatus" \
    --size=50 \
    --required=false \
    --default="pending" \
    --array=false

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ verificationStatus attribute added${NC}"
else
    echo -e "${RED}❌ Failed to add verificationStatus attribute${NC}"
fi

echo ""
echo -e "${BLUE}📊 Summary of added attributes:${NC}"
echo "=================================================="
echo -e "${GREEN}✅ secretPhrase${NC} - String (255 chars, optional)"
echo -e "${GREEN}✅ documents${NC} - String/JSON (10KB, optional)"
echo -e "${GREEN}✅ personalInfo${NC} - String/JSON (10KB, optional)"
echo -e "${GREEN}✅ isVerified${NC} - Boolean (optional, default: false)"
echo -e "${GREEN}✅ verificationStatus${NC} - String (50 chars, optional, default: 'pending')"

echo ""
echo -e "${BLUE}🔄 Next steps:${NC}"
echo "1. Update your AuthContext.tsx to include these fields"
echo "2. Test the enhanced signup functionality"
echo "3. Verify that all data is being saved correctly"

echo ""
echo -e "${GREEN}🎉 Schema update completed!${NC}"
echo -e "${YELLOW}Note: If some attributes already exist, you'll see warnings but the script will continue.${NC}"
