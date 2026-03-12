import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface OrganizationSchema {
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    "@type": "ContactPoint";
    telephone?: string;
    contactType: string;
    availableLanguage: string;
  };
  sameAs?: string[];
}

interface WebSiteSchema {
  "@type": "WebSite";
  name: string;
  url: string;
  potentialAction?: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
}

interface ServiceSchema {
  "@type": "Service";
  name: string;
  description: string;
  provider: { "@type": "Organization"; name: string };
  areaServed?: string;
  serviceType?: string;
}

interface FAQSchema {
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

interface BreadcrumbSchema {
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

interface WebPageSchema {
  "@type": "WebPage";
  name: string;
  description?: string;
  url: string;
  isPartOf?: { "@type": "WebSite"; name: string; url: string };
}

type SchemaType = OrganizationSchema | WebSiteSchema | ServiceSchema | FAQSchema | BreadcrumbSchema | WebPageSchema;

interface JsonLdSchemaProps {
  type?: "organization" | "website" | "service" | "faq" | "breadcrumb" | "webpage" | "auto";
  customData?: Partial<SchemaType>;
  faqItems?: Array<{ question: string; answer: string }>;
  breadcrumbs?: Array<{ name: string; url?: string }>;
}

const SITE_CONFIG = {
  name: "Switchly",
  url: "https://switchly.fr",
  description: "Comparateur gratuit d'électricité et de gaz. Comparez les meilleures offres en 30 secondes et économisez jusqu'à 400€/an.",
  logo: "https://switchly.fr/favicon.png",
};

const PAGE_SCHEMAS: Record<string, { type: string; title: string; description: string }> = {
  "/": { type: "webpage", title: "Accueil", description: "Comparez gratuitement les offres énergie et internet. Économisez jusqu'à 400€/an." },
  "/faq": { type: "faq", title: "FAQ", description: "Questions fréquentes sur le comparateur énergie et internet Switchly" },
  "/contact": { type: "webpage", title: "Contact", description: "Contactez l'équipe Switchly" },
  "/comparer": { type: "webpage", title: "Comparateur", description: "Comparez les offres énergie et internet gratuitement" },
  "/mentions-legales": { type: "webpage", title: "Mentions légales", description: "Mentions légales de Switchly" },
  "/politique-rgpd": { type: "webpage", title: "Politique RGPD", description: "Politique de protection des données" },
  "/cgu": { type: "webpage", title: "CGU", description: "Conditions générales d'utilisation" },
};

export const JsonLdSchema = ({ type = "auto", customData, faqItems, breadcrumbs }: JsonLdSchemaProps) => {
  const location = useLocation();
  const [schemas, setSchemas] = useState<object[]>([]);

  useEffect(() => {
    const generatedSchemas: object[] = [];
    const currentPath = location.pathname;
    const pageConfig = PAGE_SCHEMAS[currentPath];

    // Always include Organization schema on homepage
    if (currentPath === "/" || type === "organization") {
      generatedSchemas.push({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        logo: SITE_CONFIG.logo,
        description: SITE_CONFIG.description,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          availableLanguage: "French"
        },
        ...customData
      });
    }

    // Website schema
    if (currentPath === "/" || type === "website") {
      generatedSchemas.push({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.url,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_CONFIG.url}/recherche?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      });
    }

    // Service schema for homepage
    if (currentPath === "/" || type === "service") {
      generatedSchemas.push({
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Comparateur électricité et gaz",
        description: "Comparateur gratuit pour trouver les meilleures offres d'électricité et de gaz en France.",
        provider: {
          "@type": "Organization",
          name: SITE_CONFIG.name
        },
        areaServed: "France",
        serviceType: "Energy Price Comparison"
      });
    }

    // FAQ schema
    if ((type === "faq" || pageConfig?.type === "faq") && faqItems && faqItems.length > 0) {
      generatedSchemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map(item => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      });
    }

    // Breadcrumb schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      generatedSchemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          ...(crumb.url && { item: `${SITE_CONFIG.url}${crumb.url}` })
        }))
      });
    } else if (currentPath !== "/") {
      // Auto-generate breadcrumbs
      const autoBreadcrumbs = [{ name: "Accueil", url: "/" }];
      if (pageConfig) {
        autoBreadcrumbs.push({ name: pageConfig.title, url: currentPath });
      }
      generatedSchemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: autoBreadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: `${SITE_CONFIG.url}${crumb.url}`
        }))
      });
    }

    // WebPage schema for all pages
    if (type === "webpage" || type === "auto") {
      generatedSchemas.push({
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: pageConfig?.title || SITE_CONFIG.name,
        description: pageConfig?.description || SITE_CONFIG.description,
        url: `${SITE_CONFIG.url}${currentPath}`,
        isPartOf: {
          "@type": "WebSite",
          name: SITE_CONFIG.name,
          url: SITE_CONFIG.url
        }
      });
    }

    setSchemas(generatedSchemas);
  }, [location.pathname, type, customData, faqItems, breadcrumbs]);

  if (schemas.length === 0) return null;

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};

// Helper hook for FAQ pages
export const useFaqSchema = () => {
  const [faqItems, setFaqItems] = useState<Array<{ question: string; answer: string }>>([]);
  
  const addFaqItem = (question: string, answer: string) => {
    setFaqItems(prev => [...prev, { question, answer }]);
  };
  
  const setFaqFromAccordion = (items: Array<{ question: string; answer: string }>) => {
    setFaqItems(items);
  };
  
  return { faqItems, addFaqItem, setFaqFromAccordion };
};
