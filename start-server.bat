@echo off
title ForanAPI Central Server & Admin Dashboard
cd /d "%~dp0"
echo ========================================================
echo  Starting ForanAPI Central Database & Update Server...
echo ========================================================
echo.
node server/index.js
pause
