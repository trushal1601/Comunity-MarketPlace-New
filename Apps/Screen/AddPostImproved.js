import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Dimensions, Platform } from 'react-native';
import { Formik } from 'formik';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Yup from 'yup';
import { AuthService } from '../Services/AuthService';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AddPostImproved = ({ navigation }) => {
  const [images, setImages] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = AuthService.getCurrentUser();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const result = await FirebaseService.getCategories();
    if (result.success) {
      setCategoryList(result.categories);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const selectedUris = result.assets.map(asset => asset.uri);
      setImages([...images, ...selectedUris].slice(0, 5));
    }
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const onSubmitMethod = async (values, { resetForm }) => {
    if (images.length === 0) {
      Alert.alert('Error', 'Please select at least one image');
      return;
    }

    setLoading(true);
    try {
      const uploadResult = await FirebaseService.uploadMultipleImages(images);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      const postData = {
        ...values,
        image: uploadResult.urls[0] || '', // Fallback to empty string if no url
        images: uploadResult.urls || [],   // Fallback to empty array
        userName: user?.displayName || user?.email || 'Anonymous',
        userEmail: user?.email || '',
        userImage: user?.photoURL || '',
        phone: values.phone || '',
      };

      // Ensure no undefined values are sent to Firestore
      Object.keys(postData).forEach(key => {
        if (postData[key] === undefined) {
          postData[key] = '';
        }
      });

      const result = await FirebaseService.createPost(postData);
      
      if (result.success) {
        Alert.alert('Success', 'Post Added Successfully', [
          { text: 'OK', onPress: () => navigation.navigate('Home') }
        ]);
        resetForm();
        setImages([]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Submit Error:', error);
      Alert.alert('Error', error.message || 'Failed to add post');
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
    desc: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
    price: Yup.number().required('Price is required').positive('Price must be positive').integer('Price must be a whole number'),
    phone: Yup.string().required('Phone number is required').matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    address: Yup.string().required('Address is required'),
    category: Yup.string().required('Category is required'),
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Text style={styles.header}>Add New Post</Text>
        <Text style={styles.subHeader}>Create New Post and Start Selling</Text>
        
        <View style={styles.imageSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageList}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img }} style={styles.selectedImage} />
                <TouchableOpacity style={styles.removeIcon} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={24} color={Colors.ERROR} />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 5 && (
              <TouchableOpacity onPress={pickImage} style={styles.imagePickerSmall}>
                <Ionicons name="camera-outline" size={30} color={Colors.PRIMARY} />
                <Text style={styles.imagePickerTextSmall}>Add Photo</Text>
                <Text style={styles.limitText}>{images.length}/5</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <Formik
          initialValues={{ title: '', desc: '', category: '', address: '', price: '', phone: '' }}
          onSubmit={onSubmitMethod}
          validationSchema={validationSchema}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Title"
                placeholderTextColor={Colors.GRAY}
                value={values.title}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
              />
              {touched.title && errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description"
                placeholderTextColor={Colors.GRAY}
                value={values.desc}
                onChangeText={handleChange('desc')}
                onBlur={handleBlur('desc')}
                multiline
                numberOfLines={4}
              />
              {touched.desc && errors.desc && <Text style={styles.errorText}>{errors.desc}</Text>}

              <View style={styles.rowInputs}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Price (₹)"
                    placeholderTextColor={Colors.GRAY}
                    value={values.price}
                    onChangeText={handleChange('price')}
                    onBlur={handleBlur('price')}
                    keyboardType="numeric"
                  />
                  {touched.price && errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
                </View>
                <View style={{ flex: 1.5 }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor={Colors.GRAY}
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    keyboardType="phone-pad"
                  />
                  {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor={Colors.GRAY}
                value={values.address}
                onChangeText={handleChange('address')}
                onBlur={handleBlur('address')}
              />
              {touched.address && errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={values.category}
                  onValueChange={handleChange('category')}
                >
                  <Picker.Item label="Select a category" value="" />
                  {categoryList.map((item, index) => (
                    <Picker.Item key={index} label={item.name} value={item.name} />
                  ))}
                </Picker>
              </View>
              {touched.category && errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: loading ? Colors.LIGHT_GRAY : Colors.PRIMARY }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.submitButtonText}>Submit Post</Text>}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  container: {
    padding: width * 0.05,
    paddingBottom: 40,
  },
  header: {
    fontSize: width * 0.068,
    fontWeight: 'bold',
    marginTop: 10,
    color: Colors.TEXT_PRIMARY,
  },
  subHeader: {
    fontSize: width * 0.035,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 20,
    marginTop: 5,
  },
  imageSection: {
    marginBottom: 20,
  },
  imageList: {
    gap: 12,
    paddingVertical: 5,
  },
  imageWrapper: {
    position: 'relative',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  removeIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
  },
  imagePickerSmall: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.LIGHT_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerTextSmall: {
    fontSize: 10,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
    marginTop: 4,
  },
  limitText: {
    fontSize: 10,
    color: Colors.TEXT_SECONDARY,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 12,
    padding: 14,
    fontSize: width * 0.04,
    marginVertical: 8,
    backgroundColor: Colors.WHITE,
    color: Colors.TEXT_PRIMARY,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: Colors.WHITE,
    overflow: 'hidden',
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: Colors.WHITE,
    textAlign: 'center',
    fontSize: width * 0.042,
    fontWeight: '600',
  },
  errorText: {
    color: Colors.ERROR,
    fontSize: width * 0.032,
    marginBottom: 5,
    marginLeft: 5,
  },
});

export default AddPostImproved;
