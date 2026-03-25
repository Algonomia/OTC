DROP FUNCTION IF EXISTS get_otc_values;

CREATE OR REPLACE FUNCTION get_otc_values(
    pmin_version DATE = NULL,
    pmax_version DATE = NULL,
    pmin_reliability INT = NULL,
    ppriority TEXT = NULL,  -- 'version' or 'reliability'
    pjurisdictions TEXT[] = NULL,
    pobligation_types "ObligationTypeId"[] = NULL,
    psource_ids INT[] = NULL
)
    RETURNS TABLE(
        jurisdiction TEXT,
        obligation_type_id "ObligationTypeId",
        key TEXT,
        id BIGINT,
        type TEXT, -- 'from_ai' | 'from_user',
        value JSON,
        additional_values JSON,
        reference TEXT,
        notes TEXT,
        judge_llm_score FLOAT,
        version TIMESTAMP
    )
AS $$
DECLARE
    min_version DATE = COALESCE(pmin_version, '-infinity'::date);
    max_version DATE = COALESCE(pmax_version, 'infinity'::date);
    priority TEXT = CASE WHEN ppriority IS NULL OR ppriority NOT IN ('version', 'reliability') THEN 'version' ELSE ppriority END;
    min_reliability INT = COALESCE(pmin_reliability, 0);
    jurisdictions TEXT[] = COALESCE(pjurisdictions, ARRAY(SELECT distinct unnest(source.jurisdictions) FROM source));
    source_ids INT[] = COALESCE(psource_ids, ARRAY(SELECT distinct source.id FROM source));
    obligation_types "ObligationTypeId"[] = COALESCE(pobligation_types, ARRAY(SELECT distinct unnest(source.obligation_type_ids) FROM source));
BEGIN
    RETURN QUERY(
        WITH filtered_otc_llm_value AS (
            SELECT otc_llm_value.source_id,
                   otc_llm_value.jurisdiction,
                   otc_llm_value.obligation_type_id,
                   otc_llm_value.key,
                   otc_llm_value.id,
                   'from_ai' AS type,
                   otc_llm_value.value::JSON,
                   otc_llm_value.additional_values::JSON,
                   otc_llm_value.reference,
                   otc_llm_value.notes,
                   otc_llm_value.version,
                   COALESCE(otc_llm_value.judge_llm_score, 0) AS judge_llm_score
            FROM otc_llm_value
            WHERE otc_llm_value.version <= max_version AND
                  otc_llm_value.version >= min_version AND
                  otc_llm_value.judge_llm_score >= min_reliability AND
                  otc_llm_value.jurisdiction = ANY(SELECT * FROM unnest(jurisdictions)) AND
                  otc_llm_value.obligation_type_id = ANY(SELECT * FROM unnest(obligation_types)) AND
                  otc_llm_value.source_id = ANY(SELECT * FROM unnest(source_ids))
        ), filtered_otc_user_value AS (
            SELECT otc_user_value.source_id,
                   otc_user_value.jurisdiction,
                   otc_user_value.obligation_type_id,
                   otc_user_value.key,
                   otc_user_value.id,
                   'from_user' AS type,
                   otc_user_value.value::JSON,
                   otc_user_value.additional_values::JSON,
                   otc_user_value.reference,
                   otc_user_value.notes,
                   otc_user_value.version,
                   null::float AS judge_llm_score
            FROM otc_user_value
            WHERE otc_user_value.status = 'Accepted' AND
                  otc_user_value.version <= max_version AND
                  otc_user_value.version >= min_version AND
                  otc_user_value.jurisdiction = ANY(SELECT * FROM unnest(jurisdictions)) AND
                  otc_user_value.obligation_type_id = ANY(SELECT * FROM unnest(obligation_types)) AND
                  otc_user_value.source_id = ANY(SELECT * FROM unnest(source_ids))
        ), all_otc_values AS (
            SELECT * FROM filtered_otc_llm_value
            UNION ALL
            SELECT * FROM filtered_otc_user_value
        )
        SELECT DISTINCT ON (all_otc_values.jurisdiction, all_otc_values.obligation_type_id, all_otc_values.key)
            all_otc_values.jurisdiction,
            all_otc_values.obligation_type_id,
            all_otc_values.key,
            all_otc_values.id,
            all_otc_values.type,
            all_otc_values.value::JSON,
            all_otc_values.additional_values::JSON,
            all_otc_values.reference,
            all_otc_values.notes,
            all_otc_values.judge_llm_score,
            all_otc_values.version
        FROM all_otc_values
        ORDER BY all_otc_values.jurisdiction,
                 all_otc_values.obligation_type_id,
                 all_otc_values.key,
                 CASE WHEN priority = 'version' THEN all_otc_values.version END DESC,
                 CASE WHEN priority = 'version' THEN all_otc_values.judge_llm_score END DESC,
                 CASE WHEN priority = 'reliability' THEN all_otc_values.judge_llm_score END DESC,
                 CASE WHEN priority = 'reliability' THEN all_otc_values.version END DESC,
                 all_otc_values.type = 'from_user' DESC,
                 all_otc_values.id DESC
    );
END;
$$ LANGUAGE plpgsql STABLE;
