-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.attempt_answers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  attempt_id uuid NOT NULL,
  question_id uuid NOT NULL,
  choice_id uuid,
  is_flagged boolean DEFAULT false,
  answered_at timestamp with time zone DEFAULT now(),
  CONSTRAINT attempt_answers_pkey PRIMARY KEY (id),
  CONSTRAINT attempt_answers_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.attempts(id),
  CONSTRAINT attempt_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id),
  CONSTRAINT attempt_answers_choice_id_fkey FOREIGN KEY (choice_id) REFERENCES public.choices(id)
);
CREATE TABLE public.attempts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id text NOT NULL,
  package_id uuid NOT NULL,
  status text DEFAULT 'in_progress'::text CHECK (status = ANY (ARRAY['in_progress'::text, 'completed'::text, 'abandoned'::text])),
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  time_remaining integer DEFAULT 6000000,
  score_twk integer,
  score_tiu integer,
  score_tkp integer,
  final_score integer,
  is_passed boolean,
  percentile numeric,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT attempts_pkey PRIMARY KEY (id),
  CONSTRAINT attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id),
  CONSTRAINT attempts_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id)
);
CREATE TABLE public.choices (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  question_id uuid NOT NULL,
  label text NOT NULL CHECK (label = ANY (ARRAY['A'::text, 'B'::text, 'C'::text, 'D'::text, 'E'::text])),
  content text NOT NULL,
  is_answer boolean DEFAULT false,
  score integer CHECK (score >= 1 AND score <= 5),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT choices_pkey PRIMARY KEY (id),
  CONSTRAINT choices_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.package_questions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  package_id uuid NOT NULL,
  question_id uuid NOT NULL,
  position integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT package_questions_pkey PRIMARY KEY (id),
  CONSTRAINT package_questions_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id),
  CONSTRAINT package_questions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id)
);
CREATE TABLE public.packages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  difficulty text DEFAULT 'medium'::text CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])),
  duration_minutes integer DEFAULT 100,
  is_active boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  created_by text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT packages_pkey PRIMARY KEY (id),
  CONSTRAINT packages_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(user_id)
);
CREATE TABLE public.profiles (
  user_id text NOT NULL,
  email text NOT NULL UNIQUE,
  full_name text,
  phone text,
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text])),
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  subscription_tier text DEFAULT 'free'::text,
  is_deleted boolean DEFAULT false,
  deleted_at timestamp with time zone,
  CONSTRAINT profiles_pkey PRIMARY KEY (user_id)
);
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category text NOT NULL CHECK (category = ANY (ARRAY['TWK'::text, 'TIU'::text, 'TKP'::text])),
  content text NOT NULL,
  explanation text,
  topic text,
  difficulty text DEFAULT 'medium'::text CHECK (difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])),
  image_url text,
  type text DEFAULT 'multiple_choice'::text,
  is_published boolean DEFAULT false,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'deleted'::text])),
  is_deleted boolean DEFAULT false,
  created_by text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(user_id)
);