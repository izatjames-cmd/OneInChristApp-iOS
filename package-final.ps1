$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = [IO.Path]::GetFullPath($PSScriptRoot)
$outputRoot = Join-Path $projectRoot 'releases'
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
$zipPath = Join-Path $outputRoot 'OneInChristApp_FINAL_ANDROID_LANGUAGE_REVIEW_2026-09-24.zip'
if (Test-Path -LiteralPath $zipPath) { throw 'Release already exists; do not overwrite an existing final archive.' }
$skipDirs = @('node_modules', '.git', '.gradle', '.idea', '.kotlin', '.vscode', '.firebase', 'dist', 'dist-ssr', 'build', 'releases', 'capacitor-cordova-android-plugins', '.cxx', '.externalNativeBuild')
$skipPaths = @('android/app/src/main/assets/public', 'android/local.properties', 'android/app/src/main/assets/capacitor.config.json', 'android/app/src/main/assets/capacitor.plugins.json', 'android/app/src/main/res/xml/config.xml')
$history = @('FINAL_ANDROID_BASELINE.md', 'Project Context.md', 'V9_HYMNBOOK_EDITOR.md', 'V11_BIBLE_READING_SIX_MONTH_RULE.md', 'V12_CHRISTIAN_URDU_TERMINOLOGY.md', 'V13_LIVE_SERMON_TRANSCRIPT_SCROLL.md', 'V14_CONTEXT_AWARE_SERMON_GRAMMAR.md')
$files = [Collections.Generic.List[object]]::new()
function Collect-ReleaseFiles([string]$directory) {
  foreach ($item in Get-ChildItem -LiteralPath $directory -Force) {
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { continue }
    $relative = [IO.Path]::GetRelativePath($projectRoot, $item.FullName).Replace('\', '/')
    if ($relative -in $skipPaths) { continue }
    if ($item.PSIsContainer) {
      if ($item.Name -notin $skipDirs) { Collect-ReleaseFiles $item.FullName }
      continue
    }
    if ($item.Name -match '(?i)(\.log$|\.tmp$|\.bak$|\.apk$|\.aab$|\.jks$|\.keystore$|\.iml$|^\.env|^\.DS_Store$|^Thumbs\.db$|service.?account.*\.json$)') { continue }
    $entry = $relative
    if ($relative -in $history) { $entry = "docs/history/$relative" }
    if ($relative -eq 'README_FINAL.md') { $entry = 'README.md' }
    $files.Add([pscustomobject]@{ source = $item.FullName; path = $entry; bytes = $item.Length; sha256 = (Get-FileHash -LiteralPath $item.FullName -Algorithm SHA256).Hash.ToLowerInvariant() })
  }
}
Collect-ReleaseFiles $projectRoot
$zip = [IO.Compression.ZipFile]::Open($zipPath, [IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($file in $files) {
    [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.source, $file.path, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
  }
  $manifest = $zip.CreateEntry('RELEASE_MANIFEST.json')
  $writer = [IO.StreamWriter]::new($manifest.Open())
  try { $writer.Write(($files | Select-Object path, bytes, sha256 | ConvertTo-Json -Depth 3)) } finally { $writer.Dispose() }
} finally { $zip.Dispose() }
# Verify every archived byte against the source snapshot.
$zip = [IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  foreach ($file in $files) {
    $entry = $zip.GetEntry($file.path)
    if (!$entry) { throw "Missing release entry: $($file.path)" }
    $stream = $entry.Open()
    $hasher = [Security.Cryptography.SHA256]::Create()
    try { $hash = [Convert]::ToHexString($hasher.ComputeHash($stream)).ToLowerInvariant() }
    finally { $stream.Dispose(); $hasher.Dispose() }
    if ($hash -ne $file.sha256) { throw "Release verification failed: $($file.path)" }
  }
} finally { $zip.Dispose() }
$archiveHash = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash.ToLowerInvariant()
"$archiveHash  $([IO.Path]::GetFileName($zipPath))" | Set-Content -LiteralPath "$zipPath.sha256" -Encoding utf8
[pscustomobject]@{ Archive = $zipPath; FilesVerified = $files.Count; SizeMB = [math]::Round((Get-Item -LiteralPath $zipPath).Length / 1MB, 2); SHA256 = $archiveHash } | Format-List
