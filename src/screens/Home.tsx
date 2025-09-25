import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Button } from 'react-native';
import API from '../api';
import { FontAwesome } from '@expo/vector-icons';

export default function Home({ navigation, route }: any) {
  const token = route.params?.token;
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get('/products');
      setProducts(res.data);
    } catch (err) {
      alert('Failed to load products');
      console.error(err);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesome 
          key={i} 
          name="star" 
          size={14} 
          color={i <= rating ? "#f1c40f" : "#ccc"} 
          style={{ marginRight: 2 }}
        />
      );
    }
    return <View style={{ flexDirection: 'row', marginTop: 4 }}>{stars}</View>;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Cart" onPress={() => navigation.navigate('Cart', { token })} />
          <Button title="Profile" onPress={() => navigation.navigate('Profile', { token })} />
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Product', { product: item, token })}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: item.image || 'https://via.placeholder.com/300' }}
              style={styles.img}
            />
            <Text numberOfLines={1} style={styles.productTitle}>{item.title}</Text>
            <Text style={styles.productPrice}>₱{item.price}</Text>
            <Text style={styles.productStock}>Stock: {item.quantity}</Text>
            {renderStars(item.rating ?? 0)}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', padding: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '700' },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  img: { width: '100%', height: 120, resizeMode: 'cover', borderRadius: 8, marginBottom: 8 },
  productTitle: { fontWeight: '700', fontSize: 14, color: '#222' },
  productPrice: { fontSize: 14, color: '#333', marginTop: 2 },
  productStock: { fontSize: 12, color: '#777', marginTop: 2 },
});
