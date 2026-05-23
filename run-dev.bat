@echo off
REM One-click: start frontend + backend development servers
pushd "%~dp0"
echo Starting development servers (concurrently)...
npm run dev
pause
