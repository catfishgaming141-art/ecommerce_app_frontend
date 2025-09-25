import React, { useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Alert, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import API from '../api';

export default function Profile({ navigation, route }: any) {
  const user = route.params?.user;
  const token = route.params?.token;

  const [profilePic, setProfilePic] = useState(user?.avatar || '');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pickImage = async () => {
    try {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setProfilePic(uri);

        const formData = new FormData();
        formData.append('avatar', {
          uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);

        await API.post('/users/upload-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data', Authorization: 'Bearer ' + token },
        });

        Alert.alert('Success', 'Profile picture updated!');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  const saveProfile = async () => {
    try {
      await API.put('/users/update-profile', { name, email }, { headers: { Authorization: 'Bearer ' + token } });
      Alert.alert('Success', 'Profile updated!');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileBox}>
        <Text style={styles.title}>Profile</Text>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity onPress={pickImage}>
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={{ color: '#555' }}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />

        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
          <Text style={styles.saveText}>Save Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace('Login')}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f6f7fb', 
    padding: 16 
  },
  profileBox: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    marginBottom: 12,
    borderWidth: 2, 
    borderColor: '#4a90e2' 
  },
  avatarPlaceholder: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: '#ddd', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 12,
    borderWidth: 2, 
    borderColor: '#4a90e2' 
  },
  input: { 
    width: '100%', 
    backgroundColor: '#f6f7fb', 
    padding: 10, 
    borderRadius: 10, 
    marginBottom: 8,
    borderWidth: 1, 
    borderColor: '#ccc' 
  },
  saveButton: { 
    backgroundColor: '#4a90e2', 
    paddingVertical: 12, 
    paddingHorizontal: 40, 
    borderRadius: 10, 
    marginBottom: 8,
  },
  saveText: {
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16,
  },
  logoutButton: { 
    backgroundColor: '#e74c3c', 
    paddingVertical: 12, 
    paddingHorizontal: 40, 
    borderRadius: 10 
  },
  logoutText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16 
  }
});
