-- name: get-access-level
select * from user_access_level
where description = :description::character varying(255);

-- name: list-access-levels
select description from public.user_access_level;
