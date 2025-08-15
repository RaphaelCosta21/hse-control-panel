# 📋 Formulário HSE - Auto-avaliação de HSE para Contratadas

## 📖 Documentação Completa dos Campos

---

## 🏢 **ABA 1: DADOS GERAIS**

_Seção A - Informações e Dados Gerais da Contratada_

### 📝 **Campos Obrigatórios (\*)**

| Campo                             | Tipo     | Descrição                                 | Observações                                    |
| --------------------------------- | -------- | ----------------------------------------- | ---------------------------------------------- |
| **Nome da Empresa\***             | Texto    | Razão Social da empresa                   | Preenchimento livre                            |
| **CNPJ\***                        | Texto    | CNPJ da empresa                           | Formato: 00.000.000/0000-00 (desabilitado)     |
| **Número do Contrato\***          | Texto    | Número do contrato com a Oceaneering      | Preenchimento livre                            |
| **Data de Início do Contrato\***  | Data     | Data de início do contrato                | Seleção via calendário                         |
| **Data de Término do Contrato\*** | Data     | Data de término do contrato               | Seleção via calendário                         |
| **Responsável Técnico\***         | Texto    | Nome completo do responsável técnico      | Preenchimento livre                            |
| **Atividade Principal (CNAE)\***  | Texto    | Código CNAE da atividade principal        | Preenchimento livre                            |
| **Grau de Risco (NR-4)\***        | Dropdown | Grau de risco conforme NR-4               | Opções: 1-Baixo, 2-Médio, 3-Alto, 4-Muito Alto |
| **Gerente do Contrato Marine\***  | Texto    | Nome do gerente responsável pelo contrato | Preenchimento livre                            |

### 📊 **Campos Opcionais**

| Campo                            | Tipo              | Descrição                                  | Observações      |
| -------------------------------- | ----------------- | ------------------------------------------ | ---------------- |
| **Escopo do Serviço**            | Texto Multi-linha | Descrição detalhada do escopo dos serviços | 3 linhas         |
| **Total de Empregados**          | Número            | Número total de empregados da empresa      | Spinner (min: 0) |
| **Empregados para este Serviço** | Número            | Empregados destinados a este serviço       | Spinner (min: 0) |

### 🔧 **Seção SESMT**

| Campo                           | Tipo   | Descrição                          | Observações                   |
| ------------------------------- | ------ | ---------------------------------- | ----------------------------- |
| **Possui SESMT registrado?**    | Toggle | Indica se possui SESMT             | Sim/Não                       |
| **Número de Componentes SESMT** | Número | Quantidade de componentes do SESMT | Aparece apenas se SESMT = Sim |

### 📎 **Anexos Obrigatórios**

| Anexo                                 | Tipo    | Descrição                                           | Formatos Aceitos               |
| ------------------------------------- | ------- | --------------------------------------------------- | ------------------------------ |
| **REM - Resumo Estatístico Mensal\*** | Arquivo | Resumo Estatístico Mensal dos acidentes de trabalho | .pdf, .xlsx, .xls, .docx, .doc |

**Observação importante**: O REM deve conter estatísticas do ano corrente e ano anterior, preparadas conforme NBR14280 da ABNT.

---

## ⚖️ **ABA 2: CONFORMIDADE LEGAL**

_Seção B - Cumprimento das Normas Regulamentadoras_

### 🎯 **Estrutura Geral**

- **Aplicabilidade**: Cada bloco deve ser marcado como "Aplicável" ou "Não Aplicável"
- **Respostas**: Para blocos aplicáveis, responder "SIM" ou "NÃO" para cada questão
- **Anexos**: Questões com resposta "SIM" podem requerer anexos comprobatórios
- **Comentários**: Campo livre para observações em cada bloco

---

### 📋 **NR 01 - Disposições Gerais**

| Questão | Pergunta                                                                                                                                                                                                                                                                                                       | Anexo Obrigatório |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1       | A CONTRATADA tem conhecimento, cumpre e faz cumprir as disposições legais e regulamentares sobre segurança e medicina do trabalho determinadas na legislação federal, estadual e/ou municipal?                                                                                                                 | Não               |
| 2       | Elabora ordens de serviços sobre segurança e saúde, conscientizando seus empregados quanto aos riscos existentes e os seus mecanismos de prevenção e controle?                                                                                                                                                 | Não               |
| 3       | Elabora ordens de serviços sobre segurança e saúde, conscientizando seus empregados quanto às obrigações e condições exigíveis nas leis e regulamentos dos acidentes de trabalho (empregado tem 24h para comunicar um acidente) e aos procedimentos a serem adotados em caso de acidente e doença do trabalho? | Não               |
| 4       | Elabora ordens de serviços sobre segurança e saúde, conscientizando seus empregados quanto aos resultados dos exames médicos e avaliações ambientais nos locais de trabalho?                                                                                                                                   | Não               |
| 5       | A CONTRATADA mantém o Livro de Inspeção exigido pela legislação do trabalho (MTE) no local de trabalho?                                                                                                                                                                                                        | Não               |

