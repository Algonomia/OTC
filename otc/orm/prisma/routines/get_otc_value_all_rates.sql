DROP FUNCTION IF EXISTS get_otc_value_all_rates;
DROP FUNCTION IF EXISTS get_otc_value_user_rate;

CREATE OR REPLACE FUNCTION get_otc_value_all_rates(ptype TEXT, pvalue_id BIGINT) -- ptype is 'from_user' or 'from_ai'
    RETURNS TABLE(
        rate INTEGER,
        comment TEXT,
        rated_at TIMESTAMP,
        rated_by TEXT
    )
AS $$
    WITH unordered_rates AS (
        SELECT value_rate.rate,
               value_rate.comment,
               value_rate.rated_at,
               COALESCE(auth_user.firstname || ' ' || auth_user.lastname, auth_user.email) AS rated_by
        FROM value_rate
        LEFT JOIN auth_user ON auth_user.id = value_rate.user_id
        WHERE value_rate.user_value_id = pvalue_id AND ptype = 'from_user'

        UNION ALL

        SELECT value_rate.rate,
               value_rate.comment,
               value_rate.rated_at,
               COALESCE(auth_user.firstname || ' ' || auth_user.lastname, auth_user.email) AS rated_by
        FROM value_rate
        LEFT JOIN auth_user ON auth_user.id = value_rate.user_id
        WHERE value_rate.llm_value_id = pvalue_id AND ptype = 'from_ai'
    ) SELECT * FROM unordered_rates ORDER BY unordered_rates.rated_at DESC;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION get_otc_value_user_rate(puser_id TEXT, ptype TEXT, pvalue_id BIGINT) -- ptype is 'from_user' or 'from_ai'
    RETURNS TABLE(
        rate INTEGER,
        comment TEXT
    )
AS $$
    SELECT value_rate.rate,
           value_rate.comment
    FROM value_rate
    LEFT JOIN auth_user ON auth_user.id = value_rate.user_id
    WHERE value_rate.user_id = puser_id AND value_rate.user_value_id = pvalue_id AND ptype = 'from_user'

    UNION ALL

    SELECT value_rate.rate,
           value_rate.comment
    FROM value_rate
    LEFT JOIN auth_user ON auth_user.id = value_rate.user_id
    WHERE value_rate.user_id = puser_id AND value_rate.llm_value_id = pvalue_id AND ptype = 'from_ai';
$$ LANGUAGE SQL STABLE;

