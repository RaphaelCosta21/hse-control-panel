# HSE Control Panel - Documentação Completa do Projeto

**Data de Análise:** 13 de Agosto de 2025  
**Versão Atual:** 1.0.0  
**Tipo:** SharePoint Framework (SPFx) WebPart

## 📋 Visão Geral

O **HSE Control Panel** é uma solução SPFx que fornece uma interface administrativa para o time interno HSE gerenciar, avaliar e aprovar submissões de fornecedores no sistema HSE. O projeto atua como complemento ao HSE Supplier Register, oferecendo ferramentas de gestão e controle.

## 🏗️ Arquitetura Atual

### Tecnologias Base

- **SPFx Framework:** 1.20.0
- **React:** 17.0.1
- **TypeScript:** 4.7.4
- **Fluent UI:** 8.123.0 + 9.64.0 (híbrido)
- **PnPjs:** 4.13.0
- **Node.js:** >=18.17.1 <19.0.0

### Estrutura Principal

```
src/webparts/hseControlPanel/
├── HseControlPanelWebPart.ts          # WebPart principal
├── components/                        # Componentes React
│   ├── HseControlPanel.tsx           # Componente raiz
│   ├── dashboard/                    # Dashboard e métricas
│   ├── forms/                        # Gestão de formulários
│   ├── invites/                      # Sistema de convites
│   ├── settings/                     # Configurações
│   ├── filters/                      # Filtros e busca
│   └── ui/                          # Componentes UI reutilizáveis
├── services/                         # Serviços e APIs
├── types/                           # Interfaces TypeScript
├── hooks/                           # React Hooks customizados
├── utils/                           # Utilitários e helpers
├── styles/                          # Sistema de design
├── config/                          # Configurações
└── loc/                            # Localização
```

## 🎯 Funcionalidades Implementadas

### 1. Dashboard Principal

**Localização:** `src/components/dashboard/Dashboard.tsx`

**Características:**

- Métricas em tempo real de formulários HSE
- Cards com estatísticas: Total, Pendentes, Aprovados, Rejeitados
- Feed de atividades recentes
- Gráficos de status (usando Recharts)
- Ações rápidas (convites, relatórios, configurações)
- Design responsivo com microinterações

**Métricas Exibidas:**

```typescript
interface IDashboardMetrics {
  totalSubmissions: number; // Total de submissões
  pendingReview: number; // Pendentes de análise
  approved: number; // Aprovados
  rejected: number; // Rejeitados
  averageReviewTime: number; // Tempo médio de análise (dias)
  recentActivity: IActivityItem[]; // Atividades recentes
}
```

### 2. Gestão de Formulários

**Localização:** `src/components/forms/`

**Componentes Principais:**

- `FormsList.tsx` - Lista principal de formulários
- `FormsTable/` - Tabela responsiva com filtros
- `FormViewerModal/` - Modal para visualização detalhada
- `FormEvaluation/` - Interface de avaliação
- `HSEFormViewer/` - Visualizador de dados do formulário

**Funcionalidades:**

- Listagem de todos os formulários submetidos
- Filtros avançados (status, risco, data, empresa)
- Busca por CNPJ e nome da empresa
- Visualização detalhada dos dados
- Interface de avaliação (aprovação/rejeição)
- Histórico de mudanças

### 3. Sistema de Convites

**Localização:** `src/components/invites/InviteModal.tsx`

**Características:**

- Modal para envio de convites
- Validação de email
- Verificação de convites duplicados (7 dias)
- Histórico de convites enviados
- Integração com Power Automate para envio de emails
- Lista SharePoint: `hse-control-panel-invites`

### 4. Configurações do Sistema

**Localização:** `src/components/settings/SettingsPage.tsx`

**Configurações Disponíveis:**

- Templates de email (aprovação, rejeição, lembrete)
- Frequência de lembretes (dias)
- Prazo de avaliação (dias)
- Notificações automáticas
- Configurações de UI

**Lista SharePoint:** `hse-control-panel-config`

### 5. Sistema de Filtros

