import { theme } from '../../../theme';

export function getRequestMarkerColor(status: 'pending' | 'accepted' | 'rejected'): string {
  if (status === 'accepted') return theme.colors.cartoon.mint;
  if (status === 'rejected') return theme.colors.cartoon.red;
  return theme.colors.cartoon.yellow;
}

export function estimateEtaMinutes(distanceKm: number | null): number | null {
  if (distanceKm == null) return null;
  const averageCitySpeedKmH = 22;
  return Math.max(1, Math.round((distanceKm / averageCitySpeedKmH) * 60));
}

export function formatEta(distanceKm: number | null): string {
  const etaMin = estimateEtaMinutes(distanceKm);
  if (etaMin == null) return 'ETA unavailable';
  return `ETA ${etaMin} min`;
}

export function requestStatusLabel(status: 'pending' | 'accepted' | 'rejected'): string {
  if (status === 'accepted') return 'Accepted';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

