# Set Android SDK env vars for the current PowerShell session.
# Edit $sdkPath if your Android SDK is installed elsewhere (e.g. via Android Studio).

$sdkPath = "$env:LOCALAPPDATA\Android\Sdk"
if (-not (Test-Path $sdkPath)) {
  Write-Host "Android SDK not found at: $sdkPath" -ForegroundColor Yellow
  Write-Host "Install Android Studio or set `$sdkPath in this script to your SDK path." -ForegroundColor Yellow
  exit 1
}

$env:ANDROID_HOME = $sdkPath
$env:Path = "$sdkPath\platform-tools;$sdkPath\emulator;" + $env:Path
Write-Host "ANDROID_HOME set to: $env:ANDROID_HOME" -ForegroundColor Green
Write-Host "Run 'npx expo start' then press 'a' for Android." -ForegroundColor Green
