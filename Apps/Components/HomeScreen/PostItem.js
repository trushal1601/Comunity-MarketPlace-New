import { View, Text,TouchableOpacity ,Image, StyleSheet, Dimensions} from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import Colors from '../../Utils/Colors';

const { width } = Dimensions.get('window');

const PostItem = ({item}) => {

    const navigation=useNavigation();
  return (
    
      <TouchableOpacity style={styles.container} onPress={()=>navigation.push('ProductDetail',
        {
          product:item
        }
      )}>
         <Image
          source={item?.image ? { uri: item.image } : require('./../../../assets/images/placeholder.png')}
          style={styles.image}
        />
         <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.price}>₹ {item.price}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          </View>
          </TouchableOpacity>

  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    backgroundColor: Colors.CARD_BG,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    height: 140,
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
  },
  contentContainer: {
    marginTop: 8,
  },
  title: {
    fontSize: width * 0.038,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    marginTop: 4,
  },
  price: {
    fontSize: width * 0.048,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: Colors.LIGHT_SECONDARY,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  categoryText: {
    color: Colors.PRIMARY,
    fontSize: width * 0.028,
    fontWeight: '600',
  },
});

export default PostItem
