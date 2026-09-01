# check-stripe.ps1 - diagnostico da conta Stripe antes de migrar o Vertice
# Uso:
#   $env:STRIPE_SECRET_KEY = "sk_test_..."   (ou sk_live_...)
#   powershell -File check-stripe.ps1
#
# Nao imprime a chave. Nao cria nem altera nada na conta (so faz GET).

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$key = $env:STRIPE_SECRET_KEY
if (-not $key) {
  Write-Host "ERRO: defina a variavel primeiro:" -ForegroundColor Red
  Write-Host '  $env:STRIPE_SECRET_KEY = "sk_test_..."'
  exit 1
}

$mode = if ($key -like "sk_live_*") { "LIVE (dinheiro de verdade)" } else { "TEST (sandbox)" }

try {
  $acc = Invoke-RestMethod -Uri "https://api.stripe.com/v1/account" `
                           -Headers @{ Authorization = "Bearer $key" } `
                           -Method Get
} catch {
  Write-Host "ERRO ao falar com a Stripe: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Chave invalida, revogada, ou sem rede."
  exit 1
}

function Row($label, $value, $ok) {
  $color = if ($ok -eq $true) { "Green" } elseif ($ok -eq $false) { "Red" } else { "Gray" }
  Write-Host ("  {0,-28} " -f $label) -NoNewline
  Write-Host $value -ForegroundColor $color
}

Write-Host ""
Write-Host "=== CONTA STRIPE ===" -ForegroundColor Cyan
Row "Modo da chave"      $mode                    $null
Row "Account ID"         $acc.id                  $null
Row "Nome"               $acc.business_profile.name $null
Row "Tipo"               $acc.business_type       $null

Write-Host ""
Write-Host "=== A PERGUNTA QUE DECIDE ===" -ForegroundColor Cyan
$isBR = ($acc.country -eq "BR")
Row "Pais da entidade"   $acc.country             $isBR
Row "Moeda padrao"       $acc.default_currency.ToUpper() ($acc.default_currency -eq "brl")

Write-Host ""
Write-Host "=== A CONTA CONSEGUE OPERAR? ===" -ForegroundColor Cyan
Row "Aceita cobranca"    $acc.charges_enabled     ([bool]$acc.charges_enabled)
Row "Aceita saque"       $acc.payouts_enabled     ([bool]$acc.payouts_enabled)
Row "Cadastro completo"  $acc.details_submitted   ([bool]$acc.details_submitted)

if ($acc.requirements.currently_due -and $acc.requirements.currently_due.Count -gt 0) {
  Write-Host ""
  Write-Host "  PENDENCIAS que a Stripe ainda exige:" -ForegroundColor Yellow
  $acc.requirements.currently_due | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
}

Write-Host ""
Write-Host "=== TRILHOS DE PAGAMENTO ===" -ForegroundColor Cyan
if ($acc.capabilities) {
  foreach ($cap in @("card_payments","pix_payments","boleto_payments","transfers")) {
    $v = $acc.capabilities.$cap
    if (-not $v) { $v = "nao habilitado" }
    Row $cap $v ($v -eq "active")
  }
} else {
  Write-Host "  (a API nao retornou 'capabilities' para esta chave -" -ForegroundColor Gray
  Write-Host "   confira em dashboard.stripe.com/settings/payment_methods)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== VEREDITO ===" -ForegroundColor Cyan
if ($isBR -and $acc.charges_enabled) {
  Write-Host "  OK - conta brasileira e operante. Pode ir de Stripe." -ForegroundColor Green
  Write-Host "  Cartao brasileiro processa como domestico: sem IOF pro cliente."
} elseif ($isBR) {
  Write-Host "  ATENCAO - e brasileira, mas ainda nao pode cobrar." -ForegroundColor Yellow
  Write-Host "  Resolva as pendencias acima antes de criar os produtos."
} else {
  Write-Host "  CUIDADO - a conta e de '$($acc.country)', nao do Brasil." -ForegroundColor Red
  Write-Host "  Cobranca em cartao BR vira transacao internacional:"
  Write-Host "    - o cliente leva IOF na fatura"
  Write-Host "    - a taxa de aprovacao cai"
  Write-Host "  O pais da conta NAO pode ser alterado depois."
  Write-Host "  Opcoes: abrir conta Stripe BR, ou ficar no Mercado Pago."
}
Write-Host ""
