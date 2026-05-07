import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../Screen/Home';
import ItemList from '../Screen/ItemList';
import ProductDetailImproved from '../Screen/ProductDetailImproved';
import ChatScreen from '../Screen/ChatScreen';
import ChatListScreen from '../Screen/ChatListScreen';
import Colors from '../Utils/Colors';

const Stack = createStackNavigator();
const HomeScreenStackNav = () => {
  return (
    <Stack.Navigator>
        <Stack.Screen options={{headerShown:false}} name='home' component={Home}/>
        <Stack.Screen options={({ route }) => ({ title: route.params.category,
            headerStyle:{
                backgroundColor: Colors.PRIMARY
            },
            headerTintColor: Colors.WHITE,
            headerTitleStyle: {
                fontWeight: 'bold',
            },
         })} name='ItemList' component={ItemList}/>
         <Stack.Screen options={{ 
            headerStyle:{
                backgroundColor: Colors.PRIMARY
            },
            headerTintColor: Colors.WHITE,
            headerTitle:'Detail',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
         }} name='ProductDetail' component={ProductDetailImproved}/>
         <Stack.Screen options={{ 
            headerStyle:{
                backgroundColor: Colors.PRIMARY
            },
            headerTintColor: Colors.WHITE,
            headerTitle:'Chat',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
         }} name='Chat' component={ChatScreen}/>
         <Stack.Screen options={{ 
            headerStyle:{
                backgroundColor: Colors.PRIMARY
            },
            headerTintColor: Colors.WHITE,
            headerTitle:'Messages',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
         }} name='ChatList' component={ChatListScreen}/>
    </Stack.Navigator>
  )
}

export default HomeScreenStackNav
