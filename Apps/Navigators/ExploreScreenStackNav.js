import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import ExploreScreen from '../Screen/ExploreScreen';
import ProductDetailImproved from '../Screen/ProductDetailImproved';
import Colors from '../Utils/Colors';


const Stack = createStackNavigator();

const ExploreScreenStackNav = () => {
  return (
   <Stack.Navigator>
    <Stack.Screen name='ExploreScreen' component={ExploreScreen}
        options={{headerShown:false}}
    />
    <Stack.Screen options={{ 
            headerStyle:{
                backgroundColor: Colors.PRIMARY
            },
            headerTintColor: Colors.WHITE,
            headerTitle:'Detail',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
         } }name='ProductDetail' component={ProductDetailImproved}/>
   </Stack.Navigator>
  )
}

export default ExploreScreenStackNav
