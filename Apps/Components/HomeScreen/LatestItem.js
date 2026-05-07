import React from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions } from 'react-native';
import PostItem from './PostItem';
import Colors from '../../Utils/Colors';

const { width } = Dimensions.get('window');

const LatestItem = ({ latestItemList = [], emptyMessage = 'No items available right now.', scrollEnabled = true }) => {
  if (!latestItemList.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={latestItemList}
        numColumns={2}
        scrollEnabled={scrollEnabled}
        keyExtractor={(item, index) => item?.id || `${item?.title || 'item'}-${index}`}
        renderItem={({ item }) => <PostItem item={item} />}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};

export default LatestItem;

const styles = StyleSheet.create({
  container: {
    marginTop: 3,
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 12,
    padding: 20,
    backgroundColor: Colors.WHITE,
  },
  emptyText: {
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    fontSize: width * 0.036,
  },
});
