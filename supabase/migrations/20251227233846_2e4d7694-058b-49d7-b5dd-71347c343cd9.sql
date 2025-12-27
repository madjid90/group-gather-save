-- Add 'gaz' to contract_type enum
ALTER TYPE public.contract_type ADD VALUE IF NOT EXISTS 'gaz';

-- Add 'gaz' to offer_type enum
ALTER TYPE public.offer_type ADD VALUE IF NOT EXISTS 'gaz';