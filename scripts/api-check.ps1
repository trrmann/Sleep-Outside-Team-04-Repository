Param(
    [string]$ProxyUrl = "http://localhost:3000",
    [string]$BackendUrl = "https://wdd330-backend.onrender.com"
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot "src/.env.production.local"
$token = $null
if (Test-Path $envFile) {
    $m = Select-String -Path $envFile -Pattern '^BACKEND_API_TOKEN=(.*)'
    if ($m) { $token = $m.Matches[0].Groups[1].Value }
}

if (-not $token) { Write-Host "No token found in $envFile; proceeding without Authorization header" }
else { Write-Host "Using token from $envFile" }

$urls = @(
    "$ProxyUrl/api/openapi.json",
    "$ProxyUrl/api/1.0/product/927vj/",
    "$ProxyUrl/api/1.0/products/s~sleeping-bags/",
    "$BackendUrl/openapi.json"
)

foreach ($u in $urls) {
    Write-Host ""; Write-Host "=== $u ==="
    $headers = @{}
    if ($token) { $headers['Authorization'] = "Bearer $token" }
    try {
        $response = Invoke-WebRequest -Uri $u -Headers $headers -UseBasicParsing -ErrorAction Stop
        Write-Host "$($response.StatusCode) $($response.StatusDescription)"
        $content = $response.Content
        if ($content.Length -gt 2000) { $content = $content.Substring(0,2000) }
        Write-Host $content
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)"
    }
}

Write-Host "`nDone."
