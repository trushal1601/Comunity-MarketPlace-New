import { View, Text, Image, ScrollView, TouchableOpacity, Linking, Share, Alert, StyleSheet, Dimensions } from 'react-native'
import React, { useEffect ,useState} from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from "../Services/AuthService";;
import { collection, deleteDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const ProductDetail = ({navigation}) => {
    const {params}=useRoute();
    const [product,setProduct]=useState([]);
    const user = AuthService.getCurrentUser();
    const db=getFirestore(app);
    const nav=useNavigation();
    useEffect(()=>{
        params && setProduct(params.product);
        shareButton();
    },[params,navigation])

    const shareButton=()=>{
        navigation.setOptions({
            headerRight: () => (
               
                <Ionicons name="share-social-sharp" size={24} color="white" style={{marginRight:15}} onPress={()=>shareProduct()}/>
                
            ),
          });
    }

    const shareProduct=async()=>{
        const content={
            message:product?.title+"\n"+product?.desc
        }
        Share.share(content).then(resp=>{
            console.log(resp);
        },(error)=>{console.log(error);});
    }

    const sendEmailMessage=()=>{
        const subject='Regarding '+product.title;
        const body='Hi '+product.userName+"\n"+"I am interested in this Product";
        Linking.openURL('mailto:'+product.userEmail+"?subject="+subject+"&body="+body);
    }
    const deleteUserpost=()=>{
                Alert.alert('Do You Want to Delete?','Are You want to Delete this Post?',[
                   {
                    text:'Yes',
                    onPress:()=>deleteFromiFirestore()
                   },
                   {
                    text:'Cancel',
                    onPress:()=>console.log('Cancel Pressed'),
                    style:'cancel'
                   }
                ])
    }

    const deleteFromiFirestore=async()=>{
            const q=query(collection(db,'UserPost'),where('title','==',product.title));
            const snapshot=await getDocs(q);
            snapshot.forEach(doc=>{
                deleteDoc(doc.ref).then(resp=>{
                    console.log("Deleetd Doc...");
                    nav.goBack();
                })
            })
    }
  return (
    <ScrollView style={styles.container}>
      <Image source={{uri:product.image}} style={styles.productImage}/>
      
      <View style={styles.contentContainer}>
             <Text style={styles.title}>{product.title}</Text>
             <Text style={styles.price}>₹ {product.price}</Text>
             <Text style={styles.descriptionHeading}>Description</Text>
             <Text style={styles.description}>{product.desc}</Text>
      </View>
     <View style={styles.userInfoContainer}>
        <Image source={{uri:params.product.userImage}} style={styles.userImage}/>   
        <View>
            <Text style={styles.userName}>{product.userName}</Text>
            <Text style={styles.userEmail}>{product.userEmail}</Text>
        </View>
     </View>
     {user?.email===product.userEmail?
     <TouchableOpacity style={styles.deleteButton} 
     onPress={()=>deleteUserpost()}
>
 <Text style={styles.buttonText}>Delete Post</Text>
</TouchableOpacity>
     :
        <TouchableOpacity style={styles.messageButton} 
                onPress={()=>sendEmailMessage()}
        >
            <Text style={styles.buttonText}>Send Message</Text>
        </TouchableOpacity>
        }

    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    shadowColor: Colors.ERROR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  messageButton: {
    backgroundColor: Colors.PRIMARY,
    margin: width * 0.04,
    borderRadius: 12,
    padding: 16,
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

export default ProductDetail