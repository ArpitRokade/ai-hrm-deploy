@echo off
REM One-click: build and serve production via Express
pushd "%~dp0"
echo Building production bundle...
npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Build failed.
  pause
  exit /b %ERRORLEVEL%
)
echo Starting production server (server/index.js)...
npm run start:prod
pause
