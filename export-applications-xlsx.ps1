param(
  [string]$OutputPath = "",
  [string]$ScanDate = ""
)

$ErrorActionPreference = "Stop"

if (-not $OutputPath) {
  $OutputPath = Join-Path (Get-Location) "data\applications.xlsx"
}
if (-not $ScanDate) {
  $ScanDate = Get-Date -Format "yyyy-MM-dd"
}

$root = (Get-Location).Path
$applicationsPath = Join-Path $root "data\applications.md"
$pipelinePath = Join-Path $root "data\pipeline.md"
$scanHistoryPath = Join-Path $root "data\scan-history.tsv"
$applyStatusPath = Join-Path $root "data\apply-today-2026-05-14-status.tsv"

function HtmlDecode([string]$text) {
  if ($null -eq $text) { return "" }
  return [System.Net.WebUtility]::HtmlDecode($text)
}

function RelPath([string]$path) {
  if (-not $path) { return "" }
  try {
    return [System.IO.Path]::GetRelativePath($root, (Resolve-Path -LiteralPath $path -ErrorAction Stop).Path)
  } catch {
    return $path
  }
}

function Find-ResumePath([int]$id) {
  $prefix = "{0:D3}" -f $id
  $match = Get-ChildItem -LiteralPath (Join-Path $root "output") -Filter "$prefix-*.pdf" -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -notlike "cover-letter-*" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1
  if ($match) { return RelPath $match.FullName }
  return ""
}

function Get-StatusRank([string]$status) {
  if ($null -eq $status) { $status = "" }
  $normalized = $status.Trim().ToLowerInvariant()
  switch ($normalized) {
    "new" { return 0 }
    "evaluated" { return 1 }
    "blocked" { return 2 }
    "responded" { return 3 }
    "interview" { return 4 }
    "offer" { return 5 }
    "applied" { return 6 }
    "rejected" { return 7 }
    "skip" { return 90 }
    "discarded" { return 91 }
    default { return 8 }
  }
}

function Get-DateSort([string]$dateText) {
  $parsed = [datetime]::MinValue
  if ([datetime]::TryParse($dateText, [ref]$parsed)) { return $parsed }
  return [datetime]::MinValue
}

function Normalize-Key([string]$company, [string]$title) {
  $c = (HtmlDecode $company).ToLowerInvariant() -replace "[^a-z0-9]+", " "
  $t = (HtmlDecode $title).ToLowerInvariant() -replace "[^a-z0-9]+", " "
  return "$($c.Trim())|$($t.Trim())"
}

function Parse-MarkdownLink([string]$value) {
  if ($value -match "\[([^\]]+)\]\(([^)]+)\)") {
    return @{ Display = $matches[1]; Target = $matches[2] }
  }
  return @{ Display = $value; Target = "" }
}

function Read-ApplicationsRows {
  $rows = New-Object System.Collections.Generic.List[object]
  foreach ($line in Get-Content -LiteralPath $applicationsPath) {
    if ($line -notmatch "^\|") { continue }
    if ($line -match "^\|[-\s|]+\|$") { continue }
    if ($line -match "^\|\s*#\s*\|") { continue }

    $parts = $line.Trim().Trim("|") -split "\|" | ForEach-Object { $_.Trim() }
    if ($parts.Count -lt 9) { continue }
    if ($parts.Count -gt 9) {
      $parts = @($parts[0..7] + (($parts[8..($parts.Count - 1)] -join " | ")))
    }

    $idText = $parts[0].Trim()
    $id = 0
    [void][int]::TryParse($idText, [ref]$id)
    if ($id -le 0) { continue }

    $report = Parse-MarkdownLink $parts[7]
    $rows.Add([pscustomobject]@{
      Id = $id
      Date = $parts[1]
      Company = HtmlDecode $parts[2]
      Role = HtmlDecode $parts[3]
      Score = $parts[4]
      Status = $parts[5]
      PdfFlag = $parts[6]
      Report = $report.Display
      ReportPath = $report.Target
      Notes = HtmlDecode $parts[8]
    })
  }
  return $rows
}

