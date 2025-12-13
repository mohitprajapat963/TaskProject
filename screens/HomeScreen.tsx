import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  PermissionsAndroid,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
// import { useAuth } from '../App';

import Geolocation, {
  GeolocationResponse,
  GeolocationError,
} from '@react-native-community/geolocation';

import {
  launchCamera,
  CameraOptions,
  ImagePickerResponse,
  Asset,
} from 'react-native-image-picker';

type MessageType = 'text' | 'image' | 'location';

interface LocationData {
  latitude: number;
  longitude: number;
}

type Message = {
  id: string;
  type: MessageType;
  text?: string;
  imageUri?: string;
  location?: LocationData;
  sender: 'user' | 'system';
};

const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Camera permission error', err);
      return false;
    }
  }
  return true;
};

const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Location permission error', err);
      return false;
    }
  }
  return true;
};

function HomeScreen() {
  // const { signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'text',
      text: 'Hello! Welcome to the chat 👋',
      sender: 'system',
    },
    {
      id: '2',
      type: 'text',
      text: 'Tap below to start typing...',
      sender: 'system',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // const LogOut = () => {
  //   signOut();
  // };

  const addMessage = (msg: Omit<Message, 'id'>) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), ...msg }]);
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    addMessage({
      type: 'text',
      text: trimmed,
      sender: 'user',
    });
    setInput('');
  };

  const handleOpenCamera = async () => {
    console.log("clicked camera");

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Camera permission is required.');
      return;
    }

    const options: CameraOptions = {
      mediaType: 'photo',
      cameraType: 'back',
      saveToPhotos: true,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Camera error');
        return;
      }

      const asset: Asset | undefined = response.assets?.[0];
      if (asset?.uri) {
        addMessage({
          type: 'image',
          imageUri: asset.uri,
          sender: 'user',
        });
      }
    });
  };

  const handleShareLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Location permission is required.');
      return;
    }
    setIsLocating(true);
    Geolocation.getCurrentPosition(
      (position: GeolocationResponse) => {
        const { latitude, longitude } = position.coords;
        addMessage({
          type: 'location',
          location: { latitude, longitude },
          sender: 'user',
        });
        setIsLocating(false);
      },
      (error: GeolocationError) => {
        Alert.alert('Error', error.message);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 60000,
        maximumAge: 10000,
        // @ts-ignore
        showLocationDialog: true,
      },
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';

    let content: React.ReactNode = null;

    if (item.type === 'text') {
      content = (
        <Text
          style={[
            styles.messageText,
            isUser ? styles.userText : styles.systemText,
          ]}
        >
          {item.text}
        </Text>
      );
    } else if (item.type === 'image' && item.imageUri) {
      content = (
        <Image
          source={{ uri: item.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />
      );
    } else if (item.type === 'location' && item.location) {
      const { latitude, longitude } = item.location;
      content = (
        <TouchableOpacity
          onPress={() => {
            const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
            Linking.openURL(url);
          }}
        >
          <View>
            <Text style={[styles.messageText, isUser ? styles.userText : styles.systemText]}>
              📍 Location shared (Tap to open map)
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (!content) return null;

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowSystem,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.systemBubble,
          ]}
        >
          {content}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>C</Text>
                </View>
                <View>
                  <Text style={styles.headerTitle}>Chat App</Text>
                  <Text style={styles.headerSubtitle}>
                    Online • Secure chat
                  </Text>
                </View>
              </View>

              {/* <TouchableOpacity style={styles.logoutButton} onPress={LogOut}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity> */}
            </View>

            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.chatContainer}
            />

            <View style={styles.inputBar}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleOpenCamera}
              >
                <Text style={styles.iconText}>📷</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleShareLocation}
                disabled={isLocating}
              >
                {isLocating ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text style={styles.iconText}>📍</Text>
                )}
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor="#9ca3af"
                value={input}
                onChangeText={setInput}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !input.trim() && styles.sendButtonDisabled,
                ]}
                onPress={sendMessage}
                disabled={!input.trim()}
              >
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  inner: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 18,
  },
  headerTitle: {
    color: '#e5e7eb',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  logoutText: {
    color: '#fecaca',
    fontWeight: '600',
    fontSize: 12,
  },
  chatContainer: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowSystem: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    maxWidth: '75%',
  },
  systemBubble: {
    backgroundColor: '#e5e7eb',
    borderBottomLeftRadius: 2,
  },
  userBubble: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 2,
  },
  messageText: {
    fontSize: 14,
  },
  systemText: {
    color: '#111827',
  },
  userText: {
    color: '#eff6ff',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
  },
  iconButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 4,
  },
  iconText: {
    fontSize: 22,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginHorizontal: 6,
    backgroundColor: '#fff',
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: '#f9fafb',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default HomeScreen;
