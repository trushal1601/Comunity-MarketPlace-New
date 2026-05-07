import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import React from 'react'
import * as WebBrowser from "expo-web-browser";
import {useWarmUpBrowser} from '../../hooks/useWarmUpBrowser'
import { useOAuth } from '@clerk/clerk-expo';
import Colors from '../Utils/Colors';

const { width, height } = Dimensions.get('window');
WebBrowser.maybeCompleteAuthSession();

const Login = () => {
    useWarmUpBrowser();

    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

    const onPress = React.useCallback(async () => {
        try {
          const { createdSessionId, signIn, signUp, setActive } =
            await startOAuthFlow();
    
          if (createdSessionId) {
            setActive({ session: createdSessionId });
          } else {
            // Use signIn or signUp for next steps such as MFA
          }
        } catch (err) {
          console.error("OAuth error", err);
        }
      }, []);
  return (
    <View style={styles.container}>
      <Image source={require('./../../assets/images/login.png')} 
      style={styles.image}/>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Community Marketplace</Text>
        <Text style={styles.subtitle}>Buy Sell Marketplace where you can sell old item and make real money</Text>
        <TouchableOpacity onPress={onPress} style={styles.button}>
                <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  image: {
    width: '100%',
    height: height * 0.5,
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    marginTop: -30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: width * 0.06,
    paddingTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  title: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: Colors.TEXT_SECONDARY,
    marginTop: 20,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    borderRadius: 30,
    marginTop: height * 0.08,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: Colors.WHITE,
    textAlign: 'center',
    fontSize: width * 0.042,
    fontWeight: '600',
  },
});

export default Login