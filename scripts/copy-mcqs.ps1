$sourceDir = "D:\Full Stack Web Devlopement Certification"
$destDir = "C:\Users\mohit\Documents\techtomorrow\public\mcqs"

Write-Output "Starting copy..."
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

if (Test-Path $sourceDir) {
    Write-Output "Source directory found. Copying files..."
    Copy-Item -Path "$sourceDir\*" -Destination $destDir -Force -Recurse
    Write-Output "Copy completed successfully."
} else {
    Write-Output "Source directory NOT found in this session."
}
