import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AuthService } from "../Services/AuthService";;
import { Ionicons } from '@expo/vector-icons';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const ProfileStatsScreen = () => {
  const user = AuthService.getCurrentUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      loadStats();
    } else if (user === null) {
      setLoading(false);
    }
  }, [user]);

  const loadStats = async () => {
    const result = await FirebaseService.getUserStats(user.email);
    if (result.success) {
      setStats(result.stats);
    }
    setLoading(false);
  };

  const StatCard = ({ icon, title, value, color }) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Statistics</Text>
        <Text style={styles.headerSubtitle}>Track your marketplace activity</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon="cube-outline"
          title="Total Products"
          value={stats?.totalPosts || 0}
          color={Colors.PRIMARY}
        />
        <StatCard
          icon="cart-outline"
          title="Total Sales"
          value={stats?.totalSales || 0}
          color={Colors.SUCCESS}
        />
        <StatCard
          icon="star"
          title="Average Rating"
          value={stats?.avgRating || '0.0'}
          color={Colors.WARNING}
        />
        <StatCard
          icon="chatbubbles-outline"
          title="Total Reviews"
          value={stats?.totalReviews || 0}
          color={Colors.ACCENT}
        />
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={Colors.PRIMARY} />
        <Text style={styles.infoText}>
          Keep selling quality products to improve your rating and attract more buyers!
        </Text>
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: width * 0.038,
    color: Colors.TEXT_SECONDARY,
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.WHITE,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
  },
  statTitle: {
    fontSize: width * 0.035,
    color: Colors.TEXT_SECONDARY,
    marginTop: 5,
    textAlign: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.LIGHT_PRIMARY,
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: width * 0.038,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 22,
  },
});

export default ProfileStatsScreen;
