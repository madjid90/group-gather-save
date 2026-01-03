import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEODashboard } from "@/components/seo/SEODashboard";
import { ContentOptimizerDashboard } from "@/components/seo/ContentOptimizerDashboard";
import { TrackingConfigPanel } from "@/components/seo/TrackingConfigPanel";
import { SchemaConfigPanel } from "@/components/seo/SchemaConfigPanel";
import { SitemapPanel } from "@/components/seo/SitemapPanel";
import { BarChart3, Wand2, Settings2, Code, Map } from "lucide-react";

const AdminSEO = () => {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="optimizer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="optimizer" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Optimisation
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            Tracking
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Schema
          </TabsTrigger>
          <TabsTrigger value="sitemap" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            Sitemap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="optimizer">
          <ContentOptimizerDashboard />
        </TabsContent>

        <TabsContent value="audit">
          <SEODashboard />
        </TabsContent>

        <TabsContent value="tracking">
          <TrackingConfigPanel />
        </TabsContent>

        <TabsContent value="schema">
          <SchemaConfigPanel />
        </TabsContent>

        <TabsContent value="sitemap">
          <SitemapPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSEO;
