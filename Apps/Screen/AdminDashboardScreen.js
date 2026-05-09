import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Dimensions, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [])
  );

  const loadReports = async () => {
    setLoading(true);
    try {
      const result = await FirebaseService.getReports();
      console.log('Admin reports fetch result:', result);
      if (result.success) {
        setReports(result.reports);
      } else {
        Alert.alert('Error', result.error || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Admin dashboard error:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading reports.');
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleAction = (report) => {
    Alert.alert(
      'Take Action',
      `Report for: ${report.postTitle}\nReason: ${report.reason}`,
      [
        { text: 'Delete Post', onPress: () => deletePost(report.postId, report.id), style: 'destructive' },
        { text: 'Dismiss Report', onPress: () => dismissReport(report.id) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const deletePost = async (postId, reportId) => {
    const result = await FirebaseService.deletePost(postId);
    if (result.success) {
      await dismissReport(reportId);
      Alert.alert('Success', 'Post deleted and report cleared.');
    } else {
      Alert.alert('Error', 'Failed to delete post.');
    }
  };

  const dismissReport = async (reportId) => {
    try {
      const result = await FirebaseService.deleteReport(reportId);
      if (result.success) {
        setReports(prev => prev.filter(r => r.id !== reportId));
      } else {
        Alert.alert('Error', result.error || 'Failed to dismiss report');
      }
    } catch (error) {
      console.error('Dismiss report error:', error);
      Alert.alert('Error', 'An unexpected error occurred while dismissing the report.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Moderation Queue</Text>
        <Text style={styles.subtitle}>{reports.length} pending reports</Text>
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.PRIMARY]} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.reportCard} onPress={() => handleAction(item)}>
            <View style={styles.reportHeader}>
              <View style={[styles.badge, { backgroundColor: item.reason === 'Scam' ? Colors.ERROR : Colors.PRIMARY }]}>
                <Text style={styles.badgeText}>{item.reason}</Text>
              </View>
              <Text style={styles.timestamp}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            
            <Text style={styles.postTitle}>{item.postTitle}</Text>
            
            <View style={styles.reportDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="person-outline" size={14} color={Colors.GRAY} />
                <Text style={styles.detailText}>Reporter: {item.reporterEmail}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="business-outline" size={14} color={Colors.GRAY} />
                <Text style={styles.detailText}>Seller: {item.sellerEmail}</Text>
              </View>
            </View>
            
            <View style={styles.footer}>
              <Text style={styles.actionText}>Tap to take action</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.PRIMARY} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={80} color={Colors.SUCCESS} />
            <Text style={styles.emptyText}>All clear! No pending reports.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: Colors.WHITE,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  listContent: {
    padding: 15,
  },
  reportCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: Colors.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: Colors.GRAY,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 10,
  },
  reportDetails: {
    gap: 5,
    borderTopWidth: 1,
    borderTopColor: Colors.BACKGROUND,
    paddingTop: 10,
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 12,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.TEXT_SECONDARY,
    marginTop: 15,
  }
});

export default AdminDashboardScreen;
