-- Function to get user claims
CREATE OR REPLACE FUNCTION get_claims(uid uuid)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT raw_app_meta_data from auth.users
  WHERE id = uid;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_claims TO authenticated;