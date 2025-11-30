-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.students (id, name, email, password_hash, points)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Anonymous'),
    new.email,
    'managed_by_auth', -- Placeholder since Auth handles passwords
    0
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users who are in Auth but not in Students table
insert into public.students (id, name, email, password_hash, points)
select 
  id, 
  coalesce(raw_user_meta_data->>'name', 'Anonymous'), 
  email, 
  'managed_by_auth', 
  0
from auth.users
where id not in (select id from public.students);
