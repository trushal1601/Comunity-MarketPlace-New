import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, limit, startAfter, setDoc, onSnapshot, getDoc, runTransaction, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';

const getSafeEmailKey = (email = '') => email.replace(/[.#$/\[\]]/g, '_');
const getSafeIdPart = (value = '') => String(value).replace(/[\/#?\[\]]/g, '_');
const getParticipantThreadId = (participants = []) =>
  [...new Set(participants)]
    .sort()
    .map((email) => getSafeIdPart(email))
    .join('__');

export const FirebaseService = {
  async createPost(postData) {
    try {
      const docRef = await addDoc(collection(db, 'UserPost'), {
        ...postData,
        createdAt: Date.now(),
        views: 0,
        favorites: []
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getPosts(limitCount = 20, lastDoc = null) {
    try {
      let q = query(collection(db, 'UserPost'), orderBy('createdAt', 'desc'), limit(limitCount));
      if (lastDoc) {
        q = query(collection(db, 'UserPost'), orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(limitCount));
      }
      const snapshot = await getDocs(q);
      const posts = [];
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, posts, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
    } catch (error) {
      return { success: false, error: error.message, posts: [] };
    }
  },

  async getPostsByCategory(category) {
    try {
      const q = query(collection(db, 'UserPost'), where('category', '==', category), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const posts = [];
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, posts };
    } catch (error) {
      return { success: false, error: error.message, posts: [] };
    }
  },

  async getUserPosts(userEmail) {
    try {
      const q = query(collection(db, 'UserPost'), where('userEmail', '==', userEmail), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const posts = [];
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, posts };
    } catch (error) {
      return { success: false, error: error.message, posts: [] };
    }
  },

  async deletePost(postId) {
    try {
      await deleteDoc(doc(db, 'UserPost', postId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async searchPosts(searchTerm) {
    try {
      const snapshot = await getDocs(collection(db, 'UserPost'));
      const posts = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            data.desc?.toLowerCase().includes(searchTerm.toLowerCase())) {
          posts.push({ id: doc.id, ...data });
        }
      });
      return { success: true, posts };
    } catch (error) {
      return { success: false, error: error.message, posts: [] };
    }
  },

  async getCategories() {
    try {
      const snapshot = await getDocs(collection(db, 'Category'));
      const categories = [];
      snapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, categories };
    } catch (error) {
      return { success: false, error: error.message, categories: [] };
    }
  },

  async getSliders() {
    try {
      const snapshot = await getDocs(collection(db, 'Sliders'));
      const sliders = [];
      snapshot.forEach((doc) => {
        sliders.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, sliders };
    } catch (error) {
      return { success: false, error: error.message, sliders: [] };
    }
  },

  async uploadImage(uri, path = 'communityPost') {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `${path}/${Date.now()}.jpg`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      return { success: true, url: downloadUrl };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async toggleFavorite(postId, userEmail) {
    try {
      const postRef = doc(db, 'UserPost', postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();
        const favorites = [...(postData.favorites || [])];
        const index = favorites.indexOf(userEmail);
        
        if (index > -1) {
          favorites.splice(index, 1);
        } else {
          favorites.push(userEmail);
        }
        
        await updateDoc(postRef, { favorites });
        return { success: true, isFavorite: index === -1, favorites };
      }
      return { success: false, error: 'Post not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getFavorites(userEmail) {
    try {
      const q = query(collection(db, 'UserPost'), where('favorites', 'array-contains', userEmail));
      const snapshot = await getDocs(q);
      const posts = [];
      snapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, posts };
    } catch (error) {
      return { success: false, error: error.message, posts: [] };
    }
  },

  // Reviews & Ratings
  async addReview(postId, reviewData) {
    try {
      const docRef = await addDoc(collection(db, 'Reviews'), {
        ...reviewData,
        createdAt: Date.now()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getReviews(postId) {
    try {
      const q = query(collection(db, 'Reviews'), where('postId', '==', postId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const reviews = [];
      snapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, reviews };
    } catch (error) {
      return { success: false, error: error.message, reviews: [] };
    }
  },

  async getUserReviews(userEmail) {
    try {
      const q = query(collection(db, 'Reviews'), where('sellerEmail', '==', userEmail), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const reviews = [];
      snapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, reviews };
    } catch (error) {
      return { success: false, error: error.message, reviews: [] };
    }
  },

  // Chat/Messaging
  async sendMessage(chatId, messageData) {
    try {
      const now = Date.now();
      const previewText = (messageData?.text || '').trim() || (messageData?.imageUrl ? 'Photo' : '');
      await addDoc(collection(db, 'Chats', chatId, 'messages'), {
        ...messageData,
        deliveredTo: [messageData.senderEmail],
        seenBy: [messageData.senderEmail],
        createdAt: now
      });
      
      const chatRef = doc(db, 'Chats', chatId);
      await runTransaction(db, async (transaction) => {
        const chatSnap = await transaction.get(chatRef);
        const chatData = chatSnap.exists() ? chatSnap.data() : {};

        const participants = [...new Set([...(chatData.participants || []), messageData.senderEmail])];
        const unreadCounts = { ...(chatData.unreadCounts || {}) };
        const lastSeenAt = { ...(chatData.lastSeenAt || {}) };
        const lastDeliveredAt = { ...(chatData.lastDeliveredAt || {}) };
        const senderKey = getSafeEmailKey(messageData.senderEmail);

        participants.forEach((participantEmail) => {
          const participantKey = getSafeEmailKey(participantEmail);
          if (participantEmail === messageData.senderEmail) {
            unreadCounts[participantKey] = 0;
            lastSeenAt[participantKey] = now;
            lastDeliveredAt[participantKey] = now;
          } else {
            unreadCounts[participantKey] = (unreadCounts[participantKey] || 0) + 1;
          }
        });

        if (!unreadCounts[senderKey]) {
          unreadCounts[senderKey] = 0;
        }
        if (!lastSeenAt[senderKey]) {
          lastSeenAt[senderKey] = now;
        }
        if (!lastDeliveredAt[senderKey]) {
          lastDeliveredAt[senderKey] = now;
        }

        transaction.set(chatRef, {
          participants,
          lastMessage: previewText,
          lastMessageTime: now,
          lastMessageSenderEmail: messageData.senderEmail,
          updatedAt: now,
          unreadCounts,
          lastSeenAt,
          lastDeliveredAt
        }, { merge: true });
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async createChat(participants, postData) {
    const uniqueParticipants = [...new Set(participants)].sort();
    const chatId = getParticipantThreadId(uniqueParticipants);
    const chatRef = doc(db, 'Chats', chatId);

    try {
      const now = Date.now();
      if (uniqueParticipants.length < 2) {
        return { success: false, error: 'Invalid chat participants' };
      }

      await setDoc(chatRef, {
        participants: uniqueParticipants,
        postId: postData?.postId || '',
        postTitle: postData?.postTitle || '',
        postImage: postData?.postImage || '',
        updatedAt: now,
      }, { merge: true });
      
      return { success: true, chatId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUserChats(userEmail) {
    try {
      const q = query(
        collection(db, 'Chats'), 
        where('participants', 'array-contains', userEmail)
      );
      const snapshot = await getDocs(q);
      const chats = [];
      snapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() });
      });
      chats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
      return { success: true, chats };
    } catch (error) {
      return { success: false, error: error.message, chats: [] };
    }
  },

  subscribeToUserChats(userEmail, callback) {
    try {
      const q = query(collection(db, 'Chats'), where('participants', 'array-contains', userEmail));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map((chatDoc) => ({ id: chatDoc.id, ...chatDoc.data() }));
        chats.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
        callback({ success: true, chats });
      }, (error) => {
        callback({ success: false, error: error.message, chats: [] });
      });
      return unsubscribe;
    } catch (error) {
      return null;
    }
  },

  async ensureChatPreview(chatId) {
    try {
      if (!chatId) return { success: false, error: 'Invalid chat id' };

      const latestMessageQuery = query(
        collection(db, 'Chats', chatId, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      const latestSnapshot = await getDocs(latestMessageQuery);
      if (latestSnapshot.empty) return { success: true, updated: false };

      const latestMessage = latestSnapshot.docs[0].data();
      const chatRef = doc(db, 'Chats', chatId);
      await setDoc(chatRef, {
        lastMessage: latestMessage.text || '',
        lastMessageTime: latestMessage.createdAt || Date.now(),
        updatedAt: Date.now()
      }, { merge: true });

      return { success: true, updated: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getChatMessages(chatId) {
    try {
      const q = query(collection(db, 'Chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, messages };
    } catch (error) {
      return { success: false, error: error.message, messages: [] };
    }
  },

  subscribeToChatMessages(chatId, callback) {
    try {
      const q = query(collection(db, 'Chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() });
        });
        callback({ success: true, messages });
      }, (error) => {
        callback({ success: false, error: error.message, messages: [] });
      });
      return unsubscribe;
    } catch (error) {
      return null;
    }
  },
  getUnreadCountFromChat(chat, userEmail) {
    if (!chat || !userEmail) return 0;
    const key = getSafeEmailKey(userEmail);
    return Number(chat?.unreadCounts?.[key] || 0);
  },

  getChatLastMessageStatus(chat, userEmail) {
    if (!chat || !userEmail || chat?.lastMessageSenderEmail !== userEmail) return null;

    const otherParticipant = (chat.participants || []).find((email) => email !== userEmail);
    if (!otherParticipant) return 'sent';

    const otherKey = getSafeEmailKey(otherParticipant);
    const lastMessageTime = Number(chat.lastMessageTime || 0);
    const seenAt = Number(chat?.lastSeenAt?.[otherKey] || 0);
    const deliveredAt = Number(chat?.lastDeliveredAt?.[otherKey] || 0);

    if (seenAt >= lastMessageTime) return 'seen';
    if (deliveredAt >= lastMessageTime) return 'delivered';
    return 'sent';
  },

  getMessageStatus(message, userEmail, otherParticipantEmail) {
    if (!message || message.senderEmail !== userEmail) return null;
    if (!otherParticipantEmail) return 'sent';

    const seenBy = message.seenBy || [];
    const deliveredTo = message.deliveredTo || [];

    if (seenBy.includes(otherParticipantEmail)) return 'seen';
    if (deliveredTo.includes(otherParticipantEmail)) return 'delivered';
    return 'sent';
  },

  async markChatAsDelivered(chatId, userEmail) {
    try {
      if (!chatId || !userEmail) return { success: false, error: 'Invalid input' };
      const key = getSafeEmailKey(userEmail);
      const now = Date.now();
      const chatRef = doc(db, 'Chats', chatId);

      await runTransaction(db, async (transaction) => {
        const chatSnap = await transaction.get(chatRef);
        if (!chatSnap.exists()) return;
        const chatData = chatSnap.data();
        const lastDeliveredAt = { ...(chatData.lastDeliveredAt || {}) };
        if ((lastDeliveredAt[key] || 0) < now) {
          lastDeliveredAt[key] = now;
          transaction.set(chatRef, { lastDeliveredAt, updatedAt: now }, { merge: true });
        }
      });

      const recentMessagesQuery = query(
        collection(db, 'Chats', chatId, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const messagesSnap = await getDocs(recentMessagesQuery);
      await Promise.all(
        messagesSnap.docs
          .filter((messageDoc) => {
            const data = messageDoc.data();
            return data.senderEmail !== userEmail && !(data.deliveredTo || []).includes(userEmail);
          })
          .map((messageDoc) => updateDoc(messageDoc.ref, { deliveredTo: arrayUnion(userEmail) }))
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async markChatAsSeen(chatId, userEmail) {
    try {
      if (!chatId || !userEmail) return { success: false, error: 'Invalid input' };
      const chatRef = doc(db, 'Chats', chatId);
      const now = Date.now();
      const key = getSafeEmailKey(userEmail);

      await runTransaction(db, async (transaction) => {
        const chatSnap = await transaction.get(chatRef);
        if (!chatSnap.exists()) return;
        const chatData = chatSnap.data();

        const unreadCounts = { ...(chatData.unreadCounts || {}) };
        const lastSeenAt = { ...(chatData.lastSeenAt || {}) };
        const lastDeliveredAt = { ...(chatData.lastDeliveredAt || {}) };

        unreadCounts[key] = 0;
        lastSeenAt[key] = now;
        lastDeliveredAt[key] = now;

        transaction.set(chatRef, { unreadCounts, lastSeenAt, lastDeliveredAt, updatedAt: now }, { merge: true });
      });

      const recentMessagesQuery = query(
        collection(db, 'Chats', chatId, 'messages'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const messagesSnap = await getDocs(recentMessagesQuery);
      await Promise.all(
        messagesSnap.docs
          .filter((messageDoc) => {
            const data = messageDoc.data();
            return data.senderEmail !== userEmail && !(data.seenBy || []).includes(userEmail);
          })
          .map((messageDoc) => updateDoc(messageDoc.ref, {
            deliveredTo: arrayUnion(userEmail),
            seenBy: arrayUnion(userEmail)
          }))
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Order History
  async createOrder(orderData) {
    try {
      const docRef = await addDoc(collection(db, 'Orders'), {
        ...orderData,
        createdAt: Date.now(),
        status: 'pending'
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUserOrders(userEmail, type = 'buyer') {
    try {
      const field = type === 'buyer' ? 'buyerEmail' : 'sellerEmail';
      const q = query(collection(db, 'Orders'), where(field, '==', userEmail), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const orders = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      return { success: true, orders };
    } catch (error) {
      return { success: false, error: error.message, orders: [] };
    }
  },

  async updateOrderStatus(orderId, status) {
    try {
      await updateDoc(doc(db, 'Orders', orderId), { status, updatedAt: Date.now() });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // User Profile
  async updateUserProfile(userEmail, profileData) {
    try {
      const userRef = doc(db, 'Users', userEmail);
      await setDoc(userRef, {
        ...profileData,
        updatedAt: Date.now()
      }, { merge: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getUserProfile(userEmail) {
    try {
      const userRef = doc(db, 'Users', userEmail);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { success: true, profile: userSnap.data() };
      }
      return { success: false, error: 'Profile not found', profile: null };
    } catch (error) {
      return { success: false, error: error.message, profile: null };
    }
  },

  async getUserStats(userEmail) {
    try {
      const [postsRes, ordersRes, reviewsRes] = await Promise.all([
        this.getUserPosts(userEmail),
        this.getUserOrders(userEmail, 'seller'),
        this.getUserReviews(userEmail)
      ]);

      const totalPosts = postsRes.posts?.length || 0;
      const totalSales = ordersRes.orders?.length || 0;
      const reviews = reviewsRes.reviews || [];
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      return {
        success: true,
        stats: {
          totalPosts,
          totalSales,
          totalReviews: reviews.length,
          avgRating: avgRating.toFixed(1)
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Price Filter
  async getPostsByPriceRange(minPrice, maxPrice) {
    try {
      const snapshot = await getDocs(collection(db, 'UserPost'));
      const posts = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const price = parseFloat(data.price);
        if (price >= minPrice && price <= maxPrice) {
          posts.push({ id: doc.id, ...data });
        }
      });
      return { success: true, posts };
    } catch (error) {
      return { success: false, error: error.message, posts: [] };
    }
  }
};
