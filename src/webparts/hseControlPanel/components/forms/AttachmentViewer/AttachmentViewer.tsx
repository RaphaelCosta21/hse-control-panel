import * as React from "react";
import {
  Stack,
  Text,
  DefaultButton,
  DetailsList,
  IColumn,
  CommandBar,
  ICommandBarItemProps,
  SearchBox,
  Dropdown,
  MessageBar,
  MessageBarType,
  Icon,
} from "@fluentui/react";
import { IAttachmentMetadata } from "../../../types/IAttachmentMetadata";
import styles from "./AttachmentViewer.module.scss";

export interface IAttachmentViewerProps {
  attachments: { [category: string]: IAttachmentMetadata[] };
  formId: number;
  companyName: string;
  onDownloadAll?: () => void;
  onDownloadFile?: (attachment: IAttachmentMetadata) => void;
  onPreviewFile?: (attachment: IAttachmentMetadata) => void;
  className?: string;
}

const AttachmentViewer: React.FC<IAttachmentViewerProps> = ({
  attachments,
  formId,
  companyName,
  onDownloadAll,
  onDownloadFile,
  onPreviewFile,
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    React.useState<string>("Todas");

  // Helper function for formatting file sizes
  const formatFileSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Flatten all attachments with category info
  const allAttachments = React.useMemo(() => {
    console.log("AttachmentViewer - Processing attachments:", attachments);
    const flattened: (IAttachmentMetadata & { category: string })[] = [];

    // Safety check for attachments
    if (!attachments || typeof attachments !== "object") {
      console.log(
        "AttachmentViewer - No attachments or invalid type:",
        typeof attachments
      );
      return flattened;
    }

    try {
      const categories = Object.keys(attachments);
      console.log("AttachmentViewer - Categories found:", categories);

      categories.forEach((category) => {
        const files = attachments[category];
        console.log(`AttachmentViewer - Files in category ${category}:`, files);

        if (Array.isArray(files)) {
          files.forEach((file, index) => {
            console.log(`AttachmentViewer - Processing file ${index}:`, file);
            console.log(`AttachmentViewer - File type:`, typeof file);
            console.log(
              `AttachmentViewer - File keys:`,
              Object.keys(file || {})
            );

            if (file && typeof file === "object") {
              // Extração das propriedades do arquivo baseada na estrutura real
              const fileObj = file as unknown as Record<string, unknown>;

              // Extrair nome do arquivo
              let fileName = "Arquivo desconhecido";
              if (fileObj.fileName) fileName = String(fileObj.fileName);
              else if (fileObj.originalName)
                fileName = String(fileObj.originalName);
              else if (fileObj.name) fileName = String(fileObj.name);

              // Extrair tamanho do arquivo
              let fileSize = 0;
              if (fileObj.fileSize) fileSize = Number(fileObj.fileSize);
              else if (fileObj.size) fileSize = Number(fileObj.size);

              // Extrair tipo do arquivo
              let fileType = "unknown";
              if (fileObj.fileType) fileType = String(fileObj.fileType);
              else if (fileObj.type) fileType = String(fileObj.type);
              else if (fileName.indexOf(".") >= 0) {
                const ext = fileName.split(".").pop();
                fileType = `file/${ext}`;
              }

              // Extrair URL do arquivo
              let fileUrl = "";
              if (fileObj.url) fileUrl = String(fileObj.url);

              // Extrair data de upload
              let uploadDate = new Date();
              if (fileObj.uploadDate)
                uploadDate = new Date(String(fileObj.uploadDate));
              else if (fileObj.uploadedDate)
                uploadDate = new Date(String(fileObj.uploadedDate));

              // ID do arquivo
              let fileId = "";
              if (fileObj.id) fileId = String(fileObj.id);

              // Categoria (já vem do loop principal)
              const fileCategory = String(fileObj.category || category);

              console.log(
                `AttachmentViewer - Extracted data for file ${index}:`,
                {
                  fileId,
                  fileName,
                  fileSize,
                  fileType,
                  fileUrl,
                  uploadDate,
                  fileCategory,
                }
              );

              flattened.push({
                id: fileId,
                name: fileName,
                size: fileSize,
                type: fileType,
                url: fileUrl,
                category: fileCategory,
                uploadedDate: uploadDate,
                uploadedBy: "Sistema",
                description: `Arquivo ${fileName} da categoria ${fileCategory}`,
              });
              console.log(
                "AttachmentViewer - File added to flattened array with name:",
                fileName
              );
            } else {
              console.log("AttachmentViewer - File skipped, invalid:", file);
            }
          });
        } else if (files && typeof files === "object") {
          // Se não for array, mas for objeto, tenta processar como objeto único
          console.log(
            `AttachmentViewer - Category ${category} is an object, not array:`,
            files
          );
          console.log(`AttachmentViewer - Object keys:`, Object.keys(files));

          const fileName = "Arquivo único";
          flattened.push({
            name: fileName,
            size: 0,
            type: "unknown",
            category,
            uploadedDate: new Date(),
            uploadedBy: "Sistema",
            description: "Processado como objeto único",
          });
        } else {
          console.log(
            `AttachmentViewer - Category ${category} is not an array or object:`,
            files
          );
        }
      });
    } catch (error) {
      console.error("Error processing attachments:", error);
    }

    console.log("AttachmentViewer - Final flattened array:", flattened);
    console.log(
      "AttachmentViewer - Final flattened array length:",
      flattened.length
    );
    return flattened;
  }, [attachments]);

  // Filter attachments based on search and category
  const filteredAttachments = React.useMemo(() => {
    return allAttachments.filter((attachment) => {
      const matchesSearch =
        searchTerm === "" ||
        (attachment.name &&
          attachment.name.toLowerCase().indexOf(searchTerm.toLowerCase()) >=
            0) ||
        (attachment.category &&
          attachment.category.toLowerCase().indexOf(searchTerm.toLowerCase()) >=
            0);

      const matchesCategory =
        selectedCategory === "Todas" ||
        attachment.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allAttachments, searchTerm, selectedCategory]);

  const categories = React.useMemo(() => {
    const categoryList = allAttachments.map((a) => a.category).filter(Boolean);
    const uniqueCategories: string[] = [];
    categoryList.forEach((cat: string) => {
      if (uniqueCategories.indexOf(cat) === -1) {
        uniqueCategories.push(cat);
      }
    });

    return [
      { key: "Todas", text: "Todas Categorias" },
      ...uniqueCategories.map((cat: string) => ({ key: cat, text: cat })),
    ];
  }, [allAttachments]);

  const commandBarItems: ICommandBarItemProps[] = [
    {
      key: "downloadAll",
      text: "Baixar Todos",
      iconProps: { iconName: "Download" },
      onClick: onDownloadAll,
      disabled: allAttachments.length === 0,
    },
    {
      key: "refresh",
      text: "Atualizar",
      iconProps: { iconName: "Refresh" },
      onClick: () => window.location.reload(),
    },
  ];

  const columns: IColumn[] = [
    {
      key: "icon",
      name: "",
      fieldName: "icon",
      minWidth: 30,
      maxWidth: 30,
      onRender: (item: IAttachmentMetadata & { category: string }) => {
        if (!item.name)
          return <Icon iconName="Document" className={styles.fileIcon} />;

        const extension = item.name.split(".").pop()?.toLowerCase();
        let iconName = "Document";

        switch (extension) {
          case "pdf":
            iconName = "PDF";
            break;
          case "doc":
          case "docx":
            iconName = "WordDocument";
            break;
          case "xls":
          case "xlsx":
            iconName = "ExcelDocument";
            break;
          case "jpg":
          case "jpeg":
          case "png":
            iconName = "FileImage";
            break;
          default:
            iconName = "Document";
        }

        return <Icon iconName={iconName} className={styles.fileIcon} />;
      },
    },
    {
      key: "fileName",
      name: "Arquivo",
      fieldName: "fileName",
      minWidth: 200,
      maxWidth: 300,
      isResizable: true,
      onRender: (item: IAttachmentMetadata & { category: string }) => (
        <div className={styles.fileNameCell}>
          <Text variant="medium" block>
            {item.name || "Nome não disponível"}
          </Text>
          <Text
            variant="small"
            styles={{ root: { color: "var(--neutral-foreground-2)" } }}
          >
            {item.description || item.category || "Sem descrição"}
          </Text>
        </div>
      ),
    },
    {
      key: "category",
      name: "Categoria",
      fieldName: "category",
      minWidth: 120,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: IAttachmentMetadata & { category: string }) => (
        <Text variant="medium">{item.category || "Sem categoria"}</Text>
      ),
    },
    {
      key: "size",
      name: "Tamanho",
      fieldName: "size",
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      onRender: (item: IAttachmentMetadata & { category: string }) => (
        <Text variant="medium">{formatFileSize(item.size || 0)}</Text>
      ),
    },
    {
      key: "uploadedDate",
      name: "Data",
      fieldName: "uploadedDate",
      minWidth: 100,
      maxWidth: 120,
      isResizable: true,
      onRender: (item: IAttachmentMetadata & { category: string }) => (
        <Text variant="medium">
          {item.uploadedDate
            ? new Date(item.uploadedDate.toString()).toLocaleDateString("pt-BR")
            : "N/A"}
        </Text>
      ),
    },
    {
      key: "actions",
      name: "Ações",
      fieldName: "actions",
      minWidth: 120,
      maxWidth: 120,
      onRender: (item: IAttachmentMetadata & { category: string }) => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <DefaultButton
            iconProps={{ iconName: "Download" }}
            title="Baixar"
            onClick={() => {
              if (item.url) {
                // Se a URL é relativa, construir URL completa
                let fullUrl = item.url;
                if (item.url.indexOf("/") === 0) {
                  // Assumindo que é um SharePoint, pegar o domínio atual
                  fullUrl = window.location.origin + item.url;
                }
                console.log("Download - Opening URL:", fullUrl);
                window.open(fullUrl, "_blank");
              } else {
                console.log("Download - URL não encontrada para:", item);
                onDownloadFile?.(item);
              }
            }}
            styles={{ root: { minWidth: "auto", padding: "4px 8px" } }}
          />
          <DefaultButton
            iconProps={{ iconName: "View" }}
            title="Visualizar"
            onClick={() => {
              if (item.url) {
                // Se a URL é relativa, construir URL completa
                let fullUrl = item.url;
                if (item.url.indexOf("/") === 0) {
                  // Assumindo que é um SharePoint, pegar o domínio atual
                  fullUrl = window.location.origin + item.url;
                }
                console.log("Preview - Opening URL:", fullUrl);
                window.open(fullUrl, "_blank");
              } else {
                console.log("Preview - URL não encontrada para:", item);
                onPreviewFile?.(item);
              }
            }}
            styles={{ root: { minWidth: "auto", padding: "4px 8px" } }}
          />
        </Stack>
      ),
    },
  ];

  const getTotalSize = (): string => {
    const totalBytes = allAttachments.reduce(
      (sum, att) => sum + (att.size || 0),
      0
    );
    return formatFileSize(totalBytes);
  };

  if (allAttachments.length === 0) {
    return (
      <div
        className={`${styles.attachmentViewer} ${className}`}
        style={{
          backgroundColor: "#ffffff",
          padding: "24px",
          borderRadius: "8px",
          border: "1px solid #e1e5ea",
        }}
      >
        <MessageBar messageBarType={MessageBarType.info}>
          📎 Nenhum anexo encontrado para este formulário.
        </MessageBar>
      </div>
    );
  }

  try {
    return (
      <div
        className={`${styles.attachmentViewer} ${className}`}
        style={{
          backgroundColor: "#ffffff",
          padding: "24px",
          borderRadius: "8px",
          border: "1px solid #e1e5ea",
        }}
      >
        <Stack tokens={{ childrenGap: 16 }}>
          {/* Header */}
          <Stack
            horizontal
            horizontalAlign="space-between"
            verticalAlign="center"
          >
            <div>
              <Text variant="xLarge" block>
                📎 Anexos - {companyName || "Empresa"}
              </Text>
              <Text
                variant="medium"
                styles={{ root: { color: "var(--neutral-foreground-2)" } }}
              >
                {allAttachments.length} arquivo(s) | {getTotalSize()} total
              </Text>
            </div>
            <CommandBar items={commandBarItems} />
          </Stack>

          {/* Filters */}
          <Stack horizontal tokens={{ childrenGap: 12 }}>
            <SearchBox
              placeholder="Buscar arquivo..."
              value={searchTerm}
              onChange={(_, value) => setSearchTerm(value || "")}
              onClear={() => setSearchTerm("")}
              styles={{ root: { width: 300 } }}
            />
            <Dropdown
              options={categories}
              selectedKey={selectedCategory}
              onChange={(_, option) =>
                setSelectedCategory(option?.key as string)
              }
              styles={{ dropdown: { width: 180 } }}
            />
          </Stack>

          {/* Files List */}
          <div className={styles.filesContainer}>
            <DetailsList
              items={filteredAttachments}
              columns={columns}
              setKey="attachments"
              layoutMode={1} // DetailsListLayoutMode.justified
              selectionMode={0} // SelectionMode.none
              className={styles.filesList}
            />
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <Text variant="small">
              📊 Mostrando {filteredAttachments.length} de{" "}
              {allAttachments.length} arquivo(s)
              {selectedCategory !== "Todas" &&
                ` na categoria "${selectedCategory}"`}
            </Text>
          </div>
        </Stack>
      </div>
    );
  } catch (error) {
    console.error("Error rendering AttachmentViewer:", error);
    return (
      <div
        className={`${styles.attachmentViewer} ${className}`}
        style={{
          backgroundColor: "#ffffff",
          padding: "24px",
          borderRadius: "8px",
          border: "1px solid #e1e5ea",
        }}
      >
        <MessageBar messageBarType={MessageBarType.error}>
          ❌ Erro ao carregar anexos. Por favor, tente novamente.
        </MessageBar>
      </div>
    );
  }
};

export default AttachmentViewer;
