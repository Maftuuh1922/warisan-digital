# Deploy Batik MobileNet Ultimate API
Write-Host "======================================================================"
Write-Host "BATIK MOBILENET ULTIMATE - DEPLOYMENT HELPER" -ForegroundColor Cyan
Write-Host "======================================================================"
Write-Host ""

# Check model file
Write-Host "Model Files Status:" -ForegroundColor Yellow
$modelPath = "models\batik_mobilenet_ultimate_final.keras"
if (Test-Path $modelPath) {
    $size = (Get-Item $modelPath).Length / 1MB
    Write-Host "  Model: $([math]::Round($size, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "  Model not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Pilih deployment method:" -ForegroundColor Yellow
Write-Host "1. Docker (Local)"
Write-Host "2. Railway.app"
Write-Host "3. Render.com"  
Write-Host "4. Test Lokal (tanpa deploy)"
Write-Host ""

$choice = Read-Host "Pilihan (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Building Docker image..." -ForegroundColor Cyan
        docker build -t batik-api-mobilenet -f Dockerfile.mobilenet .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Docker image berhasil dibuild!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Run container dengan:" -ForegroundColor Yellow
            Write-Host "   docker run -p 5000:5000 batik-api-mobilenet"
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "Railway.app Setup:" -ForegroundColor Cyan
        Write-Host "1. Copy files untuk deployment..."
        
        Copy-Item requirements_mobilenet.txt requirements.txt -Force
        Copy-Item Procfile.mobilenet Procfile -Force
        
        Write-Host "   Files copied" -ForegroundColor Green
        Write-Host ""
        Write-Host "2. Next steps:" -ForegroundColor Yellow
        Write-Host "   - git add ."
        Write-Host "   - git commit -m 'Add MobileNet Ultimate API'"
        Write-Host "   - git push"
        Write-Host "   - Deploy di railway.app"
    }
    
    "3" {
        Write-Host ""
        Write-Host "Render.com Setup:" -ForegroundColor Cyan
        
        Copy-Item requirements_mobilenet.txt requirements.txt -Force
        
        Write-Host "   Files prepared" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next: Push to GitHub dan deploy di render.com" -ForegroundColor Yellow
    }
    
    "4" {
        Write-Host ""
        Write-Host "Test Lokal:" -ForegroundColor Cyan
        Write-Host "Model files sudah ada. Untuk test:"
        Write-Host ""
        Write-Host "Opsi A - Install Python 3.11:" -ForegroundColor Yellow
        Write-Host "   1. Download dari python.org"
        Write-Host "   2. py -3.11 -m venv test_env"
        Write-Host "   3. test_env\Scripts\activate"
        Write-Host "   4. pip install -r requirements_mobilenet.txt"
        Write-Host "   5. python app_mobilenet.py"
        Write-Host ""
        Write-Host "Opsi B - Gunakan Docker:" -ForegroundColor Yellow
        Write-Host "   docker run -p 5000:5000 batik-api-mobilenet"
    }
    
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "======================================================================"
