DROP FUNCTION IF EXISTS get_access_tokens;
CREATE OR REPLACE FUNCTION get_access_tokens(puser_id TEXT)
    RETURNS TABLE(access_key TEXT, expires_at timestamp, created_at timestamp, last_used_at timestamp)
AS $$
    SELECT otc_access_token.access_key,
           otc_access_token.expires_at,
           otc_access_token.created_at,
           MAX(otc_access_token_audit.last_used_at)
    FROM otc_access_token
    LEFT JOIN otc_access_token_audit ON otc_access_token_audit.access_key = otc_access_token.access_key
    WHERE otc_access_token.user_id = puser_id
    GROUP BY otc_access_token.access_key;
$$ LANGUAGE SQL STABLE;
