import { Search } from 'lucide-react';

const AdminSEO = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">SEO & Acquisition</h1>
        <p className="text-muted-foreground">
          Gestion SEO — pages locales et sitemap dynamique
        </p>
      </div>
      
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Search className="w-4 h-4" />
          Pages SEO locales
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Les pages locales sont générées automatiquement à partir de la table villes.
          Utilisez l'outil d'import pour ajouter des communes.
        </p>
        <div className="text-sm space-y-1 text-muted-foreground">
          <p>• <strong>/electricite/:slug</strong> — Pages électricité par ville</p>
          <p>• <strong>/gaz/:slug</strong> — Pages gaz par ville</p>
          <p>• Sitemap dynamique : <code>/functions/v1/sitemap</code></p>
        </div>
      </div>
    </div>
  );
};

export default AdminSEO;
