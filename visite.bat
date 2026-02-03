@echo off

echo ===============================
echo Aggiornamento da Git...
echo ===============================
git checkout master
git pull
echo.

echo ===============================
echo Avvio del progetto...
echo ===============================
start chrome http://localhost:3000/
node index.js

pause
