import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import React from 'react';
import Colors from '../../Utils/Colors';

const { width } = Dimensions.get('window');

const CategoriesImproved = ({ categoryList, selectedCategory, onCategorySelect }) => {
  const allCategories = [{ name: 'All', icon: null }, ...categoryList];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Categories</Text>
      <FlatList
        data={allCategories}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selectedCategory === item.name;
          return (
            <TouchableOpacity
              style={[styles.categoryItem, isSelected && styles.selectedCategory]}
              onPress={() => onCategorySelect(item.name)}
            >
              {item.icon && <Image source={{ uri: item.icon }} style={styles.categoryIcon} />}
              <Text style={[styles.categoryText, isSelected && styles.selectedText]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: width * 0.05,
    color: Colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: Colors.WHITE,
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  categoryIcon: {
    height: 30,
    width: 30,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: width * 0.035,
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
  },
  selectedText: {
    color: Colors.WHITE,
    fontWeight: '600',
  },
});

export default CategoriesImproved;
