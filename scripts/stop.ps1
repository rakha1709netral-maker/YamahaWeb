$ErrorActionPreference = 'Stop'
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$pidFile = Join-Path $projectRoot 'data\server.pid'
if (-not (Test-Path -LiteralPath $pidFile)) { Write-Host 'Server Java tidak sedang berjalan.'; exit }
$serverProcessId = [int](Get-Content -LiteralPath $pidFile -Raw)
$processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $serverProcessId"
if ($processInfo -and $processInfo.Name -eq 'java.exe' -and $processInfo.CommandLine -match '\bNusaServer\b' -and $processInfo.CommandLine.Contains((Join-Path $projectRoot 'out'))) {
    Stop-Process -Id $serverProcessId
    Write-Host 'Server Nusa Motors dihentikan.'
} elseif (-not $processInfo) { Write-Host 'Server sudah berhenti.' }
else { throw 'PID tidak cocok dengan server proyek ini. Tidak ada proses yang dihentikan.' }
