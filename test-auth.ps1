# Test Authentication Script

Write-Host "Testing CampusMart Authentication..." -ForegroundColor Cyan

# Test 1: Register a new user
Write-Host "`n1. Testing Registration..." -ForegroundColor Yellow
$registerBody = @{
    email = "test@example.com"
    username = "testuser"
    password = "password123"
    phone = "0712345678"
    campus = "Main Campus"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" `
        -Method Post `
        -ContentType "application/json" `
        -Body $registerBody `
        -ErrorAction Stop
    
    Write-Host "✓ Registration successful!" -ForegroundColor Green
    Write-Host "User ID: $($registerResponse.user.id)" -ForegroundColor Gray
    Write-Host "Username: $($registerResponse.user.username)" -ForegroundColor Gray
    Write-Host "Token: $($registerResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    
    $token = $registerResponse.token
} catch {
    Write-Host "✗ Registration failed (user might already exist)" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test 2: Login with the user
Write-Host "`n2. Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    emailOrPhone = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop
    
    Write-Host "✓ Login successful!" -ForegroundColor Green
    Write-Host "User ID: $($loginResponse.user.id)" -ForegroundColor Gray
    Write-Host "Username: $($loginResponse.user.username)" -ForegroundColor Gray
    Write-Host "Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
    
    $token = $loginResponse.token
} catch {
    Write-Host "✗ Login failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Test 3: Get current user with token
if ($token) {
    Write-Host "`n3. Testing Get Current User..." -ForegroundColor Yellow
    try {
        $headers = @{
            "Authorization" = "Bearer $token"
        }
        $meResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" `
            -Method Get `
            -Headers $headers `
            -ErrorAction Stop
        
        Write-Host "✓ Get current user successful!" -ForegroundColor Green
        Write-Host "User ID: $($meResponse.id)" -ForegroundColor Gray
        Write-Host "Username: $($meResponse.username)" -ForegroundColor Gray
        Write-Host "Email: $($meResponse.email)" -ForegroundColor Gray
        Write-Host "Campus: $($meResponse.campus)" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Get current user failed" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n✓ Authentication tests completed!" -ForegroundColor Cyan
