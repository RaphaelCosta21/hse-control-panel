import * as React from "react";
import { useState, useCallback } from "react";
import {
  ComboBox,
  IComboBoxOption,
  TextField,
  Stack,
  IconButton,
  Text,
  MessageBar,
  MessageBarType,
  Dropdown,
  IDropdownOption,
  PrimaryButton,
  DefaultButton,
} from "@fluentui/react";
import { IFieldRestriction } from "../types/IHSEFormEvaluation";
import {
  FORM_FIELDS_MAP,
  getCategories,
  getFieldsByCategory,
} from "../constants/FormFieldsMap";

interface IFieldRestrictionSelectorProps {
  restrictions: IFieldRestriction[];
  onRestrictionsChange: (restrictions: IFieldRestriction[]) => void;
  maxRestrictions?: number;
  onFormStateChange?: (isFormOpen: boolean) => void;
}

export const FieldRestrictionSelector: React.FC<
  IFieldRestrictionSelectorProps
> = ({
  restrictions,
  onRestrictionsChange,
  maxRestrictions = 3,
  onFormStateChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedField, setSelectedField] = useState<string>("");
  const [motivo, setMotivo] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Mostrar automaticamente o formulário quando não há restrições
  React.useEffect(() => {
    if (restrictions.length === 0) {
      setShowAddForm(true);
    }
  }, [restrictions.length]);

  // Notificar o componente pai quando o estado do formulário mudar
  React.useEffect(() => {
    if (onFormStateChange) {
      onFormStateChange(showAddForm);
    }
  }, [showAddForm, onFormStateChange]);

  // Opções de categoria para o dropdown
  const categoryOptions: IDropdownOption[] = getCategories().map((cat) => ({
    key: cat,
    text: cat,
  }));

  // Opções de campos baseado na categoria selecionada
  const fieldOptions: IComboBoxOption[] = selectedCategory
    ? getFieldsByCategory(selectedCategory).map((field) => ({
        key: field.id,
        text: field.nomeExibicao,
      }))
    : [];

  // Campos já selecionados (para evitar duplicatas)
  const selectedFieldIds = restrictions.map((r) => `${r.secao}.${r.campo}`);

  // Filtrar campos não selecionados
  const availableFieldOptions = fieldOptions.filter(
    (option) => !selectedFieldIds.includes(option.key as string)
  );

  const handleAddRestriction = useCallback(() => {
    if (
      !selectedField ||
      !motivo.trim() ||
      restrictions.length >= maxRestrictions
    ) {
      return;
    }

    const fieldInfo = FORM_FIELDS_MAP.find((f) => f.id === selectedField);
    if (!fieldInfo) return;

    const newRestriction: IFieldRestriction = {
      id: restrictions.length + 1,
      secao: fieldInfo.secao,
      campo: fieldInfo.campo,
      nomeExibicao: fieldInfo.nomeExibicao,
      motivo: motivo.trim(),
    };

    onRestrictionsChange([...restrictions, newRestriction]);

    // Limpar campos
    setSelectedField("");
    setMotivo("");
    setSelectedCategory("");

    // Ocultar o formulário após adicionar
    setShowAddForm(false);
  }, [
    selectedField,
    motivo,
    restrictions,
    onRestrictionsChange,
    maxRestrictions,
  ]);

  const handleRemoveRestriction = useCallback(
    (index: number) => {
      const updatedRestrictions = restrictions.filter((_, i) => i !== index);
      // Reatribuir IDs sequenciais
      const reindexedRestrictions = updatedRestrictions.map(
        (restriction, i) => ({
          ...restriction,
          id: i + 1,
        })
      );
      onRestrictionsChange(reindexedRestrictions);
    },
    [restrictions, onRestrictionsChange]
  );

  const canAddRestriction =
    selectedField && motivo.trim() && restrictions.length < maxRestrictions;

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <Text variant="mediumPlus" styles={{ root: { fontWeight: 600 } }}>
        Campos com Restrições ({restrictions.length}/{maxRestrictions})
      </Text>

      {restrictions.length >= maxRestrictions && (
        <MessageBar messageBarType={MessageBarType.info}>
          Limite máximo de {maxRestrictions} restrições atingido.
        </MessageBar>
      )}

      {/* Lista de restrições existentes */}
      {restrictions.map((restriction, index) => (
        <Stack
          key={restriction.id}
          horizontal
          verticalAlign="start"
          tokens={{ childrenGap: 12 }}
          styles={{
            root: {
              padding: 12,
              border: "1px solid #e1dfdd",
              borderRadius: 4,
              backgroundColor: "#faf9f8",
            },
          }}
        >
          <Stack grow tokens={{ childrenGap: 4 }}>
            <Text
              variant="small"
              styles={{ root: { fontWeight: 600, color: "#323130" } }}
            >
              {restriction.nomeExibicao}
            </Text>
            <Text variant="small" styles={{ root: { color: "#605e5c" } }}>
              {restriction.motivo}
            </Text>
          </Stack>
          <IconButton
            iconProps={{ iconName: "Delete" }}
            title="Remover restrição"
            ariaLabel="Remover restrição"
            onClick={() => handleRemoveRestriction(index)}
            styles={{
              root: { color: "#d13438" },
              rootHovered: { backgroundColor: "#fdf3f4" },
            }}
          />
        </Stack>
      ))}

      {/* Botão para adicionar nova restrição (só mostra se há restrições e não atingiu o limite) */}
      {restrictions.length > 0 &&
        restrictions.length < maxRestrictions &&
        !showAddForm && (
          <Stack horizontal horizontalAlign="start">
            <PrimaryButton
              text="Adicionar outra restrição"
              iconProps={{ iconName: "Add" }}
              onClick={() => setShowAddForm(true)}
            />
          </Stack>
        )}

      {/* Formulário para adicionar nova restrição */}
      {showAddForm && restrictions.length < maxRestrictions && (
        <Stack
          tokens={{ childrenGap: 12 }}
          styles={{
            root: {
              padding: 16,
              border: "1px dashed #c8c6c4",
              borderRadius: 4,
              backgroundColor: "#f3f2f1",
            },
          }}
        >
          <Text variant="medium" styles={{ root: { fontWeight: 600 } }}>
            {restrictions.length === 0
              ? "Adicionar Restrição"
              : "Adicionar Nova Restrição"}
          </Text>

          <Dropdown
            placeholder="Selecione a categoria"
            label="Categoria"
            options={categoryOptions}
            selectedKey={selectedCategory}
            onChange={(_, option) => {
              setSelectedCategory((option?.key as string) || "");
              setSelectedField(""); // Limpar campo selecionado
            }}
            required
          />

          {selectedCategory && (
            <ComboBox
              label="Campo"
              placeholder="Selecione o campo específico"
              options={availableFieldOptions}
              selectedKey={selectedField}
              onChange={(_, option) =>
                setSelectedField((option?.key as string) || "")
              }
              allowFreeform={false}
              autoComplete="on"
              required
            />
          )}

          <TextField
            label="Motivo da Restrição"
            placeholder="Descreva por que este campo precisa ser corrigido..."
            multiline
            rows={3}
            value={motivo}
            onChange={(_, value) => setMotivo(value || "")}
            required
          />

          <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 8 }}>
            {restrictions.length > 0 && (
              <DefaultButton
                text="Cancelar"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedCategory("");
                  setSelectedField("");
                  setMotivo("");
                }}
              />
            )}
            <PrimaryButton
              text="Adicionar Restrição"
              iconProps={{ iconName: "Add" }}
              onClick={handleAddRestriction}
              disabled={!canAddRestriction}
            />
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
