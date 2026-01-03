import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocalSeoPanel } from "@/components/seo/LocalSeoPanel";
import { SEORecommendationsPanel } from "@/components/seo/SEORecommendationsPanel";
import { CompetitorAnalysisPanel } from "@/components/seo/CompetitorAnalysisPanel";
import { Target, Lightbulb, MapPin } from "lucide-react";

const AdminSEO = () => {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="competitors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl">
          <TabsTrigger value="competitors" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Concurrents
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Recommandations IA
          </TabsTrigger>
          <TabsTrigger value="local" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Pages locales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="competitors">
          <CompetitorAnalysisPanel />
        </TabsContent>

        <TabsContent value="recommendations">
          <SEORecommendationsPanel />
        </TabsContent>

        <TabsContent value="local">
          <LocalSeoPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSEO;
