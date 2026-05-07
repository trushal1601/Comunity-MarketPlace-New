import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Dimensions, Alert, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { AuthService } from "../Services/AuthService";;
import { Ionicons } from '@expo/vector-icons';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const ReviewsScreen = () => {
  const { params } = useRoute();
  const user = AuthService.getCurrentUser();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    const result = await FirebaseService.getReviews(params.postId);
    if (result.success) {
      setReviews(result.reviews);
    }
  };

  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    setLoading(true);
    const reviewData = {
      postId: params.postId,
      sellerEmail: params.sellerEmail,
      buyerEmail: user.email,
      buyerName: user.displayName,
      buyerImage: user.photoURL,
      rating,
      comment
    };

    const result = await FirebaseService.addReview(params.postId, reviewData);
    if (result.success) {
      Alert.alert('Success', 'Review submitted successfully');
      setRating(0);
      setComment('');
      loadReviews();
    } else {
      Alert.alert('Error', 'Failed to submit review');
    }
    setLoading(false);
  };

  const renderStars = (count, onPress = null) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onPress && onPress(star)} disabled={!onPress}>
            <Ionicons
              name={star <= count ? 'star' : 'star-outline'}
              size={onPress ? 32 : 20}
              color={Colors.WARNING}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.buyerImage }} style={styles.userImage} />
        <View style={styles.reviewInfo}>
          <Text style={styles.userName}>{item.buyerName}</Text>
          {renderStars(item.rating)}
        </View>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text style={styles.avgRating}>{avgRating}</Text>
        {renderStars(Math.round(avgRating))}
        <Text style={styles.totalReviews}>{reviews.length} reviews</Text>
      </View>

      {user.email !== params.sellerEmail && (
        <View style={styles.addReviewContainer}>
          <Text style={styles.sectionTitle}>Add Your Review</Text>
          {renderStars(rating, setRating)}
          <TextInput
            style={styles.input}
            placeholder="Write your review..."
            placeholderTextColor={Colors.GRAY}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={submitReview}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>Submit Review</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>All Reviews</Text>
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.reviewsList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No reviews yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  summaryContainer: {
    backgroundColor: Colors.WHITE,
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  avgRating: {
    fontSize: width * 0.12,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  totalReviews: {
    fontSize: width * 0.038,
    color: Colors.TEXT_SECONDARY,
    marginTop: 5,
  },
  addReviewContainer: {
    backgroundColor: Colors.WHITE,
    padding: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 10,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    textAlignVertical: 'top',
    fontSize: width * 0.04,
  },
  submitButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.LIGHT_GRAY,
  },
  submitButtonText: {
    color: Colors.WHITE,
    fontSize: width * 0.042,
    fontWeight: '600',
  },
  reviewsList: {
    padding: 15,
  },
  reviewItem: {
    backgroundColor: Colors.WHITE,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewInfo: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: width * 0.042,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  comment: {
    fontSize: width * 0.04,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 22,
  },
  date: {
    fontSize: width * 0.032,
    color: Colors.TEXT_SECONDARY,
    marginTop: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: width * 0.04,
    color: Colors.TEXT_SECONDARY,
  },
});

export default ReviewsScreen;
