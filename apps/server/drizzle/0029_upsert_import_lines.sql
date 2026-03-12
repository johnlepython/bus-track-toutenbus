-- Fix import_lines to upsert line data (number, color, text_color) when a line ref already exists.
-- Previously it only inserted new lines, leaving stale data if the line was already created with wrong values.
CREATE OR REPLACE FUNCTION import_lines(p_network_id integer, p_lines_data jsonb, p_recorded_at timestamp)
RETURNS SETOF public.line LANGUAGE plpgsql AS $$
BEGIN
    PERFORM pg_advisory_xact_lock(p_network_id);

    RETURN QUERY
    WITH input_data AS (
        SELECT DISTINCT
            (l->>'ref')::varchar AS ref,
            (l->>'number')::varchar AS number,
            CASE WHEN length(l->>'color') = 6 THEN (l->>'color') ELSE NULL END AS color,
            CASE WHEN length(l->>'textColor') = 6 THEN (l->>'textColor') ELSE NULL END AS text_color
        FROM jsonb_array_elements(p_lines_data) AS l
    ),
    all_refs AS (
        SELECT array_agg(ref) as refs FROM input_data
    ),
    upserted AS (
        INSERT INTO public.line (network_id, ref, "number", color, text_color)
        SELECT p_network_id, ARRAY[id.ref]::varchar[], id.number, id.color, id.text_color
        FROM input_data id
        WHERE NOT EXISTS (
            SELECT 1 FROM public.line li
            WHERE li.network_id = p_network_id
              AND li.ref && ARRAY[id.ref]::varchar[]
              AND (li.archived_at IS NULL OR li.archived_at >= p_recorded_at)
        )
        RETURNING *
    ),
    updated AS (
        UPDATE public.line li
        SET "number" = id.number,
            color = COALESCE(id.color, li.color),
            text_color = COALESCE(id.text_color, li.text_color)
        FROM input_data id
        WHERE li.network_id = p_network_id
          AND li.ref && ARRAY[id.ref]::varchar[]
          AND (li.archived_at IS NULL OR li.archived_at >= p_recorded_at)
          AND NOT EXISTS (SELECT 1 FROM upserted u WHERE u.id = li.id)
        RETURNING li.*
    )
    SELECT l.* FROM public.line l, all_refs
    WHERE l.network_id = p_network_id
      AND l.ref && all_refs.refs
      AND (l.archived_at IS NULL OR l.archived_at >= p_recorded_at);
END;
$$;
