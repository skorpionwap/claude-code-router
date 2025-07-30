import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Provider } from "./ConfigProvider";

interface ProviderListProps {
  providers: Provider[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

export function ProviderList({ providers, onEdit, onRemove }: ProviderListProps) {
  return (
    <div className="space-y-3">
      {providers.map((provider, index) => (
        <div key={index} className="flex items-start justify-between rounded-md border bg-white p-4 transition-all hover:shadow-md animate-slide-in hover:scale-[1.01]">
          <div className="flex-1 space-y-1.5">
            <p className="text-md font-semibold text-gray-800">{provider.name}</p>
            <p className="text-sm text-gray-500">{provider.api_base_url}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {provider.models.map((model) => (
                <Badge key={model} variant="outline" className="font-normal transition-all-ease hover:scale-105">{model}</Badge>
              ))}
            </div>
          </div>
          <div className="ml-4 flex flex-shrink-0 items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(index)} className="transition-all-ease hover:scale-110">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => onRemove(index)} className="transition-all duration-200 hover:scale-110">
              <Trash2 className="h-4 w-4 text-current transition-colors duration-200" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}