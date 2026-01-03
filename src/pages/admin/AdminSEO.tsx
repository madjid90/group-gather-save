import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocalSeoPanel } from "@/components/seo/LocalSeoPanel";
import { UnifiedSEOPanel } from "@/components/seo/UnifiedSEOPanel";
import { Sparkles, MapPin } from "lucide-react";

const AdminSEO = () => {
  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="intelligence" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-xl">
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Intelligence SEO & Conversion
          </TabsTrigger>
          <TabsTrigger value="local" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Pages locales
          </TabsTrigger>
        </TabsList>

        <TabsContent value="intelligence">
          <UnifiedSEOPanel />
        </TabsContent>

        <TabsContent value="local">
          <LocalSeoPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSEO;
