import { Image, StyleSheet, Text, View, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AuthService } from '../../Services/AuthService';
import { FirebaseService } from '../../Services/FirebaseService';
import Colors from '../../Utils/Colors';

const { width } = Dimensions.get('window');

const Header = () => {
  const user = AuthService.getCurrentUser();
  const [profilePhoto, setProfilePhoto] = useState(user?.photoURL || '');
  const [profileName, setProfileName] = useState(user?.displayName || '');

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user?.email) return;
      const result = await FirebaseService.getUserProfile(user.email);
      if (!isMounted) return;

      if (result.success && result.profile) {
        setProfilePhoto(result.profile.photoURL || user?.photoURL || '');
        setProfileName(result.profile.displayName || user?.displayName || '');
      } else {
        setProfilePhoto(user?.photoURL || '');
        setProfileName(user?.displayName || '');
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.email, user?.photoURL, user?.displayName]);

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileName || user?.email || 'User')}&background=6366F1&color=fff` }}
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{profileName || 'Marketplace User'}</Text>
      </View>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginTop: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  welcomeText: {
    fontSize: width * 0.035,
    color: Colors.TEXT_SECONDARY,
  },
  userName: {
    fontSize: width * 0.048,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
  },
});

export default Header;
