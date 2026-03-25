DROP FUNCTION IF EXISTS get_otc_key_segment_history;
CREATE OR REPLACE FUNCTION get_otc_key_segment_history(
    puser_id TEXT,
    pjurisdiction TEXT,
    pobligation_type_id "ObligationTypeId",
    pindicator_id TEXT
)
    RETURNS TABLE(
        type TEXT,
        id BIGINT,
        source_id INTEGER,
        jurisdiction TEXT,
        obligation_type_id "ObligationTypeId",
        version timestamp,
        key TEXT,
        value JSON,
        notes TEXT,
        reference TEXT,
        additional_values JSON,
        proposed_by TEXT,
        average_rate DOUBLE PRECISION,
        current_user_rate INTEGER,
        current_user_comment TEXT,
        judge_llm_score FLOAT
    )
AS $$
    WITH unordered_otc_all_segmentation_values AS (
        SELECT 'from_user' AS type,
               otc_user_value.id,
               otc_user_value.source_id,
               otc_user_value.jurisdiction,
               otc_user_value.obligation_type_id,
               otc_user_value.version,
               otc_user_value.key,
               otc_user_value.value::JSON,
               otc_user_value.notes,
               otc_user_value.reference,
               otc_user_value.additional_values::JSON,
               COALESCE(auth_user.firstname || ' ' || auth_user.lastname, auth_user.email) AS proposed_by,
               (AVG(value_rate.rate) FILTER ( WHERE rate IS NOT NULL ))::FLOAT AS average_rate,
               (ARRAY_AGG(value_rate.rate) FILTER (WHERE value_rate.user_id = puser_id))[1] AS current_user_rate,
               (ARRAY_AGG(value_rate.comment) FILTER (WHERE value_rate.user_id = puser_id))[1] AS current_user_comment,
               NULL::FLOAT as judge_llm_score
        FROM otc_user_value
        LEFT JOIN value_rate ON otc_user_value.id = value_rate.user_value_id
        LEFT JOIN auth_user ON auth_user.id = otc_user_value.user_id
        WHERE otc_user_value.status = 'Accepted' AND
              otc_user_value.jurisdiction = pjurisdiction AND
              otc_user_value.obligation_type_id = pobligation_type_id AND
              otc_user_value.key = pindicator_id
        GROUP BY otc_user_value.id, auth_user.firstname, auth_user.lastname, auth_user.email

        UNION ALL

        SELECT 'from_ai' AS type,
               otc_llm_value.id,
               otc_llm_value.source_id,
               otc_llm_value.jurisdiction,
               otc_llm_value.obligation_type_id,
               otc_llm_value.version,
               otc_llm_value.key,
               otc_llm_value.value::JSON,
               otc_llm_value.notes,
               otc_llm_value.reference,
               otc_llm_value.additional_values::JSON,
               'AI' AS proposed_by,
               (AVG(value_rate.rate) FILTER ( WHERE value_rate.rate IS NOT NULL ))::FLOAT AS average_rate,
               (ARRAY_AGG(value_rate.rate) FILTER (WHERE value_rate.user_id = puser_id))[1] AS current_user_rate,
               (ARRAY_AGG(value_rate.comment) FILTER (WHERE value_rate.user_id = puser_id))[1] AS current_user_comment,
               COALESCE(otc_llm_value.judge_llm_score, 0) AS judge_llm_score
        FROM otc_llm_value
        LEFT JOIN value_rate ON otc_llm_value.id = value_rate.llm_value_id
        WHERE otc_llm_value.jurisdiction = pjurisdiction AND
              otc_llm_value.obligation_type_id = pobligation_type_id AND
              otc_llm_value.key = pindicator_id
        GROUP BY otc_llm_value.id
    ) SELECT * FROM unordered_otc_all_segmentation_values
    ORDER BY version DESC, type = 'from_user' DESC, id DESC;
$$ LANGUAGE SQL STABLE;
