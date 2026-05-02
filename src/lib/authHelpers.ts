import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { AuthUser } from '../types';
import type { Role } from '../types';

export interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: Role;
}

function roleFromSession(session: Session): Role {
  const meta = session.user.user_metadata as Record<string, unknown> | undefined;
  const rawMeta = (session.user as { raw_user_meta_data?: Record<string, unknown> }).raw_user_meta_data;
  const appMeta = session.user.app_metadata as Record<string, unknown> | undefined;
  const rawRole = (meta?.role ?? rawMeta?.role ?? appMeta?.role) as string | undefined;
  return rawRole === 'mechanic' || rawRole === 'seller' ? rawRole : 'user';
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, phone, avatar_url, role')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return data as ProfileRow;
}

export async function ensureProfileExists(session: Session): Promise<ProfileRow | null> {
  const existing = await fetchProfile(session.user.id);
  if (existing) return existing;

  const meta = session.user.user_metadata as Record<string, unknown> | undefined;
  const role = roleFromSession(session);

  console.log(
    '[authHelpers] ensureProfileExists creating profile',
    JSON.stringify(
      {
        userId: session.user.id,
        metaRole: (meta?.role as string | undefined) ?? null,
        resolvedRole: role,
      },
      null,
      2
    )
  );

  const { error } = await supabase.from('profiles').insert({
    id: session.user.id,
    name: ((meta?.name ??
      meta?.full_name ??
      session.user.email?.split('@')[0] ??
      null) ?? null) as string | null,
    email: session.user.email ?? null,
    phone: (meta?.phone as string | undefined) ?? null,
    role,
  });

  if (error && error.code !== '23505') return null;
  return fetchProfile(session.user.id);
}

export function authUserFromSession(session: Session, profile: ProfileRow | null): AuthUser {
  const id = session.user.id;
  const email = profile?.email ?? session.user.email ?? '';
  const name = profile?.name ?? session.user.user_metadata?.name ?? email.split('@')[0] ?? 'User';
  const role: Role = profile?.role ?? roleFromSession(session);
  return {
    id,
    name,
    email,
    role,
    phone: profile?.phone ?? undefined,
    avatar_url: profile?.avatar_url ?? undefined,
    token: session.access_token,
  };
}

export async function getAuthUserFromSession(): Promise<AuthUser | null> {
  const result = await getSessionWithProfile();
  return result?.authUser ?? null;
}

export async function ensureMechanicRoleAndRow(
  session: Session,
  profile: ProfileRow | null
): Promise<ProfileRow | null> {
  const meta = session.user.user_metadata as Record<string, string> | undefined;
  const rawMeta = (session.user as { raw_user_meta_data?: Record<string, string> }).raw_user_meta_data;
  const metaRole = meta?.role ?? rawMeta?.role;
  const targetRole: Role = roleFromSession(session);

  console.log(
    '[authHelpers] ensureMechanicRoleAndRow',
    JSON.stringify(
      {
        userId: session.user.id,
        metaRole,
        existingProfileRole: profile?.role,
        targetRole,
      },
      null,
      2
    )
  );

  if (profile && profile.role !== targetRole && (targetRole === 'mechanic' || targetRole === 'seller')) {
    await supabase
      .from('profiles')
      .update({ role: targetRole })
      .eq('id', session.user.id);
    const updated = await fetchProfile(session.user.id);
    if (updated) return updated;
  }

  if (targetRole === 'mechanic' && (profile?.role === 'mechanic' || targetRole === 'mechanic')) {
    const { data: existing } = await supabase
      .from('mechanics')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (!existing) {
      console.log('[authHelpers] Creating mechanics row for user', session.user.id);
      await supabase.from('mechanics').insert({ user_id: session.user.id });
    } else {
      console.log('[authHelpers] Mechanics row already exists for user', session.user.id);
    }
  }

  if (targetRole === 'seller' && (profile?.role === 'seller' || targetRole === 'seller')) {
    const { data: existing } = await supabase
      .from('sellers')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (!existing) {
      console.log('[authHelpers] Creating sellers row for user', session.user.id);
      const meta = session.user.user_metadata as Record<string, string> | undefined;
      await supabase.from('sellers').insert({
        user_id: session.user.id,
        shop_name: meta?.name ?? null,
      });
    } else {
      console.log('[authHelpers] Sellers row already exists for user', session.user.id);
    }
  }

  return profile;
}

export async function getSessionWithProfile(): Promise<{
  session: Session;
  profile: ProfileRow | null;
  authUser: AuthUser;
} | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  let profile = await ensureProfileExists(session);
  profile = await ensureMechanicRoleAndRow(session, profile);
  const authUser = authUserFromSession(session, profile);
  return { session, profile, authUser };
}

