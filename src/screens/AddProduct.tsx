import React, { useState, useRef } from 'react';
import { View, TextInput, Text, Animated, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import API from '../api';

export default function AddProduct({ navigation, route }: any) {
  const token = route.params?.token;
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [errors, setErrors] = useState({ title: '', desc: '', price: '', qty: '' });

  const validate = () => {
    let valid = true;
    const newErrors = { title: '', desc: '', price: '', qty: '' };

    if (!title.trim()) { newErrors.title = 'Title is required'; valid = false; }
    if (!desc.trim()) { newErrors.desc = 'Description is required'; valid = false; }
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Enter a valid price'; valid = false;
    }
    if (!qty.trim() || isNaN(Number(qty)) || Number(qty) < 0) {
      newErrors.qty = 'Enter a valid quantity'; valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const isFormValid = () => {
    return title.trim() && desc.trim() && price.trim() && !isNaN(Number(price)) && Number(price) > 0
      && qty.trim() && !isNaN(Number(qty)) && Number(qty) >= 0;
  };

  const add = async () => {
    if (!validate()) return;

    // small bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      await API.post(
        '/products/add',
        {
          title,
          description: desc,
          price: Number(price),
          quantity: Number(qty),
          gender: 'unisex',
          image: imageUrl || 'https://via.placeholder.com/300'
        },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      Alert.alert('Success', 'Product added successfully!');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(err?.response?.data?.message || 'Add failed');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={text => { setTitle(text); if (text.trim()) setErrors(prev => ({ ...prev, title: '' })); }}
        style={styles.input}
      />
      {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}

      <TextInput
        placeholder="Description"
        value={desc}
        onChangeText={text => { setDesc(text); if (text.trim()) setErrors(prev => ({ ...prev, desc: '' })); }}
        style={styles.input}
      />
      {errors.desc ? <Text style={styles.error}>{errors.desc}</Text> : null}

      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={text => { setPrice(text); if (!isNaN(Number(text)) && Number(text) > 0) setErrors(prev => ({ ...prev, price: '' })); }}
        keyboardType="numeric"
        style={styles.input}
      />
      {errors.price ? <Text style={styles.error}>{errors.price}</Text> : null}

      <TextInput
        placeholder="Quantity"
        value={qty}
        onChangeText={text => { setQty(text); if (!isNaN(Number(text)) && Number(text) >= 0) setErrors(prev => ({ ...prev, qty: '' })); }}
        keyboardType="numeric"
        style={styles.input}
      />
      {errors.qty ? <Text style={styles.error}>{errors.qty}</Text> : null}

      <TextInput
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChangeText={setImageUrl}
        style={styles.input}
      />

      {/* Gradient Add Product Button with Bounce */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%', marginTop: 10 }}>
        <TouchableOpacity onPress={add} disabled={!isFormValid()} style={{ borderRadius: 12, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#4a90e2', '#50c9c3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: 14,
              alignItems: 'center',
              borderRadius: 12,
              shadowColor: '#4a90e2',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>➕ Add Product</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f6f7fb' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#ccc' },
  error: { color: 'red', marginBottom: 6 },
});
