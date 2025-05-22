# WEPN Jekyll Runner PowerShell Script

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "WEPN Jekyll Site Runner" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if Ruby is installed
try {
    $rubyVersion = ruby --version
    Write-Host "Ruby detected: $rubyVersion" -ForegroundColor Green
} catch {
    Write-Host "Ruby is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "Please install Ruby from https://rubyinstaller.org/" -ForegroundColor Yellow
    Write-Host "Choose the version WITH DevKit" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add Ruby executables to your PATH' during installation" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After installation, open a NEW PowerShell window and run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Check if Jekyll is installed
try {
    $jekyllVersion = jekyll --version
    Write-Host "Jekyll detected: $jekyllVersion" -ForegroundColor Green
} catch {
    Write-Host "Installing Jekyll and Bundler..." -ForegroundColor Cyan
    gem install jekyll bundler
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Jekyll!" -ForegroundColor Red
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit
    }
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
bundle install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies!" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Run Jekyll server
Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Starting Jekyll server..." -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your site will be available at http://localhost:4000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

bundle exec jekyll serve

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
