import {Image, FlatList, StyleSheet, Text, View, Dimensions } from 'react-native'
import React from 'react'
import Colors from '../../Utils/Colors';

const { width } = Dimensions.get('window');

const Slider = ({sliderList}) => {
  return (
    <View style={styles.container}>
        <FlatList
            data={sliderList}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({item,index})=>(
                <View style={styles.imageContainer}>
                    <Image source={{uri:item.url}} style={styles.image} />
                </View>
            )}
        />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  imageContainer: {
    marginRight: 12,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    height: 160,
    width: width * 0.85,
    borderRadius: 15,
  },
});

export default Slider