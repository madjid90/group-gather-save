import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SEOSettings {
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  keywords: string[] | null;
  robots: string | null;
}

interface DynamicSEOHeadProps {
  defaultTitle?: string;
  defaultDescription?: string;
}

export function DynamicSEOHead({ 
  defaultTitle = 'Switchly - Achat groupé énergie et internet',
  defaultDescription = 'Rejoignez l\'achat groupé pour économiser sur vos contrats énergie et internet'
}: DynamicSEOHeadProps) {
  const location = useLocation();
  const [settings, setSettings] = useState<SEOSettings | null>(null);

  useEffect(() => {
    const fetchSEOSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('seo_page_settings')
          .select('meta_title, meta_description, og_title, og_description, og_image, canonical_url, keywords, robots')
          .eq('page_url', location.pathname)
          .eq('is_active', true)
          .single();

        if (!error && data) {
          setSettings(data as SEOSettings);
        } else {
          setSettings(null);
        }
      } catch (error) {
        console.error('Error fetching SEO settings:', error);
        setSettings(null);
      }
    };

    fetchSEOSettings();
  }, [location.pathname]);

  const title = settings?.meta_title || defaultTitle;
  const description = settings?.meta_description || defaultDescription;
  const ogTitle = settings?.og_title || title;
  const ogDescription = settings?.og_description || description;
  const ogImage = settings?.og_image || 'https://switchly.fr/og-image.png';
  const canonical = settings?.canonical_url || `https://switchly.fr${location.pathname}`;
  const robots = settings?.robots || 'index, follow';
  const keywords = settings?.keywords?.join(', ') || '';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
