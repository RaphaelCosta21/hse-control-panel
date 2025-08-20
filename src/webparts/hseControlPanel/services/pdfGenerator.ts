import {
  IHSEFormData,
  IDadosGerais,
  IConformidadeLegal,
} from "../types/IHSEFormData";
import { NR_QUESTIONS_MAP } from "../utils/formConstants";

// Tipos auxiliares para o gerador de PDF
interface IQuestionData {
  category: string;
  text: string;
  id: string;
  attachment?: string;
}

interface ICategorizedQuestions {
  mandatoryNRs: { [key: string]: IQuestionData[] };
  optionalNRs: { [key: string]: IQuestionData[] };
  otherCompliance: { [key: string]: IQuestionData[] };
}

/**
 * Serviço responsável pela geração de PDF do formulário HSE
 * Centraliza toda a lógica de geração do PDF em um local único
 */
export class PDFGeneratorService {
  /**
   * Gera o HTML completo do formulário para conversão em PDF
   */
  public static generateFormHTML(
    formData: IHSEFormData,
    userDisplayName?: string,
    userEmail?: string
  ): string {
    const dados = formData.dadosGerais;
    const conformidade = formData.conformidadeLegal || {};
    const servicosEspeciais = formData.servicosEspeciais || {};
    const anexos = formData.anexos || {};

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Formulário HSE - ${dados?.empresa || "Empresa"}</title>
        <style>
          ${this.generatePDFStyles()}
        </style>
      </head>
      <body>
        <div class="pdf-container">
          ${this.generateHeader(dados, userDisplayName, userEmail)}
          ${this.generateCompanyInfo(dados)}
          ${this.generateConformidadeLegalContent(conformidade)}
          ${this.generateServicosEspecializadosContent(servicosEspeciais)}
          ${this.generateAnexosContent(anexos)}
        </div>
      </body>
      </html>
    `;

    return html;
  }

  /**
   * Gera o cabeçalho do PDF com informações do usuário
   */
  private static generateHeader(
    dados: IDadosGerais,
    userDisplayName?: string,
    userEmail?: string
  ): string {
    const currentDate = new Date().toLocaleDateString("pt-BR");

    return `
      <div class="pdf-header">
        <div class="header-logo">
          <h1>Registro de Auto-Avaliação de HSE para Contratadas</h1>
        </div>
        <div class="header-info">
          <div class="document-info">
            <h2>${dados?.empresa || "Nome da Empresa"}</h2>
            <p><strong>CNPJ:</strong> ${dados?.cnpj || "N/A"}</p>
            <p><strong>Data de Geração:</strong> ${currentDate}</p>
          </div>
          ${
            userDisplayName || userEmail
              ? `
            <div class="user-info">
              <h3>👤 Informações do Responsável</h3>
              ${
                userDisplayName
                  ? `<p><strong>Nome:</strong> ${userDisplayName}</p>`
                  : ""
              }
              ${userEmail ? `<p><strong>Email:</strong> ${userEmail}</p>` : ""}
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;
  }

  /**
   * Gera a seção de informações da empresa
   */
  private static generateCompanyInfo(dados: IDadosGerais): string {
    if (!dados) return "";

    return `
      <div class="section company-section" style="page-break-inside: avoid;">
        <h2>📋 DADOS GERAIS DA EMPRESA</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Nome da Empresa:</label>
            <span>${dados.empresa || "N/A"}</span>
          </div>
          <div class="info-item">
            <label>CNPJ:</label>
            <span>${dados.cnpj || "N/A"}</span>
          </div>
          <div class="info-item">
            <label>Escopo do Serviço:</label>
            <span>${dados.escopoServico || "N/A"}</span>
          </div>
          <div class="info-item">
            <label>Responsável Técnico:</label>
            <span>${dados.responsavelTecnico || "N/A"}</span>
          </div>
          <div class="info-item">
            <label>Atividade Principal (CNAE):</label>
            <span>${dados.atividadePrincipalCNAE || "N/A"}</span>
          </div>
          <div class="info-item">
            <label>Grau de Risco:</label>
            <span>${dados.grauRisco || "N/A"}</span>
          </div>
          <div class="info-item">
            <label>Total de Empregados:</label>
            <span>${dados.totalEmpregados || "N/A"}</span>
          </div>
          <div class="info-item">
            <label>Empregados para este Serviço:</label>
            <span>${dados.empregadosParaServico || "N/A"}</span>
          </div>
          <div class="info-item">
            <label>Possui SESMT Registrado:</label>
            <span>${
              dados.possuiSESMT === true
                ? "Sim"
                : dados.possuiSESMT === false
                ? "Não"
                : "N/A"
            }</span>
          </div>
          ${
            dados.possuiSESMT && dados.numeroComponentesSESMT
              ? `
          <div class="info-item">
            <label>Número de Componentes SESMT:</label>
            <span>${dados.numeroComponentesSESMT}</span>
          </div>
          `
              : ""
          }
        </div>
      </div>
    `;
  }

  /**
   * Gera o conteúdo completo da Conformidade Legal com todas as NRs e questões
   */
  private static generateConformidadeLegalContent(
    conformidade: IConformidadeLegal | Record<string, unknown>
  ): string {
    const conformidadeObj = conformidade as Record<string, unknown>;

    // Agrupar questões por categoria usando o NR_QUESTIONS_MAP
    const categorizedQuestions = this.categorizeQuestions();

    let content = `
      <div class="section conformidade-section">
        <h2>📋 CONFORMIDADE LEGAL</h2>
        
        <div class="conformidade-intro">
          <p><strong>Legenda:</strong></p>
          <div class="legenda">
            <span class="status-aplicado">✅ Aplicável/Selecionado</span>
            <span class="status-nao-aplicado">❌ Não Selecionado</span>
            <span class="status-obrigatorio">⚠️ Obrigatório</span>
          </div>
        </div>
    `;

    // Processar NRs obrigatórias
    content += this.generateNRSection(
      "NORMAS REGULAMENTADORAS OBRIGATÓRIAS",
      categorizedQuestions.mandatoryNRs,
      conformidadeObj,
      true
    );

    // Processar NRs opcionais
    content += this.generateNRSection(
      "NORMAS REGULAMENTADORAS OPCIONAIS",
      categorizedQuestions.optionalNRs,
      conformidadeObj,
      false
    );

    // Processar outros itens de conformidade
    content += this.generateNRSection(
      "OUTROS ITENS DE CONFORMIDADE",
      categorizedQuestions.otherCompliance,
      conformidadeObj,
      false
    );

    content += "</div>";
    return content;
  }

  /**
   * Categoriza as questões do NR_QUESTIONS_MAP por tipo
   */
  private static categorizeQuestions(): ICategorizedQuestions {
    const mandatoryNRs: { [key: string]: IQuestionData[] } = {};
    const optionalNRs: { [key: string]: IQuestionData[] } = {};
    const otherCompliance: { [key: string]: IQuestionData[] } = {};

    // NRs obrigatórias
    const mandatoryCategories = ["NR01", "NR04", "NR05", "NR06", "NR07"];

    Object.entries(NR_QUESTIONS_MAP).forEach(([questionId, question]) => {
      const questionData = question as {
        category: string;
        text: string;
        attachment?: string;
      };
      const category = questionData.category;

      if (mandatoryCategories.includes(category)) {
        if (!mandatoryNRs[category]) mandatoryNRs[category] = [];
        mandatoryNRs[category].push({ ...questionData, id: questionId });
      } else if (category.startsWith("NR")) {
        if (!optionalNRs[category]) optionalNRs[category] = [];
        optionalNRs[category].push({ ...questionData, id: questionId });
      } else {
        if (!otherCompliance[category]) otherCompliance[category] = [];
        otherCompliance[category].push({ ...questionData, id: questionId });
      }
    });

    return { mandatoryNRs, optionalNRs, otherCompliance };
  }

  /**
   * Gera uma seção de NRs (obrigatórias, opcionais ou outros)
   */
  private static generateNRSection(
    title: string,
    categories: { [key: string]: IQuestionData[] },
    conformidadeObj: Record<string, unknown>,
    isMandatory: boolean
  ): string {
    let content = `<div class="nr-group"><h3 class="group-title">📋 ${title}</h3>`;

    Object.entries(categories).forEach(([categoryKey, questions]) => {
      const categoryTitle = this.getCategoryTitle(categoryKey);
      const categoryData = conformidadeObj[
        this.getCategoryDataKey(categoryKey)
      ] as Record<string, unknown> | undefined;
      const isSelected =
        categoryData &&
        (categoryData as { aplicavel?: boolean }).aplicavel !== false;

      content += `
        <div class="nr-section ${
          isSelected ? "nr-selected" : "nr-not-selected"
        }" style="page-break-inside: avoid;">
          <div class="nr-header">
            <div class="nr-title">
              ${isSelected ? "✅" : "❌"} ${categoryTitle}
              ${
                isMandatory
                  ? '<span class="obrigatorio-badge">⚠️ OBRIGATÓRIO</span>'
                  : ""
              }
            </div>
            <div class="nr-status">${
              isSelected ? "SELECIONADO" : "NÃO SELECIONADO"
            }</div>
          </div>
          <div class="nr-content">
      `;

      if (isSelected && categoryData) {
        // Mostrar questões respondidas
        questions.forEach((question, index) => {
          const questaoKey = `questao${index + 1}`;
          const questaoData =
            ((categoryData as Record<string, unknown>)[questaoKey] as Record<
              string,
              unknown
            >) || {};
          const resposta = (questaoData.resposta as string) || "Não respondido";
          const comentario = (questaoData.comentarios as string) || "";

          content += `
            <div class="questao" style="page-break-inside: avoid;">
              <div class="questao-numero">Questão ${index + 1}</div>
              <div class="questao-pergunta">${question.text}</div>
              <div class="questao-resposta ${
                resposta.toLowerCase() === "sim"
                  ? "sim"
                  : resposta.toLowerCase().includes("não")
                  ? "nao"
                  : ""
              }">
                <strong>Resposta:</strong> ${resposta}
              </div>
              ${
                comentario
                  ? `<div class="questao-comentario"><strong>Comentário:</strong> ${comentario}</div>`
                  : ""
              }
            </div>
          `;
        });
      } else {
        content += `<div class="nr-not-applied">Este tópico não foi selecionado pela empresa.</div>`;
      }

      content += "</div></div>";
    });

    content += "</div>";
    return content;
  }

  /**
   * Obtém o título da categoria
   */
  private static getCategoryTitle(categoryKey: string): string {
    const titles: { [key: string]: string } = {
      NR01: "NR 01 - Disposições Gerais",
      NR04: "NR 04 - SESMT",
      NR05: "NR 05 - CIPA",
      NR06: "NR 06 - EPI",
      NR07: "NR 07 - PCMSO",
      NR10: "NR 10 - Instalações e Serviços em Eletricidade",
      NR11: "NR 11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais",
      NR12: "NR 12 - Máquinas e Equipamentos",
      NR13: "NR 13 - Caldeiras e Vasos de Pressão",
      NR15: "NR 15 - Atividades e Operações Insalubres",
      NR16: "NR 16 - Atividades e Operações Periculosas",
      NR23: "NR 23 - Proteção Contra Incêndios",
      LICENCAS_AMBIENTAIS: "Licenças Ambientais",
      LEGISLACAO_MARITIMA: "Legislação Marítima",
      TREINAMENTOS_OBRIGATORIOS: "Treinamentos Obrigatórios",
      GESTAO_SMS: "Gestão de SMS (Saúde, Meio Ambiente e Segurança)",
    };
    return titles[categoryKey] || categoryKey;
  }

  /**
   * Obtém a chave dos dados da categoria na conformidade legal
   */
  private static getCategoryDataKey(categoryKey: string): string {
    const keyMap: { [key: string]: string } = {
      NR01: "nr01",
      NR04: "nr04",
      NR05: "nr05",
      NR06: "nr06",
      NR07: "nr07",
      NR10: "nr10",
      NR11: "nr11",
      NR12: "nr12",
      NR13: "nr13",
      NR15: "nr15",
      NR16: "nr16",
      NR23: "nr23",
      LICENCAS_AMBIENTAIS: "licencasAmbientais",
      LEGISLACAO_MARITIMA: "legislacaoMaritima",
      TREINAMENTOS_OBRIGATORIOS: "treinamentos",
      GESTAO_SMS: "gestaoSMS",
    };
    return keyMap[categoryKey] || categoryKey.toLowerCase();
  }

  /**
   * Gera os estilos CSS para o PDF
   */
  private static generatePDFStyles(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        color: #333;
        background: white;
      }

      .pdf-container {
        max-width: 210mm;
        margin: 0 auto;
        padding: 15mm;
      }

      /* Cabeçalho */
      .pdf-header {
        border-bottom: 3px solid #0078d4;
        padding-bottom: 20px;
        margin-bottom: 30px;
        page-break-inside: avoid;
      }

      .header-logo h1 {
        color: #0078d4;
        font-size: 24px;
        margin-bottom: 10px;
        text-align: center;
      }

      .header-info {
        display: flex;
        justify-content: space-between;
        gap: 20px;
      }

      .document-info, .user-info {
        flex: 1;
      }

      .document-info h2 {
        color: #323130;
        font-size: 18px;
        margin-bottom: 15px;
      }

      .user-info {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #28a745;
      }

      .user-info h3 {
        color: #28a745;
        font-size: 14px;
        margin-bottom: 8px;
      }

      /* Print styles */
      @media print {
        body {
          font-size: 11px;
          margin: 0;
          padding: 0;
        }
        
        .pdf-container {
          margin: 0;
          padding: 10mm;
          max-width: none;
        }
        
        .section {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .nr-section {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        .nr-group {
          page-break-inside: auto;
        }
        
        .group-title {
          page-break-after: avoid;
        }
        
        .pdf-header {
          page-break-after: avoid;
        }
      }

      /* Seções */
      .section {
        margin-bottom: 30px;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .section h2 {
        background: linear-gradient(135deg, #0078d4, #106ebe);
        color: white;
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 8px;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        page-break-after: avoid;
      }

      /* Dados da empresa */
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
      }

      .info-item {
        padding: 12px;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 4px solid #0078d4;
      }

      .info-item label {
        font-weight: 600;
        color: #323130;
        display: block;
        margin-bottom: 4px;
      }

      .info-item span {
        color: #605e5c;
      }

      /* Conformidade Legal */
      .conformidade-intro {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 20px;
      }

      .legenda {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        margin-top: 10px;
      }

      .legenda span {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 500;
      }

      .status-aplicado {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
      }

      .status-nao-aplicado {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
      }

      .status-obrigatorio {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
      }

      /* Grupos de NR */
      .nr-group {
        margin-bottom: 25px;
      }

      .group-title {
        background: #495057;
        color: white;
        padding: 12px 20px;
        margin-bottom: 15px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 600;
      }

      /* Seções de NR */
      .nr-section {
        margin-bottom: 20px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .nr-selected {
        border: 2px solid #28a745;
        page-break-inside: avoid;
      }

      .nr-not-selected {
        border: 2px solid #dc3545;
        opacity: 0.8;
        page-break-inside: avoid;
      }

      .nr-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        font-weight: 600;
      }

      .nr-selected .nr-header {
        background: linear-gradient(135deg, #d4edda, #c3e6cb);
        color: #155724;
      }

      .nr-not-selected .nr-header {
        background: linear-gradient(135deg, #f8d7da, #f5c6cb);
        color: #721c24;
      }

      .nr-title {
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .obrigatorio-badge {
        background: #ffeaa7;
        color: #856404;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 500;
      }

      .nr-status {
        font-size: 11px;
        padding: 4px 12px;
        border-radius: 12px;
        background: rgba(255,255,255,0.8);
      }

      .nr-content {
        padding: 20px;
        background: white;
      }

      /* Questões */
      .questao {
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 4px solid #6c757d;
        page-break-inside: avoid;
      }

      .questao-numero {
        font-weight: 600;
        color: #0078d4;
        margin-bottom: 8px;
        font-size: 11px;
      }

      .questao-pergunta {
        font-weight: 500;
        margin-bottom: 10px;
        color: #323130;
        line-height: 1.5;
      }

      .questao-resposta {
        margin-bottom: 8px;
        padding: 8px 12px;
        border-radius: 4px;
        font-weight: 500;
      }

      .questao-resposta.sim {
        background: #d4edda;
        color: #155724;
        border-left: 4px solid #28a745;
      }

      .questao-resposta.nao {
        background: #f8d7da;
        color: #721c24;
        border-left: 4px solid #dc3545;
      }

      .questao-comentario {
        background: #e2e3e5;
        padding: 10px;
        border-radius: 4px;
        border-left: 4px solid #6c757d;
        font-style: italic;
        color: #495057;
      }

      .nr-not-applied {
        text-align: center;
        padding: 30px;
        color: #6c757d;
        font-style: italic;
        background: #f8f9fa;
        border-radius: 6px;
        border: 2px dashed #dee2e6;
      }

      /* Serviços Especializados */
      .servicos-section {
        margin-bottom: 30px;
        page-break-inside: avoid;
      }

      .servico-item {
        margin-bottom: 20px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        page-break-inside: avoid;
      }

      .servico-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        font-weight: 600;
        background: #f1f1f1;
        border-bottom: 2px solid #0078d4;
      }

      .servico-title {
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .servico-status {
        font-size: 11px;
        padding: 4px 12px;
        border-radius: 12px;
        background: rgba(255,255,255,0.8);
      }

      .servico-not-applied {
        text-align: center;
        padding: 15px;
        color: #6c757d;
        font-style: italic;
        background: #f8f9fa;
        border-radius: 6px;
        border: 2px dashed #dee2e6;
      }

      /* Anexos */
      .anexos-section {
        margin-bottom: 30px;
        page-break-inside: avoid;
      }

      .anexo-categoria {
        margin-bottom: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 4px solid #0078d4;
        page-break-inside: avoid;
      }

      .anexo-categoria-titulo {
        font-size: 14px;
        margin-bottom: 10px;
        color: #0078d4;
      }

      .anexo-lista {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .anexo-item {
        padding: 10px;
        background: #fff;
        border-radius: 4px;
        border: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .anexo-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .anexo-nome {
        font-weight: 500;
        color: #333;
      }

      .anexo-tamanho, .anexo-data {
        font-size: 11px;
        color: #666;
      }

      .no-anexos {
        text-align: center;
        padding: 30px;
        color: #6c757d;
        font-style: italic;
        background: #f8f9fa;
        border-radius: 6px;
        border: 2px dashed #dee2e6;
      }

      /* Quebras de página */
      @media print {
        .pdf-container {
          margin: 0;
          padding: 10mm;
        }
        
        .section {
          page-break-inside: avoid;
        }
        
        .nr-section {
          page-break-inside: avoid;
        }
        
        .questao {
          page-break-inside: avoid;
        }
      }
    `;
  }

  /**
   * Gera o conteúdo da seção de Serviços Especializados
   */
  private static generateServicosEspecializadosContent(
    servicosEspeciais: Record<string, unknown> | unknown
  ): string {
    let content = `
      <div class="section servicos-section">
        <h2>🔧 SERVIÇOS ESPECIALIZADOS</h2>
    `;

    // Cast para ter acesso às propriedades
    const servicos = (servicosEspeciais as Record<string, unknown>) || {};

    // Fornecedor de Embarcações
    const fornecedorEmbarcacoes = servicos.fornecedorEmbarcacoes;
    content += `
      <div class="servico-item" style="page-break-inside: avoid;">
        <div class="servico-header">
          <div class="servico-title">
            ${fornecedorEmbarcacoes ? "✅" : "❌"} Fornecedor de Embarcações
          </div>
          <div class="servico-status">${
            fornecedorEmbarcacoes ? "SELECIONADO" : "NÃO SELECIONADO"
          }</div>
        </div>
        ${
          !fornecedorEmbarcacoes
            ? `<div class="servico-not-applied">Este serviço não foi selecionado pela empresa.</div>`
            : ""
        }
      </div>
    `;

    // Fornecedor de Içamento
    const fornecedorIcamento = servicos.fornecedorIcamento;
    content += `
      <div class="servico-item" style="page-break-inside: avoid;">
        <div class="servico-header">
          <div class="servico-title">
            ${fornecedorIcamento ? "✅" : "❌"} Fornecedor de Içamento
          </div>
          <div class="servico-status">${
            fornecedorIcamento ? "SELECIONADO" : "NÃO SELECIONADO"
          }</div>
        </div>
        ${
          !fornecedorIcamento
            ? `<div class="servico-not-applied">Este serviço não foi selecionado pela empresa.</div>`
            : ""
        }
      </div>
    `;

    content += "</div>";
    return content;
  }

  /**
   * Gera o conteúdo da seção de Anexos
   */
  private static generateAnexosContent(
    anexos: Record<string, unknown> | unknown
  ): string {
    const anexosObj = (anexos as Record<string, unknown>) || {};

    let content = `
      <div class="section anexos-section">
        <h2>📎 DOCUMENTAÇÃO ANEXADA</h2>
    `;

    // Mapear categorias de anexos com nomes amigáveis
    // Incluindo todas as chaves possíveis que podem existir nos anexos
    const categorias = {
      // Dados Gerais
      rem: "REM - Resumo Estatístico Mensal",

      // NRs Obrigatórias - baseado na interface IAnexosFormulario
      sesmt:
        "SESMT - Serviços Especializados em Engenharia de Segurança e Medicina do Trabalho",
      cipa: "CIPA - Comissão Interna de Prevenção de Acidentes",
      caEPI:
        "CA EPI - Certificado de Aprovação de Equipamentos de Proteção Individual",
      pcmso: "PCMSO - Programa de Controle Médico de Saúde Ocupacional",
      aso: "ASO - Atestado de Saúde Ocupacional",

      // NRs Opcionais - usando as chaves corretas da interface
      nr10ProjetoInstalacoes: "NR 10 - Projeto de Instalações Elétricas",
      nr10CertificacaoProfissionais: "NR 10 - Certificação de Profissionais",
      nr11CertificadoTreinamento: "NR 11 - Certificado de Treinamento",
      nr12PlanoInspecao: "NR 12 - Plano de Inspeção de Máquinas",
      nr12EvidenciaDispositivo:
        "NR 12 - Evidência de Dispositivos de Segurança",
      nr13EvidenciaSistematica:
        "NR 13 - Evidência de Sistemática de Caldeiras e Vasos de Pressão",
      nr15LaudoInsalubridade: "NR 15 - Laudo de Insalubridade",
      nr16LaudoPericulosidade: "NR 16 - Laudo de Periculosidade",
      nr23LaudoManutencao:
        "NR 23 - Laudo de Manutenção de Proteção Contra Incêndios",

      // Licenças Ambientais
      licencaOperacao: "Licenças Ambientais - Licença de Operação",

      // Treinamentos Obrigatórios
      certificadoProgramaTreinamento:
        "Treinamentos - Certificado de Programa de Treinamento",
      evidenciaTreinamento: "Treinamentos - Evidência de Treinamento",

      // Gestão de SMS
      smsProcedimentoAcidentes: "SMS - Procedimento de Acidentes",
      smsCalendarioInspecoes: "SMS - Calendário de Inspeções",
      smsProcedimentoResiduos: "SMS - Procedimento de Resíduos",
      smsMetasObjetivos: "SMS - Metas e Objetivos",
      smsProgramaAnual: "SMS - Programa Anual",

      // Serviços Especializados - Embarcações
      iopp: "IOPP - Certificado Internacional de Prevenção da Poluição por Óleo",
      registroArmador: "Registro de Armador",
      propriedadeMaritima: "Propriedade Marítima",
      arqueacao: "Certificado de Arqueação",
      segurancaNavegacao: "Certificado de Segurança da Navegação",
      classificacaoCasco: "Classificação do Casco",
      classificacaoMaquinas: "Classificação de Máquinas",
      bordaLivre: "Borda Livre",
      seguroDepem: "Seguro DEPEM",
      autorizacaoAntaq: "Autorização ANTAQ",
      tripulacaoSeguranca: "Tripulação de Segurança",
      agulhaMagnetica: "Agulha Magnética",
      balsaInflavel: "Balsa Inflável",
      licencaRadio: "Licença de Rádio",

      // Serviços Especializados - Içamento
      testeCarga: "Teste de Carga",
      registroCREA: "Registro no CREA",
      art: "ART - Anotação de Responsabilidade Técnica",
      planoManutencao: "Plano de Manutenção",
      monitoramentoFumaca: "Monitoramento de Fumaça",
      certificacaoEquipamentos: "Certificação de Equipamentos",

      // Outras categorias possíveis (mapeamento adicional)
      outros: "Outros Documentos",
    };

    let temAnexos = false;

    // Debug: verificar estrutura dos anexos recebidos
    console.log("📎 Estrutura dos anexos recebidos:", anexosObj);
    console.log("📎 Chaves disponíveis:", Object.keys(anexosObj));

    // Verificar se os anexos estão estruturados em subgrupos ou diretos
    const anexosAchatados: Record<string, unknown[]> = {};

    // Função para achatar a estrutura de anexos
    const flattenAttachments = (
      obj: Record<string, unknown>,
      prefix = ""
    ): void => {
      Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // É um array de anexos
          anexosAchatados[key] = value;
        } else if (value && typeof value === "object" && value !== null) {
          // É um objeto, verificar se tem subpropriedades
          const subObj = value as Record<string, unknown>;
          if (Object.values(subObj).some((v) => Array.isArray(v))) {
            // Tem arrays dentro, achatar recursivamente
            flattenAttachments(subObj, prefix ? `${prefix}.${key}` : key);
          } else {
            // Pode ser um objeto de anexo único, converter para array
            anexosAchatados[key] = [value];
          }
        } else if (value) {
          // Valor único que não é null/undefined, converter para array
          anexosAchatados[key] = [value];
        }
      });
    };

    // Achatar a estrutura de anexos
    flattenAttachments(anexosObj);

    console.log("📎 Anexos achatados:", anexosAchatados);

    Object.entries(categorias).forEach(([categoria, nomeAmigavel]) => {
      // Buscar anexos nesta categoria
      let anexosCategoria = anexosAchatados[categoria];

      // Se não encontrou com a chave direta, tentar variações
      if (!anexosCategoria) {
        // Tentar buscar nas estruturas aninhadas
        const possiveisChaves = [
          categoria,
          `conformidade.${categoria}`,
          `embarcacoes.${categoria}`,
          `icamento.${categoria}`,
          `dadosGerais.${categoria}`,
        ];

        for (const chave of possiveisChaves) {
          if (anexosObj[chave]) {
            anexosCategoria = Array.isArray(anexosObj[chave])
              ? (anexosObj[chave] as unknown[])
              : [anexosObj[chave]];
            break;
          }
        }
      }

      if (
        anexosCategoria &&
        Array.isArray(anexosCategoria) &&
        anexosCategoria.length > 0
      ) {
        temAnexos = true;
        console.log(
          `📎 Encontrados ${anexosCategoria.length} anexos para categoria: ${categoria}`
        );

        content += `
          <div class="anexo-categoria" style="page-break-inside: avoid;">
            <h3 class="anexo-categoria-titulo">📁 ${nomeAmigavel}</h3>
            <div class="anexo-lista">
        `;

        anexosCategoria.forEach(
          (
            anexo: {
              file?: { name?: string; size?: number };
              originalName?: string;
              fileName?: string;
              size?: number;
              uploadDate?: string;
            },
            index: number
          ) => {
            const nomeArquivo =
              anexo.originalName || anexo.fileName || `Arquivo ${index + 1}`;
            const tamanho = anexo.size ? this.formatFileSize(anexo.size) : "";
            const dataUpload = anexo.uploadDate
              ? new Date(anexo.uploadDate).toLocaleDateString("pt-BR")
              : "";

            content += `
            <div class="anexo-item">
              <div class="anexo-info">
                <span class="anexo-nome">📄 ${nomeArquivo}</span>
                ${
                  tamanho ? `<span class="anexo-tamanho">${tamanho}</span>` : ""
                }
                ${
                  dataUpload
                    ? `<span class="anexo-data">📅 ${dataUpload}</span>`
                    : ""
                }
              </div>
            </div>
          `;
          }
        );

        content += `
            </div>
          </div>
        `;
      }
    });

    if (!temAnexos) {
      content += `
        <div class="no-anexos">
          <p>📝 Nenhum documento foi anexado ao formulário.</p>
        </div>
      `;
    }

    content += "</div>";
    return content;
  }

  /**
   * Formata o tamanho do arquivo para exibição
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}
