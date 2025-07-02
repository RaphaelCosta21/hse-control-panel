# Script para criar colunas necessárias do HSE Control Panel
# Execute este script no SharePoint Online Management Shell

# Conecte-se ao site do SharePoint
# Connect-PnPOnline -Url "https://seusite.sharepoint.com/sites/seusite" -Interactive

# Função para criar colunas com tratamento de erro
function Add-ColumnSafe {
    param($ListName, $ColumnName, $ColumnType, $Choices = $null, $Required = $false)
    
    try {
        Write-Host "Criando coluna: $ColumnName na lista: $ListName" -ForegroundColor Yellow
        
        if ($Choices) {
            Add-PnPField -List $ListName -DisplayName $ColumnName -InternalName $ColumnName -Type $ColumnType -Choices $Choices -Required $Required
        } else {
            Add-PnPField -List $ListName -DisplayName $ColumnName -InternalName $ColumnName -Type $ColumnType -Required $Required
        }
        
        Write-Host "✅ Coluna $ColumnName criada com sucesso!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Erro ao criar coluna $ColumnName : $_" -ForegroundColor Red
    }
}

# Nome da lista principal
$ListName = "hse-new-register"

Write-Host "🚀 Iniciando criação de colunas para o HSE Control Panel..." -ForegroundColor Cyan

# 1. Dados Básicos do Formulário
Add-ColumnSafe -ListName $ListName -ColumnName "CNPJ" -ColumnType "Text" -Required $true
Add-ColumnSafe -ListName $ListName -ColumnName "DadosFormulario" -ColumnType "Note"
Add-ColumnSafe -ListName $ListName -ColumnName "PercentualConclusao" -ColumnType "Number"
Add-ColumnSafe -ListName $ListName -ColumnName "EmailPreenchimento" -ColumnType "Text"
Add-ColumnSafe -ListName $ListName -ColumnName "NomePreenchimento" -ColumnType "Text"
Add-ColumnSafe -ListName $ListName -ColumnName "UltimaModificacao" -ColumnType "DateTime"

# 2. Status e Avaliação
$statusChoices = @("Em Andamento", "Submetido para Avaliação", "Em Análise", "Aprovado", "Rejeitado", "Pendente Informações")
Add-ColumnSafe -ListName $ListName -ColumnName "StatusAvaliacao" -ColumnType "Choice" -Choices $statusChoices -Required $true

$riskChoices = @("1", "2", "3", "4")
Add-ColumnSafe -ListName $ListName -ColumnName "GrauRisco" -ColumnType "Choice" -Choices $riskChoices

$priorityChoices = @("Alta", "Média", "Baixa")
Add-ColumnSafe -ListName $ListName -ColumnName "PrioridadeAvaliacao" -ColumnType "Choice" -Choices $priorityChoices

Add-ColumnSafe -ListName $ListName -ColumnName "DataLimiteResposta" -ColumnType "DateTime"
Add-ColumnSafe -ListName $ListName -ColumnName "DataAvaliacao" -ColumnType "DateTime"
Add-ColumnSafe -ListName $ListName -ColumnName "Avaliador" -ColumnType "User"

# 3. Comentários e Observações
Add-ColumnSafe -ListName $ListName -ColumnName "ComentariosAvaliacao" -ColumnType "Note"
Add-ColumnSafe -ListName $ListName -ColumnName "ObservacoesAvaliacao" -ColumnType "Note"
Add-ColumnSafe -ListName $ListName -ColumnName "QuestoesPendentes" -ColumnType "Note"
Add-ColumnSafe -ListName $ListName -ColumnName "DocumentosPendentes" -ColumnType "Note"

# 4. Anexos e Histórico
Add-ColumnSafe -ListName $ListName -ColumnName "AnexosCount" -ColumnType "Number"
Add-ColumnSafe -ListName $ListName -ColumnName "HistoricoAvaliacoes" -ColumnType "Note"
Add-ColumnSafe -ListName $ListName -ColumnName "NotificacaoEnviada" -ColumnType "Boolean"

Write-Host "✅ Processo de criação de colunas concluído!" -ForegroundColor Green

# SEÇÃO ESPECIAL: Criar e popular lista de configurações HSE Control Panel
Write-Host "`n🔧 Iniciando criação da lista de configurações HSE Control Panel..." -ForegroundColor Cyan

