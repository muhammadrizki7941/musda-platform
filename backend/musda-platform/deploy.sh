#!/bin/bash

# 🚀 MUSDA HIMPERRA - QUICK DEPLOYMENT SCRIPT
# Jalankan dengan: npm run deploy

echo "🚀 Starting MUSDA HIMPERRA deployment process..."

# Step 1: Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend build successful!"

# Step 2: Copy built files
echo "📁 Preparing deployment files..."
cd ..
mkdir -p dist
cp -r frontend/dist/* dist/
cp vercel.json dist/
cp -r backend dist/

# Step 3: Install production dependencies
echo "📦 Installing production dependencies..."
cd dist/backend
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Backend dependencies installation failed!"
    exit 1
fi

cd ../..

echo "✅ Deployment files ready!"
echo ""
echo "📋 Next steps:"
echo "1. Push to GitHub: git add . && git commit -m 'Deploy ready' && git push"
echo "2. Import to Vercel: https://vercel.com/import"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Deploy and test!"
echo ""
echo "🎉 Ready to deploy to production!"