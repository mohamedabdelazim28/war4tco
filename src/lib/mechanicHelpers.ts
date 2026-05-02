import { useEffect, useRef, useCallback } from 'react';
import { supabase } from './supabase';
import { getCurrentPosition } from '../utils/location';
import { decode } from 'base64-arraybuffer';

const LOCATION_UPDATE_INTERVAL_MS = 10_000;

/**
 * Fetch the current user's mechanic row id (mechanics.id). Returns null if not a mechanic.
 * If the user has role mechanic but no row exists, inserts one and returns the new id.
 */
export async function getMechanicId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let { data, error } = await supabase
    .from('mechanics')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) return null;
  if (data) return data.id;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if ((profile as { role?: string } | null)?.role !== 'mechanic') return null;

  const { data: inserted, error: insertErr } = await supabase
    .from('mechanics')
    .insert({ user_id: user.id })
    .select('id')
    .single();

  if (insertErr || !inserted) return null;
  return inserted.id;
}

// ─── Profile helpers ──────────────────────────────────────────────

export interface MechanicFullProfile {
  mechanicId: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  workshopName: string | null;
  experienceYears: number | null;
  rating: number | null;
  availabilityStatus: string;
  bio: string | null;
}

/** Fetch the full mechanic profile (mechanics + profiles join). */
export async function getMechanicProfile(): Promise<MechanicFullProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('mechanics')
    .select('id, user_id, workshop_name, experience_years, rating, availability_status, phone, bio')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, email, phone, avatar_url')
    .eq('id', user.id)
    .single();

  return {
    mechanicId: data.id,
    userId: data.user_id,
    name: (profile as any)?.name ?? 'Mechanic',
    email: (profile as any)?.email ?? '',
    phone: data.phone ?? (profile as any)?.phone ?? null,
    avatarUrl: (profile as any)?.avatar_url ?? null,
    workshopName: data.workshop_name,
    experienceYears: data.experience_years,
    rating: data.rating,
    availabilityStatus: data.availability_status ?? 'offline',
    bio: data.bio ?? null,
  };
}

/** Update mechanic availability status. */
export async function updateAvailability(mechanicId: string, status: 'available' | 'busy' | 'offline'): Promise<void> {
  await supabase
    .from('mechanics')
    .update({ availability_status: status, updated_at: new Date().toISOString() })
    .eq('id', mechanicId);
}

// ─── Stats ──────────────────────────────────────────────────────

export interface MechanicStats {
  jobsCompleted: number;
  rating: number | null;
  totalRequests: number;
  activeJobs: number;
}

export async function getMechanicStats(mechanicId: string): Promise<MechanicStats> {
  const [completedRes, activeRes, allRes, mechRes] = await Promise.all([
    supabase
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('mechanic_id', mechanicId)
      .eq('status', 'completed'),
    supabase
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('mechanic_id', mechanicId)
      .in('status', ['accepted', 'in_progress']),
    supabase
      .from('requests')
      .select('id', { count: 'exact', head: true })
      .eq('mechanic_id', mechanicId),
    supabase
      .from('mechanics')
      .select('rating')
      .eq('id', mechanicId)
      .single(),
  ]);

  return {
    jobsCompleted: completedRes.count ?? 0,
    activeJobs: activeRes.count ?? 0,
    totalRequests: allRes.count ?? 0,
    rating: (mechRes.data as any)?.rating ?? null,
  };
}

// ─── Skills ──────────────────────────────────────────────────────