try {
    # Criar lista de configuração
    $configListName = "hse-control-panel-config"
    Write-Host "Criando lista: $configListName" -ForegroundColor Yellow
    
    $configList = New-PnPList -Title $configListName -Template GenericList -ErrorAction SilentlyContinue
    
    if ($configList) {
        Write-Host "✅ Lista $configListName criada!" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Lista $configListName já existe - continuando..." -ForegroundColor Blue
    }
    
    # Adicionar colunas específicas da configuração
    Add-ColumnSafe -ListName $configListName -ColumnName "ConfigKey" -ColumnType "Text" -Required $true
    Add-ColumnSafe -ListName $configListName -ColumnName "ConfigType" -ColumnType "Text" -Required $true
    Add-ColumnSafe -ListName $configListName -ColumnName "ConfigValue" -ColumnType "Note" -Required $true
    
    Write-Host "✅ Colunas da lista de configuração criadas!" -ForegroundColor Green
    
    # Popular com configurações essenciais
    Write-Host "`n📝 Populando lista com configurações essenciais..." -ForegroundColor Yellow
    
    $configurations = @(
        @{
            Title = "Notificar Submissões"
            ConfigKey = "notify_on_submission"
            ConfigType = "NOTIFICATION_CONFIG"
            ConfigValue = "true"
        },
        @{
            Title = "Frequência de Lembrete (dias)"
            ConfigKey = "reminder_frequency_days"
            ConfigType = "NOTIFICATION_CONFIG"
            ConfigValue = "7"
        },
        @{
            Title = "Prazo de Avaliação (dias)"
            ConfigKey = "evaluation_deadline_days"
            ConfigType = "DEADLINE_CONFIG"
            ConfigValue = "15"
        },
        @{
            Title = "Template Email - Rejeição"
            ConfigKey = "email_rejection"
            ConfigType = "EMAIL_TEMPLATE"
            ConfigValue = "Prezado fornecedor,`n`nInfelizmente, sua empresa não foi aprovada no processo de avaliação HSE pelos seguintes motivos:`n`n[MOTIVOS_REJEICAO]`n`nVocê pode realizar correções e submeter novamente.`n`nAtenciosamente,`nEquipe HSE"
        },
        @{
            Title = "Template Email - Aprovação"
            ConfigKey = "email_approval"
            ConfigType = "EMAIL_TEMPLATE"
            ConfigValue = "Parabéns!`n`nSua empresa foi aprovada no processo de avaliação HSE.`n`nGrau de Risco Atribuído: [GRAU_RISCO]`nData de Aprovação: [DATA_APROVACAO]`n`nVocê pode agora participar dos processos licitatórios.`n`nAtenciosamente,`nEquipe HSE"
        },
        @{
            Title = "Template Email - Lembrete"
            ConfigKey = "email_reminder"
            ConfigType = "EMAIL_TEMPLATE"
            ConfigValue = "Lembrete Automático`n`nEste é um lembrete sobre seu processo de avaliação HSE:`n`n- Empresa: [EMPRESA]`n- Status: [STATUS]`n- Prazo limite: [PRAZO_LIMITE]`n`nPor favor, complete as informações pendentes.`n`nAtenciosamente,`nSistema HSE"
        },
        @{
            Title = "Template Email - Novo Fornecedor"
            ConfigKey = "email_new_supplier"
            ConfigType = "EMAIL_TEMPLATE"
            ConfigValue = "Bem-vindo ao Processo de Avaliação HSE!`n`nSua empresa foi cadastrada em nosso sistema.`n`nPróximos passos:`n1. Complete o formulário HSE`n2. Anexe os documentos necessários`n3. Aguarde nossa avaliação`n`nPrazo para conclusão: [PRAZO_DIAS] dias`n`nAtenciosamente,`nEquipe HSE"
        }
    )
    
    foreach ($config in $configurations) {
        try {
            # Verificar se já existe
            $existingConfig = Get-PnPListItem -List $configListName -Query "<View><Query><Where><Eq><FieldRef Name='ConfigKey'/><Value Type='Text'>$($config.ConfigKey)</Value></Eq></Where></Query></View>"
            
            if ($existingConfig.Count -eq 0) {
                # Criar nova configuração
                Add-PnPListItem -List $configListName -Values @{
                    "Title" = $config.Title
                    "ConfigKey" = $config.ConfigKey
                    "ConfigType" = $config.ConfigType
                    "ConfigValue" = $config.ConfigValue
                }
                Write-Host "✅ Configuração criada: $($config.Title)" -ForegroundColor Green
            } else {
                Write-Host "ℹ️ Configuração já existe: $($config.Title)" -ForegroundColor Blue
            }
        }
        catch {
            Write-Host "❌ Erro ao criar configuração $($config.Title): $_" -ForegroundColor Red
        }
    }
    
    Write-Host "✅ Configurações essenciais populadas!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erro na seção de configurações: $_" -ForegroundColor Red
}

Write-Host "`n🎉 Script concluído! Verifique o SharePoint para confirmar as colunas criadas." -ForegroundColor Cyan
Write-Host "📋 Total de colunas criadas: 16 na lista principal + lista de configuração com 7 itens essenciais" -ForegroundColor Cyan
Write-Host "🔧 Lista de configuração: hse-control-panel-config" -ForegroundColor Cyan
