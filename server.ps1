# Simple Lightweight HTTP Server for Salla Store
$port = 8080
$url = "http://localhost:8080/"
$root = "c:\Users\LENOVO\Desktop\kkk"

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "Al-Nukhbah Saudi Store is now running successfully!" -ForegroundColor Yellow
    Write-Host "Storefront (Customer): http://localhost:8080/" -ForegroundColor Cyan
    Write-Host "Admin Dashboard:       http://localhost:8080/admin.html" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Green

    # Launch browser
    Start-Process "http://localhost:8080/"

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $reqPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
            if ($request.HttpMethod -eq "POST" -and $reqPath -eq "/api/test_report") {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $body = $reader.ReadToEnd()
                [System.IO.File]::WriteAllText((Join-Path $root "test_run_report.json"), $body, [System.Text.Encoding]::UTF8)
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes('{"success":true}')
                $response.ContentType = "application/json"
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $response.Close()
                continue
            }
            if ($reqPath -eq "/" -or $reqPath -eq "") { 
                $reqPath = "/index.html" 
            }
            $cleanRelPath = $reqPath.TrimStart('/').Replace('/', '\')
            $filePath = Join-Path $root $cleanRelPath

            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $mime = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".png"  { "image/png" }
                    ".svg"  { "image/svg+xml" }
                    Default { "application/octet-stream" }
                }
                $response.ContentType = $mime
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.Close()
        } catch {
            # Continue handling subsequent requests
        }
    }
} finally {
    $listener.Stop()
}
