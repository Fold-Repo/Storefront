#!/bin/bash

# Quick script to fix API URL in .env.local

echo "🔧 Fixing API URL..."

# Backup current file if it exists
if [ -f .env.local ]; then
    cp .env.local .env.local.backup
    echo "✅ Backed up .env.local to .env.local.backup"
    
    # Update the URL
    if grep -q "api.dfoldlab.co.uk" .env.local; then
        # Use sed with different syntax for macOS vs Linux
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' 's|https://api.dfoldlab.co.uk/api/v1|https://shorp-epos-backend.onrender.com/api/v1|g' .env.local
            sed -i '' 's|http://api.dfoldlab.co.uk/api/v1|https://shorp-epos-backend.onrender.com/api/v1|g' .env.local
        else
            # Linux
            sed -i 's|https://api.dfoldlab.co.uk/api/v1|https://shorp-epos-backend.onrender.com/api/v1|g' .env.local
            sed -i 's|http://api.dfoldlab.co.uk/api/v1|https://shorp-epos-backend.onrender.com/api/v1|g' .env.local
        fi
        echo "✅ Updated NEXT_PUBLIC_API_URL in .env.local"
    else
        echo "ℹ️  No old API URL found in .env.local"
    fi
else
    echo "ℹ️  No .env.local file found"
    echo "✅ The app will use the default URL: https://shorp-epos-backend.onrender.com/api/v1"
fi

echo ""
echo "⚠️  IMPORTANT: Restart your dev server for changes to take effect!"
echo "   Run: npm run dev"
echo ""
