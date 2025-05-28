import { supabase } from './supabase/client';

export const getValidSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    throw new Error('Failed to get session');
  }
  
  if (!session) {
    throw new Error('No active session');
  }
  
  return session;
};

export const withSession = async <T>(
  callback: (session: Awaited<ReturnType<typeof getValidSession>>) => Promise<T>
): Promise<T> => {
  const session = await getValidSession();
  return callback(session);
};
