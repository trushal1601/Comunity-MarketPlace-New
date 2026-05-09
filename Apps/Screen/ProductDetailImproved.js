import { View, Text, Image, ScrollView, TouchableOpacity, Linking, Share, Alert, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import React, { useLayoutEffect, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from "../Services/AuthService";
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const ProductDetailImproved = ({ navigation }) => {
  const { params } = useRoute();
  const [product, setProduct] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const user = AuthService.getCurrentUser();
  const nav = useNavigation();

  useEffect(() => {
    if (params?.product) {
      setProduct(params.product);
      checkFavorite(params.product);
      // Increment views
      if (params.product.id) {
        FirebaseService.incrementViews(params.product.id);
      }
    }
  }, [params]);

  useLayoutEffect(() => {
    setupHeader();
  }, [navigation, isFavorite, product?.id]);

  const checkFavorite = (prod) => {
    if (prod.favorites && user?.email) {
      setIsFavorite(prod.favorites.includes(user.email));
    }
  };

  const setupHeader = () => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', marginRight: 15, gap: 15 }}>
          <TouchableOpacity onPress={toggleFavorite}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? Colors.ERROR : "white"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={reportPost}>
            <Ionicons name="flag-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={shareProduct}>
            <Ionicons name="share-social-sharp" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  };

  const reportPost = () => {
    Alert.alert(
      'Report Post',
      'Why are you reporting this post?',
      [
        { text: 'Spam', onPress: () => submitReport('Spam') },
        { text: 'Scam', onPress: () => submitReport('Scam') },
        { text: 'Inappropriate', onPress: () => submitReport('Inappropriate') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const submitReport = async (reason) => {
    const reportData = {
      postId: product.id,
      postTitle: product.title,
      reporterEmail: user?.email,
      sellerEmail: product.userEmail,
      reason: reason,
      timestamp: Date.now()
    };
    const result = await FirebaseService.reportPost(reportData);
    if (result.success) {
      Alert.alert('Success', 'Thank you for reporting. Our team will review this post.');
    }
  };

  const toggleFavorite = async () => {
    if (!product?.id || !user?.email) return;

    const result = await FirebaseService.toggleFavorite(product.id, user.email);
    if (result.success) {
      setIsFavorite(result.isFavorite);
    }
  };

  const shareProduct = async () => {
    try {
      await Share.share({
        message: `${product?.title}\n\n${product?.desc}\n\nPrice: ₹${product?.price}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const startChat = () => {
    console.log('Starting chat with product:', product);
    nav.navigate('Chat', {
      sellerEmail: product.userEmail,
      postId: product.id || product.title,
      postTitle: product.title,
      postImage: product.image
    });
  };

  const sendEmailMessage = () => {
    const subject = `Regarding ${product.title}`;
    const body = `Hi ${product.userName},\n\nI am interested in this product.\n\nProduct: ${product.title}\nPrice: ₹${product.price}`;
    Linking.openURL(`mailto:${product.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const deleteUserPost = () => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      {
        text: 'Yes',
        onPress: () => deleteFromFirestore(),
        style: 'destructive'
      },
      {
        text: 'Cancel',
        style: 'cancel'
      }
    ]);
  };

  const deleteFromFirestore = async () => {
    if (!product?.id) return;

    const result = await FirebaseService.deletePost(product.id);
    if (result.success) {
      Alert.alert('Success', 'Post deleted successfully');
      nav.goBack();
    } else {
      Alert.alert('Error', 'Failed to delete post');
    }
  };

  const sendWhatsAppMessage = () => {
    if (!product.phone) {
      Alert.alert('Phone Number Missing', 'This seller has not provided a phone number.');
      return;
    }
    const message = `Hi ${product.userName}, I am interested in your listing: ${product.title}`;
    Linking.openURL(`whatsapp://send?phone=91${product.phone}&text=${encodeURIComponent(message)}`);
  };

  const markAsSoldMethod = async () => {
    if (!product?.id) {
      Alert.alert('Error', 'Product ID is missing. Please refresh and try again.');
      return;
    }

    Alert.alert(
      'Mark as Sold?',
      'Are you sure you want to mark this item as sold? This will reflect in your sales statistics.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Sold',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await FirebaseService.markAsSold(product);
              if (result.success) {
                setProduct({ ...product, status: 'sold', isSold: true });
                Alert.alert('Success', 'Product marked as sold!');
              } else {
                Alert.alert('Error', result.error || 'Failed to mark as sold');
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'An unexpected error occurred');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const navigateToSellerProfile = () => {
    nav.navigate('SellerProfile', {
      sellerEmail: product.userEmail,
      sellerName: product.userName,
      sellerImage: product.userImage
    });
  };

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  const isSold = product.isSold || product.status === 'sold';
  const images = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(e) => {
            const offset = e.nativeEvent.contentOffset.x;
            setActiveImageIndex(Math.round(offset / width));
          }}
        >
          {images.map((img, index) => (
            <Image
              key={index}
              source={img ? { uri: img } : require('../../assets/images/placeholder.png')}
              style={styles.productImage}
            />
          ))}
        </ScrollView>
        {isSold && (
          <View style={styles.soldBadge}>
            <Text style={styles.soldBadgeText}>SOLD</Text>
          </View>
        )}
        {images.length > 1 && (
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  activeImageIndex === index && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{product.title}</Text>
          {/* <View style={styles.viewCountContainer}>
            <Ionicons name="eye-outline" size={16} color={Colors.GRAY} />
            <Text style={styles.viewCountText}>{product.views || 0}</Text>
          </View> */}
        </View>
        <Text style={styles.price}>₹ {product.price}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={Colors.TEXT_SECONDARY} />
          <Text style={styles.address}>{product.address}</Text>
        </View>

        <Text style={styles.descriptionHeading}>Description</Text>
        <Text style={styles.description}>{product.desc}</Text>
      </View>

      <TouchableOpacity
        style={styles.userInfoContainer}
        onPress={navigateToSellerProfile}
      >
        <Image
          source={product.userImage ? { uri: product.userImage } : require('../../assets/images/placeholder.png')}
          style={styles.userImage}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{product.userName}</Text>
          <Text style={styles.userEmail}>{product.userEmail}</Text>
          <Text style={styles.viewProfileText}>View Profile</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={Colors.PRIMARY} />
      </TouchableOpacity>

      {user?.email === product.userEmail ? (
        <View style={styles.ownerActions}>
          <TouchableOpacity
            style={[styles.soldButton, (isSold || loading) && { backgroundColor: Colors.GRAY }]}
            onPress={() => !isSold && !loading && markAsSoldMethod()}
            disabled={isSold || loading}
          >
            {loading ? <ActivityIndicator size="small" color={Colors.WHITE} /> : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.WHITE} />
                <Text style={styles.buttonText}>{isSold ? 'Already Sold' : 'Mark as Sold'}</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, loading && { opacity: 0.5 }]}
            onPress={() => !loading && deleteUserPost()}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.WHITE} />
            <Text style={styles.buttonText}>Delete Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.actionButton, styles.chatButton, loading && { opacity: 0.5 }]} onPress={() => !loading && startChat()} disabled={isSold || loading}>
            <Ionicons name="chatbubble-outline" size={20} color={Colors.WHITE} />
            <Text style={styles.buttonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.whatsappButton, (isSold || loading) && { backgroundColor: Colors.GRAY }]} onPress={() => !loading && sendWhatsAppMessage()} disabled={isSold || loading}>
            <Ionicons name="logo-whatsapp" size={20} color={Colors.WHITE} />
            <Text style={styles.buttonText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.messageButton, loading && { opacity: 0.5 }]} onPress={() => !loading && sendEmailMessage()} disabled={isSold || loading}>
            <Ionicons name="mail-outline" size={20} color={Colors.WHITE} />
            <Text style={styles.buttonText}>Email</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loaderText}>Processing...</Text>
        </View>
      )}
    </ScrollView>
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
    backgroundColor: Colors.BACKGROUND,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    height: 350,
    width: width,
  },
  pagination: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: Colors.WHITE,
    width: 20,
  },
  contentContainer: {
    padding: width * 0.04,
    backgroundColor: Colors.WHITE,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.BACKGROUND,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  viewCountText: {
    fontSize: 12,
    color: Colors.GRAY,
    fontWeight: '600',
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    flex: 1,
  },
  price: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },
  address: {
    fontSize: width * 0.038,
    color: Colors.TEXT_SECONDARY,
  },
  descriptionHeading: {
    marginTop: 16,
    fontWeight: 'bold',
    fontSize: width * 0.05,
    color: Colors.TEXT_PRIMARY,
  },
  description: {
    fontSize: width * 0.042,
    color: Colors.TEXT_SECONDARY,
    marginTop: 8,
    lineHeight: 24,
  },
  userInfoContainer: {
    padding: width * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.LIGHT_PRIMARY,
    marginTop: 0,
  },
  userImage: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: width * 0.045,
    color: Colors.TEXT_PRIMARY,
  },
  userEmail: {
    color: Colors.TEXT_SECONDARY,
    fontSize: width * 0.035,
    marginTop: 2,
  },
  viewProfileText: {
    color: Colors.PRIMARY,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.ERROR,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.ERROR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 12,
    margin: width * 0.04,
  },
  soldButton: {
    flex: 1.5,
    backgroundColor: Colors.SUCCESS,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  chatButton: {
    backgroundColor: Colors.PRIMARY,
    shadowColor: Colors.PRIMARY,
  },
  whatsappButton: {
    backgroundColor: Colors.SUCCESS,
    shadowColor: Colors.SUCCESS,
  },
  messageButton: {
    backgroundColor: Colors.SECONDARY,
    shadowColor: Colors.SECONDARY,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    margin: width * 0.04,
  },
  buttonText: {
    textAlign: 'center',
    color: Colors.WHITE,
    fontSize: width * 0.035,
    fontWeight: 'bold',
  },
  soldBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    transform: [{ rotate: '15deg' }],
    zIndex: 10,
  },
  soldBadgeText: {
    color: Colors.WHITE,
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 2,
  },
  fullScreenLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderText: {
    marginTop: 10,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
});

export default ProductDetailImproved;
