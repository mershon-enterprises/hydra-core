-- name: session-start!
insert into public.user_session
(start_date, end_date, user_id)
values (
  now(), now(), (select id from public.user where email_address=:email_address)
);

-- name: session-get-current
select us.id from public.user_session us
inner join public.user u
  on u.id = us.user_id
where u.email_address=:email_address
and (
  us.end_date is null
  or (now() - us.end_date) < interval '30 minutes'
);

-- name: session-update!
update public.user_session
set end_date = now(), date_modified = now()
where id=:session_id;

-- name: session-log-detail!
insert into public.user_session_detail
(attribute, value, session_id)
values (
  :attribute, :value, :session_id
);