export async function getSkills(mechanicId: string): Promise<{ id: string; skill_name: string }[]> {
  const { data } = await supabase
    .from('mechanic_skills')
    .select('id, skill_name')
    .eq('mechanic_id', mechanicId)
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function addSkill(mechanicId: string, skillName: string): Promise<{ id: string; skill_name: string } | null> {
  const { data, error } = await supabase
    .from('mechanic_skills')
    .insert({ mechanic_id: mechanicId, skill_name: skillName.trim() })
    .select('id, skill_name')
    .single();
  if (error) return null;
  return data;
}

export async function deleteSkill(skillId: string): Promise<void> {
  await supabase.from('mechanic_skills').delete().eq('id', skillId);
}

// ─── Service Areas ──────────────────────────────────────────────

export async function getServiceAreas(mechanicId: string): Promise<{ id: string; area_name: string }[]> {
  const { data } = await supabase
    .from('mechanic_service_areas')
    .select('id, area_name')
    .eq('mechanic_id', mechanicId)
    .order('created_at', { ascending: true });
  return data ?? [];
}

export async function addServiceArea(mechanicId: string, areaName: string): Promise<{ id: string; area_name: string } | null> {
  const { data, error } = await supabase
    .from('mechanic_service_areas')
    .insert({ mechanic_id: mechanicId, area_name: areaName.trim() })
    .select('id, area_name')
    .single();
  if (error) return null;
  return data;
}

export async function deleteServiceArea(areaId: string): Promise<void> {
  await supabase.from('mechanic_service_areas').delete().eq('id', areaId);
}

// ─── Portfolio ──────────────────────────────────────────────────

export interface PortfolioItem {
  id: string;
  title: string;
  image_url: string | null;
  description: string | null;
}

export async function getPortfolio(mechanicId: string): Promise<PortfolioItem[]> {
  const { data } = await supabase
    .from('mechanic_portfolio')
    .select('id, title, image_url, description')
    .eq('mechanic_id', mechanicId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

/** Upload image to Supabase Storage and return public URL. */
export async function uploadPortfolioImage(userId: string, uri: string): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });

    const fileName = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('mechanic-portfolio')
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) {
      console.error('[uploadPortfolioImage] Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('mechanic-portfolio')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (err) {
    console.error('[uploadPortfolioImage] Error:', err);
    return null;
  }
}

export async function addPortfolioItem(
  mechanicId: string,
  title: string,
  imageUrl: string | null,
  description?: string,
): Promise<PortfolioItem | null> {
  const { data, error } = await supabase
    .from('mechanic_portfolio')
    .insert({
      mechanic_id: mechanicId,
      title: title.trim(),
      image_url: imageUrl,
      description: description?.trim() || null,
    })
    .select('id, title, image_url, description')
    .single();
  if (error) return null;
  return data;
}

export async function deletePortfolioItem(itemId: string): Promise<void> {
  await supabase.from('mechanic_portfolio').delete().eq('id', itemId);
}

// ─── Nearby Requests ──────────────────────────────────────────

export interface NearbyRequest {
  id: string;
  customerName: string;
  customerPhone: string | null;
  problem: string | null;
  locationLat: number | null;
  locationLng: number | null;
  createdAt: string;
  distanceKm: number;
}

