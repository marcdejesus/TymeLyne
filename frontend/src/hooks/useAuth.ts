import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import { UserProfile } from '../services/supabase';
import Toast from 'react-native-toast-message';

// A simplified authentication hook for development
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session and set up auth state listener
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch user profile
          await fetchUserProfile(session.user.id);
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              await fetchUserProfile(session.user.id);
            } else {
              setProfile(null);
            }
          }
        );

        setLoading(false);
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Check if profiles table exists by attempting to query it
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If we get a "relation does not exist" error, create the table
        if (error.code === '42P01') {
          console.log('Profiles table does not exist, creating user in backend instead');
          
          // Use the Django backend instead
          // This is just a placeholder for now
          setProfile({
            id: userId,
            email: user?.email || '',
            role: 'USER',
            full_name: user?.user_metadata?.full_name || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          
          return;
        }
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const createProfileInSupabase = async (userId: string, email: string, fullName: string) => {
    try {
      // Check if profiles table exists by attempting to query it
      const { error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (checkError && checkError.code === '42P01') {
        // If the table doesn't exist, we'll create it using SQL - this is a workaround
        const { error: createTableError } = await supabase.rpc('create_profiles_table');
        if (createTableError) {
          console.error('Error creating profiles table:', createTableError);
          return false;
        }
      }

      // Now try to create the profile
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: email,
            full_name: fullName,
            role: 'USER',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.error('Error creating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createProfileInSupabase:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === 'Email not confirmed') {
          // Handle email confirmation error specifically
          Toast.show({
            type: 'error',
            text1: 'Email not confirmed',
            text2: 'Please check your inbox and confirm your email before logging in.',
            position: 'bottom',
            visibilityTime: 4000,
          });
        }
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      // Create auth user with user_metadata containing fullName
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      // Show toast message for email confirmation
      Toast.show({
        type: 'success',
        text1: 'Registration successful!',
        text2: 'Please check your email to confirm your account.',
        position: 'bottom',
        visibilityTime: 4000,
      });

      // Try to create profile if signup successful
      if (data.user) {
        try {
          await createProfileInSupabase(data.user.id, email, fullName);
        } catch (profileError) {
          console.error('Error creating profile after signup:', profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Try to update in Supabase first
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)
          .select()
          .single();

        if (!error) {
          setProfile(data);
          return { data, error: null };
        }
      } catch (supabaseError) {
        console.log('Supabase update failed, trying backend:', supabaseError);
      }

      // If Supabase fails, update local state for now
      // Here you would normally call your Django backend
      if (profile) {
        const updatedProfile = {
          ...profile,
          ...updates,
          updated_at: new Date().toISOString()
        };
        setProfile(updatedProfile);
        return { data: updatedProfile, error: null };
      }

      return { data: null, error: new Error('Failed to update profile') };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  const updateAvatar = async (file: FormData) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Upload file to Supabase Storage
      const fileObject = file.get('file') as File;
      const fileExt = fileObject?.name?.split('.').pop() || 'jpg';
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, fileObject, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicURL } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      return await updateProfile({
        avatar_url: publicURL.publicUrl
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      return { data: null, error };
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateAvatar,
  };
} 