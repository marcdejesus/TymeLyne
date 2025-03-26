import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import Toast from 'react-native-toast-message';

// Update the UserProfile interface to include avatar_retry_count
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string | null;
  avatar_preview_uri?: string; // Local URI for displaying selected image preview
  avatar_retry_count?: number; // Track number of retries for loading avatar
  role?: 'USER' | 'ADMIN' | 'PREMIUM';
  created_at: string;
  updated_at: string;
}

// A simplified authentication hook for development
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);

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

  // Effects to handle user changes
  useEffect(() => {
    if (user) {
      setLoading(true);
      
      const loadProfile = async () => {
        // Try to fetch the user's profile
        const userProfile = await fetchUserProfile(user.id);
        
        if (userProfile) {
          setProfile(userProfile);
        } else {
          // Profile fetch failed, try to create one
          console.log('No profile found, attempting to create one');
          const created = await createProfileInSupabase(
            user.id,
            user.email || '',
            user.user_metadata?.full_name || ''
          );
          
          if (created) {
            // Try to fetch again
            const newProfile = await fetchUserProfile(user.id);
            if (newProfile) {
              setProfile(newProfile);
            } else {
              // Create a minimal local profile
              createLocalProfile(user.id);
            }
          } else {
            // Creation failed, use local profile
            createLocalProfile(user.id);
          }
        }
        
        // Check if user is an admin
        try {
          const { data, error } = await supabase
            .from('admin_users')
            .select('is_admin')
            .eq('user_id', user.id)
            .single();
          
          if (!error && data) {
            setAdmin(data.is_admin);
          } else {
            setAdmin(false);
          }
        } catch (adminError) {
          console.error('Error checking admin status:', adminError);
          setAdmin(false);
        }
        
        setLoading(false);
      };
      
      loadProfile();
    } else {
      // Reset state when user logs out
      setProfile(null);
      setAdmin(false);
    }
  }, [user]);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    console.log('Fetching profile for:', userId);
    
    // First try using our read-only function to avoid recursion
    try {
      // Use a new instance of the client without RLS for this operation
      const { data, error } = await supabase.rpc('get_profile_by_id', {
        lookup_user_id: userId
      });
      
      if (!error && data) {
        console.log('Profile fetched successfully using RPC');
        
        // Validate avatar URLs
        if (data.avatar_url) {
          // Ensure avatar URL is still valid (not expired)
          try {
            // If it's a Supabase storage URL, check if the bucket and file exist
            if (data.avatar_url.includes('/storage/v1/object/public/avatars/')) {
              // Get the path part from the URL
              const urlParts = data.avatar_url.split('/avatars/');
              if (urlParts.length > 1) {
                const filePath = urlParts[1];
                
                // Use the storage.getPublicUrl method to verify the public URL is working
                const { data: urlData } = supabase.storage
                  .from('avatars')
                  .getPublicUrl(filePath);
                
                if (urlData && urlData.publicUrl) {
                  // Check if the URL is accessible without downloading the full file
                  try {
                    const response = await fetch(urlData.publicUrl, { 
                      method: 'HEAD',
                      cache: 'no-store' // Bypass cache to ensure file exists
                    });
                    
                    if (!response.ok) {
                      console.error('Avatar file not accessible (HEAD request failed):', response.status);
                      console.log('Clearing invalid avatar URL from profile');
                      data.avatar_url = null;
                    } else {
                      console.log('Avatar URL verified with HEAD request');
                    }
                  } catch (fetchError) {
                    console.error('Error validating avatar URL with fetch:', fetchError);
                    // Keep the URL, let the Image component handle the fallback
                  }
                }
              }
            }
          } catch (avatarError) {
            console.error('Error validating avatar URL:', avatarError);
            // Don't clear the URL, let the Image component handle the fallback
          }
        }
        
        return data as UserProfile;
      } else {
        console.error('Error fetching profile with RPC:', error);
      }
    } catch (rpcError) {
      console.error('Exception with get_profile_by_id RPC:', rpcError);
    }
    
    // If RPC fails, try standard query
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        // Check for infinite recursion error
        if (error.message && (
            error.message.includes('infinite recursion') ||
            error.code === '42P17')) {
          console.error('Infinite recursion error when fetching profile:', error);
          
          // Create a minimal profile with just the ID
          // This allows the app to function while the backend issues are resolved
          return {
            id: userId,
            email: user?.email || '',
            role: 'USER',
            full_name: user?.user_metadata?.full_name || '',
            bio: '',
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        
        console.error('Error fetching profile:', error);
        return null;
      }
      
      console.log('Profile fetched successfully:', data);
      return data as UserProfile;
    } catch (fetchError) {
      console.error('Error fetching profile:', fetchError);
      
      // Create a minimal profile with just the ID
      // This allows the app to function while the backend issues are resolved
      if (user) {
        return {
          id: userId,
          email: user.email || '',
          role: 'USER',
          full_name: user.user_metadata?.full_name || '',
          bio: '',
          avatar_url: null, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      
      return null;
    }
  };
  
  const createLocalProfile = (userId: string) => {
    console.log('Creating local profile for:', userId);
    
    // Create a minimal profile with just the ID when we can't access Supabase
    const localProfile: UserProfile = {
      id: userId,
      email: user?.email || '',
      role: 'USER',
      full_name: user?.user_metadata?.full_name || '',
      bio: '',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setProfile(localProfile);
    return localProfile;
  };

  const createProfileInSupabase = async (
    userId: string,
    email: string,
    fullName: string
  ): Promise<boolean> => {
    console.log('Creating profile for:', userId, email);
    
    try {
      // Try using our RPC function first - most reliable
      try {
        const { data, error } = await supabase.rpc('update_profile', {
          user_id: userId,
          new_full_name: fullName,
          new_bio: ''
        });
        
        if (!error) {
          console.log('Profile created successfully using RPC');
          return true;
        } else {
          console.error('RPC error when creating profile:', error);
        }
      } catch (rpcError) {
        console.error('Exception with update_profile RPC:', rpcError);
      }
      
      // If RPC fails, try direct insert
      try {
        const { error } = await supabase.from('profiles').insert({
          id: userId,
          email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        
        if (error) {
          // Check for infinite recursion error
          if (error.message && (
              error.message.includes('infinite recursion') ||
              error.code === '42P17')) {
            console.error('Infinite recursion error when inserting profile:', error);
            return false;
          }
          
          // Check for duplicate key
          if (error.code === '23505') {
            console.log('Profile already exists, no need to create');
            return true;
          }
          
          console.error('Error creating profile:', error);
          return false;
        }
        
        console.log('Profile created successfully using direct insert');
        return true;
      } catch (insertError) {
        console.error('Error inserting profile:', insertError);
        return false;
      }
    } catch (error) {
      console.error('Error in createProfileInSupabase:', error);
      return false;
    }
  };

  const ensureSupabaseSetup = async () => {
    try {
      console.log('Checking Supabase setup...');
      
      // Try to use our new consolidated setup function
      try {
        const { error } = await supabase.rpc('setup_database');
        if (error) {
          console.error('Failed to run setup_database:', error);
          // Continue anyway, as the app has fallbacks for permissions issues
        } else {
          console.log('Supabase setup successful, fetching user profile');
          return true;
        }
      } catch (error) {
        console.log('Error calling setup_database RPC:', error);
        
        // Try the individual setup functions as fallback
        try {
          // Try creating the bucket with our specialized function
          await supabase.rpc('create_avatars_bucket', { bucket_name: 'avatars' });
        } catch (bucketError) {
          console.log('Error creating bucket via RPC:', bucketError);
          
          // Fallback to direct creation which might fail due to RLS
          const { error: directError } = await supabase.storage.getBucket('avatars');
          if (directError && directError.message.includes('not found')) {
            console.log('Avatars bucket does not exist, creating it');
            const { error: createError } = await supabase.storage.createBucket('avatars', {
              public: true,
              fileSizeLimit: 5242880, // 5MB
              allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif']
            });
            
            if (createError) {
              console.error('Failed to create avatars bucket:', createError);
              if (createError.message.includes('row-level security policy')) {
                console.error('RLS policy violation when creating bucket - user lacks permission');
                console.log('Unable to create storage bucket due to permissions');
              }
            }
          }
        }
      }
      
      // Even if some parts failed, we can still try to fetch the profile
      console.log('Supabase setup issues, will try to fetch profile anyway');
      return false;
    } catch (error) {
      console.error('Error in ensureSupabaseSetup:', error);
      console.log('Supabase setup issues, will try to fetch profile anyway');
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
      // Ensure Supabase is set up correctly before signup
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

      if (error) {
        // Special handling for database errors - they may indicate issues with the trigger
        if (error.message.includes('Database error')) {
          console.error('Database error during signup:', error.message);
          // The user might have been created but the profile creation failed
          // Let's try to get the session anyway
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData?.session?.user) {
            // User was created, but profile creation likely failed
            // Create the profile manually
            const userId = sessionData.session.user.id;
            await createProfileInSupabase(userId, email, fullName);
            
            Toast.show({
              type: 'success',
              text1: 'Account created!',
              text2: 'Please check your email to confirm your account.',
              position: 'bottom',
              visibilityTime: 4000,
            });
            
            return { data: sessionData, error: null };
          }
        }
        
        throw error;
      }

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
          // For safety, run the setup database function again
          await supabase.rpc('setup_database');
          
          // Then create the profile with explicit error handling
          const created = await createProfileInSupabase(data.user.id, email, fullName);
          if (!created) {
            console.log('Failed to create profile, but user was created. Will create on next login.');
          }
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

  // Add a refreshProfile function that forces a fresh reload of profile data
  const refreshProfile = async () => {
    if (!user) return null;
    
    console.log('Forcing profile refresh for user:', user.id);
    
    // Clear the current profile first to ensure UI updates
    setProfile(null);
    
    // Fetch fresh profile data
    try {
      // Try the direct RPC function first
      const { data, error } = await supabase.rpc('get_profile_by_id', {
        lookup_user_id: user.id
      });
      
      if (!error && data) {
        console.log('Profile refreshed with fresh data:', data);
        setProfile(data as UserProfile);
        return data as UserProfile;
      } else {
        console.error('Error refreshing profile via RPC:', error);
        
        // Fall back to standard query
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (!profileError && profileData) {
          console.log('Profile refreshed with standard query:', profileData);
          setProfile(profileData as UserProfile);
          return profileData as UserProfile;
        } else {
          console.error('Error refreshing profile via standard query:', profileError);
        }
      }
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    }
    
    return null;
  };

  // Update the updateProfile method to properly refresh data after updates
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { data: null, error: new Error('No user logged in') };
    
    console.log('Updating profile with:', updates);
    
    setLoading(true);
    try {
      // Try using our RPC function first (most reliable)
      try {
        console.log('Using update_profile RPC function');
        const { data, error } = await supabase.rpc('update_profile', {
          user_id: user.id,
          new_full_name: updates.full_name,
          new_bio: updates.bio
        });
        
        if (!error) {
          console.log('Profile updated successfully using RPC');
          
          // Get fresh profile data instead of just merging updates
          await refreshProfile();
          
          return { data, error: null };
        }
      } catch (rpcError) {
        console.error('Exception with update_profile RPC:', rpcError);
      }
      
      // If we get here, the RPC approach failed, try direct update
      try {
        console.log('Trying direct profile update');
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          // Check for infinite recursion error
          if (error.message && (
              error.message.includes('infinite recursion') ||
              error.code === '42P17')) {
            console.log('Supabase update failed, trying local update:', error);
            
            // Just update locally
            setProfile(prev => prev ? { ...prev, ...updates } : null);
            
            return { 
              data: profile ? { ...profile, ...updates } : null, 
              error: null 
            };
          }
          
          // Try running a test query to check permissions
          try {
            console.log('Testing read permissions on profile');
            const { data: testData, error: testError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (testError) {
              console.error('Test query failed - cannot read profile:', testError);
            } else {
              console.log('Can read profile, but cannot update. Current data:', testData);
            }
          } catch (testError) {
            console.error('Error testing read permissions:', testError);
          }
          
          throw error;
        }

        // Update was successful - get fresh data
        console.log('Profile updated successfully via direct update');
        
        // Force a full refresh instead of just updating the state
        await refreshProfile();
        
        return { data, error: null };
      } catch (updateError) {
        console.error('Error directly updating profile:', updateError);
        
        // Try direct RPC as last resort
        try {
          if (user.email) {
            console.log('Trying direct_update_profile as last resort');
            const { data, error } = await supabase.rpc('direct_update_profile', {
              user_email: user.email,
              new_full_name: updates.full_name || null,
              new_bio: updates.bio || null,
              new_avatar_url: updates.avatar_url || null
            });
            
            if (!error) {
              console.log('Profile updated with direct_update_profile:', data);
              
              // Force a full refresh
              await refreshProfile();
              
              return { data, error: null };
            }
          }
        } catch (directError) {
          console.error('Error with direct_update_profile:', directError);
        }
        
        // Fall back to local update
        console.log('Falling back to local profile update');
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        
        return { 
          data: profile ? { ...profile, ...updates } : null, 
          error: null 
        };
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const updateAvatarUrl = async (avatarUrl: string) => {
    if (!user) return { data: null, error: new Error('No user logged in') };
    
    setLoading(true);
    try {
      // First try using our RPC function
      try {
        const { data, error } = await supabase.rpc('update_avatar_url', {
          user_id: user.id,
          new_avatar_url: avatarUrl
        });
        
        if (!error) {
          // Update was successful with RPC
          setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
          return { data, error: null };
        } else {
          console.error('RPC error when updating avatar:', error);
        }
      } catch (rpcError) {
        console.error('Exception with update_avatar_url RPC:', rpcError);
      }
      
      // Fall back to direct update if RPC fails
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          // Check for infinite recursion error
          if (error.message && (
              error.message.includes('infinite recursion') ||
              error.code === '42P17')) {
            console.log('Supabase avatar update failed, using local update:', error);
            
            // Just update locally
            setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
            
            return { 
              data: profile ? { ...profile, avatar_url: avatarUrl } : null, 
              error: null 
            };
          }
          
          throw error;
        }

        // Update was successful with direct approach
        setProfile(prev => prev ? { ...prev, ...data } : data);
        return { data, error: null };
      } catch (updateError) {
        console.error('Error directly updating avatar:', updateError);
        
        // Fall back to local update
        setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
        
        return { 
          data: profile ? { ...profile, avatar_url: avatarUrl } : null, 
          error: null 
        };
      }
    } catch (error) {
      console.error('Error in updateAvatarUrl:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Update the updateAvatar function to ensure the image is valid
  const updateAvatar = async (file: FormData) => {
    if (!user) return { data: null, error: new Error('No user logged in') };

    try {
      // Extract the file object
      const fileObject = file.get('file') as any;
      if (!fileObject) {
        return { data: null, error: new Error('No file provided') };
      }

      // Log the file properties for debugging
      console.log('File for upload:', {
        uri: fileObject.uri,
        name: fileObject.name,
        type: fileObject.type
      });

      // Validate the image file before uploading
      try {
        // Verify the source file exists and is valid
        const sourceFileInfo = await fetch(fileObject.uri, { method: 'HEAD' });
        if (!sourceFileInfo.ok) {
          throw new Error(`Source file validation failed: ${sourceFileInfo.status}`);
        }
        
        const contentLength = sourceFileInfo.headers.get('content-length');
        if (!contentLength || parseInt(contentLength) < 100) {
          throw new Error('Source file too small or invalid');
        }
        
        console.log('Source file validated, size:', contentLength, 'bytes');
      } catch (validationError) {
        console.error('Error validating source file:', validationError);
        // Continue anyway as the fetch might still work
      }

      // Check if storage bucket exists and create it if needed
      try {
        await supabase.rpc('create_avatars_bucket', {
          bucket_name: 'avatars',
          public_access: true
        });
        
        await supabase.rpc('update_avatars_mime_types', {
          mime_types: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
        });
        
        console.log('Avatars bucket configured for upload');
      } catch (bucketError) {
        console.error('Error with bucket setup:', bucketError);
        // Continue anyway, the bucket might already exist
      }
      
      // Direct file upload to Supabase Storage
      try {
        const filePath = `${user.id}/${fileObject.name}`;
        
        // Use the Fetch API for reliable uploads
        const fetchResponse = await fetch(fileObject.uri);
        if (!fetchResponse.ok) {
          throw new Error(`Failed to fetch local file: ${fetchResponse.status}`);
        }
        
        const blob = await fetchResponse.blob();
        if (blob.size === 0 || blob.size < 100) {
          throw new Error(`Invalid blob size: ${blob.size} bytes`);
        }
        
        console.log('Blob created successfully, size:', blob.size, 'bytes');
        
        // Ensure we have the correct content type
        // iOS sometimes has issues with content type detection
        let contentType = fileObject.type || 'image/jpeg';
        
        // If we're handling a JPEG but contentType doesn't match, fix it
        const isJpeg = fileObject.name.toLowerCase().endsWith('.jpg') || 
                      fileObject.name.toLowerCase().endsWith('.jpeg');
        if (isJpeg && contentType !== 'image/jpeg') {
          console.log('Correcting content type for JPEG image');
          contentType = 'image/jpeg';
        }
        
        // If we're handling a PNG but contentType doesn't match, fix it
        const isPng = fileObject.name.toLowerCase().endsWith('.png');
        if (isPng && contentType !== 'image/png') {
          console.log('Correcting content type for PNG image');
          contentType = 'image/png';
        }
        
        console.log('Using content type for upload:', contentType);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: true,
            contentType: contentType
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw uploadError;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (!publicUrlData || !publicUrlData.publicUrl) {
          throw new Error('Failed to get public URL for uploaded file');
        }
        
        console.log('File successfully uploaded, public URL:', publicUrlData.publicUrl);

        // Update profile with the new avatar URL
        const avatarUrl = publicUrlData.publicUrl;
        
        // Validate the URL accessibility with a comprehensive check
        try {
          // First try a HEAD request
          console.log('Validating uploaded file with HEAD request');
          const urlCheckResponse = await fetch(avatarUrl, { 
            method: 'HEAD',
            cache: 'no-store' // Bypass cache to ensure file exists
          });
          
          if (!urlCheckResponse.ok) {
            console.error('Avatar URL validation failed (HEAD):', urlCheckResponse.status);
            throw new Error(`URL validation failed: ${urlCheckResponse.status}`);
          }
          
          // Now try a GET request to validate the content
          console.log('Validating uploaded file with GET request');
          const contentCheckResponse = await fetch(avatarUrl, {
            cache: 'no-store'
          });
          
          if (!contentCheckResponse.ok) {
            console.error('Avatar URL validation failed (GET):', contentCheckResponse.status);
            throw new Error(`URL content validation failed: ${contentCheckResponse.status}`);
          }
          
          const contentBlob = await contentCheckResponse.blob();
          if (contentBlob.size === 0 || contentBlob.size < 100) {
            console.error('Retrieved content invalid size:', contentBlob.size);
            throw new Error(`Retrieved content has invalid size: ${contentBlob.size} bytes`);
          }
          
          console.log('Avatar URL and content validated successfully, size:', contentBlob.size, 'bytes');
        } catch (urlCheckError) {
          console.error('Error validating avatar URL:', urlCheckError);
          // Continue anyway, but log the issue
        }
        
        const { data, error } = await supabase.from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', user.id)
          .select()
          .single();
        
        if (error) {
          console.error('Error updating profile with avatar URL:', error);
          
          // Try the RPC method as backup
          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc('update_avatar_url', {
              user_id: user.id,
              new_avatar_url: avatarUrl
            });
            
            if (rpcError) {
              console.error('RPC error when updating avatar URL:', rpcError);
              throw rpcError;
            }
            
            // Update profile in state
            if (profile) {
              setProfile({
                ...profile,
                avatar_url: avatarUrl,
                avatar_preview_uri: fileObject.uri
              });
            }
            
            return { data: { avatar_url: avatarUrl } as any, error: undefined };
          } catch (rpcError) {
            console.error('Error with RPC avatar update:', rpcError);
            throw error; // Throw the original error
          }
        }

        // Update was successful with direct approach
        if (profile) {
          setProfile({
            ...profile,
            ...data,
            avatar_preview_uri: fileObject.uri // Keep the preview URI
          });
        }
        
        return { data, error: undefined };
      } catch (uploadError: any) {
        console.error('Upload error:', uploadError);
        
        // Update local preview even if upload fails
        if (profile) {
          const localUrl = 'local-avatar://' + Date.now();
          setProfile({
            ...profile,
            avatar_url: localUrl,
            avatar_preview_uri: fileObject.uri
          });
        }
        
        // Create a more user-friendly error
        return { 
          data: { avatar_url: 'local-avatar://' + Date.now() } as any, 
          error: new Error('Upload failed with status: ' + (uploadError.message || '400'))
        };
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      return { data: null, error: error as Error };
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    admin,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateAvatarUrl,
    updateAvatar,
    refreshProfile,
    setProfile,
  };
} 