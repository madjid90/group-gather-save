import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageByPageAnalysis } from '@/components/seo/PageByPageAnalysis';
import { LocalSeoPanel } from '@/components/seo/LocalSeoPanel';
import { Globe, Search } from 'lucide-react';

const AdminSEO = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">SEO & Acquisition</h1>
        <p className="text-muted-foreground">
          Analyse page par page avec scraping et recommandations IA section par section
        </p>
      </div>
      
      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pages" className="gap-2">
            <Search className="w-4 h-4" />
            Analyse par page
          </TabsTrigger>
          <TabsTrigger value="local" className="gap-2">
            <Globe className="w-4 h-4" />
            Pages locales
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pages">
          <PageByPageAnalysis />
        </TabsContent>
        
        <TabsContent value="local">
          <LocalSeoPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSEO;
