begin;

-- wipe out the database
truncate table public.user_access_level cascade;
truncate table public.client cascade;
truncate table public.data_set cascade;
truncate table public.user cascade;

-- set up access levels
insert into public.user_access_level (description) values
('Create Attachments'),
('Create Data'),
('Manage Attachments'),
('Manage Clients'),
('Manage Data'),
('Manage Users'),
('View Attachments'),
('View Clients'),
('View Same Client Data'),
('View Same Client Location Data'),
('View Own Data');

-- set up clients
insert into public.client (name) values
('Aera Energy'),
('Chevron'),
('Occidental Petroleum');

-- set up locations
insert into public.client_location (client_id, description) values
(
    (select id from public.client where name='Aera Energy'),
    'North Midway'
),
(
    (select id from public.client where name='Aera Energy'),
    'South Belridge'
),
(
    (select id from public.client where name='Chevron'),
    'Cymric'
),
(
    (select id from public.client where name='Chevron'),
    'Kern River'
),
(
    (select id from public.client where name='Occidental Petroleum'),
    'Lost Hills'
);

-- set up users
insert into public.user (email_address) values
('kevin@slixbits.com'),
('brent@slixbits.com');

-- set up manager access for kevin
insert into public.user_to_user_access_level (user_id, access_level_id) values
(
    (select id from public.user where email_address='kevin@slixbits.com'),
    (select id from public.user_access_level where description='Manage Attachments')
),
(
    (select id from public.user where email_address='kevin@slixbits.com'),
    (select id from public.user_access_level where description='Manage Clients')
),
(
    (select id from public.user where email_address='kevin@slixbits.com'),
    (select id from public.user_access_level where description='Manage Data')
),
(
    (select id from public.user where email_address='kevin@slixbits.com'),
    (select id from public.user_access_level where description='Manage Users')
);

commit;
