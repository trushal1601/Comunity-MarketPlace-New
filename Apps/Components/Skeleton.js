import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const Skeleton = ({ width: w, height: h, borderRadius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: w,
          height: h,
          borderRadius: borderRadius,
          backgroundColor: '#E1E9EE',
          opacity: opacity,
        },
        style,
      ]}
    />
  );
};

export const HomeSkeleton = () => {
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.headerRow}>
        <Skeleton width={width * 0.4} height={30} />
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>
      
      <Skeleton width="100%" height={180} borderRadius={20} style={{ marginTop: 20 }} />
      
      <View style={styles.categoryRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ alignItems: 'center' }}>
            <Skeleton width={60} height={60} borderRadius={12} />
            <Skeleton width={50} height={15} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>

      <Skeleton width={width * 0.3} height={25} style={{ marginTop: 30 }} />
      
      <View style={styles.itemsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.itemCard}>
            <Skeleton width="100%" height={120} borderRadius={12} />
            <Skeleton width="80%" height={20} style={{ marginTop: 10 }} />
            <Skeleton width="40%" height={15} style={{ marginTop: 6 }} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    padding: 16,
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  itemCard: {
    width: '48%',
    marginBottom: 20,
  },
});

export default Skeleton;
