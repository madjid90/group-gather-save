import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrackingConfig {
  ga4_measurement_id?: string;
  meta_pixel_id?: string;
  google_ads_id?: string;
  tiktok_pixel_id?: string;
  clarity_project_id?: string;
  gsc_verification?: string;
}

export const TrackingScripts = () => {
  const [config, setConfig] = useState<TrackingConfig>({});

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('seo_config')
        .select('config_key, config_value')
        .eq('is_active', true);

      if (data) {
        const configMap: TrackingConfig = {};
        data.forEach(item => {
          if (item.config_value) {
            configMap[item.config_key as keyof TrackingConfig] = item.config_value;
          }
        });
        setConfig(configMap);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    // Google Analytics 4
    if (config.ga4_measurement_id) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.ga4_measurement_id}`;
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.ga4_measurement_id}');
      `;
      document.head.appendChild(inlineScript);
    }

    // Meta Pixel
    if (config.meta_pixel_id) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${config.meta_pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);
    }

    // Google Ads
    if (config.google_ads_id) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${config.google_ads_id}`;
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${config.google_ads_id}');
      `;
      document.head.appendChild(inlineScript);
    }

    // TikTok Pixel
    if (config.tiktok_pixel_id) {
      const script = document.createElement('script');
      script.innerHTML = `
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${config.tiktok_pixel_id}');
          ttq.page();
        }(window, document, 'ttq');
      `;
      document.head.appendChild(script);
    }

    // Microsoft Clarity
    if (config.clarity_project_id) {
      const script = document.createElement('script');
      script.innerHTML = `
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${config.clarity_project_id}");
      `;
      document.head.appendChild(script);
    }

    // Google Search Console verification meta tag
    if (config.gsc_verification) {
      const meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      meta.content = config.gsc_verification;
      document.head.appendChild(meta);
    }
  }, [config]);

  return null;
};