---

### 🏥 **NR 04 - SESMT**

| Questão | Pergunta                                                       | Anexo Obrigatório          |
| ------- | -------------------------------------------------------------- | -------------------------- |
| 1       | A CONTRATADA possui SESMT registrado no órgão regional do MTE? | **Sim** - Documentos SESMT |
| 2       | O SESMT está dimensionado para quadro atual de empregados?     | Não                        |

---

### 👥 **NR 05 - CIPA**

| Questão | Pergunta                                                      | Anexo Obrigatório         |
| ------- | ------------------------------------------------------------- | ------------------------- |
| 1       | A CONTRATADA possui CIPA registrada no órgão regional do MTE? | **Sim** - Documentos CIPA |
| 2       | A CIPA está dimensionada para quadro atual de empregados?     | Não                       |

---

### 🦺 **NR 06 - EPI**

| Questão | Pergunta                                                                                                                                                                                             | Anexo Obrigatório     |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 1       | A CONTRATADA fornece EPI adequado ao risco, em perfeito estado de conservação e funcionamento, com preenchimento de cautela e gratuitamente a seus empregados conforme disposições contidas na NR-6? | **Sim** - CA dos EPIs |
| 2       | A CONTRATADA orienta os empregados quanto à obrigatoriedade do uso, guarda, manutenção e substituição do EPI?                                                                                        | Não                   |

---

### 🏥 **NR 07 - PCMSO**

| Questão | Pergunta                                                                                 | Anexo Obrigatório |
| ------- | ---------------------------------------------------------------------------------------- | ----------------- |
| 1       | A CONTRATADA elabora e implementa PCMSO?                                                 | **Sim** - PCMSO   |
| 2       | A CONTRATADA realiza os exames médicos previstos na NR 7? Controle de ASO.               | **Sim** - ASO     |
| 3       | A CONTRATADA tem arquivo comprovando que realizou e custeou os exames previstos na NR 7? | Não               |

---

### 🔍 **NR 09 - PPRA**

| Questão | Pergunta                                                                        | Anexo Obrigatório |
| ------- | ------------------------------------------------------------------------------- | ----------------- |
| 1       | A CONTRATADA tem o PPRA atualizado?                                             | **Sim** - PPRA    |
| 2       | O PPRA da CONTRATADA está adequado aos riscos apresentados por suas atividades? | Não               |
| 3       | Os trabalhadores foram informados sobre os riscos ambientais?                   | Não               |

---

### ⚡ **NR 10 - Instalações e Serviços em Eletricidade**

| Questão | Pergunta                                                                                                             | Anexo Obrigatório |
| ------- | -------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1       | As instalações elétricas estão de acordo com a norma regulamentadora?                                                | Não               |
| 2       | As instalações elétricas foram projetadas de acordo com as normas técnicas brasileiras e/ou internacionais vigentes? | Não               |
| 3       | Os profissionais são habilitados para trabalhos com eletricidade?                                                    | Não               |

---

### 🚛 **NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais**

| Questão | Pergunta                                                                                                                | Anexo Obrigatório |
| ------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1       | Os equipamentos utilizados na movimentação de materiais e/ou pessoal estão dentro das condições especiais de segurança? | Não               |
| 2       | Os operadores de transporte possuem habilitação, sendo submetidos a treinamento específico?                             | Não               |

---

### ⚙️ **NR 12 - Máquinas e Equipamentos**

| Questão | Pergunta                                                                             | Anexo Obrigatório |
| ------- | ------------------------------------------------------------------------------------ | ----------------- |
| 1       | A CONTRATADA possui um plano de Inspeção/Manutenção para as máquinas e equipamentos? | Não               |
| 2       | Os dispositivos de acionamento, partida e parada estão em conformidade com a NR?     | Não               |

---

### 🔥 **NR 13 - Caldeiras e Vasos de Pressão**

