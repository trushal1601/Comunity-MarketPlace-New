import { View, StyleSheet, Dimensions, Text } from 'react-native';
import React, { useState, useEffect } from 'react';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { AuthService } from '../Services/AuthService';
import LatestItem from '../Components/HomeScreen/LatestItem';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const MyProducts = () => {
  const db = getFirestore(app);
  const user = AuthService.getCurrentUser();
  const [productList, setProductList] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (user?.email) {
      getUserPost();
    }
  }, [user?.email]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (user?.email) {
        getUserPost();
      }
    });
    return unsubscribe;
  }, [navigation, user?.email]);

  const getUserPost = async () => {
    try {
      const q = query(collection(db, 'UserPost'), where('userEmail', '==', user.email));
      const snapshot = await getDocs(q);
      const newProductList = snapshot.docs.map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() }));
      setProductList(newProductList);
    } catch (error) {
      console.error('Error fetching user products:', error);
      setProductList([]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Listings</Text>
      <LatestItem latestItemList={productList} emptyMessage="You have not posted any product yet." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: width * 0.04,
    paddingTop: 20,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
});

export default MyProducts;
