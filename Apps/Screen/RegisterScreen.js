import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { AuthService } from '../Services/AuthService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState('');
  const [profileImageBase64, setProfileImageBase64] = useState('');

  const pickProfileImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow gallery access to select profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length) {
      const selectedUri = result.assets[0].uri;
      setProfileImageUri(selectedUri);

      const manipulated = await ImageManipulator.manipulateAsync(
        selectedUri,
        [{ resize: { width: 320 } }],
        {
          compress: 0.45,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (manipulated.base64) {
        setProfileImageBase64(`data:image/jpeg;base64,${manipulated.base64}`);
      }
    }
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await AuthService.register(email, password, fullName, profileImageBase64);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', result.warning ? `Account created.\n${result.warning}` : 'Account created successfully!');
    } else {
      Alert.alert('Registration Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Ionicons name="person-add" size={80} color={Colors.PRIMARY} />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our marketplace community</Text>
        </View>

        <View style={styles.formContainer}>
          <TouchableOpacity style={styles.avatarPicker} onPress={pickProfileImage}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.avatarImage} />
            ) : (
              <>
                <Ionicons name="camera-outline" size={26} color={Colors.PRIMARY} />
                <Text style={styles.avatarText}>Add Profile Photo</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={Colors.GRAY} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={Colors.GRAY}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={Colors.GRAY} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.GRAY}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.GRAY} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.GRAY}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons 
                name={showPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={Colors.GRAY} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.GRAY} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={Colors.GRAY}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons 
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                size={20} 
                color={Colors.GRAY} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.WHITE} />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginTop: 20,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: Colors.TEXT_SECONDARY,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
  },
  avatarPicker: {
    height: 110,
    width: 110,
    borderRadius: 55,
    alignSelf: 'center',
    marginBottom: 18,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    marginTop: 6,
    color: Colors.PRIMARY,
    fontSize: width * 0.028,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: width * 0.04,
    color: Colors.TEXT_PRIMARY,
  },
  registerButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: Colors.LIGHT_GRAY,
  },
  registerButtonText: {
    color: Colors.WHITE,
    fontSize: width * 0.042,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: width * 0.04,
    color: Colors.TEXT_SECONDARY,
  },
  loginLink: {
    fontSize: width * 0.04,
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
});

export default RegisterScreen;
