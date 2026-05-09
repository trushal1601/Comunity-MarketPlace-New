import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FirebaseService } from '../Services/FirebaseService';
import { AuthService } from '../Services/AuthService';
import Colors from '../Utils/Colors';
import PostItem from '../Components/HomeScreen/PostItem';

const { width } = Dimensions.get('window');

const SellerProfileScreen = () => {
  const { params } = useRoute();
  const navigation = useNavigation();
  const [sellerPosts, setSellerPosts] = useState([]);
  const [sellerStats, setSellerStats] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState(false);
  const user = AuthService.getCurrentUser();

  const sellerEmail = params?.sellerEmail;

  useEffect(() => {
    if (sellerEmail) {
      loadSellerData();
      checkFollowing();
    }
  }, [sellerEmail]);

  const loadSellerData = async () => {
    setLoading(true);
    const [postsRes, statsRes] = await Promise.all([
      FirebaseService.getUserPosts(sellerEmail),
      FirebaseService.getUserStats(sellerEmail)
    ]);

    if (postsRes.success) setSellerPosts(postsRes.posts);
    if (statsRes.success) setSellerStats(statsRes.stats);
    setLoading(false);
  };

  const checkFollowing = async () => {
    if (user?.email && sellerEmail) {
      const following = await FirebaseService.isFollowing(user.email, sellerEmail);
      setIsFollowing(following);
    }
  };

  const handleFollow = async () => {
    if (!user?.email || !sellerEmail) return;
    setFollowingLoading(true);
    const result = await FirebaseService.toggleFollow(user.email, sellerEmail);
    if (result.success) {
      setIsFollowing(result.isFollowing);
      // Refresh stats to show new follower count
      const statsRes = await FirebaseService.getUserStats(sellerEmail);
      if (statsRes.success) setSellerStats(statsRes.stats);
    }
    setFollowingLoading(false);
  };

  const startChat = () => {
    navigation.navigate('Chat', {
      sellerEmail: sellerEmail,
      postTitle: 'Direct Message',
    });
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
      <FlatList
        data={sellerPosts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.profileInfo}>
              <Image 
                source={params?.sellerImage ? { uri: params.sellerImage } : require('../../assets/images/placeholder.png')} 
                style={styles.profileImage} 
              />
              <Text style={styles.name}>{params?.sellerName}</Text>
              <Text style={styles.email}>{sellerEmail}</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{sellerStats?.totalPosts || 0}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{sellerStats?.avgRating || 0.0}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{sellerStats?.totalSales || 0}</Text>
                  <Text style={styles.statLabel}>Sales</Text>
                </View>
              </View>

              {user?.email !== sellerEmail && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.button, isFollowing ? styles.followingButton : styles.followButton]} 
                    onPress={handleFollow}
                    disabled={followingLoading}
                  >
                    {followingLoading ? (
                      <ActivityIndicator size="small" color={isFollowing ? Colors.PRIMARY : Colors.WHITE} />
                    ) : (
                      <>
                        <Ionicons name={isFollowing ? "person-remove" : "person-add"} size={18} color={isFollowing ? Colors.PRIMARY : Colors.WHITE} />
                        <Text style={[styles.buttonText, isFollowing && styles.followingButtonText]}>
                          {isFollowing ? 'Following' : 'Follow'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={[styles.button, styles.chatButton]} onPress={startChat}>
                    <Ionicons name="chatbubble-outline" size={18} color={Colors.WHITE} />
                    <Text style={styles.buttonText}>Message</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <Text style={styles.sectionTitle}>Active Listings</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ flex: 0.5, padding: 5 }}>
            <PostItem item={item} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active listings found.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
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
  header: {
    backgroundColor: Colors.WHITE,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileInfo: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.PRIMARY,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginTop: 10,
  },
  email: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.TEXT_SECONDARY,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 25,
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    minWidth: 140,
  },
  followButton: {
    backgroundColor: Colors.PRIMARY,
  },
  followingButton: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  chatButton: {
    backgroundColor: Colors.SUCCESS,
  },
  buttonText: {
    color: Colors.WHITE,
    fontWeight: 'bold',
    fontSize: 16,
  },
  followingButtonText: {
    color: Colors.PRIMARY,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginTop: 30,
    marginLeft: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    padding: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 16,
  }
});

export default SellerProfileScreen;
