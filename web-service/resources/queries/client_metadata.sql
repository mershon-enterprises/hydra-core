-- name: add-client-metadata<!
with
  valid_user as
  (select id from "user"
   where email_address = :email_address),

  valid_client as
  (select id from "client" where name = :client_name),

  new_client_metadata as
  (insert into "client_metadata" (
     client_id,
     created_by,
     key_name,
     key_value
  ) values (
    (select id from valid_client),
    (select id from valid_user),
    :key_name,
    :key_value
  ) returning *)

select
  ncm.key_name,
  ncm.key_value,
  u.email_address as last_updated_by,
  c.name as client_name
from new_client_metadata ncm
inner join "client" c on c.id = ncm.client_id
inner join "user"   u on u.id = ncm.created_by
; --

-- name: get-client-metadata
with
  valid_client as
  (select id from "client" where name = :client_name),

  valid_user as
  (select id from "user"
   where email_address = :email_address)

select
  cm.key_name,
  cm.key_value,
  u.email_address as last_updated_by,
  c.name as client_name

from "client_metadata" cm
inner join "client" c on c.id = cm.client_id
inner join "user"   u on u.id = cm.created_by

where cm.client_id = (select id from valid_client)

  and cm.key_name = :key_name

  and case when (nullif(:email_address, null) is null) then true
      else cm.created_by = (select id from valid_user) end

  and cm.date_deleted is null;



-- name: get-client-metadata-list-by-client-name
with
  valid_client as
  (select id from "client" where name = :client_name),

  valid_user as
  (select id from "user"
   where email_address = :email_address)

select
  cm.key_name,
  cm.key_value,
  u.email_address as last_updated_by,
  c.name as client_name

from "client_metadata" cm
inner join "client" c on c.id = cm.client_id
inner join "user"   u on u.id = cm.created_by

where cm.client_id = (select id from valid_client)

  and case when (nullif(:email_address, null) is null) then true
      else cm.created_by = (select id from valid_user) end

  and cm.date_deleted is null;

-- name: delete-client-metadata<!
with
  valid_client as
  (select id from "client" where name = :client_name),

  valid_user as
  (select id from "user" where email_address = :email_address),

  deleted_client_metadata as
  (update "client_metadata"
   set date_deleted = now(),
       deleted_by = (select id from valid_user)
   where key_name = :key_name
     and client_id = (select id from valid_client)
     and date_deleted is null
   returning *)

select
  dcm.key_name,
  dcm.key_value,
  dcm.date_created,
  dcm.date_deleted,
  cbu.email_address last_updated_by,
  dbu.email_address deleted_by,
  c.name as client_name
from deleted_client_metadata dcm
inner join "client" c on c.id = dcm.client_id
inner join "user"   cbu on cbu.id = dcm.created_by
inner join "user"   dbu on dbu.id = dcm.deleted_by
; --
