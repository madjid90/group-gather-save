import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Building2, Globe, Briefcase, HelpCircle, Copy, Check, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SchemaPreview {
  type: string;
  data: object;
}

const DEFAULT_SCHEMAS = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Switchly",
    url: "https://switchly.fr",
    logo: "https://switchly.fr/favicon.png",
    description: "Plateforme d'achat groupé d'énergie",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "French"
    }
  },
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Switchly",
    url: "https://switchly.fr",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://switchly.fr/recherche?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  },
  service: {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Achat groupé d'énergie",
    description: "Service d'achat groupé pour négocier les meilleurs tarifs",
    provider: { "@type": "Organization", name: "Switchly" },
    areaServed: "France",
    serviceType: "Energy Buying Group"
  },
  localBusiness: {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Switchly",
    address: {
      "@type": "PostalAddress",
      addressCountry: "FR"
    },
    priceRange: "€"
  }
};

export const SchemaConfigPanel = () => {
  const { toast } = useToast();
  const [activeSchemas, setActiveSchemas] = useState<Record<string, boolean>>({
    organization: true,
    website: true,
    service: true,
    localBusiness: false
  });
  const [customSchemas, setCustomSchemas] = useState<Record<string, object>>(DEFAULT_SCHEMAS);
  const [previewSchema, setPreviewSchema] = useState<SchemaPreview | null>(null);
  const [copied, setCopied] = useState(false);

  const handleToggleSchema = (type: string) => {
    setActiveSchemas(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleCopySchema = async (schema: object) => {
    await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    toast({ title: "Copié", description: "Schema JSON-LD copié dans le presse-papier" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreview = (type: string) => {
    setPreviewSchema({ type, data: customSchemas[type] });
  };

  const schemaTypes = [
    { key: "organization", label: "Organization", icon: Building2, description: "Informations sur votre entreprise" },
    { key: "website", label: "WebSite", icon: Globe, description: "Données du site web" },
    { key: "service", label: "Service", icon: Briefcase, description: "Description des services offerts" },
    { key: "localBusiness", label: "LocalBusiness", icon: Building2, description: "Pour les entreprises locales" }
  ];

  const generateFullSchema = () => {
    const activeSchema = Object.entries(activeSchemas)
      .filter(([, active]) => active)
      .map(([type]) => customSchemas[type]);
    
    return JSON.stringify(activeSchema, null, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Schema.org / JSON-LD</h2>
          <p className="text-muted-foreground">Configurez les données structurées pour améliorer votre SEO</p>
        </div>
        <Button onClick={() => handleCopySchema(JSON.parse(generateFullSchema()))}>
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          Copier tout
        </Button>
      </div>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            FAQ Schema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {schemaTypes.map(({ key, label, icon: Icon, description }) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{label}</CardTitle>
                        <CardDescription className="text-sm">{description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={activeSchemas[key] ? "default" : "secondary"}>
                        {activeSchemas[key] ? "Actif" : "Inactif"}
                      </Badge>
                      <Switch
                        checked={activeSchemas[key]}
                        onCheckedChange={() => handleToggleSchema(key)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(key)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Voir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopySchema(customSchemas[key])}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu JSON-LD complet</CardTitle>
              <CardDescription>
                Ce code sera automatiquement injecté dans vos pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                {generateFullSchema()}
              </pre>
            </CardContent>
          </Card>

          {previewSchema && (
            <Card>
              <CardHeader>
                <CardTitle>Aperçu: {previewSchema.type}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {JSON.stringify(previewSchema.data, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>FAQ Schema Generator</CardTitle>
              <CardDescription>
                Les FAQ sont automatiquement extraites de la page /faq et converties en schema FAQPage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Le composant JsonLdSchema génère automatiquement le schema FAQPage 
                  lorsqu'il est utilisé sur la page FAQ avec les questions/réponses de votre FAQ.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Exemple de schema FAQ généré:</Label>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
{`{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Comment fonctionne l'achat groupé ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "L'achat groupé permet..."
      }
    }
  ]
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