| Questão | Pergunta                                                                                                                       | Anexo Obrigatório |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------- |
| 1       | A CONTRATADA possui uma sistemática de calibração e manutenção dos Equipamentos Críticos e instrumentos contemplados nesta NR? | Não               |

---

### ☣️ **NR 15 - Atividades e Operações Insalubres**

| Questão | Pergunta                                                                                                                           | Anexo Obrigatório |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1       | A CONTRATADA atende aos requisitos estabelecidos na NR 15 e em seus anexos, no que se refere às atividades e operações insalubres? | Não               |

---

### 🚒 **NR 23 - Proteção Contra Incêndios**

| Questão | Pergunta                                                                                                                   | Anexo Obrigatório |
| ------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1       | Os equipamentos de Combate a Incêndios encontram-se devidamente identificados e com a manutenção em dia?                   | Não               |
| 2       | Os equipamentos de Combate a Incêndios encontram-se distribuídos e em quantidade de acordo com o que é estabelecido na NR? | Não               |
| 3       | O Extintor de incêndio possui a certificação do INMETRO?                                                                   | Não               |

---

### 🌱 **Licenças Ambientais**

| Questão | Pergunta                                                                         | Anexo Obrigatório |
| ------- | -------------------------------------------------------------------------------- | ----------------- |
| 1       | A CONTRATADA possui licença de operação emitida pelo órgão ambiental competente? | Não               |

---

### ⚓ **Legislação Marítima**

| Questão | Pergunta                                                            | Anexo Obrigatório |
| ------- | ------------------------------------------------------------------- | ----------------- |
| 1       | A CONTRATADA está em conformidade com os regulamentos do MODU CODE? | Não               |
| 2       | A CONTRATADA está em conformidade com os regulamentos da NORMAN?    | Não               |
| 3       | A CONTRATADA está em conformidade com os regulamentos da MARPOL?    | Não               |
| 4       | A CONTRATADA está em conformidade com os regulamentos da STCW?      | Não               |
| 5       | A CONTRATADA está em conformidade com os regulamentos do ISM CODE?  | Não               |
| 6       | A CONTRATADA está em conformidade com os regulamentos do SOLAS?     | Não               |

---

### 🎓 **Treinamentos Obrigatórios**

| Questão | Pergunta                                                                                                                                                                  | Anexo Obrigatório |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 1       | A CONTRATADA tem Programa Educativo contemplando a temática de Prevenção de Acidentes, Meio Ambiente e Doenças do Trabalho?                                               | Não               |
| 2       | Todos os empregados recebem treinamento admissional e periódico, visando executar suas funções com segurança?                                                             | Não               |
| 3       | Nos treinamentos os empregados recebem cópias ou têm os procedimentos em local acessível, para que as operações sejam realizadas com segurança e ambientalmente corretas? | Não               |

---

### 📊 **Gestão de SMS (Saúde, Meio Ambiente e Segurança)**

| Questão | Pergunta                                                                                            | Anexo Obrigatório |
| ------- | --------------------------------------------------------------------------------------------------- | ----------------- |
| 1       | A CONTRATADA tem procedimento para análise e registro de acidentes?                                 | Não               |
| 2       | A CONTRATADA realiza inspeções de SMS programadas?                                                  | Não               |
| 3       | A CONTRATADA tem procedimento para minimização e disposição de resíduos?                            | Não               |
| 4       | A CONTRATADA divulga as Metas e Programa de Segurança, Meio Ambiente e Saúde?                       | Não               |
| 5       | A CONTRATADA tem um Programa das Atividades de Segurança Meio Ambiente e Saúde para o ano em curso? | Não               |

---

## 🚢 **ABA 3: SERVIÇOS ESPECIALIZADOS**

_Seção C - Embarcações e Içamento de Carga_

### 🎯 **Seleção de Serviços**

| Serviço                                                 | Tipo   | Descrição |
| ------------------------------------------------------- | ------ | --------- |
| **Fornecedor de Serviços Envolvendo Embarcações**       | Toggle | Sim/Não   |
| **Fornecedor de Serviços Envolvendo Içamento de Carga** | Toggle | Sim/Não   |

---

### 🚢 **Certificados Marítimos Obrigatórios**

_Aplicável apenas se "Embarcações" = Sim_

