import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useConfig } from "./ConfigProvider";
import { Combobox } from "./ui/combobox";

export function Router() {
  const { t } = useTranslation();
  const { config, setConfig } = useConfig();

  if (!config) {
    return null;
  }

  const handleRouterChange = (field: string, value: string) => {
    const newRouter = { ...config.Router, [field]: value };
    setConfig({ ...config, Router: newRouter });
  };

  const modelOptions = config.Providers.flatMap((provider) =>
    provider.models.map((model) => ({
      value: `${provider.name},${model}`,
      label: `${provider.name}, ${model}`,
    }))
  );

  return (
    <Card className="flex h-full flex-col rounded-lg border shadow-sm">
      <CardHeader className="border-b p-4">
        <CardTitle className="text-lg">{t("router.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-5 overflow-y-auto p-4">
        <div className="space-y-2">
          <Label>{t("router.default")}</Label>
          <Combobox
            options={modelOptions}
            value={config.Router.default}
            onChange={(value) => handleRouterChange("default", value)}
            placeholder={t("router.selectModel")}
            searchPlaceholder={t("router.searchModel")}
            emptyPlaceholder={t("router.noModelFound")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("router.background")}</Label>
          <Combobox
            options={modelOptions}
            value={config.Router.background}
            onChange={(value) => handleRouterChange("background", value)}
            placeholder={t("router.selectModel")}
            searchPlaceholder={t("router.searchModel")}
            emptyPlaceholder={t("router.noModelFound")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("router.think")}</Label>
          <Combobox
            options={modelOptions}
            value={config.Router.think}
            onChange={(value) => handleRouterChange("think", value)}
            placeholder={t("router.selectModel")}
            searchPlaceholder={t("router.searchModel")}
            emptyPlaceholder={t("router.noModelFound")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("router.longContext")}</Label>
          <Combobox
            options={modelOptions}
            value={config.Router.longContext}
            onChange={(value) => handleRouterChange("longContext", value)}
            placeholder={t("router.selectModel")}
            searchPlaceholder={t("router.searchModel")}
            emptyPlaceholder={t("router.noModelFound")}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("router.webSearch")}</Label>
          <Combobox
            options={modelOptions}
            value={config.Router.webSearch}
            onChange={(value) => handleRouterChange("webSearch", value)}
            placeholder={t("router.selectModel")}
            searchPlaceholder={t("router.searchModel")}
            emptyPlaceholder={t("router.noModelFound")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
