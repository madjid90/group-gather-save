import { supabase } from "@/integrations/supabase/client";

type EventType = 'cta_inscription' | 'offre_acceptee' | 'offre_refusee' | 'calculator_started' | 'calculator_completed' | 'calculator_result_viewed' | 'calculator_cta_inscription';
type SourceType = 'hero' | 'cta_section' | 'mobile_cta' | 'navbar' | 'mon_offre' | 'partage' | 'savings_calculator';

interface TrackClickOptions {
  eventType: EventType;
  source: SourceType;
  offerId?: string;
  metadata?: Record<string, unknown>;
}

export const trackClick = async ({ eventType, source, offerId, metadata = {} }: TrackClickOptions) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use type assertion for the dynamic table
    const insertData: Record<string, unknown> = {
      event_type: eventType,
      source,
      user_id: user?.id || null,
      offer_id: offerId || null,
      metadata
    };
    
    await (supabase.from('click_events') as any).insert(insertData);
  } catch (error) {
    // Silent fail - don't block user actions for tracking
    console.error('Click tracking error:', error);
  }
};

export const useClickTracking = () => {
  const trackCTAClick = (source: SourceType) => {
    trackClick({ eventType: 'cta_inscription', source });
  };

  const trackOfferAccepted = (offerId: string) => {
    trackClick({ eventType: 'offre_acceptee', source: 'mon_offre', offerId });
  };

  const trackOfferRefused = (offerId: string) => {
    trackClick({ eventType: 'offre_refusee', source: 'mon_offre', offerId });
  };

  return { trackCTAClick, trackOfferAccepted, trackOfferRefused, trackClick };
};
