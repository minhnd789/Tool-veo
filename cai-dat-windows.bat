@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo === Cai dat Tool Edit Video ===

where node >nul 2>nul
if errorlevel 1 (
  echo [LOI] Chua co Node.js. Tai ban LTS tai https://nodejs.org roi chay lai file nay.
  pause
  exit /b 1
)
node -v

echo.
echo --- Cai thu vien npm (mat vai phut) ---
call npm install
if errorlevel 1 (
  echo [LOI] npm install that bai.
  pause
  exit /b 1
)

echo.
echo --- Kiem tra thu vien ---
call npm run check

echo.
echo --- Cai numpy cho Python (de tao am thanh NinjaFight) ---
where py >nul 2>nul
if not errorlevel 1 (
  py -3 -m pip install --user numpy
) else (
  where python >nul 2>nul
  if not errorlevel 1 (
    python -m pip install --user numpy
  ) else (
    echo [CANH BAO] Chua co Python. Chi can neu muon chay "npm run fight:sfx".
  )
)

if not exist public\fight mkdir public\fight

echo.
echo === Xong! Mo Remotion Studio bang lenh: npm run studio ===
pause