export async function fetchNearbyRequests(mechanicLat?: number, mechanicLng?: number): Promise<NearbyRequest[]> {
  const { data, error } = await supabase
    .from('requests')
    .select('id, user_id, status, problem_description, location_lat, location_lng, created_at')
    .eq('status', 'pending')
    .is('mechanic_id', null)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) return [];

  // Fetch user profiles for names
  const userIds = [...new Set(data.map((r: any) => r.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, phone')
    .in('id', userIds);

  const profileMap: Record<string, { name: string; phone: string | null }> = {};
  (profiles ?? []).forEach((p: any) => {
    profileMap[p.id] = { name: p.name ?? 'Customer', phone: p.phone };
  });

  return data.map((r: any) => {
    let dist = 0;
    if (mechanicLat != null && mechanicLng != null && r.location_lat != null && r.location_lng != null) {
      dist = haversineDistance(mechanicLat, mechanicLng, r.location_lat, r.location_lng);
    }
    return {
      id: r.id,
      customerName: profileMap[r.user_id]?.name ?? 'Customer',
      customerPhone: profileMap[r.user_id]?.phone ?? null,
      problem: r.problem_description,
      locationLat: r.location_lat,
      locationLng: r.location_lng,
      createdAt: r.created_at,
      distanceKm: dist,
    };
  });
}

export async function acceptRequest(requestId: string, mechanicId: string): Promise<boolean> {
  const { error } = await supabase
    .from('requests')
    .update({ mechanic_id: mechanicId, status: 'accepted' })
    .eq('id', requestId)
    .eq('status', 'pending');
  return !error;
}

export async function updateRequestStatus(
  requestId: string,
  status: 'in_progress' | 'completed' | 'cancelled',
): Promise<boolean> {
  const update: Record<string, unknown> = { status };
  if (status === 'completed') {
    update.completed_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from('requests')
    .update(update)
    .eq('id', requestId);
  return !error;
}

// ─── Jobs (accepted requests) ──────────────────────────────────

export interface MechanicJob {
  id: string;
  customerName: string;
  customerPhone: string | null;
  problem: string | null;
  status: string;
  locationLat: number | null;
  locationLng: number | null;
  createdAt: string;
  completedAt: string | null;
}

export async function fetchMechanicJobs(mechanicId: string): Promise<MechanicJob[]> {
  const { data, error } = await supabase
    .from('requests')
    .select('id, user_id, status, problem_description, location_lat, location_lng, created_at, completed_at')
    .eq('mechanic_id', mechanicId)
    .in('status', ['accepted', 'in_progress', 'completed'])
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];

  const userIds = [...new Set(data.map((r: any) => r.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, phone')
    .in('id', userIds);

  const profileMap: Record<string, { name: string; phone: string | null }> = {};
  (profiles ?? []).forEach((p: any) => {
    profileMap[p.id] = { name: p.name ?? 'Customer', phone: p.phone };
  });

  return data.map((r: any) => ({
    id: r.id,
    customerName: profileMap[r.user_id]?.name ?? 'Customer',
    customerPhone: profileMap[r.user_id]?.phone ?? null,
    problem: r.problem_description,
    status: r.status,
    locationLat: r.location_lat,
    locationLng: r.location_lng,
    createdAt: r.created_at,
    completedAt: r.completed_at,
  }));
}

// ─── Bookings ──────────────────────────────────────────────────

export interface MechanicBooking {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string | null;
  date: string;
  time: string;
  status: string;
  createdAt: string;
}

export async function fetchMechanicBookings(mechanicId: string): Promise<MechanicBooking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, user_id, date, time, status, created_at')
    .eq('mechanic_id', mechanicId)
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  if (error || !data) return [];

  const userIds = [...new Set(data.map((b: any) => b.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, phone')
    .in('id', userIds);

  const profileMap: Record<string, { name: string; phone: string | null }> = {};
  (profiles ?? []).forEach((p: any) => {
    profileMap[p.id] = { name: p.name ?? 'Customer', phone: p.phone };
  });

  return data.map((b: any) => ({
    id: b.id,
    userId: b.user_id,
    customerName: profileMap[b.user_id]?.name ?? 'Customer',
    customerPhone: profileMap[b.user_id]?.phone ?? null,
    date: b.date,
    time: b.time,
    status: b.status,
    createdAt: b.created_at,
  }));
}

export async function updateBookingStatus(bookingId: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<boolean> {
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);
  return !error;
}

// ─── Location helpers ──────────────────────────────────────────

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Upsert current position into mechanic_locations: update existing row for this mechanic or insert.
 */
async function upsertMechanicLocation(mechanicId: string, lat: number, lng: number): Promise<void> {
  const { data: existing } = await supabase
    .from('mechanic_locations')
    .select('id')
    .eq('mechanic_id', mechanicId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('mechanic_locations')
      .update({ lat, lng, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
  } else {
    await supabase.from('mechanic_locations').insert({
      mechanic_id: mechanicId,
      lat,
      lng,
    });
  }
}

/**
 * Hook: when the current user is a mechanic, updates mechanic_locations every 10 seconds with current position.
 * Call from a mechanic-scoped component (e.g. inside MechanicStack or Requests tab).
 */
export function useMechanicLocationUpdates(): void {
  const mechanicIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(async () => {
    if (!mechanicIdRef.current) {
      mechanicIdRef.current = await getMechanicId();
    }
    const mid = mechanicIdRef.current;
    if (!mid) return;

    const location = await getCurrentPosition();
    if (!location) return;

    const { latitude, longitude } = location.coords;
    await upsertMechanicLocation(mid, latitude, longitude);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const mid = await getMechanicId();
      if (cancelled) return;
      mechanicIdRef.current = mid;
      if (!mid) return;

      await tick();
      intervalRef.current = setInterval(tick, LOCATION_UPDATE_INTERVAL_MS);
    })();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [tick]);
}