function Read-PipelineUrls {
  $byId = @{}
  $pending = New-Object System.Collections.Generic.List[object]

  foreach ($line in Get-Content -LiteralPath $pipelinePath) {
    if ($line -match "^- \[x\] #(\d+) \| (https?://\S+) \| (.*?) \| (.*?) \| (.*?) \| (.*)$") {
      $byId[[int]$matches[1]] = $matches[2]
      continue
    }
    if ($line -match "^- \[ \] (https?://\S+) \| (.*?) \| (.*)$") {
      $pending.Add([pscustomobject]@{
        Url = $matches[1]
        Company = HtmlDecode $matches[2]
        Role = HtmlDecode $matches[3]
      })
    }
  }

  return @{ ById = $byId; Pending = $pending }
}

function Read-LatestApplyStatus {
  $byUrl = @{}
  if (-not (Test-Path -LiteralPath $applyStatusPath)) { return $byUrl }

  $rows = Import-Csv -Delimiter "`t" -LiteralPath $applyStatusPath
  foreach ($row in $rows) {
    if (-not $row.url) { continue }
    $byUrl[$row.url] = $row
  }
  return $byUrl
}

function Add-Hyperlink($sheet, [int]$row, [int]$col, [string]$display, [string]$target) {
  if (-not $display) { return }
  $cell = $sheet.Cells.Item($row, $col)
  $cell.Value2 = $display
  if (-not $target -or $target -eq "-") { return }

  if ($target -match "^https?://") {
    [void]$sheet.Hyperlinks.Add($cell, $target, "", "", $display)
    return
  }

  $full = if ([System.IO.Path]::IsPathRooted($target)) { $target } else { Join-Path $root $target }
  if (Test-Path -LiteralPath $full) {
    [void]$sheet.Hyperlinks.Add($cell, (Resolve-Path -LiteralPath $full).Path, "", "", $display)
  }
}

function Write-SheetTable($workbook, [string]$name, [array]$headers, [array]$rows, [hashtable]$hyperlinkCols, [bool]$filterSkipDiscarded) {
  $sheet = $workbook.Worksheets.Add()
  $sheet.Name = $name
  $sheet.Activate() | Out-Null
  $sheet.Application.ActiveWindow.DisplayGridlines = $false

  for ($c = 0; $c -lt $headers.Count; $c++) {
    $sheet.Cells.Item(1, $c + 1).Value2 = $headers[$c]
    if ($headers[$c] -eq "Date" -or $headers[$c] -eq "First Seen") {
      $sheet.Columns.Item($c + 1).NumberFormat = "@"
    }
  }

  for ($r = 0; $r -lt $rows.Count; $r++) {
    $row = $rows[$r]
    for ($c = 0; $c -lt $headers.Count; $c++) {
      $header = $headers[$c]
      $value = $row.$header
      if ($null -eq $value) { $value = "" }

      if ($hyperlinkCols.ContainsKey($header)) {
        $targetName = $hyperlinkCols[$header]
        Add-Hyperlink $sheet ($r + 2) ($c + 1) ([string]$value) ([string]$row.$targetName)
      } else {
        $sheet.Cells.Item($r + 2, $c + 1).Value2 = [string]$value
      }
    }
  }

  $lastRow = [Math]::Max(2, $rows.Count + 1)
  $lastCol = $headers.Count
  $range = $sheet.Range($sheet.Cells.Item(1, 1), $sheet.Cells.Item($lastRow, $lastCol))
  $listObject = $sheet.ListObjects.Add(1, $range, $null, 1)
  $listObject.Name = ($name -replace "[^A-Za-z0-9]", "") + "Table"
  $listObject.TableStyle = "TableStyleMedium2"
  try { $listObject.ShowAutoFilterDropDown = $true } catch {}

  $headerRange = $sheet.Range($sheet.Cells.Item(1, 1), $sheet.Cells.Item(1, $lastCol))
  $headerRange.Font.Bold = $true
  $headerRange.Font.Color = 16777215
  $headerRange.Interior.Color = 6299648
  $range.WrapText = $true
  $range.VerticalAlignment = -4160

  $widths = @{
    "#" = 8; "Date" = 12; "Company" = 24; "Role" = 42; "Score" = 10; "Status" = 14;
    "Report" = 18; "Job URL" = 45; "Resume Path" = 55; "Source" = 18; "First Seen" = 12;
    "Apply Attempt" = 18; "Notes" = 70
  }
  for ($c = 0; $c -lt $headers.Count; $c++) {
    $header = $headers[$c]
    $sheet.Columns.Item($c + 1).ColumnWidth = $(if ($widths.ContainsKey($header)) { $widths[$header] } else { 18 })
  }
  $sheet.Rows.Item(1).RowHeight = 24
  $sheet.Range("A2").Select() | Out-Null
  $sheet.Application.ActiveWindow.FreezePanes = $true

  if ($filterSkipDiscarded) {
    $statusCol = [Array]::IndexOf($headers, "Status") + 1
    if ($statusCol -gt 0) {
      $listObject.Range.AutoFilter($statusCol, "<>SKIP", 1, "<>Discarded") | Out-Null
    }
  }

  return $sheet
}

