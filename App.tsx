/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState, createContext, useContext } from 'react';
import { } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import axios from 'axios';

type AuthContextType = {
  userToken: string | null;
  signIn: (data: { email: string; password: string }) => Promise<void>;
  signUp: (data: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
};


const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => useContext(AuthContext)!;

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const TOKEN_KEY = 'userToken';
const API_URL = 'https://postscarlatinoid-untranquilly-cristobal.ngrok-free.dev';

function App() {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const LoadToken = async () => {
      try {
        const value = await AsyncStorage.getItem(TOKEN_KEY);
        if (value) {
          setUserToken(value as string)
          setLoading(false)
        }
      } catch (error) {
        console.error(error);
      }
    }
    LoadToken();
  }, [])


  const authContext: AuthContextType = {
    userToken,

    signIn: async ({ email, password }) => {
      console.log(email, password, "SIGN IN USER");

      try {
        setLoading(true);

        const response = await axios.get(`${API_URL}/Users`, {
          params: {
            email,
            password,
          },
        });

        const users = await response.data;

        if (!users || users.length === 0) {
          Alert.alert('Login Failed', 'Invalid email or password.');
          setLoading(false);
          return;
        }

        const user = users[0];

        const token = `token-${user.id}-${user.email}`;
        await AsyncStorage.setItem(TOKEN_KEY, token);
        setUserToken(token);
      } catch (error: any) {
        console.error('Login error:', error);
        Alert.alert('Login Error', error.message || 'Unable to login');
      } finally {
        setLoading(false);
      }
    },

    signUp: async ({ name, email, password }) => {
      console.log(name, email, password, "SIGn UP USER");
      
      try {
        setLoading(true);
        const checkUser = await axios.get(`${API_URL}/Users`, {
          params: { email },
        });

        if (checkUser && checkUser.data.length > 0) {
          Alert.alert('Registration Failed', 'Email is already registered.');
          setLoading(false);
          return;
        }


        const createNewUser = await axios.post(`${API_URL}/Users`, {
          name,
          email,
          password,
        });

        const newUser = createNewUser.data;

        const token = `token-${newUser.id}-${newUser.email}`;
        await AsyncStorage.setItem(TOKEN_KEY, token);
        setUserToken(token);
      } catch (error: any) {
        console.error('SignUp error:', error);
        Alert.alert('Registration Error', error.message || 'Unable to register');
      } finally {
        setLoading(false);
      }
    },

    signOut: async () => {
      try {
        setLoading(true);
        await AsyncStorage.removeItem(TOKEN_KEY);
        setUserToken(null);
      } catch (error) {
        console.error('SignOut error:', error);
      } finally {
        setLoading(false);
      }
    },
  };

  if (loading) {
    return (
      <View style={styles.LoadingView}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} >
          {userToken === null ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            <Stack.Screen name="Home" component={HomeScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

export default App;

const styles = StyleSheet.create({
  LoadingView: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  }
})