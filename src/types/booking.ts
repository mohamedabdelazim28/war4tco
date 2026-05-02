export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type AvailabilityStatus = 'available' | 'busy' | 'offline';

export interface Booking {
  id: string;
  user_id: string;
  mechanic_id: string;
  date: string;
  time: string;
  status: BookingStatus;
  created_at: string;
}

export interface Mechanic {
  id: string;
  user_id: string;
  workshop_name: string | null;
  experience_years: number | null;
  rating: number | null;
  availability_status: AvailabilityStatus;
  created_at: string;
  updated_at: string;
}

export interface MechanicWithProfile extends Mechanic {
  profile: {
    name: string | null;
    email: string | null;
  } | null;
}
