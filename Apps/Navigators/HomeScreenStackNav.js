import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../Screen/HomeAdvanced';
import ItemList from '../Screen/ItemList';
import ProductDetailImproved from '../Screen/ProductDetailImproved';
import ChatScreen from '../Screen/ChatScreen';
import ChatListScreen from '../Screen/ChatListScreen';
import SellerProfileScreen from '../Screen/SellerProfileScreen';
import AdminDashboardScreen from '../Screen/AdminDashboardScreen';
import Colors from '../Utils/Colors';

const Stack = createStackNavigator();
const HomeScreenStackNav = () => {
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
        <Stack.Screen options={{headerShown:false}} name='home' component={Home}/>
        <Stack.Screen options={({ route }) => ({ title: route.params.category })} name='ItemList' component={ItemList}/>
        <Stack.Screen options={{ title: 'Detail' }} name='ProductDetail' component={ProductDetailImproved}/>
        <Stack.Screen options={{ title: 'Chat' }} name='Chat' component={ChatScreen}/>
        <Stack.Screen options={{ title: 'Messages' }} name='ChatList' component={ChatListScreen}/>
        <Stack.Screen options={{ title: 'Seller Profile' }} name='SellerProfile' component={SellerProfileScreen}/>
        <Stack.Screen options={{ title: 'Admin Dashboard' }} name='AdminDashboard' component={AdminDashboardScreen}/>
    </Stack.Navigator>
  )
}

export default HomeScreenStackNav
