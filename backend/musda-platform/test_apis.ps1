# Test Admin Dashboard APIs dengan PowerShell

Write-Host "🧪 Testing New Admin Dashboard APIs" -ForegroundColor Cyan
Write-Host ""

$API_BASE = "http://localhost:3001"

# Test 1: Health Check
Write-Host "1️⃣ Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api" -Method GET -ErrorAction Stop
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Health Check: $($data.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Check existing endpoints (without auth first)
Write-Host ""
Write-Host "2️⃣ Testing Public Endpoints..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/agendas" -Method GET -ErrorAction Stop
    $agendas = $response.Content | ConvertFrom-Json
    Write-Host "✅ Agendas: $($agendas.Count) items found" -ForegroundColor Green
} catch {
    $errorData = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorData)
    $errorContent = $reader.ReadToEnd() | ConvertFrom-Json
    Write-Host "⚠️ Agendas: $($errorContent.message)" -ForegroundColor Yellow
}

# Test 3: Try system settings (will need auth)
Write-Host ""
Write-Host "3️⃣ Testing System Settings (without auth)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/system/settings" -Method GET -ErrorAction Stop
    $settings = $response.Content | ConvertFrom-Json
    Write-Host "✅ System Settings: $($settings.data.Count) settings found" -ForegroundColor Green
} catch {
    $errorData = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorData)
    $errorContent = $reader.ReadToEnd() | ConvertFrom-Json
    Write-Host "⚠️ System Settings: $($errorContent.message)" -ForegroundColor Yellow
}

# Test 4: Try content API
Write-Host ""
Write-Host "4️⃣ Testing Content API (without auth)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/content" -Method GET -ErrorAction Stop
    $content = $response.Content | ConvertFrom-Json
    Write-Host "✅ Content: $($content.data.Count) items found" -ForegroundColor Green
} catch {
    $errorData = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorData)
    $errorContent = $reader.ReadToEnd() | ConvertFrom-Json
    Write-Host "⚠️ Content: $($errorContent.message)" -ForegroundColor Yellow
}

# Test 5: Try reports API
Write-Host ""
Write-Host "5️⃣ Testing Reports API (without auth)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/reports/stats" -Method GET -ErrorAction Stop
    $reports = $response.Content | ConvertFrom-Json
    Write-Host "✅ Reports: Data retrieved successfully" -ForegroundColor Green
} catch {
    $errorData = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorData)
    $errorContent = $reader.ReadToEnd() | ConvertFrom-Json
    Write-Host "⚠️ Reports: $($errorContent.message)" -ForegroundColor Yellow
}

# Test 6: Check SPH Settings (existing endpoint)
Write-Host ""
Write-Host "6️⃣ Testing SPH Settings (existing)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/sph-settings" -Method GET -ErrorAction Stop
    $sph = $response.Content | ConvertFrom-Json
    Write-Host "✅ SPH Settings: Working correctly" -ForegroundColor Green
} catch {
    $errorData = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errorData)
    $errorContent = $reader.ReadToEnd() | ConvertFrom-Json
    Write-Host "⚠️ SPH Settings: $($errorContent.message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 API Testing Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor White
Write-Host "- Health Check: Basic server connectivity" -ForegroundColor Gray
Write-Host "- New APIs: System, Content, Reports, Profile routes" -ForegroundColor Gray
Write-Host "- Most endpoints require authentication (normal behavior)" -ForegroundColor Gray
Write-Host "- Next step: Test with admin authentication" -ForegroundColor Gray