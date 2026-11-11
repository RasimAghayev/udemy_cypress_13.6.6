$wt = "D:\Tasks\ai_code\update_git_repo\projects\worktrees\udemy_cypress_13.6.6"
$src = Join-Path $wt "cypress"
$files = Get-ChildItem -Path $src -Recurse -File -Include *.js,*.cy.js | Where-Object { $_.FullName -notlike "*node_modules*" }

function Count-Ref($pattern) {
    $n = 0
    $hits = @()
    foreach ($f in $files) {
        $c = (Get-Content $f.FullName -Raw)
        if ($c -match [regex]::Escape($pattern)) { $n++; $hits += $f.FullName.Replace($wt + "\", "") }
    }
    return "$n -> " + ($hits -join ", ")
}

Write-Host "=== PAGE OBJECTS ==="
foreach ($p in @("HomePage","LandingPage","LoginPage","SettingsPage","homePage","landingPage","loginPage","SettingsPage.js")) {
    Write-Host ("{0}: {1}" -f $p, (Count-Ref $p))
}

Write-Host "=== FIXTURES (basename) ==="
foreach ($p in @("Article","ConduitCsv","ConduitExcelData","conduitLoginData","example","Login","profile","Tags","users")) {
    Write-Host ("{0}: {1}" -f $p, (Count-Ref $p))
}

Write-Host "=== read-xlsx usage ==="
Write-Host ("readXlsx: {0}" -f (Count-Ref "readXlsx"))
Write-Host ("read-xlsx: {0}" -f (Count-Ref "read-xlsx"))

Write-Host "=== it.only / it.skip ==="
foreach ($f in $files) {
    $c = (Get-Content $f.FullName -Raw)
    if ($c -match "it\.only|it\.skip|fit\(") { Write-Host ("{0}: {1}" -f $f.FullName.Replace($wt + "\", ""), ($c -split "`n" | Where-Object { $_ -match "it\.only|it\.skip|fit\(" } | Select-Object -First 5) -join " | ") }
}