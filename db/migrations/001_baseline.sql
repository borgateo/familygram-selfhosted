create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  username text not null,
  display_name text not null,
  password_hash text not null,
  avatar_url text,
  role text not null default 'member' check (role in ('admin', 'member')),
  family_role text,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  locale text not null default 'en' check (locale in ('en', 'it', 'pt-BR')),
  disabled boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index users_email_lower_idx on users (lower(email));
create unique index users_username_lower_idx on users (lower(username));

create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  type text not null check (type in ('photo', 'video')),
  media_url text not null,
  thumb_url text not null,
  caption text check (char_length(caption) <= 2000),
  filter text,
  likes_count integer not null default 0 check (likes_count >= 0),
  comments_count integer not null default 0 check (comments_count >= 0),
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on posts (created_at desc, id desc);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index comments_post_created_idx on comments (post_id, created_at);

create table likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table invites (
  id uuid primary key default gen_random_uuid(),
  token uuid unique not null default gen_random_uuid(),
  created_by uuid references users(id) on delete cascade not null,
  used_by uuid references users(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create table invite_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null,
  message text check (message is null or char_length(message) <= 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create unique index invite_requests_email_lower_idx on invite_requests (lower(email));

create table family_relationships (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid references users(id) on delete cascade not null,
  to_user_id uuid references users(id) on delete cascade not null,
  relationship_type text not null check (relationship_type in (
    'parent', 'child', 'sibling', 'spouse',
    'grandparent', 'grandchild', 'uncle_aunt',
    'nephew_niece', 'cousin', 'other'
  )),
  label text,
  created_at timestamptz not null default now(),
  check (from_user_id <> to_user_id),
  unique (from_user_id, to_user_id)
);

create table sessions (
  id text primary key,
  user_id uuid references users(id) on delete cascade not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index sessions_user_id_idx on sessions (user_id);
create index sessions_expires_at_idx on sessions (expires_at);

create or replace function update_likes_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set likes_count = likes_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger likes_count_trigger
after insert or delete on likes
for each row execute function update_likes_count();

create or replace function update_comments_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update posts set comments_count = comments_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger comments_count_trigger
after insert or delete on comments
for each row execute function update_comments_count();
