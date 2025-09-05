import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useConfig } from "./ConfigProvider";
import { TransformerList } from "./TransformerList";
import { useThemeStyles } from "@/hooks/useThemeStyles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Transformers() {
  const { t } = useTranslation();
  const { config, setConfig } = useConfig();
  const styles = useThemeStyles();
  const [editingTransformerIndex, setEditingTransformerIndex] = useState<number | null>(null);
  const [deletingTransformerIndex, setDeletingTransformerIndex] = useState<number | null>(null);
  const [newTransformer, setNewTransformer] = useState<{ name?: string; path: string; options: { [key: string]: string } } | null>(null);

  // Handle case where config is null or undefined
  if (!config) {
    return (
      <Card className={styles.cardWithHeader}>
        <CardHeader className={`${styles.header} flex flex-row items-center justify-between`}>
          <CardTitle className={styles.title}>{t("transformers.title")}</CardTitle>
        </CardHeader>
        <CardContent className={`${styles.content} flex-grow flex items-center justify-center`}>
          <div className={styles.text.secondary}>Loading transformers configuration...</div>
        </CardContent>
      </Card>
    );
  }

  // Validate config.Transformers to ensure it's an array
  const validTransformers = Array.isArray(config.transformers) ? config.transformers : [];

  const handleAddTransformer = () => {
    const newTransformer = { name: "", path: "",  options: {} };
    setNewTransformer(newTransformer);
    setEditingTransformerIndex(validTransformers.length); // Use the length as index for the new item
  };

  const handleRemoveTransformer = (index: number) => {
    const newTransformers = [...validTransformers];
    newTransformers.splice(index, 1);
    setConfig({ ...config, transformers: newTransformers });
    setDeletingTransformerIndex(null);
  };

  const handleTransformerChange = (index: number, field: string, value: string, parameterKey?: string) => {
    if (index < validTransformers.length) {
      // Editing an existing transformer
      const newTransformers = [...validTransformers];
      if (parameterKey !== undefined) {
        newTransformers[index].options![parameterKey] = value;
      } else {
        (newTransformers[index] as unknown as Record<string, unknown>)[field] = value;
      }
      setConfig({ ...config, transformers: newTransformers });
    } else {
      // Editing the new transformer
      if (newTransformer) {
        const updatedTransformer = { ...newTransformer };
        if (parameterKey !== undefined) {
          updatedTransformer.options![parameterKey] = value;
        } else {
          (updatedTransformer as Record<string, unknown>)[field] = value;
        }
        setNewTransformer(updatedTransformer);
      }
    }
  };

  const editingTransformer = editingTransformerIndex !== null ? 
    (editingTransformerIndex < validTransformers.length ? 
      validTransformers[editingTransformerIndex] : 
      newTransformer) : 
    null;

  const handleSaveTransformer = () => {
    if (newTransformer && editingTransformerIndex === validTransformers.length) {
      // Saving a new transformer
      const newTransformers = [...validTransformers, newTransformer];
      setConfig({ ...config, transformers: newTransformers });
    }
    // Close the dialog
    setEditingTransformerIndex(null);
    setNewTransformer(null);
  };

  const handleCancelTransformer = () => {
    // Close the dialog without saving
    setEditingTransformerIndex(null);
    setNewTransformer(null);
  };

  return (
    <Card className={styles.cardWithHeader}>
      <CardHeader className={`${styles.header} flex flex-row items-center justify-between`}>
        <CardTitle className={styles.title}>
          {t("transformers.title")} 
          <span className={`text-sm font-normal ${styles.text.secondary}`}>
            ({validTransformers.length})
          </span>
        </CardTitle>
        <Button 
          onClick={handleAddTransformer}
          className={styles.button('primary')}
        >
          {t("transformers.add")}
        </Button>
      </CardHeader>
      <CardContent className={`${styles.content} flex-grow overflow-y-auto`}>
        <TransformerList
          transformers={validTransformers}
          onEdit={setEditingTransformerIndex}
          onRemove={setDeletingTransformerIndex}
        />
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editingTransformerIndex !== null} onOpenChange={handleCancelTransformer}>
        <DialogContent 
          className={styles.dialog}
          style={styles.dialogStyle}
        >
          <DialogHeader>
            <DialogTitle>{t("transformers.edit")}</DialogTitle>
          </DialogHeader>
          {editingTransformer && editingTransformerIndex !== null && (
            <div className="space-y-4 py-4 px-6 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="transformer-path">{t("transformers.path")}</Label>
                <Input 
                  id="transformer-path" 
                  value={editingTransformer.path || ''} 
                  onChange={(e) => handleTransformerChange(editingTransformerIndex, "path", e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("transformers.parameters")}</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const parameters = editingTransformer.options || {};
                      const newKey = `param${Object.keys(parameters).length + 1}`;
                      if (editingTransformerIndex !== null) {
                        const newParameters = { ...parameters, [newKey]: "" };
                        if (editingTransformerIndex < validTransformers.length) {
                          const newTransformers = [...validTransformers];
                          newTransformers[editingTransformerIndex].options = newParameters;
                          setConfig({ ...config, transformers: newTransformers });
                        } else if (newTransformer) {
                          setNewTransformer({ ...newTransformer, options: newParameters });
                        }
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {Object.entries(editingTransformer.options || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Input 
                      value={key} 
                      onChange={(e) => {
                        const parameters = editingTransformer.options || {};
                        const newParameters = { ...parameters };
                        delete newParameters[key];
                        newParameters[e.target.value] = value;
                        if (editingTransformerIndex !== null) {
                          if (editingTransformerIndex < validTransformers.length) {
                            const newTransformers = [...validTransformers];
                            newTransformers[editingTransformerIndex].options = newParameters;
                            setConfig({ ...config, transformers: newTransformers });
                          } else if (newTransformer) {
                            setNewTransformer({ ...newTransformer, options: newParameters });
                          }
                        }
                      }}
                      className="flex-1"
                    />
                    <Input 
                      value={value} 
                      onChange={(e) => {
                        if (editingTransformerIndex !== null) {
                          handleTransformerChange(editingTransformerIndex, "parameters", e.target.value, key);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (editingTransformerIndex !== null) {
                          const parameters = editingTransformer.options || {};
                          const newParameters = { ...parameters };
                          delete newParameters[key];
                          if (editingTransformerIndex < validTransformers.length) {
                            const newTransformers = [...validTransformers];
                            newTransformers[editingTransformerIndex].options = newParameters;
                            setConfig({ ...config, transformers: newTransformers });
                          } else if (newTransformer) {
                            setNewTransformer({ ...newTransformer, options: newParameters });
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelTransformer}>{t("app.cancel")}</Button>
            <Button onClick={handleSaveTransformer}>{t("app.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingTransformerIndex !== null} onOpenChange={() => setDeletingTransformerIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("transformers.delete")}</DialogTitle>
            <DialogDescription>
              {t("transformers.delete_transformer_confirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTransformerIndex(null)}>{t("app.cancel")}</Button>
            <Button variant="destructive" onClick={() => deletingTransformerIndex !== null && handleRemoveTransformer(deletingTransformerIndex)}>{t("app.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
