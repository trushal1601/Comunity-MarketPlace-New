import { View, Text, Image, ScrollView, TouchableOpacity, Linking, Share, Alert, StyleSheet, Dimensions } from 'react-native'
import React, { useEffect ,useState} from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from "../Services/AuthService";;
import { collection, deleteDoc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import Colors from '../Utils/Colors';

import { FirebaseService } from '../Services/FirebaseService';

const { width } = Dimensions.get('window');

const ProductDetail = ({navigation}) => {
    const {params}=useRoute();
    const [product,setProduct]=useState([]);
    const user = AuthService.getCurrentUser();
    const db=getFirestore(app);
    const nav=useNavigation();
    const [isSold, setIsSold] = useState(false);

    useEffect(()=>{
        if(params) {
            setProduct(params.product);
            setIsSold(params.product.isSold || params.product.status === 'sold');
        }
        shareButton();
    },[params,navigation])

    const shareButton=()=>{
        navigation.setOptions({
            headerRight: () => (
                <Ionicons name="share-social-sharp" size={24} color="white" style={{marginRight:15}} onPress={()=>shareProduct()}/>
            ),
          });
    }

    const markAsSoldMethod = () => {
        Alert.alert(
            'Mark as Sold?',
            'Are you sure you want to mark this item as sold? This will reflect in your sales statistics.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Yes, Sold', 
                    onPress: async () => {
                        const result = await FirebaseService.markAsSold(product);
                        if (result.success) {
                            setIsSold(true);
                            Alert.alert('Success', 'Product marked as sold!');
                        }
                    }
                }
            ]
        );
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

    const sendWhatsAppMessage=()=>{
        if(!product.phone){
            Alert.alert('Phone Number Missing','This seller has not provided a phone number.');
            return;
        }
        const message='Hi '+product.userName+', I am interested in your listing: '+product.title;
        Linking.openURL('whatsapp://send?phone=91'+product.phone+"&text="+message);
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
                console.log("Deleted Doc...");
                nav.goBack();
            })
        })
    }

  return (
    <ScrollView style={styles.container}>
      <View>
        <Image source={{uri:product.image}} style={styles.productImage}/>
        {isSold && (
            <View style={styles.soldBadge}>
                <Text style={styles.soldBadgeText}>SOLD</Text>
            </View>
        )}
      </View>
      
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
     <View style={styles.ownerActions}>
        <TouchableOpacity 
            style={[styles.soldButton, isSold && { backgroundColor: Colors.GRAY }]} 
            onPress={() => !isSold && markAsSoldMethod()}
            disabled={isSold}
        >
            <Ionicons name="checkmark-circle" size={20} color={Colors.WHITE} />
            <Text style={styles.buttonText}>{isSold ? 'Already Sold' : 'Mark as Sold'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={()=>deleteUserpost()}>
            <Ionicons name="trash" size={20} color={Colors.WHITE} />
            <Text style={styles.buttonText}>Delete Post</Text>
        </TouchableOpacity>
     </View>
     :
        <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.messageButton} 
                    onPress={()=>sendEmailMessage()}
                    disabled={isSold}
            >
                <Ionicons name="mail" size={20} color={Colors.WHITE} />
                <Text style={styles.buttonText}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.messageButton, {backgroundColor: Colors.SUCCESS}, isSold && {backgroundColor: Colors.GRAY}]} 
                    onPress={()=>sendWhatsAppMessage()}
                    disabled={isSold}
            >
                <Ionicons name="logo-whatsapp" size={20} color={Colors.WHITE} />
                <Text style={styles.buttonText}>WhatsApp</Text>
            </TouchableOpacity>
        </View>
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
    flex: 1,
    backgroundColor: Colors.ERROR,
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
  ownerActions: {
    flexDirection: 'row',
    gap: 12,
    margin: width * 0.04,
  },
  messageButton: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    margin: width * 0.04,
  },
  buttonText: {
    textAlign: 'center',
    color: Colors.WHITE,
    fontSize: width * 0.038,
    fontWeight: '700',
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
  },
  soldBadgeText: {
    color: Colors.WHITE,
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: 2,
  },
});

export default ProductDetail