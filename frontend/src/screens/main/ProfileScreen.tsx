import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { Button, TextInput, Avatar, Divider, Card } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Feather';

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

  if (!user || !profile) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarUpload} disabled={loading}>
          {profile.avatar_url ? (
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