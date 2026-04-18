-- With Running - Supabase DB Schema

-- 사용자 프로필
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  avatar_url text,
  pace text,
  preferred_distance text[],
  preferred_time text[],
  preferred_region text[],
  total_distance numeric default 0,
  total_runs int default 0,
  created_at timestamptz default now()
);

-- 코스
create table courses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  distance numeric not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) default 'easy',
  elevation int default 0,
  location text,
  region text,
  image_url text,
  rating numeric default 0,
  review_count int default 0,
  coordinates jsonb default '[]',
  tags text[] default '{}',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- 모임
create table crews (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  course_id uuid references courses(id),
  host_id uuid references profiles(id),
  date date not null,
  time text not null,
  pace text,
  distance numeric,
  max_members int default 8,
  location text,
  region text,
  tags text[] default '{}',
  status text check (status in ('upcoming', 'full', 'completed', 'cancelled')) default 'upcoming',
  is_recurring boolean default false,
  recurring_day text,
  created_at timestamptz default now()
);

-- 모임 멤버
create table crew_members (
  id uuid default gen_random_uuid() primary key,
  crew_id uuid references crews(id) on delete cascade,
  user_id uuid references profiles(id),
  status text check (status in ('accepted', 'pending', 'rejected')) default 'pending',
  created_at timestamptz default now(),
  unique(crew_id, user_id)
);

-- 코스 리뷰
create table course_reviews (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references courses(id) on delete cascade,
  user_id uuid references profiles(id),
  rating int check (rating between 1 and 5),
  content text,
  created_at timestamptz default now()
);

-- 러닝 리포트 (실시간 코스 리포팅)
create table run_reports (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references courses(id),
  user_id uuid references profiles(id),
  tag text not null,
  lat numeric,
  lng numeric,
  report_type text check (report_type in ('auto', 'voice', 'quick_tap', 'watch')) default 'quick_tap',
  created_at timestamptz default now()
);

-- RLS (Row Level Security) 정책
alter table profiles enable row level security;
alter table courses enable row level security;
alter table crews enable row level security;
alter table crew_members enable row level security;
alter table course_reviews enable row level security;
alter table run_reports enable row level security;

-- 누구나 읽기 가능
create policy "Public read" on profiles for select using (true);
create policy "Public read" on courses for select using (true);
create policy "Public read" on crews for select using (true);
create policy "Public read" on crew_members for select using (true);
create policy "Public read" on course_reviews for select using (true);
create policy "Public read" on run_reports for select using (true);

-- 본인만 수정 가능
create policy "Own update" on profiles for update using (auth.uid() = id);
create policy "Auth insert" on courses for insert with check (auth.uid() = created_by);
create policy "Auth insert" on crews for insert with check (auth.uid() = host_id);
create policy "Auth insert" on crew_members for insert with check (auth.uid() = user_id);
create policy "Auth insert" on course_reviews for insert with check (auth.uid() = user_id);
create policy "Auth insert" on run_reports for insert with check (auth.uid() = user_id);
