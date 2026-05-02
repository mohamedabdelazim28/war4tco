import type { JobStatus } from '../../../components/ui';

/**
 * Types kept for backward compatibility.
 * All mock data has been removed — screens now use Supabase directly.
 */

export type MechanicRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface MechanicRequestItem {
  id: string;
  customerName: string;
  customerAvatar?: string;
  problem: string;
  status: MechanicRequestStatus;
  requestTime: string;
  locationLat: number;
  locationLng: number;
  distanceKm: number;
  carImages?: string[];
  phone?: string;
}

export interface MechanicJobItem {
  id: string;
  customerName: string;
  customerAvatar?: string;
  problem: string;
  status: JobStatus;
  eta: string;
  distanceKm: number;
  startTime?: string;
  endTime?: string;
  locationLat: number;
  locationLng: number;
  priceLabel: string;
  serviceType: string;
  locationLabel: string;
  scheduledTime: string;
  phone?: string;
}

export interface MechanicProfilePortfolioItem {
  id: string;
  title: string;
  imageUrl: string;
}

export interface MechanicProfileData {
  name: string;
  avatarUrl?: string;
  workshopName: string;
  rating: number;
  experienceYears: number;
  services: string[];
  serviceAreas: string[];
  portfolio: MechanicProfilePortfolioItem[];
  availability: boolean;
  jobsCompleted: number;
  avgResponseTimeMin: number;
  avgJobDurationMin: number;
  email: string;
  phone?: string;
}
