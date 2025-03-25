import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { Button, TextInput, Avatar, Divider, Card } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import { supabase } from '../../services/supabase';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile, updateAvatar } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [bio, setBio] = useState(profile?.bio || '');

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        bio,
      });
      
      if (error) throw error;
      setEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'You need to grant access to your photo library to upload an avatar.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        
        const asset = result.assets[0];
        const uri = asset.uri;
        const filename = uri.split('/').pop() || 'avatar.jpg';
        
        // Create a FormData object for the file
        const formData = new FormData();
        formData.append('file', {
          uri,
          name: filename,
          type: `image/${filename.split('.').pop()}` || 'image/jpeg',
        } as any);
        
        const { error } = await updateAvatar(formData);
        
        if (error) throw error;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const fixDatabaseIssues = async () => {
    setLoading(true);
    try {
      // First check if profiles table exists
      const { error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (checkError && checkError.code === '42P01') {
        // Run the SQL script to create profiles table
        try {
          // Try running our stored procedure
          const { error: rpcError } = await supabase.rpc('create_profiles_table');
          
          if (rpcError) {
            console.error('Error creating profiles table via RPC:', rpcError);
            throw rpcError;
          }
          
          Toast.show({
            type: 'success',
            text1: 'Success!',
            text2: 'Created profiles table. Please reload the app.',
            position: 'bottom',
            visibilityTime: 4000,
          });
          return;
        } catch (error) {
          console.error('RPC error:', error);
          
          // If RPC fails, show SQL script instructions
          showSqlInstructions();
          return;
        }
      }
      
      // If profile doesn't exist for user, create one
      if (user) {
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id);
          
        if (!profileError && (!data || data.length === 0)) {
          // Create profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email || '',
                full_name: fullName || user.user_metadata?.full_name || '',
                role: 'USER',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]);
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            
            // Check for RLS error
            if (insertError.code === '42501') {
              showSqlInstructions();
              return;
            }
            
            throw insertError;
          }
          
          Toast.show({
            type: 'success',
            text1: 'Success!',
            text2: 'Created your profile. Please reload the app.',
            position: 'bottom',
            visibilityTime: 4000,
          });
          return;
        }
      }
      
      // Check if avatars bucket exists and create if needed
      const { error: bucketError } = await supabase.storage.getBucket('avatars');
      
      if (bucketError && bucketError.message.includes('not found')) {
        // Create bucket
        const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif']
        });
        
        if (createBucketError) {
          console.error('Error creating avatars bucket:', createBucketError);
          
          // Check for RLS error
          if (createBucketError.message.includes('row-level security policy')) {
            showSqlInstructions();
            return;
          }
          
          throw createBucketError;
        }
        
        Toast.show({
          type: 'success',
          text1: 'Success!', 
          text2: 'Created avatars storage bucket.',
          position: 'bottom',
          visibilityTime: 4000,
        });
        return;
      }
      
      Toast.show({
        type: 'info',
        text1: 'No issues found',
        text2: 'Your database setup appears to be working correctly.',
        position: 'bottom',
        visibilityTime: 4000,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fix database issues');
    } finally {
      setLoading(false);
    }
  };
  
  const showSqlInstructions = () => {
    Alert.alert(
      'Database Setup Required',
      'Your account does not have permission to create tables or buckets in Supabase. You need to run the SQL script from the frontend/src/services/supabase.sql file in your Supabase dashboard SQL Editor.',
      [
        { 
          text: 'OK', 
          style: 'default'
        }
      ]
    );
  };

  if (!user || !profile) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
        <Button 
          mode="contained" 
          onPress={fixDatabaseIssues}
          loading={loading}
          disabled={loading}
          style={styles.button}
          icon="database"
        >
          Fix Database Issues
        </Button>
      </View>
    );
  }

  // Function to get avatar source
  const getAvatarSource = () => {
    if (!profile.avatar_url) return undefined;
    
    // If it's a local avatar, return undefined to use the icon
    if (profile.avatar_url.startsWith('local-avatar://')) {
      return undefined;
    }
    
    return { uri: profile.avatar_url };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarUpload} disabled={loading}>
          {profile.avatar_url && !profile.avatar_url.startsWith('local-avatar://') ? (
            <Avatar.Image 
              size={100} 
              source={{ uri: profile.avatar_url }} 
              style={styles.avatar} 
            />
          ) : (
            <Avatar.Icon 
              size={100} 
              icon="account" 
              style={styles.avatar} 
            />
          )}
          <View style={styles.editAvatarIcon}>
            <Icon name="camera" size={16} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.nameText}>{profile.full_name || user.email}</Text>
        <Text style={styles.emailText}>{user.email}</Text>
        
        {profile.role && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{profile.role}</Text>
          </View>
        )}
      </View>
      
      <Divider style={styles.divider} />
      
      <Card style={styles.card}>
        <Card.Title title="Profile Information" />
        <Card.Content>
          {editing ? (
            <>
              <TextInput
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                style={styles.input}
              />
              <TextInput
                label="Bio"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <View style={styles.buttonRow}>
                <Button 
                  mode="outlined" 
                  onPress={() => setEditing(false)}
                  style={styles.button}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={handleSaveProfile}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                >
                  Save
                </Button>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{profile.full_name || 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Bio:</Text>
                <Text style={styles.infoValue}>{profile.bio || 'Not set'}</Text>
              </View>
              <Button 
                mode="outlined" 
                onPress={() => setEditing(true)}
                style={styles.button}
                icon="pencil"
              >
                Edit Profile
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Title title="Account" />
        <Card.Content>
          <Button 
            mode="outlined" 
            onPress={() => {/* Navigate to change password */}}
            style={styles.button}
            icon="lock"
          >
            Change Password
          </Button>
          <Button 
            mode="outlined" 
            onPress={fixDatabaseIssues}
            style={styles.button}
            icon="database"
            loading={loading}
            disabled={loading}
          >
            Fix Database Issues
          </Button>
          <Button 
            mode="outlined" 
            onPress={handleSignOut}
            style={[styles.button, styles.signOutButton]}
            icon="logout"
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  avatar: {
    marginBottom: 10,
  },
  editAvatarIcon: {
    position: 'absolute',
    right: 0,
    bottom: 10,
    backgroundColor: '#2196F3',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#e1f5fe',
    borderRadius: 20,
    marginTop: 8,
  },
  roleText: {
    color: '#0277bd',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  input: {
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    marginVertical: 8,
  },
  signOutButton: {
    borderColor: '#f44336',
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
  },
}); 