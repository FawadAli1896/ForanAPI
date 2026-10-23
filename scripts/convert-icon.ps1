Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("c:\laragon\www\API\public\icon.jpg")
$img.Save("c:\laragon\www\API\public\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
Write-Host "PNG saved successfully!"
