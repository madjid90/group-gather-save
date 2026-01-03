import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseRealtimeNotificationsOptions {
  userId: string | null;
  onOfferUpdate?: (payload: any) => void;
  onProfileUpdate?: (payload: any) => void;
}

export function useRealtimeNotifications({
  userId,
  onOfferUpdate,
  onProfileUpdate,
}: UseRealtimeNotificationsOptions) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!userId) return;

    console.log('[Realtime] Setting up notifications for user:', userId);

    // Create a single channel for all subscriptions
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      // Listen to user_offers changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_offers',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[Realtime] Offer change:', payload);
          
          if (payload.eventType === 'INSERT') {
            toast.success('🎁 Nouvelle offre disponible !', {
              description: 'Une nouvelle offre personnalisée vient d\'arriver.',
              duration: 8000,
            });
          } else if (payload.eventType === 'UPDATE') {
            const newData = payload.new;
            const oldData = payload.old;
            
            // Check if status changed
            if (newData?.statut !== oldData?.statut) {
              if (newData?.statut === 'envoyee') {
                toast.success('📬 Offre envoyée !', {
                  description: 'Consultez votre nouvelle offre personnalisée.',
                  duration: 8000,
                });
              } else if (newData?.statut === 'acceptee') {
                toast.success('✅ Offre acceptée !', {
                  description: 'Votre souscription est confirmée.',
                  duration: 8000,
                });
              }
            }
          }

          onOfferUpdate?.(payload);
        }
      )
      // Listen to profiles changes
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[Realtime] Profile change:', payload);
          
          const newData = payload.new as Record<string, any> | undefined;
          const oldData = payload.old as Record<string, any> | undefined;

          // Check if status changed
          if (newData?.statut !== oldData?.statut) {
            if (newData?.statut === 'profil_ok') {
              toast.info('📋 Profil validé', {
                description: 'Votre profil est maintenant complet.',
                duration: 5000,
              });
            } else if (newData?.statut === 'offre_envoyee') {
              toast.success('🎉 Bonne nouvelle !', {
                description: 'Une offre vous a été attribuée.',
                duration: 8000,
              });
            }
          }

          onProfileUpdate?.(payload);
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Successfully subscribed to notifications');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Channel error');
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('[Realtime] Cleaning up notifications');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, onOfferUpdate, onProfileUpdate]);

  return {
    isConnected: channelRef.current !== null,
  };
}
