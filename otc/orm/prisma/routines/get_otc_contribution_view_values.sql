DROP FUNCTION IF EXISTS get_otc_contribution_view_values;
CREATE OR REPLACE FUNCTION get_otc_contribution_view_values(prequester_email TEXT)
    RETURNS TABLE(
        id BIGINT,
        source_id INTEGER,
        jurisdiction TEXT,
        obligation_type_id "ObligationTypeId",
        version timestamp,
        key TEXT,
        value JSON,
        additional_values JSON,
        notes TEXT,
        reference TEXT,
        proposed_by TEXT,
        status "ValuesStatus",
        admin_comment TEXT
    )
AS $$
    WITH requester_line AS (
        SELECT is_admin FROM auth_user WHERE prequester_email = auth_user.email
    ) SELECT otc_user_value.id,
             otc_user_value.source_id,
             otc_user_value.jurisdiction,
             otc_user_value.obligation_type_id,
             otc_user_value.version,
             otc_user_value.key,
             otc_user_value.value::JSON,
             otc_user_value.additional_values::JSON,
             otc_user_value.notes,
             otc_user_value.reference,
             COALESCE(auth_user.firstname || ' ' || auth_user.lastname, auth_user.email) AS proposed_by,
             otc_user_value.status,
             otc_user_value.admin_comment
    FROM otc_user_value
    LEFT JOIN auth_user ON auth_user.id = otc_user_value.user_id
    WHERE auth_user.email = prequester_email OR
          (SELECT is_admin FROM requester_line)
    ORDER BY otc_user_value.version DESC, otc_user_value.id DESC;
$$ LANGUAGE SQL STABLE;
