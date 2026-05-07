import { View, Text, StyleSheet, Dimensions, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AuthService } from "../Services/AuthService";;
import { FirebaseService } from '../Services/FirebaseService';
import LatestItem from '../Components/HomeScreen/LatestItem';
import Colors from '../Utils/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const MyProductsImproved = () => {
  const user = AuthService.getCurrentUser();
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      loadMyProducts();
    }
  }, [user]);

  const loadMyProducts = async () => {
    setLoading(true);
    const result = await FirebaseService.getUserPosts(user.email);
    if (result.success) {
      setMyProducts(result.posts);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyProducts();
    setRefreshing(false);
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
      <Text style={styles.heading}>My Products</Text>
      <Text style={styles.subHeading}>Total: {myProducts.length} items</Text>

      {myProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={60} color={Colors.GRAY} />
          <Text style={styles.emptyText}>No products yet</Text>
          <Text style={styles.emptySubText}>Start selling by adding your first product</Text>
        </View>
      ) : (
        <FlatList
          data={[{ key: 'content' }]}
          keyExtractor={(item) => item.key}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.PRIMARY]} />
          }
          renderItem={() => <LatestItem latestItemList={myProducts} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: width * 0.04,
    paddingTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND,
  },
  heading: {
    fontSize: width * 0.075,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 5,
  },
  subHeading: {
    fontSize: width * 0.04,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: width * 0.05,
    color: Colors.TEXT_PRIMARY,
    marginTop: 15,
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: width * 0.038,
    color: Colors.TEXT_SECONDARY,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default MyProductsImproved;
