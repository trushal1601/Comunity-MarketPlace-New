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
    role: 'user'
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
            role: result.profile.role || 'user'
          });
        }
      };

      loadProfile();
      return () => {
        isActive = false;
      };
    }, [user?.email])
  );

  const isAdmin = profileData.role === 'admin' ||
    user?.email === 'admin@marketplace.com' ||
    user?.email === 'kath3@yopmail.com';

  const quickActions = [
    { id: 'listings', title: 'My Products', icon: 'pricetags-outline', route: 'MyProducts' },
    { id: 'favorites', title: 'My Favorites', icon: 'heart-outline', route: 'Favorites' },
    { id: 'stats', title: 'Statistics', icon: 'stats-chart-outline', route: 'ProfileStats' },
    { id: 'messages', title: 'Messages', icon: 'chatbubbles-outline', route: 'Messages' },
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
        {isAdmin && <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>Admin</Text></View>}
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeadingRow}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <Text style={styles.sectionSubTitle}>Manage your activity and growth</Text>
        </View>
        <View style={styles.actionGrid}>
          {quickActions.map((item) => (
            <TouchableOpacity key={item.id} style={styles.actionBtn} onPress={() => navigation.navigate(item.route)}>
              <View style={styles.iconBadge}>
                <Ionicons name={item.icon} size={22} color={Colors.PRIMARY} />
              </View>
              <Text style={styles.actionText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
          {isAdmin && (
            <TouchableOpacity style={[styles.actionBtn, styles.adminActionBtn]} onPress={() => navigation.navigate('AdminDashboard')}>
              <View style={[styles.iconBadge, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="shield-checkmark-outline" size={22} color={Colors.ERROR} />
              </View>
              <Text style={[styles.actionText, { color: Colors.ERROR }]}>Admin Panel</Text>
            </TouchableOpacity>
          )}
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
  adminBadge: {
    backgroundColor: Colors.ERROR,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
  },
  adminBadgeText: {
    color: Colors.WHITE,
    fontSize: 10,
    fontWeight: 'bold',
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
    marginBottom: 12,
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
  adminActionBtn: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
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
