begin;

-- wipe out the database
truncate table public.user_access_level cascade;
truncate table public.client cascade;
truncate table public.client_location cascade;
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
insert into public.client_location (id, client_id, description) values
(
    1,
    (select id from public.client where name='Aera Energy'),
    'North Midway'
),
(
    2,
    (select id from public.client where name='Aera Energy'),
    'South Belridge'
),
(
    3,
    (select id from public.client where name='Chevron'),
    'Cymric'
),
(
    4,
    (select id from public.client where name='Chevron'),
    'Kern River'
),
(
    5,
    (select id from public.client where name='Occidental Petroleum'),
    'Lost Hills'
);

-- set up users
insert into public.user (id, email_address) values
(1, 'admin@example.com'),
(2, 'manager@example.com');

-- set up manager access for kevin
insert into public.user_to_user_access_level (user_id, access_level_id) values
(
    (select id from public.user where email_address='admin@example.com'),
    (select id from public.user_access_level where description='Manage Attachments')
),
(
    (select id from public.user where email_address='admin@example.com'),
    (select id from public.user_access_level where description='Manage Clients')
),
(
    (select id from public.user where email_address='admin@example.com'),
    (select id from public.user_access_level where description='Manage Data')
),
(
    (select id from public.user where email_address='admin@example.com'),
    (select id from public.user_access_level where description='Manage Users')
),
(
    (select id from public.user where email_address='manager@example.com'),
    (select id from public.user_access_level where description='Create Data')
),
(
    (select id from public.user where email_address='manager@example.com'),
    (select id from public.user_access_level where description='View Own Data')
);


-- set up some sample data
insert into public.data_set (uuid, created_by) values
(
    '7fa1f8f6-498d-4054-9300-4fcd4fa6bb57',
    (select id from public.user where email_address='admin@example.com')
);
    insert into public.data_set_boolean
    (description, value, created_by, data_set_id) values
    (
        'Reconciled to QuickBooks',
        false,
        (select id from public.user where email_address='admin@example.com'),
        (select max(id) from public.data_set)
    );
    insert into public.data_set_date
    (description, value, created_by, data_set_id) values
    (
        'Start Date',
        '2014-07-18 09:00:00',
        (select id from public.user where email_address='admin@example.com'),
        (select max(id) from public.data_set)
    ),
    (
        'End Date',
        '2014-07-18 09:30:00',
        (select id from public.user where email_address='admin@example.com'),
        (select max(id) from public.data_set)
    );
    insert into public.data_set_integer
    (description, value, created_by, data_set_id) values
    (
        'Duration (hours)',
        0,
        (select id from public.user where email_address='admin@example.com'),
        (select max(id) from public.data_set)
    ),
    (
        'Duration (minutes)',
        30,
        (select id from public.user where email_address='admin@example.com'),
        (select max(id) from public.data_set)
    );
    insert into public.data_set_text
    (description, value, created_by, data_set_id) values
    (
        'Description',
        'Time Log Entry',
        (select id from public.user where email_address='admin@example.com'),
        (select max(id) from public.data_set)
    ),
    (
        'Project',
        'hydra-core',
        (select id from public.user where email_address='admin@example.com'),
        (select max(id) from public.data_set)
    );

commit;
