# Configuração de Colunas SharePoint - HSE Control Panel

## Lista Principal: "hse-new-register"

### Colunas Existentes (Herdadas do HSE Supplier Register)

| Coluna              | Tipo   | Descrição                      | Obrigatório |
| ------------------- | ------ | ------------------------------ | ----------- |
| Id                  | Number | Identificador único automático | Sim         |
| Title               | Text   | Nome da empresa contratada     | Sim         |
| CNPJ                | Text   | CNPJ da empresa                | Sim         |
| StatusAvaliacao     | Choice | Status da avaliação            | Sim         |
| GrauRisco           | Choice | Grau de risco calculado        | Sim         |
| PercentualConclusao | Number | % de conclusão (0-100)         | Sim         |
| EmailPreenchimento  | Text   | Email do responsável           | Não         |
| NomePreenchimento   | Text   | Nome do responsável técnico    | Não         |
| AnexosCount         | Number | Contador de anexos             | Não         |
| DadosFormulario     | Note   | JSON com dados do formulário   | Não         |

### Novas Colunas para HSE Control Panel

#### 1. **PrioridadeAvaliacao** (Choice)

- **Finalidade**: Define a prioridade de avaliação do formulário
- **Valores**: Baixa, Normal, Alta, Urgente
- **Uso**: Permite ao painel priorizar avaliações baseado em critérios de negócio
- **Automação**: Calculado automaticamente baseado no grau de risco e data de submissão

#### 2. **DataLimiteResposta** (DateTime)

- **Finalidade**: Data limite para resposta da avaliação
- **Uso**: Controle de SLA e alertas de prazo
- **Automação**: Calculado baseado na data de submissão + dias úteis (configurável)

#### 3. **DataSubmissao** (DateTime)

- **Finalidade**: Data/hora da submissão para avaliação
- **Uso**: Tracking de timeline e cálculo de SLA
- **Automação**: Preenchido automaticamente quando status muda para "Submetido para Avaliação"

#### 4. **AvaliadorResponsavel** (Person)

- **Finalidade**: Usuário responsável pela avaliação
- **Uso**: Atribuição de responsabilidade e notificações
- **Automação**: Pode ser atribuído automaticamente baseado em regras de distribuição

#### 5. **NotasAvaliacao** (Note)

- **Finalidade**: Notas e comentários do avaliador
- **Uso**: Feedback detalhado para a empresa
- **Automação**: Preenchido manualmente pelo avaliador

#### 6. **HistoricoStatus** (Note)

- **Finalidade**: Log de mudanças de status com timestamps
- **Uso**: Auditoria e tracking de mudanças
- **Automação**: Atualizado automaticamente a cada mudança de status

#### 7. **ScoreAvaliacao** (Number)

- **Finalidade**: Score numérico da avaliação (0-100)
- **Uso**: Ranking e comparação de empresas
- **Automação**: Calculado baseado nos critérios de avaliação

#### 8. **DataAprovacao** (DateTime)

- **Finalidade**: Data de aprovação final
- **Uso**: Controle de validade e renovação
- **Automação**: Preenchido quando status muda para "Aprovado"

#### 9. **ValidadeAvaliacao** (DateTime)

- **Finalidade**: Data de expiração da avaliação
- **Uso**: Controle de renovação automática
- **Automação**: Calculado como DataAprovacao + período de validade

#### 10. **TipoEmpresa** (Choice)

- **Finalidade**: Classificação do tipo de empresa
- **Valores**: Contratada, Subcontratada, Terceirizada, Prestadora de Serviço
- **Uso**: Filtros específicos e regras diferenciadas

#### 11. **AreaAtuacao** (Choice)

- **Finalidade**: Área principal de atuação da empresa
- **Valores**: Construção Civil, Montagem Industrial, Serviços Gerais, Transporte, etc.
- **Uso**: Categorização e filtros específicos

#### 12. **NumeroContrato** (Text)

- **Finalidade**: Número do contrato principal
- **Uso**: Referência contratual e integração com outros sistemas

#### 13. **EmailNotificacao** (Text)

- **Finalidade**: Email para notificações automáticas
- **Uso**: Sistema de notificações e alertas
- **Automação**: Pode ser diferente do email de preenchimento

