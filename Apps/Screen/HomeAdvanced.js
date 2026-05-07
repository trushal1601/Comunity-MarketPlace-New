import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, Dimensions, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../Components/HomeScreen/Header';
import Slider from '../Components/HomeScreen/Slider';
import CategoriesImproved from '../Components/HomeScreen/CategoriesImproved';
import LatestItem from '../Components/HomeScreen/LatestItem';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const HomeAdvanced = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [sliderList, setSliderList] = useState([]);
  const [latestItemList, setLatestItemList] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, latestItemList, minPrice, maxPrice]);

  const loadData = async () => {
    setLoading(true);
    const [slidersRes, categoriesRes, postsRes] = await Promise.all([
      FirebaseService.getSliders(),
      FirebaseService.getCategories(),
      FirebaseService.getPosts()
    ]);

    if (slidersRes.success) setSliderList(slidersRes.sliders);
    if (categoriesRes.success) setCategoryList(categoriesRes.categories);
    if (postsRes.success) setLatestItemList(postsRes.posts);
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterItems = () => {
    let filtered = latestItemList;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (minPrice || maxPrice) {
      filtered = filtered.filter(item => {
        const price = parseFloat(item.price);
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        return price >= min && price <= max;
      });
    }

    setFilteredItems(filtered);
  };

  const clearPriceFilter = () => {
    setMinPrice('');
    setMaxPrice('');
    setShowPriceFilter(false);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
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
      <FlatList
        data={[{ key: 'content' }]}
        style={styles.list}
        keyExtractor={(item) => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.PRIMARY]} />
        }
        ListHeaderComponent={
          <>
            <Header />
            <Slider sliderList={sliderList} />
            
            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.GRAY} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search products..."
                  placeholderTextColor={Colors.GRAY}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color={Colors.GRAY} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowPriceFilter(true)}
              >
                <Ionicons name="filter" size={20} color={Colors.WHITE} />
              </TouchableOpacity>
            </View>

            {(minPrice || maxPrice) && (
              <View style={styles.activeFilterContainer}>
                <Text style={styles.activeFilterText}>
                  Price: ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                </Text>
                <TouchableOpacity onPress={clearPriceFilter}>
                  <Ionicons name="close-circle" size={20} color={Colors.ERROR} />
                </TouchableOpacity>
              </View>
            )}

            <CategoriesImproved 
              categoryList={categoryList} 
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
            
            <Text style={styles.heading}>
              {selectedCategory === 'All' ? 'Latest Items' : selectedCategory}
              {searchQuery && ` - "${searchQuery}"`}
              {` (${filteredItems.length})`}
            </Text>
          </>
        }
        renderItem={() => (
          <LatestItem latestItemList={filteredItems} />
        )}
        contentContainerStyle={styles.contentContainer}
      />

      <Modal
        visible={showPriceFilter}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPriceFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Price</Text>
            
            <Text style={styles.label}>Minimum Price</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Min price"
              placeholderTextColor={Colors.GRAY}
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Maximum Price</Text>
            <TextInput
              style={styles.priceInput}
              placeholder="Max price"
              placeholderTextColor={Colors.GRAY}
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.clearButton]}
                onPress={clearPriceFilter}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.applyButton]}
                onPress={() => setShowPriceFilter(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  list: {
    flex: 1,
    paddingHorizontal: width * 0.04,
  },
  contentContainer: {
    paddingBottom: 30,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.BACKGROUND,
  },
  searchRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: width * 0.04,
    color: Colors.TEXT_PRIMARY,
  },
  filterButton: {
    backgroundColor: Colors.PRIMARY,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.LIGHT_PRIMARY,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    justifyContent: 'space-between',
  },
  activeFilterText: {
    fontSize: width * 0.038,
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  heading: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: Colors.TEXT_PRIMARY,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 20,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 8,
    marginTop: 10,
  },
  priceInput: {
    backgroundColor: Colors.BACKGROUND,
    borderRadius: 12,
    padding: 14,
    fontSize: width * 0.04,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: Colors.BACKGROUND,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  applyButton: {
    backgroundColor: Colors.PRIMARY,
  },
  clearButtonText: {
    color: Colors.TEXT_PRIMARY,
    fontSize: width * 0.04,
    fontWeight: '600',
  },
  applyButtonText: {
    color: Colors.WHITE,
    fontSize: width * 0.04,
    fontWeight: '600',
  },
});

export default HomeAdvanced;
