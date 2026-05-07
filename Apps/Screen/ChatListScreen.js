import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { AuthService } from '../Services/AuthService';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');
const getSafeEmailKey = (email = '') => email.replace(/[.#$/\[\]]/g, '_');
const formatChatTime = (timestamp) => {
  if (!timestamp) return '';
  const messageDate = new Date(timestamp);
  const today = new Date();
  const isToday = messageDate.toDateString() === today.toDateString();
  if (isToday) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ChatListScreen = () => {
  const user = AuthService.getCurrentUser();
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilesByEmail, setProfilesByEmail] = useState({});
  const backfillInProgressRef = useRef({});

  useFocusEffect(
    React.useCallback(() => {
      if (!user?.email) {
        setLoading(false);
        setChats([]);
        return () => {};
      }

      const unsubscribeChats = FirebaseService.subscribeToUserChats(user.email, (result) => {
        if (result.success) {
          const nextChats = result.chats || [];
          setChats(nextChats);
          const userKey = getSafeEmailKey(user.email);
          nextChats.forEach((chat) => {
            const isIncomingLastMessage = chat?.lastMessageSenderEmail && chat.lastMessageSenderEmail !== user.email;
            const deliveredAt = Number(chat?.lastDeliveredAt?.[userKey] || 0);
            const lastMessageTime = Number(chat?.lastMessageTime || 0);
            if (isIncomingLastMessage && lastMessageTime > deliveredAt) {
              FirebaseService.markChatAsDelivered(chat.id, user.email).catch(() => {});
            }
          });
        } else {
          setChats([]);
        }
        setLoading(false);
      });

      return () => {
        if (unsubscribeChats) unsubscribeChats();
      };
    }, [user?.email])
  );

  useEffect(() => {
    const chatsWithoutPreview = chats.filter((chat) => !chat?.lastMessage || !chat?.lastMessageTime);
    chatsWithoutPreview.forEach((chat) => {
      if (!backfillInProgressRef.current[chat.id]) {
        backfillInProgressRef.current[chat.id] = true;
        FirebaseService.ensureChatPreview(chat.id).catch(() => {});
      }
    });
  }, [chats]);

  useEffect(() => {
    const loadProfiles = async () => {
      if (!user?.email || chats.length === 0) return;

      const otherEmails = [...new Set(
        chats
          .map((chat) => chat.participants?.find((participantEmail) => participantEmail !== user.email))
          .filter(Boolean)
      )];

      const missingEmails = otherEmails.filter((email) => !profilesByEmail[email]);
      if (missingEmails.length === 0) return;

      const profileEntries = await Promise.all(
        missingEmails.map(async (email) => {
          const profileResult = await FirebaseService.getUserProfile(email);
          return [email, profileResult.success ? profileResult.profile : null];
        })
      );

      setProfilesByEmail((prev) => {
        const next = { ...prev };
        profileEntries.forEach(([email, profile]) => {
          next[email] = profile;
        });
        return next;
      });
    };

    loadProfiles();
  }, [chats, profilesByEmail, user?.email]);

  const openChat = async (chat) => {
    const otherUser = chat.participants?.find((participantEmail) => participantEmail !== user.email);

    if (chat.id && user?.email) {
      await FirebaseService.markChatAsSeen(chat.id, user.email);
    }

    navigation.navigate('Chat', {
      chatId: chat.id,
      participants: chat.participants || [],
      sellerEmail: otherUser,
      postId: chat.postId,
      postTitle: chat.postTitle,
      postImage: chat.postImage,
    });
  };

  const renderChat = ({ item }) => {
    const unreadCount = FirebaseService.getUnreadCountFromChat(item, user?.email);
    const otherUserEmail = item.participants?.find((participantEmail) => participantEmail !== user.email) || '';
    const otherProfile = profilesByEmail[otherUserEmail] || null;
    const displayName = otherProfile?.displayName || otherUserEmail || 'User';
    const displayImage = otherProfile?.photoURL || '';
    const lastMessageTime = formatChatTime(item.lastMessageTime);
    const messageStatus = FirebaseService.getChatLastMessageStatus(item, user?.email);

    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => openChat(item)}>
        <Image
          source={displayImage ? { uri: displayImage } : require('../../assets/images/placeholder.png')}
          style={styles.productImage}
        />

        <View style={styles.chatInfo}>
          <Text style={styles.productTitle} numberOfLines={1}>{displayName}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {messageStatus ? (
          <Ionicons
            name={
              messageStatus === 'sent'
                ? 'checkmark'
                : 'checkmark-done'
            }
            size={14}
            color={
              messageStatus === 'seen'
                ? '#0EA5E9'
                : Colors.GRAY
            }
            style={{ marginRight: 4 ,paddingTop:5}}
          />
        ) : null}

        <Text
          style={[
            styles.lastMessage,
            unreadCount > 0 && styles.unreadMessage,
          ]}
          numberOfLines={1}
        >
          {item?.lastMessage?.trim()
            ? item.lastMessage
            : 'No messages yet'}
        </Text>
      </View>
        </View>

        <View style={styles.rightMeta}>
          <View style={styles.metaRow}>
            {lastMessageTime ? <Text style={styles.timeText}>{lastMessageTime}</Text> : null}
          </View>
          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={60} color={Colors.GRAY} />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubText}>Start chatting from any listing detail screen.</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  productImage: {
    width: 58,
    height: 58,
    borderRadius: 99,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productTitle: {
    fontSize: width * 0.04,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  otherUser: {
    fontSize: width * 0.034,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: width * 0.034,
    color: Colors.GRAY,
    marginTop: 4,
  },
  unreadMessage: {
    color: Colors.TEXT_PRIMARY,
    fontWeight: '600',
  },
  rightMeta: {
    marginLeft: 8,
    width: 72,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    minHeight: 18,
  },
  timeText: {
    fontSize: width * 0.029,
    color: Colors.TEXT_SECONDARY,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: Colors.WHITE,
    fontSize: width * 0.028,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: width * 0.05,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginTop: 15,
  },
  emptySubText: {
    fontSize: width * 0.036,
    color: Colors.TEXT_SECONDARY,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ChatListScreen;
