import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../Components/HomeScreen/Header';
import Slider from '../Components/HomeScreen/Slider';
import Categories from '../Components/HomeScreen/Categories';
import LatestItem from '../Components/HomeScreen/LatestItem';
import { app } from '../../firebaseConfig';
import { collection, getDocs, getFirestore, onSnapshot, orderBy, query } from 'firebase/firestore';
import Colors from '../Utils/Colors';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { HomeSkeleton } from '../Components/Skeleton';

const { width } = Dimensions.get('window');

const Home = () => {
  const db = getFirestore(app);
  const navigation = useNavigation();
  const [categoryList, setCategoryList] = useState([]);
  const [sliderList, setSliderList] = useState([]);
  const [latestItemList, setLatestItemList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeLatestItems();
    return () => unsubscribe?.();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        // Initial load shows skeleton, subsequent loads happen in background
        if (sliderList.length === 0) setLoading(true);
        await Promise.all([getSliders(), getCategoryList()]);
        setLoading(false);
      };
      loadData();
    }, [])
  );

  const subscribeLatestItems = () => {
    const q = query(collection(db, 'UserPost'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLatestItemList(items);
    }, (error) => {
      console.error('onSnapshot error:', error);
    });
  };

  const getSliders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Sliders'));
      const sliders = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSliderList(sliders);
    } catch (error) {
      console.error('Error fetching sliders:', error);
    }
  };

  const getCategoryList = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Category'));
      const categories = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategoryList(categories);
    } catch (error) {
      console.error('Error fetching category list:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([getSliders(), getCategoryList()]);
    setRefreshing(false);
  };

  if (loading) {
    return <HomeSkeleton />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.PRIMARY]} />}
    >
      <Header />

      <TouchableOpacity style={styles.messagesBanner} onPress={() => navigation.navigate('Messages')}>
        <View style={styles.messagesBannerLeft}>
          <Ionicons name="chatbubbles-outline" size={22} color={Colors.PRIMARY} />
          <View>
            <Text style={styles.messagesTitle}>Messages Center</Text>
            <Text style={styles.messagesSubTitle}>Track all buyer and seller conversations</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.PRIMARY} />
      </TouchableOpacity>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{latestItemList.length}</Text>
          <Text style={styles.metricLabel}>Live Listings</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{categoryList.length}</Text>
          <Text style={styles.metricLabel}>Categories</Text>
        </View>
      </View>

      <Slider sliderList={sliderList} />
      <Categories categoryList={categoryList} />

      <View style={styles.latestHeaderRow}>
        <Text style={styles.heading}>Latest Items ({latestItemList.length})</Text>
      </View>

      <LatestItem latestItemList={latestItemList} emptyMessage="No listings available right now." scrollEnabled={false} />
    </ScrollView>
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
  messagesBanner: {
    backgroundColor: Colors.WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    padding: 14,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messagesBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messagesTitle: {
    fontSize: width * 0.04,
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
  },
  messagesSubTitle: {
    marginTop: 3,
    color: Colors.TEXT_SECONDARY,
    fontSize: width * 0.031,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    borderColor: Colors.BORDER,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  metricValue: {
    fontSize: width * 0.06,
    fontWeight: '800',
    color: Colors.PRIMARY,
  },
  metricLabel: {
    marginTop: 2,
    color: Colors.TEXT_SECONDARY,
    fontSize: width * 0.032,
  },
  latestHeaderRow: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
  },
});

export default Home;
