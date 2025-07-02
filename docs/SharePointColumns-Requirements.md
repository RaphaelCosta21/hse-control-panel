# COLUNAS DO SHAREPOINT - HSE CONTROL PANEL

## 📋 RESUMO EXECUTIVO

O HSE Control Panel utiliza as mesmas listas do HSE Supplier Register, mas requer **16 colunas adicionais** para funcionar corretamente. Este documento lista todas as colunas necessárias e fornece um script PowerShell para criação automática.

## 🎯 LISTA PRINCIPAL: `hse-new-register`

### ✅ COLUNAS JÁ EXISTENTES

Estas colunas já devem existir do HSE Supplier Register:

- `Id` - Número (campo padrão do SharePoint)
- `Title` - Texto simples (nome da empresa)
- `Created` - Data e hora (campo padrão do SharePoint)
- `Modified` - Data e hora (campo padrão do SharePoint)

### 🆕 COLUNAS QUE DEVEM SER CRIADAS

#### **1. Dados Básicos do Formulário**

| Coluna                | Tipo             | Obrigatório | Descrição                              |
| --------------------- | ---------------- | ----------- | -------------------------------------- |
| `CNPJ`                | Texto simples    | ✅          | CNPJ da empresa (14 caracteres)        |
| `DadosFormulario`     | Múltiplas linhas | ❌          | JSON com dados completos do formulário |
| `PercentualConclusao` | Número           | ❌          | Percentual de conclusão (0-100)        |
| `EmailPreenchimento`  | Texto simples    | ❌          | Email de quem preencheu                |
| `NomePreenchimento`   | Texto simples    | ❌          | Nome de quem preencheu                 |
| `UltimaModificacao`   | Data e hora      | ❌          | Data da última modificação manual      |

#### **2. Status e Avaliação**

| Coluna                | Tipo            | Valores Permitidos                                                                            | Descrição                          |
| --------------------- | --------------- | --------------------------------------------------------------------------------------------- | ---------------------------------- |
| `StatusAvaliacao`     | Escolha         | Em Andamento, Submetido para Avaliação, Em Análise, Aprovado, Rejeitado, Pendente Informações | Status atual da avaliação          |
| `GrauRisco`           | Escolha         | 1, 2, 3, 4                                                                                    | Grau de risco calculado            |
| `PrioridadeAvaliacao` | Escolha         | Alta, Média, Baixa                                                                            | Prioridade para avaliação          |
| `DataLimiteResposta`  | Data e hora     | -                                                                                             | Prazo limite para resposta         |
| `DataAvaliacao`       | Data e hora     | -                                                                                             | Data da última avaliação           |
| `Avaliador`           | Pessoa ou grupo | -                                                                                             | Usuário responsável pela avaliação |

#### **3. Comentários e Observações**

| Coluna                 | Tipo             | Descrição                     |
| ---------------------- | ---------------- | ----------------------------- |
| `ComentariosAvaliacao` | Múltiplas linhas | Comentários do avaliador      |
| `ObservacoesAvaliacao` | Múltiplas linhas | Observações gerais            |
| `QuestoesPendentes`    | Múltiplas linhas | Lista de questões pendentes   |
| `DocumentosPendentes`  | Múltiplas linhas | Lista de documentos pendentes |

#### **4. Anexos e Histórico**

| Coluna                | Tipo             | Descrição                        |
| --------------------- | ---------------- | -------------------------------- |
| `AnexosCount`         | Número           | Quantidade de anexos             |
| `HistoricoAvaliacoes` | Múltiplas linhas | JSON com histórico de avaliações |
| `NotificacaoEnviada`  | Sim/Não          | Se a notificação foi enviada     |

## 🎯 OUTRAS LISTAS NECESSÁRIAS

### 📚 BIBLIOTECA: `anexos-contratadas`

**Status:** ✅ JÁ EXISTE (do HSE Supplier Register)

- Usada para armazenar anexos dos formulários HSE

### ⚙️ LISTA: `hse-control-panel-config`

**Status:** 🆕 CRIAR NOVA LISTA

| Coluna        | Tipo             | Obrigatório | Descrição                    |
| ------------- | ---------------- | ----------- | ---------------------------- |
| `Id`          | Número           | ✅          | Campo padrão                 |
| `Title`       | Texto simples    | ✅          | Nome da configuração         |
| `ConfigType`  | Texto simples    | ✅          | Tipo de configuração         |
| `ConfigValue` | Múltiplas linhas | ❌          | Valor da configuração (JSON) |
| `Created`     | Data e hora      | ✅          | Campo padrão                 |
| `Modified`    | Data e hora      | ✅          | Campo padrão                 |

## 🔧 COMO IMPLEMENTAR

### Opção 1: Script PowerShell (Recomendado)

1. Execute o script `CreateSharePointColumns.ps1` fornecido
2. O script criará todas as colunas automaticamente
3. Verifique o log para confirmar a criação

### Opção 2: Criação Manual

1. Acesse a lista `hse-new-register` no SharePoint
2. Vá em "Configurações da Lista" > "Criar Coluna"
3. Crie cada coluna conforme a tabela acima
4. Crie a nova lista `hse-control-panel-config`

## ⚠️ PONTOS DE ATENÇÃO

1. **Não modifique colunas existentes** do HSE Supplier Register
2. **Teste em ambiente de desenvolvimento** primeiro
3. **Faça backup** antes de executar o script
4. **Verifique permissões** para criar colunas e listas
5. **Configure valores padrão** conforme necessário

## 🔍 VALIDAÇÃO PÓS-CRIAÇÃO

Após criar as colunas, verifique:

- [ ] Todas as 16 colunas foram criadas na lista `hse-new-register`
- [ ] A lista `hse-control-panel-config` foi criada
- [ ] Não há erros de compilação no HSE Control Panel
- [ ] O dashboard carrega corretamente
- [ ] Os formulários podem ser visualizados

## 📞 SUPORTE

Se encontrar problemas:

1. Verifique o log do script PowerShell
2. Confirme permissões de administrador no SharePoint
3. Teste criar uma coluna manualmente primeiro
4. Verifique se a lista `hse-new-register` existe

---

**Última atualização:** $(Get-Date)
**Versão do HSE Control Panel:** 1.0.0
