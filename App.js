import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './Apps/Screen/LoginScreen';
import RegisterScreen from './Apps/Screen/RegisterScreen';
import TabNavigation from './Apps/Navigators/TabNavigation';
import { AuthService } from './Apps/Services/AuthService';
import Colors from './Apps/Utils/Colors';

const Stack = createStackNavigator();

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.BACKGROUND }}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: Colors.BACKGROUND }}>
        {user ? (
          <TabNavigation />
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Navigator>
        )}
        <StatusBar style="auto" />
      </View>
    </NavigationContainer>
  );
};

export default App;
