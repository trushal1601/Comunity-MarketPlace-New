import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthService } from '../Services/AuthService';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const ProfileScreenFirebase = () => {
  const user = AuthService.getCurrentUser();
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    photoURL: user?.photoURL || '',
  });

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const loadProfile = async () => {
        if (!user?.email) return;
        const result = await FirebaseService.getUserProfile(user.email);
        if (!isActive) return;

        if (result.success && result.profile) {
          setProfileData({
            displayName: result.profile.displayName || user?.displayName || '',
            photoURL: result.profile.photoURL || user?.photoURL || '',
          });
        } else {
          setProfileData({
            displayName: user?.displayName || '',
            photoURL: user?.photoURL || '',
          });
        }
      };

      loadProfile();
      return () => {
        isActive = false;
      };
    }, [user?.email, user?.displayName, user?.photoURL])
  );

  const menuList = [
    { id: 1, name: 'My Products', path: 'MyProducts' },
    { id: 2, name: 'Messages', path: 'ChatList' },
    { id: 3, name: 'Orders', path: 'OrderHistory' },
    { id: 4, name: 'Statistics', path: 'ProfileStats' },
    { id: 5, name: 'Edit Profile', path: 'EditProfile' },
    { id: 6, name: 'Favorites', path: 'Favorites' },
    { id: 7, name: 'Explore', path: 'Explore' },
    { id: 8, name: 'Home', path: 'Home' },
    { id: 9, name: 'Log out' },
  ];

  const onMenuPress = async (item) => {
    if (item.name === 'Log out') {
      await AuthService.logout();
      return;
    }
    if (item.path) {
      navigation.navigate(item.path);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onMenuPress(item)} style={styles.menuItem}>
      <Text style={styles.menuText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image source={{ uri: profileData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.displayName || user?.email || 'User')}&background=6366F1&color=fff` }} style={styles.profileImage} />
        <Text style={styles.userName}>{profileData.displayName || user?.displayName}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>
      <FlatList
        data={menuList}
        numColumns={3}
        style={styles.menuList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.04,
    backgroundColor: Colors.BACKGROUND,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 40,
    backgroundColor: Colors.WHITE,
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    height: 90,
    width: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: Colors.PRIMARY,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: width * 0.062,
    marginTop: 12,
    color: Colors.TEXT_PRIMARY,
  },
  userEmail: {
    fontSize: width * 0.04,
    marginTop: 6,
    color: Colors.TEXT_SECONDARY,
  },
  menuList: {
    marginTop: 20,
  },
  menuItem: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    borderRadius: 15,
    borderColor: Colors.LIGHT_SECONDARY,
    backgroundColor: Colors.LIGHT_PRIMARY,
    marginHorizontal: 4,
    marginTop: 12,
    minHeight: 100,
    justifyContent: 'center',
  },
  menuText: {
    fontSize: width * 0.032,
    marginTop: 8,
    color: Colors.PRIMARY,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ProfileScreenFirebase;
