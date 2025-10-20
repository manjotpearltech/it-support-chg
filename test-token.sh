#!/bin/bash

# Test Azure Access Token Script
# This script helps you verify your Azure access token is working

echo "🔍 Checking .env file..."

if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Read the token from .env
TOKEN=$(grep REACT_APP_AZURE_ACCESS_TOKEN .env | cut -d '=' -f2)

if [ -z "$TOKEN" ]; then
    echo "❌ REACT_APP_AZURE_ACCESS_TOKEN is empty in .env file"
    echo ""
    echo "📋 To get your access token:"
    echo "1. Go to https://portal.azure.com"
    echo "2. Click the Cloud Shell icon (>_) at the top"
    echo "3. Run this command:"
    echo "   az account get-access-token --resource https://cognitiveservices.azure.com/ --query accessToken -o tsv"
    echo "4. Copy the output and paste it in .env file after REACT_APP_AZURE_ACCESS_TOKEN="
    echo ""
    exit 1
fi

echo "✅ Token found in .env file"
echo "Token length: ${#TOKEN} characters"

# Test the token with Azure OpenAI
echo ""
echo "🧪 Testing token with Azure OpenAI..."

ENDPOINT=$(grep REACT_APP_AZURE_OPENAI_ENDPOINT .env | cut -d '=' -f2)
DEPLOYMENT=$(grep REACT_APP_AZURE_OPENAI_DEPLOYMENT .env | cut -d '=' -f2)
API_VERSION=$(grep REACT_APP_AZURE_OPENAI_API_VERSION .env | cut -d '=' -f2)

if [ -z "$ENDPOINT" ] || [ -z "$DEPLOYMENT" ] || [ -z "$API_VERSION" ]; then
    echo "❌ Missing configuration in .env file"
    exit 1
fi

# Make a test API call
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  "${ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VERSION}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }')

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo ""
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS! Your token is working!"
    echo "Azure OpenAI responded successfully."
    echo ""
    echo "🚀 You can now run: npm start"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ AUTHENTICATION FAILED (401)"
    echo "Your token is invalid or expired."
    echo ""
    echo "📋 Get a new token:"
    echo "1. Go to https://portal.azure.com"
    echo "2. Click Cloud Shell (>_)"
    echo "3. Run: az account get-access-token --resource https://cognitiveservices.azure.com/ --query accessToken -o tsv"
    echo "4. Update .env file with the new token"
elif [ "$HTTP_CODE" = "403" ]; then
    echo "❌ PERMISSION DENIED (403)"
    echo "Your token doesn't have permission to access Azure OpenAI."
    echo "Make sure your Azure account has access to the OpenAI service."
else
    echo "❌ ERROR (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
fi

echo ""