**Localização:** `src/components/filters/`

**Filtros Implementados:**

```typescript
interface IFormsFilters {
  status?: string; // Status do formulário
  grauRisco?: string; // Grau de risco (1-4)
  dataInicio?: Date; // Data início
  dataFim?: Date; // Data fim
  empresa?: string; // Nome da empresa
  avaliador?: string; // Avaliador responsável
  prioridade?: string; // Prioridade da avaliação
  cnpj?: string; // CNPJ
}
```

## 🔧 Serviços e APIs

### 1. SharePointService

**Arquivo:** `src/services/SharePointService.ts`

**Responsabilidades:**

- Conexão com listas SharePoint via PnPjs
- Operações CRUD em formulários HSE
- Gerenciamento de anexos
- Estatísticas e métricas

**Métodos Principais:**

```typescript
- saveFormData(formData, attachments): Promise<number>
- getFormsList(): Promise<any[]>
- getFormDetails(formId): Promise<FormDetails>
- getFormsStatistics(): Promise<Statistics>
```

### 2. InviteService

**Arquivo:** `src/services/InviteService.ts`

**Responsabilidades:**

- Criação de convites para fornecedores
- Verificação de duplicatas
- Histórico de convites
- Integração com Power Automate

### 3. ConfigurationService

**Arquivo:** `src/services/ConfigurationService.ts`

**Responsabilidades:**

- Gerenciamento de configurações do sistema
- Templates de email
- Parâmetros de notificação
- Configurações de UI

### 4. HSEFormService

**Arquivo:** `src/services/HSEFormService.ts`

**Status:** Parcialmente implementado (TODOs presentes)
**Propósito:** Lógica de negócio específica para formulários HSE

## 📊 Integração com SharePoint

### Listas Utilizadas

#### 1. Lista Principal: "hse-new-register"

**Reutilizada do HSE Supplier Register**

```typescript
interface ISharePointFormItem {
  Id: number;
  Title: string; // Nome da empresa
  CNPJ: string;
  StatusAvaliacao: string; // Status da avaliação
  GrauRisco: "1" | "2" | "3" | "4";
  PercentualConclusao: number;
  DadosFormulario: string; // JSON com dados completos
  EmailPreenchimento: string;
  NomePreenchimento: string;
  AnexosCount: number;
  DataAvaliacao?: string;
  Avaliador?: string;
  ComentariosAvaliacao?: string;
}
```

#### 2. Biblioteca: "anexos-contratadas"

**Reutilizada do HSE Supplier Register**

- Armazenamento de documentos e anexos
- Metadados de arquivos
- Controle de versão

#### 3. Lista de Convites: "hse-control-panel-invites"

```typescript
interface IInviteItem {
  Title: string;
  FornecedorEmail: string;
  ConvidadoPor: string;
  DataEnvio: string;
}
```

#### 4. Lista de Configurações: "hse-control-panel-config"

```typescript
interface IConfigurationItem {
  Title: string;
  ConfigKey: string;
  ConfigType: ConfigType;
  ConfigValue: string;
}
```

## 🎨 Sistema de Design

### Arquivo Principal: `src/styles/modern-design-system.scss`

**Características:**

- Design system baseado em CSS Custom Properties
- Cores semânticas para status de formulários
- Palette de cores para níveis de risco
- Tipografia consistente (Segoe UI)
- Sistema de espaçamento padronizado
- Sombras e bordas consistentes

**Cores de Status:**

```scss
--status-draft: #8764b8; // Rascunho
--status-submitted: #0078d4; // Enviado
--status-under-review: #ff8c00; // Em análise
--status-approved: #107c10; // Aprovado
--status-rejected: #d13438; // Rejeitado
--status-pending-info: #8764b8; // Pendente informações
```

**Níveis de Risco:**

```scss
--risk-level-1: #107c10; // Verde - Baixo
--risk-level-2: #ffaa44; // Amarelo - Médio
--risk-level-3: #ff8c00; // Laranja - Alto
--risk-level-4: #d13438; // Vermelho - Muito Alto
```

