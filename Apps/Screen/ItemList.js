import { ActivityIndicator, StyleSheet, Text, View, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import LatestItem from '../Components/HomeScreen/LatestItem';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const ItemList = () => {
  const [itemList, setItemList] = useState([]);
  const [loading, setLoading] = useState(true);
  const { params } = useRoute();
  const db = getFirestore(app);

  useEffect(() => {
    if (params?.category) {
      getItemListByCategory();
    }
  }, [params?.category]);

  const getItemListByCategory = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'UserPost'), where('category', '==', params.category));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setItemList(items);
    } catch (error) {
      console.error('Error getting items by category:', error);
      setItemList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={Colors.PRIMARY} size="large" />
      ) : itemList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No post found in this category.</Text>
        </View>
      ) : (
        <LatestItem latestItemList={itemList} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.04,
    backgroundColor: Colors.BACKGROUND,
  },
  loader: {
    marginTop: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: width * 0.04,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default ItemList;
