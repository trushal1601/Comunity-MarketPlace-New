import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Dimensions, Platform } from 'react-native';
import { Formik } from 'formik';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Yup from 'yup';
import { AuthService } from '../Services/AuthService';
import { FirebaseService } from '../Services/FirebaseService';
import Colors from '../Utils/Colors';

const { width } = Dimensions.get('window');

const AddPostImproved = ({ navigation }) => {
  const [image, setImage] = useState(null);
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
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const onSubmitMethod = async (values, { resetForm }) => {
    if (!image) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    setLoading(true);
    try {
      const uploadResult = await FirebaseService.uploadImage(image);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      const postData = {
        ...values,
        image: uploadResult.url,
        userName: user.displayName,
        userEmail: user.email,
        userImage: user.photoURL,
      };

      const result = await FirebaseService.createPost(postData);
      
      if (result.success) {
        Alert.alert('Success', 'Post Added Successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        resetForm();
        setImage(null);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add post');
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
    desc: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
    price: Yup.number().required('Price is required').positive('Price must be positive').integer('Price must be a whole number'),
    address: Yup.string().required('Address is required'),
    category: Yup.string().required('Category is required'),
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Text style={styles.header}>Add New Post</Text>
        <Text style={styles.subHeader}>Create New Post and Start Selling</Text>
        
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          <Image
            source={image ? { uri: image } : require('./../../assets/images/placeholder.png')}
            style={styles.image}
          />
          <Text style={styles.imagePickerText}>Tap to select image</Text>
        </TouchableOpacity>

        <Formik
          initialValues={{ title: '', desc: '', category: '', address: '', price: '' }}
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
                {loading ? <ActivityIndicator color={Colors.WHITE} /> : <Text style={styles.submitButtonText}>Submit</Text>}
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
  imagePicker: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: Colors.LIGHT_PRIMARY,
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.LIGHT_SECONDARY,
  },
  image: {
    height: 120,
    width: 120,
    borderRadius: 15,
  },
  imagePickerText: {
    marginTop: 10,
    color: Colors.PRIMARY,
    fontSize: width * 0.035,
    fontWeight: '600',
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
