import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Dimensions, Alert, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { AuthService } from "../Services/AuthService";;
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const EditProfileScreen = ({ navigation }) => {
  const user = AuthService.getCurrentUser();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    setLoading(true);
    const profileData = {
      phone,
      address,
      bio,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    };

    const result = await FirebaseService.updateUserProfile(
      user.email,
      profileData
    );

    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={Colors.GRAY} />
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            placeholderTextColor={Colors.GRAY}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.label}>Address</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color={Colors.GRAY} />
          <TextInput
            style={styles.input}
            placeholder="Enter your address"
            placeholderTextColor={Colors.GRAY}
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <Text style={styles.label}>Bio</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell us about yourself..."
            placeholderTextColor={Colors.GRAY}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={saveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.WHITE} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  imageContainer: {
    backgroundColor: Colors.WHITE,
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.PRIMARY,
  },
  name: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginTop: 15,
  },
  email: {
    fontSize: width * 0.038,
    color: Colors.TEXT_SECONDARY,
    marginTop: 5,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 8,
    marginTop: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: width * 0.04,
    color: Colors.TEXT_PRIMARY,
  },
  textArea: {
    marginLeft: 0,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: Colors.LIGHT_GRAY,
  },
  saveButtonText: {
    color: Colors.WHITE,
    fontSize: width * 0.042,
    fontWeight: '600',
  },
});

export default EditProfileScreen;
