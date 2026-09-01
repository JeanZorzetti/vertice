# create-stripe-products.ps1 - cria os 3 planos do Vertice na Stripe
# Uso:
#   $env:STRIPE_SECRET_KEY = "sk_test_..."   (depois repita com sk_live_...)
#   powershell -File create-stripe-products.ps1
#
# Idempotente: se ja existir um produto com o mesmo metadata.plan_key, reaproveita.

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$key = $env:STRIPE_SECRET_KEY
if (-not $key) { Write-Host "ERRO: defina STRIPE_SECRET_KEY" -ForegroundColor Red; exit 1 }

$mode = if ($key -like "sk_live_*") { "LIVE" } else { "TEST" }
Write-Host "Criando planos em modo $mode" -ForegroundColor Cyan

$headers = @{ Authorization = "Bearer $key" }

function Post-Stripe($path, $pairs) {
  $body = ($pairs.GetEnumerator() | ForEach-Object {
    "$([uri]::EscapeDataString($_.Key))=$([uri]::EscapeDataString([string]$_.Value))"
  }) -join "&"
  return Invoke-RestMethod -Uri "https://api.stripe.com/v1/$path" -Headers $headers `
                           -Method Post -Body $body `
                           -ContentType "application/x-www-form-urlencoded"
}

# preco em CENTAVOS - a Stripe trabalha na menor unidade da moeda
$plans = @(
  @{ key = "starter"; name = "Vertice Starter"; amount = 9700;  desc = "Ate 5 clientes ativos por mes" },
  @{ key = "pro";     name = "Vertice Pro";     amount = 19700; desc = "Ate 20 clientes ativos por mes" },
  @{ key = "agency";  name = "Vertice Agency";  amount = 39700; desc = "Clientes ilimitados" }
)

$existing = Invoke-RestMethod -Uri "https://api.stripe.com/v1/products?limit=100&active=true" -Headers $headers

$out = @{}

foreach ($p in $plans) {
  $prod = $existing.data | Where-Object { $_.metadata.plan_key -eq $p.key } | Select-Object -First 1

  if ($prod) {
    Write-Host "  produto '$($p.key)' ja existe: $($prod.id)" -ForegroundColor Gray
  } else {
    $prod = Post-Stripe "products" @{
      "name"                = $p.name
      "description"         = $p.desc
      "metadata[plan_key]"  = $p.key
    }
    Write-Host "  produto '$($p.key)' criado: $($prod.id)" -ForegroundColor Green
  }

  # procura um price mensal em BRL com o valor certo
  $prices = Invoke-RestMethod -Uri "https://api.stripe.com/v1/prices?product=$($prod.id)&active=true&limit=100" -Headers $headers
  $price = $prices.data | Where-Object {
    $_.unit_amount -eq $p.amount -and $_.currency -eq "brl" -and $_.recurring.interval -eq "month"
  } | Select-Object -First 1

  if ($price) {
    Write-Host "    price ja existe: $($price.id)" -ForegroundColor Gray
  } else {
    $price = Post-Stripe "prices" @{
      "product"              = $prod.id
      "unit_amount"          = $p.amount
      "currency"             = "brl"
      "recurring[interval]"  = "month"
      "metadata[plan_key]"   = $p.key
    }
    Write-Host "    price criado: $($price.id)  (R$ $($p.amount / 100))" -ForegroundColor Green
  }

  $out[$p.key] = $price.id
}

Write-Host ""
Write-Host "=== COLE ISSO NAS VARIAVEIS DE AMBIENTE ($mode) ===" -ForegroundColor Cyan
Write-Host "STRIPE_PRICE_STARTER=$($out['starter'])"
Write-Host "STRIPE_PRICE_PRO=$($out['pro'])"
Write-Host "STRIPE_PRICE_AGENCY=$($out['agency'])"
Write-Host ""
