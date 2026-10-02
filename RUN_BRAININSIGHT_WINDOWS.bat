@echo off
setlocal
cd /d "%~dp0"
start "BrainInsight API" cmd /k "cd /d "%~dp0backend" && if not exist venv\Scripts\python.exe (python -m venv venv && call venv\Scripts\activate.bat && python -m pip install --upgrade pip && pip install -r requirements.txt) else (call venv\Scripts\activate.bat) && python app.py"
timeout /t 2 >nul
start "BrainInsight UI" cmd /k "cd /d "%~dp0client" && npm install && npm run dev:static"
endlocal