## 🔗 Componentes UI Reutilizáveis

### 1. StatusBadge

**Arquivo:** `src/components/ui/StatusBadge/`

- Badges visuais para status de formulários
- Ícones consistentes para cada status
- Cores semânticas

### 2. RiskBadge

**Arquivo:** `src/components/ui/RiskBadge/`

- Indicadores visuais de nível de risco
- Cores graduais baseadas no risco

### 3. MetricCard

**Arquivo:** `src/components/ui/MetricCard/`

- Cards para métricas do dashboard
- Suporte a ícones e trends
- Animações de hover

### 4. FilterPanel

**Arquivo:** `src/components/ui/FilterPanel/`

- Painel expansível de filtros
- Integração com React Hook Form

## 🎣 React Hooks Customizados

### 1. useHSEForm

**Arquivo:** `src/hooks/useHSEForm.ts`
**Status:** Implementado com dados mock

```typescript
interface IHSEFormHookData {
  formData: IHSEFormData | null;
  attachments: { [category: string]: IAttachmentMetadata[] };
  loading: boolean;
  error: string | null;
  saving: boolean;
  loadForm: (formId: number) => Promise<void>;
  saveForm: (data, attachments) => Promise<number>;
  submitForm: (data, attachments) => Promise<number>;
  clearForm: () => void;
}
```

### 2. useDashboardData

**Arquivo:** `src/hooks/useDashboardData.ts`
**Propósito:** Gerenciamento de dados do dashboard

### 3. useFormEvaluation

**Arquivo:** `src/hooks/useFormEvaluation.ts`
**Propósito:** Lógica de avaliação de formulários

### 4. useFilters

**Arquivo:** `src/hooks/useFilters.ts`
**Propósito:** Gerenciamento de estado dos filtros

## 🛠️ Utilitários e Helpers

### 1. Constants

**Arquivo:** `src/utils/constants.ts`

```typescript
const FORM_STATUS = {
  EM_ANDAMENTO: "Em Andamento",
  ENVIADO: "Enviado",
  EM_ANALISE: "Em Análise",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
  PENDENTE_INFORMACOES: "Pendente Informações",
};

const RISK_LEVELS = {
  NIVEL_1: "1",
  NIVEL_2: "2",
  NIVEL_3: "3",
  NIVEL_4: "4",
};
```

### 2. Formatters

**Arquivo:** `src/utils/formatters.ts`
**Funcionalidades:** Formatação de CNPJ, datas, números

### 3. Validators

**Arquivo:** `src/utils/validators.ts`
**Funcionalidades:** Validações de email, CNPJ, campos obrigatórios

## 📱 Interface de Usuário

### Layout Principal

O webpart utiliza um layout de tabs (Pivot) com 4 seções principais:

1. **📊 Dashboard** - Visão geral e métricas
2. **📋 Formulários** - Gestão de submissões
3. **📈 Relatórios** - Em desenvolvimento
4. **⚙️ Configurações** - Configurações do sistema

### Design Responsivo

- Grid system flexível
- Breakpoints para mobile/tablet/desktop
- Componentes que se adaptam ao container

### Microinterações

- Animações de hover nos cards
- Transições suaves entre estados
- Loading states com spinners
- Feedback visual para ações

## 🔄 Estado Atual de Implementação

### ✅ Completamente Implementado

- Dashboard com métricas mock
- Lista de formulários com integração SharePoint
- Sistema de convites funcional
- Configurações básicas
- Sistema de filtros
- Componentes UI reutilizáveis
- Design system completo

### 🚧 Parcialmente Implementado

- HSEFormService (métodos com TODO)
- Visualização detalhada de formulários
- Sistema de avaliação/aprovação
- Histórico de mudanças

### ❌ Não Implementado

- Relatórios e exportação
- Integração com Power BI
- Notificações push
- Sistema de workflows avançados

## 📦 Dependências Principais

### Produção

