-- name: add-user!
insert into public.user (email_address) values (:email_address);

-- name: get-user
select * from public.user where email_address=:email_address;

-- name: get-user-access
select distinct ual.description
from public.user u
left join public.user_to_user_access_level u2ual on u.id=u2ual.user_id
inner join public.user_access_level ual on ual.id=u2ual.access_level_id
where u.email_address=:email_address
