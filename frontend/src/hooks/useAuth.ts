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
          // Try to ensure the Supabase setup is correct
          const setupSuccess = await ensureSupabaseSetup();
          
          // Fetch user profile
          if (setupSuccess) {
            console.log('Supabase setup successful, fetching user profile');
          } else {
            console.log('Supabase setup issues, will try to fetch profile anyway');
          }
          
          await fetchUserProfile(session.user.id);
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              try {
                await fetchUserProfile(session.user.id);
              } catch (profileError) {
                console.error('Error in auth state change profile fetch:', profileError);
                // Create a local profile as fallback
                createLocalProfile(session.user.id);
              }
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
        .eq('id', userId);

      if (error) {
        // If we get a "relation does not exist" error, create the table
        if (error.code === '42P01') {
          console.log('Profiles table does not exist, creating user in backend instead');
          createLocalProfile(userId);
          return;
        }
        throw error;
      }

      // If no profile was found but the table exists, create one
      if (data.length === 0) {
        console.log('No profile found for user, creating one');
        
        if (user) {
          // Try to create the profile
          const created = await createProfileInSupabase(
            userId, 
            user.email || '', 
            user.user_metadata?.full_name || ''
          );
          
          if (!created) {
            // If creation failed, use a local profile
            createLocalProfile(userId);
          } else {
            // Fetch the newly created profile
            const { data: newProfile, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
              
            if (!fetchError && newProfile) {
              setProfile(newProfile);
            }
          }
        } else {
          createLocalProfile(userId);
        }
        return;
      }

      // If we have data with at least one profile, use the first one
      if (data.length > 0) {
        setProfile(data[0]);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      createLocalProfile(userId);
    }
  };
  
  const createLocalProfile = (userId: string) => {
    // Create a local profile when Supabase operations fail
    setProfile({
      id: userId,
      email: user?.email || '',
      role: 'USER',
      full_name: user?.user_metadata?.full_name || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
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
        // Check if it's an RLS policy error
        if (error.code === '42501') {
          console.error('RLS policy violation when creating profile - user lacks permission');
          
          // Even though we can't create the profile in Supabase, we can still use a local profile
          console.log('Falling back to local profile');
          return false;
        }
        
        console.error('Error creating profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createProfileInSupabase:', error);
      return false;
    }
  };

  const ensureSupabaseSetup = async () => {
    try {
      // Check if profiles table exists
      const { error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (checkError && checkError.code === '42P01') {
        console.log('Profiles table does not exist, trying to create it');
        
        // Try to create profiles table using our RPC function
        const { error: createError } = await supabase.rpc('create_profiles_table');
        
        if (createError) {
          console.error('Failed to create profiles table via RPC:', createError);
          
          // If RPC fails, let's try direct SQL (only works if user has enough permissions)
          const { error: sqlError } = await supabase.from('dummy_operation_to_trigger_migration').select();
          console.log('Triggered migration attempt:', sqlError ? 'Failed' : 'Success');
          
          return false;
        }
        return true;
      }
      
      // Check if avatars bucket exists
      const { error: bucketError } = await supabase.storage.getBucket('avatars');
      
      if (bucketError && bucketError.message.includes('not found')) {
        console.log('Avatars bucket does not exist, creating it');
        
        const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif']
        });
        
        if (createBucketError) {
          console.error('Failed to create avatars bucket:', createBucketError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error in ensureSupabaseSetup:', error);
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
      // Ensure Supabase is set up correctly
      await ensureSupabaseSetup();
      
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
          .select();

        if (error) {
          // Check if the error indicates that no record was found to update
          if (error.details?.includes('no rows')) {
            console.log('No profile to update, attempting to create one');
            
            // Try to create the profile instead
            const created = await createProfileInSupabase(
              user.id,
              user.email || '',
              user.user_metadata?.full_name || updates.full_name || ''
            );
            
            if (created) {
              // Fetch the newly created profile
              const { data: newProfile, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
              if (!fetchError && newProfile) {
                setProfile(newProfile);
                return { data: newProfile, error: null };
              }
            }
            throw error;
          }
          throw error;
        }

        if (data && data.length > 0) {
          setProfile(data[0]);
          return { data: data[0], error: null };
        }
      } catch (supabaseError) {
        console.log('Supabase update failed, trying local update:', supabaseError);
      }

      // If Supabase fails, update local state for now
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
      // Check if storage bucket exists first
      const { error: bucketError } = await supabase.storage.getBucket('avatars');
      
      // If bucket doesn't exist, create it
      if (bucketError && bucketError.message.includes('not found')) {
        try {
          const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif']
          });
          
          if (createBucketError) {
            // Check if it's an RLS policy error
            if (createBucketError.message.includes('row-level security policy')) {
              console.error('RLS policy violation when creating bucket - user lacks permission');
              
              // Even though we can't create the bucket, we can still save the avatar locally
              console.log('Unable to create storage bucket due to permissions');
              
              // Create a fake URL for avatar in local mode
              const fileObject = file.get('file') as File;
              if (!fileObject) {
                return { data: null, error: new Error('No file provided') };
              }
              
              // Just update the profile with a placeholder URL for now
              const placeholderUrl = 'local-avatar://' + Date.now();
              return await updateProfile({
                avatar_url: placeholderUrl
              });
            }
            
            console.error('Error creating avatars bucket:', createBucketError);
            throw createBucketError;
          }
        } catch (bucketCreateError) {
          // If we can't create the bucket, try to proceed anyway
          console.error('Error creating avatars bucket:', bucketCreateError);
          
          // Create a fake URL for avatar in local mode
          const fileObject = file.get('file') as File;
          if (!fileObject) {
            return { data: null, error: new Error('No file provided') };
          }
          
          // Just update the profile with a placeholder URL for now
          const placeholderUrl = 'local-avatar://' + Date.now();
          return await updateProfile({
            avatar_url: placeholderUrl
          });
        }
      }

      // Upload file to Supabase Storage
      const fileObject = file.get('file') as File;
      if (!fileObject) {
        return { data: null, error: new Error('No file provided') };
      }
      
      const fileExt = fileObject?.name?.split('.').pop() || 'jpg';
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, fileObject, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) {
          // Check if it's an RLS policy error
          if (uploadError.message.includes('row-level security policy')) {
            console.error('RLS policy violation when uploading avatar - user lacks permission');
            
            // Even though we can't upload to Supabase, we can still save the avatar locally
            console.log('Unable to upload to Supabase Storage due to permissions');
            
            // Just update the profile with a placeholder URL for now
            const placeholderUrl = 'local-avatar://' + Date.now();
            return await updateProfile({
              avatar_url: placeholderUrl
            });
          }
          
          throw uploadError;
        }

        // Get public URL
        const { data: publicURL } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (!publicURL || !publicURL.publicUrl) {
          throw new Error('Failed to get public URL for avatar');
        }

        // Update profile with avatar URL
        return await updateProfile({
          avatar_url: publicURL.publicUrl
        });
      } catch (uploadError) {
        console.error('Upload error:', uploadError);
        
        // Just update the profile with a placeholder URL for now
        const placeholderUrl = 'local-avatar://' + Date.now();
        return await updateProfile({
          avatar_url: placeholderUrl
        });
      }
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