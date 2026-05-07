import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AuthService } from "../Services/AuthService";;
import { Ionicons } from '@expo/vector-icons';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const OrderHistoryScreen = () => {
  const user = AuthService.getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buyer');

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    const result = await FirebaseService.getUserOrders(user.email, activeTab);
    if (result.success) {
      setOrders(result.orders);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return Colors.SUCCESS;
      case 'pending': return Colors.WARNING;
      case 'cancelled': return Colors.ERROR;
      default: return Colors.GRAY;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.productImage }} style={styles.productImage} />
      <View style={styles.orderInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.productTitle}</Text>
        <Text style={styles.price}>₹{item.price}</Text>
        <View style={styles.statusContainer}>
          <Ionicons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
          <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
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
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buyer' && styles.activeTab]}
          onPress={() => setActiveTab('buyer')}
        >
          <Text style={[styles.tabText, activeTab === 'buyer' && styles.activeTabText]}>
            Purchases
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'seller' && styles.activeTab]}
          onPress={() => setActiveTab('seller')}
        >
          <Text style={[styles.tabText, activeTab === 'seller' && styles.activeTabText]}>
            Sales
          </Text>
        </TouchableOpacity>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={60} color={Colors.GRAY} />
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubText}>
            {activeTab === 'buyer' ? 'Start shopping!' : 'Start selling!'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    padding: 5,
    margin: 10,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.PRIMARY,
  },
  tabText: {
    fontSize: width * 0.04,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.WHITE,
  },
  listContainer: {
    padding: 10,
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  orderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: width * 0.042,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  price: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  status: {
    fontSize: width * 0.035,
    fontWeight: '600',
    marginLeft: 4,
  },
  date: {
    fontSize: width * 0.032,
    color: Colors.TEXT_SECONDARY,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: width * 0.05,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginTop: 15,
  },
  emptySubText: {
    fontSize: width * 0.038,
    color: Colors.TEXT_SECONDARY,
    marginTop: 8,
  },
});

export default OrderHistoryScreen;
