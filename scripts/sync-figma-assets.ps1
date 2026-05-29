# Sync img/ files into docs/design/figma-assets/ for Figma import
$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "img"
$dest = Join-Path $root "docs\design\figma-assets"
$files = @(
  "duacrypto-mark.svg",
  "duacrypto-logo.png",
  "kane-profile.png",
  "balkans-crypto-2025-1.png",
  "balkans-crypto-2025-2.png",
  "balkans-crypto-2025-3.png",
  "bitcoin-event-cover.jpg",
  "bitcoin-pizza-day-cover.jpg",
  "bitcoin-pizza-day-1.png",
  "bitcoin-pizza-day-2.png",
  "bitcoin-pizza-day-3.png",
  "as-seen-on-eko.png",
  "as-seen-on-abc-news.png",
  "as-seen-on-top-channel.png"
)
New-Item -ItemType Directory -Force -Path $dest | Out-Null
foreach ($f in $files) {
  $p = Join-Path $src $f
  if (Test-Path $p) {
    Copy-Item $p (Join-Path $dest $f) -Force
    Write-Host "Copied $f"
  } else {
    Write-Warning "Missing $f"
  }
}
