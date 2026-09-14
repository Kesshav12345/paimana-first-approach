@echo off
title PAIMANA-INTEL - Shutdown System
color 0C

echo =====================================================================
echo               PAIMANA-INTEL PLATFORM SHUTDOWN
echo =====================================================================
echo.

echo Stopping services on ports 8000 (ML), 8080 (Backend), and 5173 (Frontend)...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ports = @(8000, 8080, 5173); foreach ($p in $ports) { $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue; if ($conns) { $pids = $conns | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($id in $pids) { Stop-Process -Id $id -Force -ErrorAction SilentlyContinue; Write-Host \"[STOPPED] Terminated process $id on port $p\" } } else { Write-Host \"[OK] No active service on port $p\" } }"

echo.
echo =====================================================================
echo   ALL PAIMANA SERVICES STOPPED CLEANLY!
echo =====================================================================
powershell -NoProfile -Command "Start-Sleep -Seconds 2"
