import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEODashboard } from "@/components/seo/SEODashboard";
import { ContentOptimizerDashboard } from "@/components/seo/ContentOptimizerDashboard";
import { BarChart3, Wand2 } from "lucide-react";

const AdminSEO = () => {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="optimizer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="optimizer" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Optimisation
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Audit SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="optimizer">
          <ContentOptimizerDashboard />
        </TabsContent>

        <TabsContent value="audit">
          <SEODashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSEO;