#### 14. **StatusIntegracao** (Choice)

- **Finalidade**: Status de integração com outros sistemas
- **Valores**: Pendente, Integrado, Erro, Não Aplicável
- **Uso**: Controle de sincronização com sistemas externos

#### 15. **UltimaVisualizacao** (DateTime)

- **Finalidade**: Última vez que o formulário foi visualizado no Control Panel
- **Uso**: Tracking de atividade e engajamento

## Script PowerShell para Criação das Colunas

```powershell
# Conectar ao SharePoint Online
Connect-PnPOnline -Url "https://yourtenant.sharepoint.com/sites/yoursite" -Interactive

$listName = "hse-new-register"

# Criar colunas Choice
Add-PnPField -List $listName -DisplayName "PrioridadeAvaliacao" -InternalName "PrioridadeAvaliacao" -Type Choice -Choices @("Baixa","Normal","Alta","Urgente") -DefaultValue "Normal"

Add-PnPField -List $listName -DisplayName "TipoEmpresa" -InternalName "TipoEmpresa" -Type Choice -Choices @("Contratada","Subcontratada","Terceirizada","Prestadora de Serviço")

Add-PnPField -List $listName -DisplayName "AreaAtuacao" -InternalName "AreaAtuacao" -Type Choice -Choices @("Construção Civil","Montagem Industrial","Serviços Gerais","Transporte","Consultoria","Outros")

Add-PnPField -List $listName -DisplayName "StatusIntegracao" -InternalName "StatusIntegracao" -Type Choice -Choices @("Pendente","Integrado","Erro","Não Aplicável") -DefaultValue "Pendente"

# Criar colunas DateTime
Add-PnPField -List $listName -DisplayName "DataLimiteResposta" -InternalName "DataLimiteResposta" -Type DateTime

Add-PnPField -List $listName -DisplayName "DataSubmissao" -InternalName "DataSubmissao" -Type DateTime

Add-PnPField -List $listName -DisplayName "DataAprovacao" -InternalName "DataAprovacao" -Type DateTime

Add-PnPField -List $listName -DisplayName "ValidadeAvaliacao" -InternalName "ValidadeAvaliacao" -Type DateTime

Add-PnPField -List $listName -DisplayName "UltimaVisualizacao" -InternalName "UltimaVisualizacao" -Type DateTime

# Criar colunas Person
Add-PnPField -List $listName -DisplayName "AvaliadorResponsavel" -InternalName "AvaliadorResponsavel" -Type User

# Criar colunas Text
Add-PnPField -List $listName -DisplayName "NumeroContrato" -InternalName "NumeroContrato" -Type Text

Add-PnPField -List $listName -DisplayName "EmailNotificacao" -InternalName "EmailNotificacao" -Type Text

# Criar colunas Note
Add-PnPField -List $listName -DisplayName "NotasAvaliacao" -InternalName "NotasAvaliacao" -Type Note

Add-PnPField -List $listName -DisplayName "HistoricoStatus" -InternalName "HistoricoStatus" -Type Note

# Criar coluna Number
Add-PnPField -List $listName -DisplayName "ScoreAvaliacao" -InternalName "ScoreAvaliacao" -Type Number -Min 0 -Max 100

Write-Host "Colunas criadas com sucesso na lista $listName"
```

## Integração no Código

As novas colunas serão utilizadas nos seguintes componentes:

1. **Dashboard**: Métricas por prioridade e SLA
2. **FormsTable**: Filtros por área de atuação e tipo de empresa
3. **FormEvaluation**: Score e notas de avaliação
4. **Notifications**: Sistema de alertas baseado em prazos
5. **Reports**: Relatórios por área, tipo e performance

## Benefícios das Novas Colunas

- **Melhor Controle de SLA**: DataLimiteResposta + PrioridadeAvaliacao
- **Auditoria Completa**: HistoricoStatus + UltimaVisualizacao
- **Gestão de Responsabilidades**: AvaliadorResponsavel
- **Categorização Avançada**: TipoEmpresa + AreaAtuacao
- **Integração com Sistemas**: StatusIntegracao + NumeroContrato
- **Scoring e Ranking**: ScoreAvaliacao para comparações
