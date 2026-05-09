import { View, Text, StyleSheet, Dimensions, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import { AuthService } from "../Services/AuthService";;
import { useFocusEffect } from '@react-navigation/native';
import { FirebaseService } from '../Services/FirebaseService';
import LatestItem from '../Components/HomeScreen/LatestItem';
import Colors from '../Utils/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const FavoritesScreen = () => {
  const user = AuthService.getCurrentUser();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.email) {
        loadFavorites();
      } else if (user === null) {
        setLoading(false);
      }
    }, [user])
  );

  const loadFavorites = async () => {
    setLoading(true);
    const result = await FirebaseService.getFavorites(user.email);
    if (result.success) {
      setFavorites(result.posts);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFavorites();
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
      <Text style={styles.heading}>My Favorites</Text>
      <Text style={styles.subHeading}>Total: {favorites.length} items</Text>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={60} color={Colors.GRAY} />
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubText}>Save products you like to view them later</Text>
        </View>
      ) : (
        <FlatList
          data={[{ key: 'content' }]}
          keyExtractor={(item) => item.key}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.PRIMARY]} />
          }
          renderItem={() => <LatestItem latestItemList={favorites} />}
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

export default FavoritesScreen;
