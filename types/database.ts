/**
 * Database Types
 * Auto-gerado baseado no schema do Supabase
 */

export interface Database {
  public: {
    Tables: {
      certifications: {
        Row: Certification;
        Insert: Omit<Certification, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Certification, 'id' | 'created_at'>>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Question, 'id' | 'created_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      quiz_attempts: {
        Row: QuizAttempt;
        Insert: Omit<QuizAttempt, 'id' | 'completed_at'>;
        Update: Partial<Omit<QuizAttempt, 'id'>>;
      };
      user_answers: {
        Row: UserAnswer;
        Insert: Omit<UserAnswer, 'id' | 'answered_at'>;
        Update: Partial<Omit<UserAnswer, 'id'>>;
      };
      flashcards: {
        Row: Flashcard;
        Insert: Omit<Flashcard, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Flashcard, 'id' | 'created_at'>>;
      };
      user_achievements: {
        Row: UserAchievement;
        Insert: Omit<UserAchievement, 'unlocked_at'>;
        Update: never;
      };
    };
  };
}

export interface Certification {
  id: string; // 'SAA-C03', 'CLF-C02', 'AIF-C01'
  name: string;
  short_name: string;
  description: string;
  exam_duration_minutes: number;
  total_questions: number;
  passing_score: number;
  domains: DomainInfo[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DomainInfo {
  key: string; // 'SECURE', 'RESILIENT', etc.
  label: string;
  weight: number; // 0.0 - 1.0
  color: string; // hex color
}

export interface Question {
  id: string; // 'saa-secure-001'
  certification_id: string;
  domain: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string | null;
  correct_answer: string;
  correct_answers?: string[] | null;
  required_selection_count?: number | null;
  explanation_basic: string;
  explanation_detailed: string;
  incorrect_explanations: Record<string, string>; // {A: "...", B: "..."}
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  tier: 'FREE' | 'PRO';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string; // UUID (references auth.users)
  plan: 'FREE' | 'PRO' | 'PRO_PLUS';
  daily_quiz_count: number;
  daily_quiz_reset_at: string;
  ai_questions_today: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  subscription_ends_at: string | null;
  xp: number;
  level: number;
  streak_days: number;
  last_activity_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string; // UUID
  user_id: string;
  certification_id: string;
  quiz_type: 'daily' | 'full' | 'practice' | 'domains' | 'review';
  questions_count: number;
  time_limit_seconds: number | null;
  questions_answered: number;
  correct_answers: number;
  score: number; // 100-1000
  domain_breakdown: Record<string, DomainStats>;
  duration_seconds: number | null;
  completed_at: string;
}

export interface DomainStats {
  correct: number;
  total: number;
}

export interface UserAnswer {
  id: string; // UUID
  user_id: string;
  quiz_attempt_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  marked_for_review: boolean;
  time_spent_seconds: number | null;
  answered_at: string;
}

export interface Flashcard {
  id: string; // UUID
  user_id: string;
  certification_id: string;
  front: string;
  back: string;
  source: 'predefined' | 'ai_generated' | 'user_created';
  tags: string[];
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}
