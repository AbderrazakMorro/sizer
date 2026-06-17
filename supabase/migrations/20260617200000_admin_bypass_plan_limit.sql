-- Admin bypass for plan limits on projects
-- Admins (role = 'admin' in user_roles) are exempt from active projects limit.

create or replace function check_active_projects_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_config jsonb;
  v_limit int;
  v_count int;
  v_is_becoming_active boolean;
  v_is_admin boolean;
begin
  -- Determine if this operation is making the project active
  if TG_OP = 'INSERT' then
    v_is_becoming_active := (NEW.status = 'active');
  elsif TG_OP = 'UPDATE' then
    v_is_becoming_active := (OLD.status IS DISTINCT FROM 'active' AND NEW.status = 'active');
  else
    return NEW;
  end if;

  -- Only check limit if project is becoming active
  if not v_is_becoming_active then
    return NEW;
  end if;

  -- Admin bypass: admins are not subject to plan limits
  select exists(
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  ) into v_is_admin;

  if v_is_admin then
    return NEW;
  end if;

  -- Get effective plan config
  select config into v_config from get_effective_plan(auth.uid()) limit 1;
  if v_config is null then
    return NEW;
  end if;

  -- Get effective active projects limit (includes extras)
  v_limit := (v_config->>'effective_active_projects_limit')::int;
  if v_limit = -1 then
    return NEW;
  end if;

  -- Count current active projects
  select count(*) into v_count
  from projects
  where user_id = auth.uid()
    and status = 'active'
    and (TG_OP = 'INSERT' or id <> NEW.id); -- Exclude current row if UPDATE

  -- Check if limit would be exceeded
  if v_count >= v_limit then
    raise exception 'PLAN_LIMIT_EXCEEDED: El plan actual permite un máximo de % proyecto(s) activo(s). Actualiza tu plan para crear más proyectos.', v_limit
      using errcode = 'P0001';
  end if;

  return NEW;
end;
$$;

comment on function check_active_projects_plan_limit() is 'Enforces active projects limit from effective plan. Admins bypass the limit. Only counts projects with status = active. Raises PLAN_LIMIT_EXCEEDED on violation.';
