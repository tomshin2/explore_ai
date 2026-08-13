import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  updated_at: string | null;
};

type AuthResult = { session: Session | null; error: Error | null };

type StoredUser = {
  id: string;
  email: string;
  password: string;
  profile: { username: string | null; full_name: string | null } | null;
};

const USERS_KEY = 'demo_users';
const SESSION_KEY = 'demo_session';

const listeners = new Set<(session: Session | null) => void>();

function notify(session: Session | null) {
  listeners.forEach((fn) => fn(session));
}

async function loadUsers(): Promise<Record<string, StoredUser>> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as Record<string, StoredUser>) : {};
}

async function persistUsers(users: Record<string, StoredUser>) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function makeId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function toSession(user: StoredUser): Session {
  return {
    access_token: 'demo-token',
    refresh_token: 'demo-refresh',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: {
      id: user.id,
      aud: 'authenticated',
      role: 'authenticated',
      email: user.email,
      email_confirmed_at: new Date().toISOString(),
    } as unknown as Session['user'],
  } as Session;
}

async function demoSignUp(email: string, password: string): Promise<AuthResult> {
  const users = await loadUsers();
  const key = email.trim().toLowerCase();
  if (users[key]) {
    return { session: null, error: new Error('This email is already registered.') };
  }
  const user: StoredUser = { id: makeId(), email: key, password, profile: null };
  users[key] = user;
  await persistUsers(users);
  const session = toSession(user);
  await AsyncStorage.setItem(SESSION_KEY, user.id);
  notify(session);
  return { session, error: null };
}

async function demoSignIn(email: string, password: string): Promise<AuthResult> {
  const users = await loadUsers();
  const key = email.trim().toLowerCase();
  const user = users[key];
  if (!user || user.password !== password) {
    return { session: null, error: new Error('Invalid email or password.') };
  }
  const session = toSession(user);
  await AsyncStorage.setItem(SESSION_KEY, user.id);
  notify(session);
  return { session, error: null };
}

async function demoSignOut(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
  notify(null);
}

async function demoGetSession(): Promise<Session | null> {
  const userId = await AsyncStorage.getItem(SESSION_KEY);
  if (!userId) return null;
  const users = await loadUsers();
  const user = Object.values(users).find((u) => u.id === userId);
  return user ? toSession(user) : null;
}

async function demoGetProfile(userId: string): Promise<Profile | null> {
  const users = await loadUsers();
  const user = Object.values(users).find((u) => u.id === userId);
  if (!user) return null;
  return {
    id: user.id,
    username: user.profile?.username ?? null,
    full_name: user.profile?.full_name ?? null,
    updated_at: null,
  };
}

async function demoGetProfiles(): Promise<Profile[]> {
  const users = await loadUsers();
  return Object.values(users).map((u) => ({
    id: u.id,
    username: u.profile?.username ?? null,
    full_name: u.profile?.full_name ?? null,
    updated_at: null,
  }));
}

async function demoUpsertProfile(profile: {
  id: string;
  username: string | null;
  full_name: string | null;
}): Promise<Error | null> {
  const users = await loadUsers();
  const user = Object.values(users).find((u) => u.id === profile.id);
  if (!user) return new Error('User not found.');
  user.profile = { username: profile.username, full_name: profile.full_name };
  await persistUsers(users);
  return null;
}

export const api = {
  configured: isSupabaseConfigured,

  async getSession(): Promise<Session | null> {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
    return demoGetSession();
  },

  onSessionChange(cb: (session: Session | null) => void): () => void {
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
      return () => data.subscription.unsubscribe();
    }
    listeners.add(cb);
    return () => listeners.delete(cb);
  },

  async signUp(email: string, password: string): Promise<AuthResult> {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { session: data.session, error };
    }
    return demoSignUp(email, password);
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { session: data.session, error };
    }
    return demoSignIn(email, password);
  },

  async signOut(): Promise<Error | null> {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      return error;
    }
    await demoSignOut();
    return null;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    if (supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, updated_at')
        .eq('id', userId)
        .maybeSingle();
      return data as Profile | null;
    }
    return demoGetProfile(userId);
  },

  async getProfiles(): Promise<Profile[]> {
    if (supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, updated_at')
        .order('username' as never, { ascending: true } as never);
      return (data as Profile[]) ?? [];
    }
    return demoGetProfiles();
  },

  async upsertProfile(profile: {
    id: string;
    username: string | null;
    full_name: string | null;
  }): Promise<Error | null> {
    if (supabase) {
      const { error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });
      return error;
    }
    return demoUpsertProfile(profile);
  },
};
