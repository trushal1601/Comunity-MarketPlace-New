import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import Colors from '../../Utils/Colors';

const { width } = Dimensions.get('window');

const Categories = ({categoryList}) => {

  const navigation=useNavigation();
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Categories</Text>
      <FlatList
        data={categoryList}
        numColumns={4}
        keyExtractor={(item, index) => item?.id || `${item?.name || 'category'}-${index}`}
        renderItem={({item,index})=>(
          <TouchableOpacity style={styles.categoryItem} onPress={()=>navigation.navigate('ItemList',{
            category:item.name
           })}>
            <Image source={{uri:item.icon}} style={styles.categoryIcon}/>
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.LIGHT_SECONDARY,
    margin: 4,
    minHeight: 90,
    borderRadius: 12,
    backgroundColor: Colors.LIGHT_PRIMARY,
  },
  categoryIcon: {
    height: 40,
    width: 40,
  },
  categoryText: {
    fontSize: width * 0.03,
    marginTop: 6,
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
  },
});

export default Categories
