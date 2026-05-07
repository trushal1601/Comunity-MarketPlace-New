import { View, Text, Image, ScrollView, TouchableOpacity, Linking, Share, Alert, StyleSheet, Dimensions } from 'react-native';
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
  const user = AuthService.getCurrentUser();
  const nav = useNavigation();

  useEffect(() => {
    if (params?.product) {
      setProduct(params.product);
      checkFavorite(params.product);
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
        <View style={{ flexDirection: 'row', marginRight: 15 }}>
          <TouchableOpacity onPress={toggleFavorite} style={{ marginRight: 15 }}>
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? Colors.ERROR : "white"} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={shareProduct}>
            <Ionicons name="share-social-sharp" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
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

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={product.image ? { uri: product.image } : require('../../assets/images/placeholder.png')}
        style={styles.productImage}
      />
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>₹ {product.price}</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={Colors.TEXT_SECONDARY} />
          <Text style={styles.address}>{product.address}</Text>
        </View>

        <Text style={styles.descriptionHeading}>Description</Text>
        <Text style={styles.description}>{product.desc}</Text>
      </View>

      <View style={styles.userInfoContainer}>
        <Image
          source={product.userImage ? { uri: product.userImage } : require('../../assets/images/placeholder.png')}
          style={styles.userImage}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{product.userName}</Text>
          <Text style={styles.userEmail}>{product.userEmail}</Text>
        </View>
      </View>

      {user?.email === product.userEmail ? (
        <TouchableOpacity style={styles.deleteButton} onPress={deleteUserPost}>
          <Ionicons name="trash-outline" size={20} color={Colors.WHITE} />
          <Text style={styles.buttonText}>Delete Post</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.chatButton} onPress={startChat}>
            <Ionicons name="chatbubble-outline" size={20} color={Colors.WHITE} />
            <Text style={styles.buttonText}>Chat with Seller</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton} onPress={sendEmailMessage}>
            <Ionicons name="mail-outline" size={20} color={Colors.WHITE} />
            <Text style={styles.buttonText}>Send Email</Text>
          </TouchableOpacity>
        </>
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
  productImage: {
    height: 350,
    width: '100%',
  },
  contentContainer: {
    padding: width * 0.04,
    backgroundColor: Colors.WHITE,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
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
  deleteButton: {
    backgroundColor: Colors.ERROR,
    margin: width * 0.04,
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
  chatButton: {
    backgroundColor: Colors.SUCCESS,
    margin: width * 0.04,
    marginBottom: width * 0.02,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.SUCCESS,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  messageButton: {
    backgroundColor: Colors.PRIMARY,
    margin: width * 0.04,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    textAlign: 'center',
    color: Colors.WHITE,
    fontSize: width * 0.042,
    fontWeight: '600',
  },
});

export default ProductDetailImproved;
