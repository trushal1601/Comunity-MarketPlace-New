import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, Alert, Image, InteractionManager, Modal } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { AuthService } from '../Services/AuthService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');
const ChatScreen = () => {
  const { params } = useRoute();
  const user = AuthService.getCurrentUser();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [otherUserName, setOtherUserName] = useState('');
  const [otherUserEmail, setOtherUserEmail] = useState('');
  const [otherUserImage, setOtherUserImage] = useState('');
  const [subscriptionVersion, setSubscriptionVersion] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const listRef = useRef(null);
  const queueRef = useRef([]);
  const isProcessingQueueRef = useRef(false);
  const debugTag = '[ChatDebug]';
  const debugLog = (...args) => console.log(debugTag, ...args);
  const scrollToBottom = (animated = false) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false });
      }, 80);
    });
  };
  const mergeServerWithPending = (serverMessages = [], previousMessages = []) => {
    const pendingMessages = previousMessages.filter((msg) => String(msg?.id || '').startsWith('temp_'));
    const serverClientIds = new Set(
      (serverMessages || [])
        .map((msg) => msg?.clientId)
        .filter(Boolean)
    );

    const unresolvedPending = pendingMessages.filter((msg) => !serverClientIds.has(msg.id));
    const merged = [...(serverMessages || []), ...unresolvedPending];
    merged.sort((a, b) => Number(a?.createdAt || 0) - Number(b?.createdAt || 0));
    return merged;
  };

  useEffect(() => {
    const setupChat = async () => {
      if (!user?.email) return;

      setMessages([]);

      const sellerEmail =
        params?.sellerEmail ||
        params?.participants?.find((participantEmail) => participantEmail !== user.email);

      if (params?.chatId) {
        debugLog('setupChat -> opened from chat list', { chatId: params?.chatId, sellerEmail });
        setChatId(params.chatId);

        if (sellerEmail) {
          setOtherUserEmail(sellerEmail);
          await loadOtherUserName(sellerEmail);
        }

        await FirebaseService.markChatAsSeen(params.chatId, user.email);
        return;
      }

      if (sellerEmail) {
        debugLog('setupChat -> opened from product detail', { sellerEmail, userEmail: user.email });
        setOtherUserEmail(sellerEmail);
        await loadOtherUserName(sellerEmail);

        // For product-detail entry, attach only to an existing thread.
        // If no thread exists yet, keep chatId null until first send creates it.
        const chatsResult = await FirebaseService.getUserChats(user.email);
        debugLog('setupChat -> getUserChats result', {
          success: chatsResult.success,
          chatCount: chatsResult.chats?.length || 0
        });
        if (chatsResult.success) {
          const existingChat = (chatsResult.chats || []).find((chat) => {
            const participants = chat.participants || [];
            return participants.includes(user.email) && participants.includes(sellerEmail);
          });
          debugLog('setupChat -> existingChat lookup', {
            found: Boolean(existingChat),
            existingChatId: existingChat?.id || null
          });
          setChatId(existingChat?.id || null);
        } else {
          setChatId(null);
        }
      }
    };

    setupChat();
  }, [params?.chatId, params?.participants, params?.sellerEmail, params?.postId, params?.postTitle, params?.postImage, user?.email]);

  useEffect(() => {
    if (!chatId) return undefined;

    let retryTimer = null;
    debugLog('subscribe -> attach', { chatId, subscriptionVersion });
    const unsubscribe = FirebaseService.subscribeToChatMessages(chatId, async (result) => {
      if (result.success) {
        debugLog('subscribe -> success', {
          chatId,
          serverMessageCount: result.messages?.length || 0
        });
        setMessages((prev) => mergeServerWithPending(result.messages || [], prev));
        InteractionManager.runAfterInteractions(() => scrollToBottom(false));
        if (user?.email) {
          await FirebaseService.markChatAsSeen(chatId, user.email);
        }
      } else {
        debugLog('subscribe -> error', { chatId, error: result.error });
        const fetchResult = await FirebaseService.getChatMessages(chatId);
        if (fetchResult.success) {
          debugLog('subscribe -> fallback fetch success', {
            chatId,
            fetchedMessageCount: fetchResult.messages?.length || 0
          });
          setMessages((prev) => mergeServerWithPending(fetchResult.messages || [], prev));
          InteractionManager.runAfterInteractions(() => scrollToBottom(false));
        } else {
          debugLog('subscribe -> fallback fetch failed', { chatId, error: fetchResult.error });
        }

        // Retry listener once more after brief delay for first-time thread init race.
        if (!retryTimer) {
          retryTimer = setTimeout(() => {
            setSubscriptionVersion((prev) => prev + 1);
          }, 500);
        }
      }
    });

    return () => {
      debugLog('subscribe -> cleanup', { chatId });
      if (retryTimer) clearTimeout(retryTimer);
      if (unsubscribe) unsubscribe();
    };
  }, [chatId, user?.email, subscriptionVersion]);

  const loadOtherUserName = async (sellerEmail) => {
    if (!sellerEmail) return;

    const profileResult = await FirebaseService.getUserProfile(sellerEmail);
    if (profileResult.success && profileResult.profile) {
      setOtherUserName(profileResult.profile.displayName || sellerEmail);
      setOtherUserImage(profileResult.profile.photoURL || '');
    } else {
      setOtherUserName(sellerEmail);
      setOtherUserImage('');
    }
  };

  const ensureActiveChatId = async () => {
    if (!user?.email) return null;

    const sellerEmail =
      params?.sellerEmail ||
      params?.participants?.find((participantEmail) => participantEmail !== user.email);

    let activeChatId = chatId || params?.chatId || null;
    const openedFromChatList = Boolean(params?.chatId);
    debugLog('ensureActiveChatId -> start', {
      chatIdState: chatId,
      routeChatId: params?.chatId || null,
      openedFromChatList
    });

    // Product-detail flow derives chatId locally; ensure chat doc exists before writing first message.
    if (!openedFromChatList) {
      if (!sellerEmail) return null;

      const participants = [user.email, sellerEmail].sort();
      const chatResult = await FirebaseService.createChat(participants, {
        postId: params?.postId,
        postTitle: params?.postTitle,
        postImage: params?.postImage,
      });
      debugLog('ensureActiveChatId -> createChat result', {
        success: chatResult.success,
        chatId: chatResult.chatId || null,
        error: chatResult.error || null
      });

      if (!chatResult.success || !chatResult.chatId) {
        Alert.alert('Chat Error', chatResult.error || 'Unable to start chat. Please try again.');
        return null;
      }

      activeChatId = chatResult.chatId;
      if (chatResult.chatId !== chatId) {
        setChatId(chatResult.chatId);
      }
      // Ensure message listener restarts after first-time thread creation.
      setSubscriptionVersion((prev) => prev + 1);
    }

    if (!activeChatId) return null;
    await FirebaseService.markChatAsSeen(activeChatId, user.email);
    debugLog('ensureActiveChatId -> resolved', { activeChatId });
    return activeChatId;
  };

  const processSendQueue = async () => {
    if (isProcessingQueueRef.current) return;
    isProcessingQueueRef.current = true;

    while (queueRef.current.length > 0) {
      const queuedMessage = queueRef.current[0];
      debugLog('queue -> processing', {
        pendingQueue: queueRef.current.length,
        hasImage: Boolean(queuedMessage?.imageUrl),
        textLength: queuedMessage?.text?.length || 0,
        clientId: queuedMessage?.clientId || null
      });
      const activeChatId = await ensureActiveChatId();

      if (!activeChatId) {
        debugLog('queue -> no activeChatId, clearing queue');
        queueRef.current = [];
        break;
      }

      const { tempId, ...messagePayload } = queuedMessage;
      const sendResult = await FirebaseService.sendMessage(activeChatId, messagePayload);
      if (!sendResult.success) {
        debugLog('queue -> send failed', { activeChatId, error: sendResult.error });
        Alert.alert('Send Failed', sendResult.error || 'Message could not be sent.');
        console.log('Failed to send message:', sendResult.error);
        setMessages((prev) => prev.map((msg) => (
          msg.id === tempId ? { ...msg, failed: true } : msg
        )));
        queueRef.current.shift();
        continue;
      }

      queueRef.current.shift();
      debugLog('queue -> send success, fetching latest', { activeChatId });
      const fetchResult = await FirebaseService.getChatMessages(activeChatId);
      if (fetchResult.success) {
        debugLog('queue -> fetch success', {
          activeChatId,
          fetchedMessageCount: fetchResult.messages?.length || 0
        });
        setMessages((prev) => mergeServerWithPending(fetchResult.messages || [], prev));
      } else {
        debugLog('queue -> fetch failed', { activeChatId, error: fetchResult.error });
      }
      scrollToBottom(true);
    }

    isProcessingQueueRef.current = false;
  };

  const enqueueMessage = (messagePayload) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const optimisticMessage = {
      id: tempId,
      ...messagePayload,
      clientId: tempId,
      createdAt: Date.now(),
      deliveredTo: [user?.email].filter(Boolean),
      seenBy: [user?.email].filter(Boolean),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    debugLog('enqueue -> optimistic message added', {
      tempId,
      hasImage: Boolean(messagePayload?.imageUrl),
      textLength: messagePayload?.text?.length || 0
    });
    scrollToBottom(true);

    queueRef.current.push({ ...messagePayload, clientId: tempId, tempId });
    debugLog('enqueue -> queued', { queueSize: queueRef.current.length, tempId });
    processSendQueue();
  };

  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text || !user?.email) return;

    setNewMessage('');
    enqueueMessage({
      text,
      senderEmail: user.email,
      senderName: user.displayName || user.email,
      senderImage: user.photoURL || '',
    });
  };

  const sendImageMessage = async () => {
    if (!user?.email) return;

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow gallery access to share images.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (pickerResult.canceled || !pickerResult.assets?.length) return;

    const imageUri = pickerResult.assets[0].uri;
    const caption = newMessage.trim();
    if (caption) {
      setNewMessage('');
    }

    const manipulated = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 960 } }],
      {
        compress: 0.7,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      }
    );

    if (!manipulated.base64) {
      Alert.alert('Image Process Failed', 'Unable to prepare image for sending.');
      return;
    }

    const base64Image = `data:image/jpeg;base64,${manipulated.base64}`;

    enqueueMessage({
      text: caption,
      imageUrl: base64Image,
      senderEmail: user.email,
      senderName: user.displayName || user.email,
      senderImage: user.photoURL || '',
    });
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderEmail === user?.email;
    const messageStatus = FirebaseService.getMessageStatus(item, user?.email, otherUserEmail);
    return (
      <View style={styles.messageWrapper}>
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.senderName || 'User'}</Text>
        )}

        <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.theirMessage]}>
          {item.imageUrl ? (
            <TouchableOpacity onPress={() => {
              setSelectedImage(item.imageUrl);
              setIsModalVisible(true);
            }}>
              <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
            </TouchableOpacity>
          ) : null}
          {item.text ? <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>{item.text}</Text> : null}
          <View style={[styles.messageMetaRow, isMyMessage && styles.myMessageMetaRow]}>
            <Text style={[styles.messageTime, isMyMessage && styles.myMessageTime]}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isMyMessage ? (
              <Ionicons
                name={messageStatus === 'sent' ? 'checkmark' : 'checkmark-done'}
                size={14}
                color={messageStatus === 'seen' ? '#0EA5E9' : '#6B7280'}
                style={styles.messageStatusIcon}
              />
            ) : null}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 95 : 75}
    >
      <View style={styles.chatHeader}>
        <View style={styles.chatHeaderRow}>
          <Image
            source={otherUserImage ? { uri: otherUserImage } : require('../../assets/images/placeholder.png')}
            style={styles.headerAvatar}
          />
          <View style={styles.chatHeaderTextWrap}>
            <Text style={styles.chatHeaderTitle}>{otherUserName || 'Seller'}</Text>
            {/* <Text style={styles.chatHeaderSubtitle} numberOfLines={1}>{params?.postTitle || 'Product chat'}</Text> */}
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id || index.toString()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No messages yet. Start the conversation.</Text>
          </View>
        }
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => scrollToBottom(false)}
        onLayout={() => scrollToBottom(false)}
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.mediaButton} onPress={sendImageMessage}>
          <Ionicons name="image-outline" size={20} color={Colors.PRIMARY} />
        </TouchableOpacity>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor={Colors.GRAY}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons name="send" size={20} color={Colors.WHITE} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
        animationType="fade"
      >
        <View style={styles.modalBackground}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF3',
  },
  chatHeader: {
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  chatHeaderTextWrap: {
    marginLeft: 10,
    flex: 1,
  },
  chatHeaderTitle: {
    color: Colors.TEXT_PRIMARY,
    fontSize: width * 0.042,
    fontWeight: '700',
  },
  chatHeaderSubtitle: {
    marginTop: 2,
    color: Colors.TEXT_SECONDARY,
    fontSize: width * 0.031,
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 6,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  emptyStateText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: width * 0.033,
    textAlign: 'center',
  },
  messageWrapper: {
    marginBottom: 10,
  },
  senderName: {
    marginLeft: 8,
    marginBottom: 3,
    fontSize: width * 0.03,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '600',
  },
  messageContainer: {
    maxWidth: '78%',
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 12,
  },
  messageImage: {
    width: 180,
    height: 180,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#E5E7EB',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.WHITE,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: width * 0.038,
    color: '#1F2937',
    lineHeight: 20,
  },
  myMessageText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: width * 0.026,
    color: '#64748B',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  myMessageMetaRow: {
    gap: 3,
  },
  myMessageTime: {
    color: '#4B5563',
  },
  messageStatusIcon: {
    marginTop: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 16 : 10,
    backgroundColor: Colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 110,
  },
  mediaButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  input: {
    fontSize: width * 0.038,
    color: Colors.TEXT_PRIMARY,
  },
  sendButton: {
    backgroundColor: Colors.PRIMARY,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.LIGHT_GRAY,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  fullScreenImage: {
    width: width,
    height: width,
  },
});

export default ChatScreen;
