-- Enable realtime for user_offers and profiles tables
-- This allows clients to receive live updates

-- Set REPLICA IDENTITY FULL for complete row data on updates
ALTER TABLE public.user_offers REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_offers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;