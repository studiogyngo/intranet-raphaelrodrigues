$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding $false
$latin1 = [System.Text.Encoding]::GetEncoding('iso-8859-1')
$root = Split-Path $PSScriptRoot -Parent
$colPath = Join-Path $root 'colaboradores.html'
$idxPath = Join-Path $root 'index.html'

function Get-DoubleCount([byte[]]$bytes) {
  return ([regex]::Matches([BitConverter]::ToString($bytes), 'C3-83-C2')).Count
}

function Convert-ToEntities([string]$text) {
  $sb = New-Object System.Text.StringBuilder ($text.Length * 2)
  foreach ($ch in $text.ToCharArray()) {
    $code = [int][char]$ch
    if ($code -gt 127) {
      [void]$sb.Append('&#' + $code + ';')
    } else {
      [void]$sb.Append($ch)
    }
  }
  return $sb.ToString()
}

$bytes = [System.IO.File]::ReadAllBytes($colPath)
$guard = 0
while ((Get-DoubleCount $bytes) -gt 0 -and $guard -lt 6) {
  $decoded = $utf8.GetString($bytes)
  $decoded = $utf8.GetString($latin1.GetBytes($decoded))
  $bytes = $utf8.GetBytes($decoded)
  $guard++
}

$col = $utf8.GetString($bytes)
$idx = $utf8.GetString([System.IO.File]::ReadAllBytes($idxPath))

$idxChromeStart = $idx.IndexOf("  <!-- ============================================")
$idxMain = $idx.IndexOf('<main')
$chrome = $idx.Substring($idxChromeStart, $idxMain - $idxChromeStart)

$colMainStart = $col.IndexOf('<main')
$colMainEnd = $col.IndexOf('</main>') + 7
if ($colMainStart -lt 0 -or $colMainEnd -lt 7) { throw 'main block not found' }
$main = $col.Substring($colMainStart, $colMainEnd - $colMainStart)

$idxFooterStart = $idx.IndexOf('<footer class="site-footer"')
$idxFooterComment = $idx.LastIndexOf('  <!-- ============================================', $idxFooterStart)
if ($idxFooterComment -ge 0) { $idxFooterStart = $idxFooterComment }
$idxFooterEnd = $idx.IndexOf('</footer>') + 9
$footer = $idx.Substring($idxFooterStart, $idxFooterEnd - $idxFooterStart)

$modalStart = $col.IndexOf('<div class="notice-modal" id="person-modal"')
$scriptStart = $col.LastIndexOf('<script src="script.js"')
$modal = ''
if ($modalStart -ge 0 -and $scriptStart -gt $modalStart) {
  $modal = $col.Substring($modalStart, $scriptStart - $modalStart).TrimEnd() + "`r`n"
}

$preStart = $col.IndexOf("  <!-- ============================================")
$head = $col.Substring(0, $preStart)
if ($head -notmatch 'http-equiv="Content-Type"') {
  $head = $head.Replace(
    '  <meta charset="UTF-8">' + "`r`n",
    '  <meta charset="UTF-8">' + "`r`n" + '  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' + "`r`n"
  )
}

$nl = "`r`n"
$combined = $head + $chrome + $main + $nl + $nl + $footer + $nl + $nl + $modal + $nl + '  <script src="script.js" defer></script>' + $nl + '</body>' + $nl + '</html>' + $nl
$safe = Convert-ToEntities $combined
[System.IO.File]::WriteAllBytes($colPath, $utf8.GetBytes($safe))

$out = [System.IO.File]::ReadAllBytes($colPath)
$ascii = [System.Text.Encoding]::ASCII.GetString($out)
$t = $ascii.IndexOf('<title>')
Write-Output ('passes=' + $guard)
Write-Output ('double=' + (Get-DoubleCount $out))
Write-Output ('non_ascii_bytes=' + ($out | Where-Object { $_ -gt 127 }).Count)
Write-Output ('title=' + $ascii.Substring($t, [Math]::Min(90, $ascii.Length - $t)))
Write-Output ('has_entity_oacute=' + $ascii.Contains('&#243;'))
Write-Output ('has_entity_iacute=' + $ascii.Contains('&#237;'))
Write-Output ('has_person_modal=' + $ascii.Contains('id="person-modal"'))
