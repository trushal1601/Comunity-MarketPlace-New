import { View, Text, StyleSheet, Dimensions, RefreshControl, ScrollView, TextInput } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, getFirestore, orderBy, query } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import LatestItem from '../Components/HomeScreen/LatestItem';
import Colors from '../Utils/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ExploreScreen = () => {
  const db = getFirestore(app);
  const [productList, setProductList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAllProducts();
  }, []);

  const getAllProducts = async () => {
    const q = query(collection(db, 'UserPost'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setProductList(products);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getAllProducts();
    setRefreshing(false);
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return productList;

    return productList.filter((item) => {
      const title = item?.title?.toLowerCase() || '';
      const desc = item?.desc?.toLowerCase() || '';
      const category = item?.category?.toLowerCase() || '';
      const address = item?.address?.toLowerCase() || '';
      return title.includes(term) || desc.includes(term) || category.includes(term) || address.includes(term);
    });
  }, [productList, searchTerm]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.PRIMARY]} />}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Explore Marketplace</Text>
      <Text style={styles.subHeading}>Discover listings from your community</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.GRAY} />
        <TextInput
          placeholder="Search by title, description, category, location"
          placeholderTextColor={Colors.GRAY}
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
        />
      </View>

      {searchTerm ? <Text style={styles.resultText}>{filteredProducts.length} results found</Text> : null}

      <LatestItem latestItemList={filteredProducts} emptyMessage="No matching listings found." scrollEnabled={false} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: width * 0.04,
    paddingTop: 30,
  },
  heading: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 6,
  },
  subHeading: {
    fontSize: width * 0.035,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: Colors.TEXT_PRIMARY,
    fontSize: width * 0.034,
  },
  resultText: {
    marginBottom: 8,
    color: Colors.TEXT_SECONDARY,
    fontSize: width * 0.031,
    fontWeight: '600',
  },
});

export default ExploreScreen;
