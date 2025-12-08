-- Create a security definer function to validate housing tokens without RLS issues
CREATE OR REPLACE FUNCTION public.validate_housing_token(p_token uuid)
RETURNS TABLE(user_id uuid, form_completed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.housing_form_completed
  FROM public.profiles p
  WHERE p.housing_token = p_token;
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.validate_housing_token(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_housing_token(uuid) TO authenticated;