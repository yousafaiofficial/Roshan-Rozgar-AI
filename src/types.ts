export interface WorkerProfile {
  id: string;
  name: string;
  name_ur: string;
  trade: string;
  trade_ur: string;
  experience_years: number;
  area: string;
  city: 'Islamabad' | 'Rawalpindi';
  latitude: number;
  longitude: number;
  starting_price: number;
  bio: string;
  bio_ur: string;
  skills: string[];
  is_available: boolean;
  rating: number;
  completed_jobs: number;
  phone: string;
  avatar_url?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  area: string;
  city: 'Islamabad' | 'Rawalpindi';
  created_at: string;
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  worker_id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  worker_name: string;
  worker_trade: string;
  service: string;
  description: string;
  urgency: 'Today' | 'Within 24 Hours' | 'Flexible' | 'Emergency';
  area: string;
  proposed_price: number;
  counter_price?: number;
  agreed_price: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_role: 'worker' | 'customer';
  sender_name: string;
  transcript: string;
  audio_url?: string;
  is_voice: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  worker_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  categories: {
    work_quality: number;
    punctuality: number;
    communication: number;
    professionalism: number;
  };
  ai_summary?: string;
  created_at: string;
}

export type AppLanguage = 'en' | 'roman' | 'ur';

export type UserRole = 'customer' | 'worker';
