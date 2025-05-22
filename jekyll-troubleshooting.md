# Jekyll Installation and Troubleshooting Guide

## Ruby Installation Steps

1. **Install Ruby with DevKit**
   - Download the latest Ruby+DevKit installer from [RubyInstaller](https://rubyinstaller.org/downloads/)
   - Choose a version marked "WITH DEVKIT" (recommended: Ruby 3.1.x or 3.2.x)
   - During installation, **make sure to check** "Add Ruby executables to your PATH"
   - Complete the installation including the MSYS2 toolchain when prompted

2. **Verify Ruby Installation**
   - Open a **NEW** PowerShell window (important!)
   - Run: `ruby --version`
   - You should see the Ruby version if installed correctly

## Jekyll Installation

1. **Install Jekyll and Bundler gems**
   ```
   gem install jekyll bundler
   ```

2. **Verify Jekyll Installation**
   ```
   jekyll --version
   ```

3. **Install Project Dependencies**
   ```
   cd C:\Users\User\Music\wepn
   bundle install
   ```

## Common Issues and Solutions

### "gem not recognized" Error

**Problem**: You installed Ruby but the `gem` command doesn't work.

**Solutions**:
- **Open a new terminal window** after installing Ruby
- Check if Ruby is in your PATH:
  ```
  $env:Path -split ';' | Where-Object { $_ -like "*ruby*" }
  ```
- Add Ruby to PATH manually:
  ```
  $env:Path += ";C:\Ruby32-x64\bin"  # Adjust path to match your Ruby installation
  ```

### SSL Error When Installing Gems

**Problem**: SSL certificate verification errors when installing gems.

**Solution**:
- Download RubyGems certificate bundle:
  ```
  Invoke-WebRequest -Uri https://curl.se/ca/cacert.pem -OutFile C:\cacert.pem
  $env:SSL_CERT_FILE = "C:\cacert.pem"
  ```

### Jekyll Build/Serve Errors

**Problem**: Error messages when running `jekyll serve`.

**Solutions**:
- Check for syntax errors in your YAML files
- Verify all required gems are installed: `bundle install`
- Run with verbose output for more details: `bundle exec jekyll serve --verbose`

## Running Jekyll

1. **Using the run-jekyll.bat**
   - Double-click `run-jekyll.bat` in your project folder
   - Follow any prompts

2. **Manually from the command line**
   ```
   cd C:\Users\User\Music\wepn
   bundle exec jekyll serve
   ```

3. **View the site**
   - Open http://localhost:4000 in your browser

## Deployment Without Jekyll

If you can't get Jekyll running locally, you can still deploy the site:

1. **GitHub Pages:** If using GitHub, it can build Jekyll automatically
2. **Netlify/Vercel:** These services can build Jekyll sites for you
3. **Pre-built site:** You can request a pre-built version of the site from a developer with Ruby installed

## Getting Help

- Jekyll documentation: https://jekyllrb.com/docs/
- Ruby installer issues: https://github.com/oneclick/rubyinstaller2/issues
