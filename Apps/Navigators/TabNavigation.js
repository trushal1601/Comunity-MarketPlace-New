import { Text, StyleSheet } from 'react-native';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import HomeScreenStackNav from './HomeScreenStackNav';
import ExploreScreenStackNav from './ExploreScreenStackNav';
import AddPost from '../Screen/AddPost';
import ProfileStackNav from './ProfileStackNav';
import MessagesStackNav from './MessagesStackNav';
import Colors from '../Utils/Colors';

const Tab = createBottomTabNavigator();

const getTabBarDisplay = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? '';
  return routeName === 'Chat' ? 'none' : 'flex';
};

const TabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarInactiveTintColor: Colors.GRAY,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreenStackNav}
        options={({ route }) => ({
          tabBarStyle: [styles.tabBar, { display: getTabBarDisplay(route) }],
          tabBarLabel: ({ color }) => <Text style={[styles.label, { color }]}>Home</Text>,
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        })}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreenStackNav}
        options={{
          tabBarLabel: ({ color }) => <Text style={[styles.label, { color }]}>Explore</Text>,
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStackNav}
        options={({ route }) => ({
          tabBarStyle: [styles.tabBar, { display: getTabBarDisplay(route) }],
          tabBarLabel: ({ color }) => <Text style={[styles.label, { color }]}>Messages</Text>,
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" size={size} color={color} />,
        })}
      />
      <Tab.Screen
        name="AddPost"
        component={AddPost}
        options={{
          tabBarLabel: ({ color }) => <Text style={[styles.label, { color }]}>Add Post</Text>,
          tabBarIcon: ({ color, size }) => <Ionicons name="camera" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNav}
        options={{
          tabBarLabel: ({ color }) => <Text style={[styles.label, { color }]}>Profile</Text>,
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    marginBottom: 3,
  },
  label: {
    fontSize: 12,
    marginBottom: 3,
    fontWeight: '600',
  },
});

export default TabNavigation;
