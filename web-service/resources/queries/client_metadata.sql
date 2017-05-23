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
  u.email_address,
  c.name as client_name
from new_client_metadata ncm
inner join "client" c on c.id = ncm.client_id
inner join "user"   u on u.id = ncm.created_by
; --

-- name: get-client-metadata-list-by-client-name
with
  valid_client as
  (select id from "client" where name = :client_name),

  valid_user as
  (select id from "user"
   where email_address = :email_address)

select * from "client_metadata"
where client_id = (select id from valid_client)

  and case when (nullif(:email_address, null) is null) then true
      else created_by = (select id from valid_user) end

  and date_deleted is null;

-- name: delete-client-metadata<!
with
  valid_client as
  (select id from "client" where name = :client_name),

  valid_user as
  (select id from "user" where email_address = :email_address),

  deleted_client_metadata as
  (update "client_metadata"
   set date_deleted = now()
   where key_name = :key_name
     and client_id = (select id from valid_client)
     and date_deleted is null
   returning *)

select
  dcm.key_name,
  dcm.key_value,
  dcm.date_created,
  dcm.date_deleted,
  u.email_address,
  c.name as client_name
from deleted_client_metadata dcm
inner join "client" c on c.id = dcm.client_id
inner join "user"   u on u.id = dcm.created_by
; --
