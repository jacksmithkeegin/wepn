@echo off
echo ===================================
echo WEPN Jekyll Site Runner
echo ===================================
echo.

REM Check if Ruby is installed
ruby --version
if %ERRORLEVEL% NEQ 0 (
    echo Ruby is not installed or not in PATH!
    echo Please install Ruby from https://rubyinstaller.org/
    echo Choose the version WITH DevKit
    echo Make sure to check "Add Ruby executables to your PATH" during installation
    echo.
    echo After installation, open a NEW command prompt and run this script again.
    pause
    exit /b
)

REM Check if Jekyll is installed
jekyll --version
if %ERRORLEVEL% NEQ 0 (
    echo Installing Jekyll and Bundler...
    gem install jekyll bundler
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install Jekyll!
        pause
        exit /b
    )
)

REM Install dependencies
echo Installing dependencies...
bundle install
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies!
    pause
    exit /b
)

echo.
echo ===================================
echo Starting Jekyll server...
echo ===================================
echo.
echo Your site will be available at http://localhost:4000/
echo Press Ctrl+C to stop the server
echo.

REM Use local config to override baseurl for development
bundle exec jekyll serve --config _config.yml,_config_local.yml --livereload

pause
