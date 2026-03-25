DROP PROCEDURE IF EXISTS create_or_update_rate;
CREATE OR REPLACE PROCEDURE create_or_update_rate(ptype TEXT, pid BIGINT, puser_id TEXT, prate INT, pcomment TEXT) -- ptype is 'from_user' or 'from_ai'
AS $$
DECLARE
    value_rate_id BIGINT;
    previous_rate INT;
    previous_comment TEXT;
BEGIN
    SELECT id, rate, comment FROM value_rate WHERE ptype = 'from_user' AND user_id = puser_id AND user_value_id = pid
    UNION ALL
    SELECT id, rate, comment FROM value_rate WHERE ptype = 'from_ai' AND user_id = puser_id AND llm_value_id = pid
    INTO value_rate_id, previous_rate, previous_comment;

    IF previous_rate = prate AND previous_comment = pcomment THEN
        RETURN;
    END IF;

    IF ptype = 'from_user' AND 'Accepted' NOT IN (SELECT otc_user_value.status FROM otc_user_value WHERE id = pid) THEN
        RETURN;
    END IF;

    IF (value_rate_id IS NULL) THEN
        IF ptype = 'from_user' THEN
            INSERT INTO value_rate(rate, comment, user_id, user_value_id)
            SELECT prate, pcomment, puser_id, pid;
        ELSE
            IF ptype = 'from_ai' THEN
                INSERT INTO value_rate(rate, comment, user_id, llm_value_id)
                SELECT prate, pcomment, puser_id, pid;
            END IF;
        END IF;
    ELSE
        UPDATE value_rate SET rate = prate, comment = pcomment, rated_at = now()
        WHERE value_rate_id = value_rate.id;
    END IF;
END;
$$ LANGUAGE plpgsql;
