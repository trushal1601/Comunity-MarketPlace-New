import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../Services/AuthService';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
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

  const quickActions = [
    { id: 'listings', title: 'My Products', icon: 'pricetags-outline', route: 'MyProducts' },
    { id: 'messages', title: 'Messages', icon: 'chatbubbles-outline', route: 'Messages' },
    { id: 'explore', title: 'Explore', icon: 'search-outline', route: 'Explore' },
    { id: 'home', title: 'Home', icon: 'home-outline', route: 'Home' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.topBand} />

      <View style={styles.heroCard}>
        <View style={styles.avatarRing}>
          <Image
            source={{ uri: profileData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.displayName || user?.displayName || 'User')}&background=6366F1&color=fff` }}
            style={styles.profileImage}
          />
        </View>
        <Text style={styles.userName}>{profileData.displayName || user?.displayName || 'Marketplace User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'No email available'}</Text>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubTitle}>Everything important in one place</Text>
        </View>
        <View style={styles.actionGrid}>
          {quickActions.map((item) => (
            <TouchableOpacity key={item.id} style={styles.actionBtn} onPress={() => navigation.navigate(item.route)}>
              <View style={styles.iconBadge}>
                <Ionicons name={item.icon} size={22} color={Colors.PRIMARY} />
              </View>
              <Text style={styles.actionText}>{item.title}</Text>
              {/* <Ionicons name="chevron-forward" size={14} color={Colors.GRAY} /> */}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => AuthService.logout()}>
        <Ionicons name="log-out-outline" size={20} color={Colors.ERROR} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  contentContainer: {
    padding: width * 0.04,
    paddingBottom: 30,
  },
  topBand: {
    height: 72,
    borderRadius: 18,
    backgroundColor: '#DDE7FF',
    marginBottom: 10,
    marginTop: 40,
  },
  heroCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER,
    marginTop: -60,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  userName: {
    marginTop: 10,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: width * 0.052,
  },
  userEmail: {
    marginTop: 4,
    color: Colors.TEXT_SECONDARY,
    fontSize: width * 0.034,
  },
  sectionCard: {
    marginTop: 12,
    backgroundColor: Colors.WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 14,
  },
  sectionHeadingRow: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: width * 0.042,
  },
  sectionSubTitle: {
    marginTop: 4,
    color: Colors.TEXT_SECONDARY,
    fontSize: width * 0.03,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '48.2%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.LIGHT_SECONDARY,
    backgroundColor: '#F8FAFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 102,
    marginBottom: 10,
  },
  iconBadge: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#EBF0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    marginTop: 8,
    marginBottom: 4,
    color: '#334155',
    fontWeight: '600',
    fontSize: width * 0.033,
  },
  logoutBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F5C2C7',
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: {
    color: Colors.ERROR,
    fontWeight: '700',
    fontSize: width * 0.035,
  },
});

export default ProfileScreen;
