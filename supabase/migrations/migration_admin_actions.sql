
CREATE OR REPLACE FUNCTION admin_delete_account(p_lead_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS 
DECLARE
  v_admin_email VARCHAR;
BEGIN
  SELECT email INTO v_admin_email FROM auth.users WHERE id = auth.uid();
  IF v_admin_email != 'logaritma.tim@gmail.com' THEN
    RAISE EXCEPTION 'Unauthorized: Only admin can perform this action.';
  END IF;

  IF p_lead_id IS NOT NULL THEN
    DELETE FROM leads WHERE id = p_lead_id;
  END IF;

  IF p_user_id IS NOT NULL THEN
    DELETE FROM merchants WHERE user_id = p_user_id;
    DELETE FROM auth.users WHERE id = p_user_id;
  END IF;
END;
;

CREATE OR REPLACE FUNCTION admin_set_premium(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS 
DECLARE
  v_admin_email VARCHAR;
BEGIN
  SELECT email INTO v_admin_email FROM auth.users WHERE id = auth.uid();
  IF v_admin_email != 'logaritma.tim@gmail.com' THEN
    RAISE EXCEPTION 'Unauthorized: Only admin can perform this action.';
  END IF;

  IF p_user_id IS NOT NULL THEN
    UPDATE merchants 
    SET status = 'Premium', 
        expired_at = '2099-12-31 23:59:59'::timestamp,
        trial_expires_at = '2099-12-31 23:59:59'::timestamp
    WHERE user_id = p_user_id;
  ELSE
    RAISE EXCEPTION 'User belum menyelesaikan pendaftaran merchant.';
  END IF;
END;
;
