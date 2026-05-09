import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import ExploreScreen from '../Screen/ExploreScreenImproved';
import ProductDetailImproved from '../Screen/ProductDetailImproved';
import SellerProfileScreen from '../Screen/SellerProfileScreen';
import AdminDashboardScreen from '../Screen/AdminDashboardScreen';
import Colors from '../Utils/Colors';

const Stack = createStackNavigator();

const ExploreScreenStackNav = () => {
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
    <Stack.Screen name='ExploreScreen' component={ExploreScreen}
        options={{headerShown:false}}
    />
    <Stack.Screen options={{ title: 'Detail' }} name='ProductDetail' component={ProductDetailImproved}/>
    <Stack.Screen options={{ title: 'Seller Profile' }} name='SellerProfile' component={SellerProfileScreen}/>
    <Stack.Screen options={{ title: 'Admin Dashboard' }} name='AdminDashboard' component={AdminDashboardScreen}/>
   </Stack.Navigator>
  )
}

export default ExploreScreenStackNav
