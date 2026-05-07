import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../Screen/ProfileScreen';
import MyProducts from '../Screen/MyProducts';
import ProductDetailImproved from '../Screen/ProductDetailImproved';
import Colors from '../Utils/Colors';

const Stack = createStackNavigator();
const ProfileStackNav = () => {
  return (
   <Stack.Navigator>
    <Stack.Screen name='ProfileScreen' component={ProfileScreen} options={{headerShown:false}}/>
    <Stack.Screen name='MyProducts' component={MyProducts} options={{ 
            headerStyle:{
                backgroundColor: Colors.PRIMARY
            },
            headerTintColor: Colors.WHITE,
            headerTitle:'My Products',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
         } }/>
         
         <Stack.Screen name='ProductDetail' component={ProductDetailImproved} options={{ 
            headerStyle:{
                backgroundColor: Colors.PRIMARY
            },
            headerTintColor: Colors.WHITE,
            headerTitle:'Product Detail',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
         } }/>
   </Stack.Navigator>
  )
}

export default ProfileStackNav
