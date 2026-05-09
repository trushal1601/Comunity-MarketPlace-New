import { View, Text, StyleSheet, Dimensions, RefreshControl, ScrollView, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
  const [sortBy, setSortBy] = useState('newest');

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
    let result = [...productList];
    const term = searchTerm.trim().toLowerCase();
    
    if (term) {
      result = result.filter((item) => {
        const title = item?.title?.toLowerCase() || '';
        const desc = item?.desc?.toLowerCase() || '';
        const category = item?.category?.toLowerCase() || '';
        const address = item?.address?.toLowerCase() || '';
        return title.includes(term) || desc.includes(term) || category.includes(term) || address.includes(term);
      });
    }

    // Apply Sorting
    if (sortBy === 'priceLow') {
      result.sort((a, b) => parseFloat(a.price || 0) - parseFloat(b.price || 0));
    } else if (sortBy === 'priceHigh') {
      result.sort((a, b) => parseFloat(b.price || 0) - parseFloat(a.price || 0));
    } else {
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }

    return result;
  }, [productList, searchTerm, sortBy]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.PRIMARY]} />}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Explore Marketplace</Text>
      <Text style={styles.subHeading}>Discover listings from your community</Text>

      <View style={styles.controlsRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.GRAY} />
          <TextInput
            placeholder="Search listings..."
            placeholderTextColor={Colors.GRAY}
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
        </View>
        
        <View style={styles.sortContainer}>
          <Ionicons name="filter" size={18} color={Colors.PRIMARY} />
          <Picker
            selectedValue={sortBy}
            onValueChange={(itemValue) => setSortBy(itemValue)}
            style={styles.picker}
            dropdownIconColor={Colors.PRIMARY}
          >
            <Picker.Item label="Newest" value="newest" style={styles.pickerItem} />
            <Picker.Item label="Price: Low to High" value="priceLow" style={styles.pickerItem} />
            <Picker.Item label="Price: High to Low" value="priceHigh" style={styles.pickerItem} />
          </Picker>
        </View>
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
  controlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 0.6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  sortContainer: {
    flex: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 14,
    paddingHorizontal: 8,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: Colors.TEXT_PRIMARY,
    fontSize: width * 0.032,
  },
  picker: {
    flex: 1,
    color: Colors.TEXT_PRIMARY,
  },
  pickerItem: {
    fontSize: 14,
  },
  resultText: {
    marginBottom: 8,
    color: Colors.TEXT_SECONDARY,
    fontSize: width * 0.031,
    fontWeight: '600',
  },
});

export default ExploreScreen;