```json
{
  "@fluentui/react": "^8.123.0",
  "@fluentui/react-components": "^9.64.0",
  "@fluentui/react-icons": "^2.0.239",
  "@fluentui/react-charting": "^5.16.36",
  "@pnp/sp": "^4.13.0",
  "@pnp/graph": "^4.13.0",
  "recharts": "^2.8.0",
  "date-fns": "^2.30.0",
  "file-saver": "^2.0.5",
  "xlsx": "^0.18.5"
}
```

### Desenvolvimento

```json
{
  "@microsoft/sp-build-web": "1.20.2",
  "@microsoft/eslint-config-spfx": "1.20.2",
  "typescript": "4.7.4",
  "gulp": "4.0.2"
}
```

## 🗂️ Configuração SharePoint

### Listas Necessárias

1. **hse-new-register** (compartilhada com HSE Supplier Register)
2. **anexos-contratadas** (compartilhada com HSE Supplier Register)
3. **hse-control-panel-invites** (nova)
4. **hse-control-panel-config** (nova)

### Permissões Necessárias

- **Read/Write** nas listas HSE
- **Read/Write** na biblioteca de documentos
- **Create** para novos itens
- **Update** para avaliações

## 🚀 Deploy e Instalação

### Comandos Build

```bash
# Instalar dependências
npm install

# Build desenvolvimento
npm run serve

# Build produção
npm run build

# Empacotar solução
npm run package-solution

# Deploy para SharePoint
npm run deploy
```

### Configuração pós-deploy

1. Criar listas SharePoint necessárias
2. Configurar permissões adequadas
3. Executar script `CreateSharePointColumns.ps1`
4. Configurar Power Automate para convites
5. Configurar templates de email

## 🔍 Pontos de Atenção

### 1. Dados Mock vs. Reais

- Dashboard usa dados simulados
- FormsList integra com SharePoint real
- Mistura pode causar inconsistências

### 2. TODOs no Código

- HSEFormService precisa implementação completa
- Métodos de avaliação não finalizados
- Integração com Power Automate parcial

### 3. Performance

- Sem cache implementado
- Queries SharePoint podem ser lentas
- Falta paginação em algumas listas

### 4. Segurança

- Validações client-side apenas
- Falta verificação de permissões
- Dados sensíveis em logs de console

## 📈 Próximos Passos Recomendados

### Prioridade Alta

1. **Completar HSEFormService** - Implementar métodos TODOs
2. **Sistema de Avaliação** - Finalizar aprovação/rejeição
3. **Cache de Dados** - Implementar para performance
4. **Validações Server-side** - Aumentar segurança

### Prioridade Média

1. **Relatórios** - Implementar visualizações
2. **Exportação** - Excel/PDF dos dados
3. **Notificações** - Push notifications
4. **Audit Trail** - Log completo de ações

### Prioridade Baixa

1. **Testes Unitários** - Coverage do código
2. **Documentação API** - Swagger/OpenAPI
3. **Internacionalização** - Suporte multi-idioma
4. **PWA Features** - Offline support

## 📞 Considerações Técnicas

### Arquitetura

- Estrutura modular bem organizada
- Separação clara de responsabilidades
- Uso apropriado de React Hooks
- Design system consistente

### Qualidade do Código

- TypeScript bem tipado
- Convenções de nomenclatura consistentes
- Estrutura de pastas lógica
- Reutilização de componentes

### Manutenibilidade

- Código bem documentado
- Interfaces claras
- Configurações centralizadas
- Logs para debugging

## 🏁 Conclusão

O HSE Control Panel está em um estágio avançado de desenvolvimento, com uma base sólida e arquitetura bem definida. A maioria das funcionalidades principais está implementada, mas há alguns pontos que precisam ser finalizados para uma implementação em produção completa.

O projeto demonstra boas práticas de desenvolvimento SPFx e React, com um design system moderno e componentes reutilizáveis. A integração com SharePoint está funcional, embora alguns serviços precisem ser completados.

---

**Última atualização:** 13 de Agosto de 2025  
**Próxima revisão:** Após implementação dos TODOs críticos
