import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, Dimensions, TextInput, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../Components/HomeScreen/Header';
import Slider from '../Components/HomeScreen/Slider';
import CategoriesImproved from '../Components/HomeScreen/CategoriesImproved';
import LatestItem from '../Components/HomeScreen/LatestItem';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const Home = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [sliderList, setSliderList] = useState([]);
  const [latestItemList, setLatestItemList] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, latestItemList]);

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

    setFilteredItems(filtered);
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
    <FlatList
      data={[{ key: 'content' }]}
      style={styles.container}
      keyExtractor={(item) => item.key}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.PRIMARY]} />
      }
      ListHeaderComponent={
        <>
          <Header />
          <Slider sliderList={sliderList} />
          
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

          <CategoriesImproved 
            categoryList={categoryList} 
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
          
          <Text style={styles.heading}>
            {selectedCategory === 'All' ? 'Latest Items' : selectedCategory}
            {searchQuery && ` - "${searchQuery}"`}
          </Text>
        </>
      }
      renderItem={() => (
        <LatestItem latestItemList={filteredItems} />
      )}
      contentContainerStyle={styles.contentContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 15,
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
  heading: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: Colors.TEXT_PRIMARY,
  },
});

export default Home;