$apps = @(Read-ApplicationsRows)
$pipeline = Read-PipelineUrls
$applyStatusByUrl = Read-LatestApplyStatus

$maxId = ($apps | Measure-Object -Property Id -Maximum).Maximum
if (-not $maxId) { $maxId = 0 }

$todayResumeIds = @{}
@(
  @{ Id = 108; Company = "emaratech"; Title = "Artificial Intelligence Developer" },
  @{ Id = 109; Company = "Bramwith Consulting"; Title = "Senior AI Engineer - FinTech Software House - Dubai Based" },
  @{ Id = 110; Company = "Dicetek LLC"; Title = "AI Engineer" },
  @{ Id = 111; Company = "Flatgigs"; Title = "Full Stack AI Engineer" },
  @{ Id = 112; Company = "oryxsearch.io"; Title = "MLOps / ML Platform Engineer (LLM & Streaming Infra)" },
  @{ Id = 113; Company = "Reap"; Title = "Senior Software Engineer, AI Agents" },
  @{ Id = 114; Company = "CNTXT AI"; Title = "Lead Machine Learning Engineer" },
  @{ Id = 115; Company = "Faze 3 Consulting"; Title = "AI/ML/DevOps Engineer" },
  @{ Id = 116; Company = "Almosafer"; Title = "Specialist - Machine Learning" },
  @{ Id = 117; Company = "Bhatia general contracting"; Title = "Artificial Intelligence Engineer" },
  @{ Id = 118; Company = "Bramwith Consulting"; Title = "Data Scientist - FinTech Software House - Dubai Based" },
  @{ Id = 119; Company = "Jobgether"; Title = "AI Research Engineer - Reinforcement Learning" },
  @{ Id = 120; Company = "LanceSoft Middle East"; Title = "AI Engineer" },
  @{ Id = 121; Company = "Virtusa"; Title = "Data Scientist" },
  @{ Id = 122; Company = "talabat"; Title = "Sr. Data Scientist (AI & ML)" },
  @{ Id = 123; Company = "Ajman University"; Title = "Data Scientist" },
  @{ Id = 124; Company = "Dubai Holding"; Title = "Associate Director - Data Scientist" },
  @{ Id = 125; Company = "Global Software Solutions Group"; Title = "Senior Data Engineer" },
  @{ Id = 126; Company = "Inception"; Title = "Applied Scientist" }
) | ForEach-Object {
  $todayResumeIds[(Normalize-Key $_.Company $_.Title)] = $_.Id
}

$existingRows = New-Object System.Collections.Generic.List[object]
foreach ($app in $apps) {
  $url = ""
  if ($pipeline.ById.ContainsKey($app.Id)) { $url = $pipeline.ById[$app.Id] }
  $resumePath = Find-ResumePath $app.Id
  $existingRows.Add([pscustomobject]@{
    "#" = $app.Id
    "Date" = $app.Date
    "Company" = $app.Company
    "Role" = $app.Role
    "Score" = $app.Score
    "Status" = $app.Status
    "Report" = $app.Report
    "ReportTarget" = $app.ReportPath
    "Job URL" = $url
    "JobURLTarget" = $url
    "Resume Path" = $resumePath
    "ResumeTarget" = $resumePath
    "Source" = "applications.md"
    "First Seen" = ""
    "Apply Attempt" = ""
    "Notes" = $app.Notes
  })
}

