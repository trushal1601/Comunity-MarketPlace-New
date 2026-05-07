import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ChatListScreen from '../Screen/ChatListScreen';
import ChatScreen from '../Screen/ChatScreen';
import Colors from '../Utils/Colors';

const Stack = createStackNavigator();

const MessagesStackNav = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          headerStyle: { backgroundColor: Colors.PRIMARY },
          headerTintColor: Colors.WHITE,
          headerTitle: 'Messages',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerStyle: { backgroundColor: Colors.PRIMARY },
          headerTintColor: Colors.WHITE,
          headerTitle: 'Chat',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
};

export default MessagesStackNav;
