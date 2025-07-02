# Tela de Configurações - HSE Control Panel

## 📋 Resumo da Implementação

A tela de configurações foi implementada com sucesso no HSE Control Panel, permitindo a gestão das 7 configurações essenciais do sistema através de uma interface amigável e intuitiva.

## 🎯 Funcionalidades Implementadas

### 1. **Acesso à Tela de Configurações**

- Botão "Configurações" disponível no painel de "Ações Rápidas" do Dashboard
- Navegação direta através da aba "⚙️ Configurações" no menu principal
- Botão "Voltar" para retornar ao Dashboard

### 2. **Interface de Configuração**

- **Design Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Agrupamento por Tipo**: Configurações organizadas em seções lógicas
- **Validação de Dados**: Campos obrigatórios e validação de valores
- **Feedback Visual**: Mensagens de sucesso/erro e indicadores de carregamento

### 3. **Configurações Gerenciadas**

#### 🔔 **Configurações de Notificação**

- `notify_on_submission`: Ativar/desativar notificações para novas submissões
- `reminder_frequency_days`: Frequência de lembretes automáticos (1-30 dias)

#### ⏱️ **Configurações de Prazo**

- `evaluation_deadline_days`: Prazo limite para avaliação HSE (1-90 dias)

#### 📧 **Templates de Email**

- `email_rejection`: Modelo de email para fornecedores rejeitados
- `email_approval`: Modelo de email para fornecedores aprovados
- `email_reminder`: Modelo de email para lembretes automáticos
- `email_new_supplier`: Modelo de email de boas-vindas

## 🗂️ Estrutura de Arquivos Criados

```
src/webparts/hseControlPanel/
├── components/
│   └── settings/
│       ├── SettingsPage.tsx          # Componente principal da tela
│       ├── SettingsPage.module.scss  # Estilos específicos
│       └── index.ts                  # Exportações
├── services/
│   └── ConfigurationService.ts      # Serviço para operações com SharePoint
├── types/
│   └── IConfigurationData.ts        # Interfaces e tipos TypeScript
└── config/
    └── sharePointConfig.ts           # Configuração atualizada com nova lista
```

## 🔧 Configuração do SharePoint

### Lista: `hse-control-panel-config`

**Colunas criadas:**

- `Title` (Texto): Nome amigável da configuração
- `ConfigKey` (Texto): Chave única da configuração
- `ConfigType` (Texto): Tipo da configuração (EMAIL_TEMPLATE, NOTIFICATION_CONFIG, DEADLINE_CONFIG)
- `ConfigValue` (Texto Longo): Valor da configuração

### Script PowerShell Atualizado

O arquivo `scripts/CreateSharePointColumns.ps1` foi atualizado para:

- ✅ Criar a lista `hse-control-panel-config`
- ✅ Adicionar todas as colunas necessárias
- ✅ Popular com as 7 configurações essenciais e valores padrão

## 🚀 Como Utilizar

### 1. **Executar o Script PowerShell**

```powershell
# No SharePoint Online Management Shell
Connect-PnPOnline -Url "https://seusite.sharepoint.com/sites/seusite" -Interactive
.\scripts\CreateSharePointColumns.ps1
```

### 2. **Acessar a Tela de Configurações**

1. Abra o HSE Control Panel
2. No Dashboard, clique em "Configurações" nas Ações Rápidas
3. OU clique na aba "⚙️ Configurações" no menu superior

### 3. **Editar Configurações**

1. Modifique os valores desejados nos campos
2. O sistema detectará automaticamente as alterações
3. Clique em "Salvar Configurações" para aplicar
4. Use "Resetar" para desfazer alterações não salvas

## 🔄 Fluxo de Operação

### Carregamento Inicial

1. **Leitura**: Busca configurações existentes na lista SharePoint
2. **Processamento**: Converte dados brutos para formato do formulário
3. **Preenchimento**: Popula campos com valores padrão se não existirem

### Salvamento de Configurações

1. **Validação**: Verifica campos obrigatórios e formatos
2. **Conversão**: Transforma valores do formulário para string (SharePoint)
3. **Persistência**: Atualiza itens existentes ou cria novos
4. **Feedback**: Exibe mensagem de sucesso/erro

### Estratégia de Atualização

- **Sobrescrever**: Ao invés de criar novos itens, atualiza os existentes
- **Busca por Chave**: Usa `ConfigKey` para localizar configurações específicas
- **Upsert**: Cria novo item apenas se não existir

## 🎨 Design e UX

### Características da Interface

- **Agrupamento Visual**: Configurações organizadas por tipo com ícones
- **Campos Inteligentes**: Tipo apropriado para cada configuração (toggle, number, textarea)
- **Descrições Contextuais**: Texto explicativo para cada configuração
- **Estados Visuais**: Loading, erro, sucesso claramente indicados

### Responsividade

- **Desktop**: Layout em coluna única com campos espaçados
- **Mobile**: Campos compactados mantendo usabilidade
- **Tema**: Suporte a tema claro/escuro

## 🔍 Validações Implementadas

### Por Tipo de Campo

- **Boolean**: Toggle simples (Ativado/Desativado)
- **Number**: Validação de range (min/max) e tipo numérico
- **Textarea**: Campos de texto longo para templates de email
- **Required**: Campos obrigatórios claramente marcados

### Específicas por Configuração

- `reminder_frequency_days`: 1-30 dias
- `evaluation_deadline_days`: 1-90 dias
- Templates de email: Texto obrigatório

## 🛠️ Tecnologias Utilizadas

- **React**: Componente de classe com estado local
- **Fluent UI**: Componentes padronizados Microsoft
- **PnP/SP**: Comunicação com SharePoint Online
- **TypeScript**: Tipagem forte e interfaces bem definidas
- **SCSS Modules**: Estilos modulares e isolados

## 🎯 Próximos Passos Opcionais

1. **Histórico de Alterações**: Registrar quem/quando modificou configurações
2. **Validação Avançada**: Regex para templates de email e outros formatos
3. **Preview de Templates**: Visualizar como emails ficarão antes de salvar
4. **Backup/Restore**: Exportar/importar configurações
5. **Permissões**: Controlar quem pode editar configurações

## 📞 Suporte

Para dúvidas sobre a implementação:

- Consulte este README
- Verifique os comentários no código TypeScript
- Execute o script PowerShell para configurar o SharePoint
- Teste a funcionalidade no ambiente de desenvolvimento

---

**Status**: ✅ **Implementação Completa e Funcional**  
**Versão**: 1.0  
**Data**: Janeiro 2025