$todayRows = New-Object System.Collections.Generic.List[object]
if (Test-Path -LiteralPath $scanHistoryPath) {
  $scanRows = Import-Csv -Delimiter "`t" -LiteralPath $scanHistoryPath |
    Where-Object { $_.first_seen -eq $ScanDate -and $_.status -eq "added" }
  $nextId = [int]$maxId + 1
  foreach ($scan in $scanRows) {
    $decodedCompany = HtmlDecode $scan.company
    $decodedTitle = HtmlDecode $scan.title
    $key = Normalize-Key $decodedCompany $decodedTitle
    if ($todayResumeIds.ContainsKey($key)) {
      $rowId = [int]$todayResumeIds[$key]
    } else {
      while ($todayResumeIds.ContainsValue($nextId)) { $nextId++ }
      $rowId = $nextId
      $nextId++
    }
    $resumePath = Find-ResumePath $rowId
    $attempt = ""
    $attemptNote = ""
    if ($applyStatusByUrl.ContainsKey($scan.url)) {
      $attempt = $applyStatusByUrl[$scan.url].status
      $attemptNote = $applyStatusByUrl[$scan.url].notes
    }
    $obj = [pscustomobject]@{
      "#" = $rowId
      "Date" = $ScanDate
      "Company" = $decodedCompany
      "Role" = $decodedTitle
      "Score" = ""
      "Status" = "New"
      "Report" = "-"
      "ReportTarget" = ""
      "Job URL" = $scan.url
      "JobURLTarget" = $scan.url
      "Resume Path" = $resumePath
      "ResumeTarget" = $resumePath
      "Source" = $scan.portal
      "First Seen" = $scan.first_seen
      "Apply Attempt" = $attempt
      "Notes" = $(if ($attemptNote) { "Found today; apply attempt: $attemptNote" } else { "Found today; pending evaluation/application" })
    }
    $existingRows.Add($obj)
    $todayRows.Add($obj)
  }
}

$summaryRows = @()
$allRows = @($existingRows.ToArray() | Sort-Object `
  @{ Expression = { Get-StatusRank ([string]$_."Status") }; Ascending = $true },
  @{ Expression = { Get-DateSort ([string]$_."Date") }; Descending = $true },
  @{ Expression = { [int]$_."#" }; Descending = $true })
$statusGroups = $allRows | Group-Object Status | Sort-Object Name
foreach ($group in $statusGroups) {
  $summaryRows += [pscustomobject]@{
    "Metric" = "Status: $($group.Name)"
    "Value" = $group.Count
    "Notes" = ""
  }
}
$summaryRows += [pscustomobject]@{ "Metric" = "Operational source of truth"; "Value" = "data/applications.xlsx"; "Notes" = "Applications sheet contains all jobs; SKIP and Discarded rows are retained but filtered out by default." }
$summaryRows += [pscustomobject]@{ "Metric" = "Total rows"; "Value" = $allRows.Count; "Notes" = "Sorted by unapplied status first, then newest date and highest row number." }
$summaryRows += [pscustomobject]@{ "Metric" = "New jobs on $ScanDate"; "Value" = $todayRows.Count; "Notes" = "New jobs are kept in the Applications sheet with resume paths when generated PDFs exist." }

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
  $workbook = $excel.Workbooks.Add()
  while ($workbook.Worksheets.Count -gt 1) {
    $workbook.Worksheets.Item($workbook.Worksheets.Count).Delete()
  }
  $workbook.Worksheets.Item(1).Name = "Scratch"

  $summaryHeaders = @("Metric", "Value", "Notes")
  Write-SheetTable $workbook "Summary" $summaryHeaders $summaryRows @{} $false | Out-Null

  $headers = @("#", "Date", "Company", "Role", "Score", "Status", "Report", "Job URL", "Resume Path", "Source", "First Seen", "Apply Attempt", "Notes")
  $linkCols = @{ "Report" = "ReportTarget"; "Job URL" = "JobURLTarget"; "Resume Path" = "ResumeTarget" }
  Write-SheetTable $workbook "Applications" $headers $allRows $linkCols $true | Out-Null

  $workbook.Worksheets.Item("Scratch").Delete()
  $workbook.Worksheets.Item("Applications").Activate() | Out-Null

  $outDir = Split-Path -Parent $OutputPath
  if ($outDir -and -not (Test-Path -LiteralPath $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
  }
  if (Test-Path -LiteralPath $OutputPath) {
    Remove-Item -LiteralPath $OutputPath -Force
  }
  $absoluteOutputPath = [System.IO.Path]::GetFullPath($OutputPath)
  $workbook.SaveAs($absoluteOutputPath, 51)
  $workbook.Close($true)
} finally {
  $excel.Quit()
  if ($workbook) { [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) }
  [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel)
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

Write-Host "Exported $OutputPath"
