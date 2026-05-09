import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../Screen/ProfileScreen';
import MyProducts from '../Screen/MyProductsImproved';
import ProductDetailImproved from '../Screen/ProductDetailImproved';
import SellerProfileScreen from '../Screen/SellerProfileScreen';
import AdminDashboardScreen from '../Screen/AdminDashboardScreen';
import ProfileStatsScreen from '../Screen/ProfileStatsScreen';
import FavoritesScreen from '../Screen/FavoritesScreen';
import Colors from '../Utils/Colors';

const Stack = createStackNavigator();
const ProfileStackNav = () => {
  return (
   <Stack.Navigator screenOptions={{
            headerStyle:{
                backgroundColor: Colors.PRIMARY
            },
            headerTintColor: Colors.WHITE,
            headerTitleStyle: {
                fontWeight: 'bold',
            },
         }}>
    <Stack.Screen name='ProfileScreen' component={ProfileScreen} options={{headerShown:false}}/>
    <Stack.Screen name='MyProducts' component={MyProducts} options={{ headerTitle:'My Products' } }/>
    <Stack.Screen name='ProductDetail' component={ProductDetailImproved} options={{ headerTitle:'Product Detail' } }/>
    <Stack.Screen name='SellerProfile' component={SellerProfileScreen} options={{ headerTitle:'Seller Profile' } }/>
    <Stack.Screen name='AdminDashboard' component={AdminDashboardScreen} options={{ headerTitle:'Admin Dashboard' } }/>
    <Stack.Screen name='ProfileStats' component={ProfileStatsScreen} options={{ headerTitle:'Your Statistics' } }/>
    <Stack.Screen name='Favorites' component={FavoritesScreen} options={{ headerTitle:'My Favorites' } }/>
   </Stack.Navigator>
  )
}

export default ProfileStackNav
