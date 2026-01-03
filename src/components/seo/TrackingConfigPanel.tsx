import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, BarChart3, Target, Eye, Search, Settings2 } from "lucide-react";
import { useSEOConfig } from "@/hooks/useSEOConfig";

const ICON_MAP: Record<string, React.ReactNode> = {
  ga4_measurement_id: <BarChart3 className="w-5 h-5" />,
  meta_pixel_id: <Target className="w-5 h-5" />,
  google_ads_id: <Target className="w-5 h-5" />,
  tiktok_pixel_id: <Target className="w-5 h-5" />,
  clarity_project_id: <Eye className="w-5 h-5" />,
  gsc_verification: <Search className="w-5 h-5" />
};

const CATEGORY_MAP: Record<string, string> = {
  ga4_measurement_id: 'analytics',
  meta_pixel_id: 'pixel',
  google_ads_id: 'pixel',
  tiktok_pixel_id: 'pixel',
  clarity_project_id: 'analytics',
  gsc_verification: 'seo'
};

export const TrackingConfigPanel = () => {
  const { configs, loading, saving, updateConfig, toggleConfig, getConfigLabel } = useSEOConfig();
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const analyticsConfigs = configs.filter(c => CATEGORY_MAP[c.config_key] === 'analytics');
  const pixelConfigs = configs.filter(c => CATEGORY_MAP[c.config_key] === 'pixel');
  const seoConfigs = configs.filter(c => CATEGORY_MAP[c.config_key] === 'seo');

  const handleSave = async (configKey: string, isActive: boolean) => {
    const value = editValues[configKey] ?? configs.find(c => c.config_key === configKey)?.config_value ?? '';
    await updateConfig(configKey, value, isActive);
  };

  const renderConfigCard = (config: typeof configs[0]) => {
    const { label, description, placeholder } = getConfigLabel(config.config_key);
    const currentValue = editValues[config.config_key] ?? config.config_value ?? '';
    const hasChanges = editValues[config.config_key] !== undefined && 
                       editValues[config.config_key] !== (config.config_value ?? '');

    return (
      <Card key={config.id} className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {ICON_MAP[config.config_key] || <Settings2 className="w-5 h-5" />}
              </div>
              <div>
                <CardTitle className="text-base">{label}</CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={config.is_active ? "default" : "secondary"}>
                {config.is_active ? "Actif" : "Inactif"}
              </Badge>
              <Switch
                checked={config.is_active}
                onCheckedChange={() => toggleConfig(config.config_key)}
                disabled={!config.config_value}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder={placeholder}
              value={currentValue}
              onChange={(e) => setEditValues(prev => ({ 
                ...prev, 
                [config.config_key]: e.target.value 
              }))}
              className="font-mono text-sm"
            />
            <Button
              size="sm"
              onClick={() => handleSave(config.config_key, config.is_active)}
              disabled={saving || !hasChanges}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Analytics & Heatmaps</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {analyticsConfigs.map(renderConfigCard)}
        </div>
      </div>

      {/* Pixels Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Pixels Publicitaires</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pixelConfigs.map(renderConfigCard)}
        </div>
      </div>

      {/* SEO Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Outils SEO</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {seoConfigs.map(renderConfigCard)}
        </div>
      </div>
    </div>
  );
};
