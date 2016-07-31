-- name: get-attachment-data
select 'attachment' as type, filename, octet_length(contents) as bytes
from public.data_set_attachment
where data_set_id=:data_set_id
and date_deleted is null;

-- name: get-boolean-data
select 'boolean' as type, description, value
from public.data_set_boolean
where data_set_id=:data_set_id
and date_deleted is null;

-- name: get-date-data
select 'date' as type, description, value
from public.data_set_date
where data_set_id=:data_set_id
and date_deleted is null;

-- name: get-integer-data
select 'integer' as type, description, value
from public.data_set_integer
where data_set_id=:data_set_id
and date_deleted is null;

-- name: get-real-data
select 'real' as type, description, value
from public.data_set_real
where data_set_id=:data_set_id
and date_deleted is null;

-- name: get-text-data
select 'text' as type, description, value
from public.data_set_text
where data_set_id=:data_set_id
and date_deleted is null;
