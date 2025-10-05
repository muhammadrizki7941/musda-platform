@echo off
REM 🚀 MUSDA HIMPERRA - QUICK DEPLOYMENT SCRIPT (Windows)
REM Jalankan dengan: npm run deploy

echo 🚀 Starting MUSDA HIMPERRA deployment process...

REM Step 1: Build frontend
echo 📦 Building frontend...
cd frontend
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    exit /b 1
)

echo ✅ Frontend build successful!

REM Step 2: Copy built files
echo 📁 Preparing deployment files...
cd ..
if not exist dist mkdir dist
xcopy /E /Y frontend\dist\* dist\
copy vercel.json dist\
xcopy /E /Y backend dist\backend\

REM Step 3: Install production dependencies
echo 📦 Installing production dependencies...
cd dist\backend
call npm install --production

if %errorlevel% neq 0 (
    echo ❌ Backend dependencies installation failed!
    exit /b 1
)

cd ..\..

echo ✅ Deployment files ready!
echo.
echo 📋 Next steps:
echo 1. Push to GitHub: git add . ^&^& git commit -m "Deploy ready" ^&^& git push
echo 2. Import to Vercel: https://vercel.com/import
echo 3. Set environment variables in Vercel dashboard
echo 4. Deploy and test!
echo.
echo 🎉 Ready to deploy to production!