| ID  | Certificado                   | Categoria             | Descrição                                                  |
| --- | ----------------------------- | --------------------- | ---------------------------------------------------------- |
| 74  | **IOPP**                      | iopp                  | Certificado Internacional de Prevenção à Poluição por Óleo |
| 75  | **Registro de Armador**       | registroArmador       | Registro do Armador                                        |
| 76  | **Propriedade Marítima**      | propriedadeMaritima   | Propriedade Marítima                                       |
| 77  | **Arqueação**                 | arqueacao             | Certificado de Arqueação                                   |
| 78  | **Segurança de Navegação**    | segurancaNavegacao    | Certificado de Segurança de Navegação                      |
| 79  | **Classificação do Casco**    | classificacaoCasco    | Certificado de Classificação do Casco                      |
| 80  | **Classificação de Máquinas** | classificacaoMaquinas | Certificado de Classificação de Máquinas                   |
| 81  | **Borda Livre**               | bordaLivre            | Certificado de Borda Livre                                 |
| 82  | **Seguro DEPEM**              | seguroDepem           | Seguro Obrigatório DEPEM                                   |
| 83  | **Autorização ANTAQ**         | autorizacaoAntaq      | Autorização da ANTAQ                                       |
| 84  | **Tripulação de Segurança**   | tripulacaoSeguranca   | Certificado de Tripulação de Segurança                     |
| 85  | **Agulha Magnética**          | agulhaMagnetica       | Certificado de Agulha Magnética                            |
| 86  | **Balsa Inflável**            | balsaInflavel         | Certificado de Balsa Inflável                              |
| 87  | **Licença de Rádio**          | licencaRadio          | Licença de Rádio                                           |

**Formatos aceitos**: .pdf, .jpg, .png  
**Tamanho máximo**: 50MB por arquivo

---

### 🏗️ **Documentos para Içamento de Carga**

_Aplicável apenas se "Içamento de Carga" = Sim_

| ID  | Documento                        | Categoria                | Descrição                                 |
| --- | -------------------------------- | ------------------------ | ----------------------------------------- |
| 88  | **Teste de Carga**               | testeCarga               | Teste de Carga dos Equipamentos           |
| 89  | **CREA do Engenheiro**           | registroCREA             | Registro CREA do Engenheiro               |
| 90  | **ART**                          | art                      | Anotação de Responsabilidade Técnica      |
| 91  | **Plano de Manutenção**          | planoManutencao          | Plano de Manutenção dos Equipamentos      |
| 92  | **Fumaça Preta**                 | monitoramentoFumaca      | Controle de Emissão de Fumaça Preta       |
| 93  | **Certificação de Equipamentos** | certificacaoEquipamentos | Certificação dos Equipamentos de Içamento |

**Formatos aceitos**: .pdf, .docx, .xlsx  
**Tamanho máximo**: 50MB por arquivo

---

## 📋 **RESUMO DE CAMPOS POR ABA**

### 🏢 **Dados Gerais**

- **9 campos obrigatórios**
- **4 campos opcionais**
- **1 anexo obrigatório** (REM)

### ⚖️ **Conformidade Legal**

- **16 seções** de normas regulamentadoras
- **44 questões** no total
- **Anexos condicionais** baseados nas respostas "SIM"
- **Campo de comentários** em cada seção

### 🚢 **Serviços Especializados**

- **2 tipos de serviços** (Embarcações e Içamento)
- **14 certificados marítimos** (se aplicável)
- **6 documentos de içamento** (se aplicável)
- **Seção opcional** - pode ser pulada se não aplicável

### 📋 **Revisão Final**

- **Validação automática** de todo o formulário
- **Resumo visual** do preenchimento
- **Submissão final** do formulário

---

## 📝 **TIPOS DE RESPOSTA ACEITOS**

### 📋 **Conformidade Legal**

- ✅ **SIM** - Empresa está em conformidade
- ❌ **NÃO** - Empresa não está em conformidade
- 📝 **Comentários** - Campo livre para observações

### 🎯 **Aplicabilidade**

- ✅ **Aplicável** - A norma se aplica à empresa
- ❌ **Não Aplicável** - A norma não se aplica à empresa

### 📎 **Anexos**

- 🔴 **Obrigatórios** - Marcados com asterisco (\*)
- 🔵 **Condicionais** - Obrigatórios apenas se resposta = "SIM"
- ⚪ **Opcionais** - Podem ser anexados como documentação adicional

---

_📅 Documento gerado automaticamente - versão 1.0_  
_🏢 Sistema HSE - Auto-avaliação para Contratadas_
