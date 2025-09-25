import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import API from '../api';

export default function Cart({ route, navigation }: any) {
  const token = route.params?.token;
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    try {
      const res = await API.get('/cart', { headers: { Authorization: 'Bearer ' + token } });
      setCartItems(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load cart items');
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Cart is empty', 'Add items to cart first.');
      return;
    }

    Alert.alert(
      'Confirm Checkout',
      `Total: ₱${totalPrice.toFixed(2)}\nDo you want to place the order?`,
      [
        { text: 'Cancel' },
        { text: 'Confirm', onPress: createOrder }
      ]
    );
  };

  async function createOrder() {
    try {
      await API.post('/orders', { items: cartItems }, { headers: { Authorization: 'Bearer ' + token } });
      Alert.alert('Success', 'Order placed successfully!');
      setCartItems([]); // clear cart
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to place order');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemName}>{item.product?.title}</Text>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
            <Text style={styles.itemPrice}>₱{item.price * item.quantity}</Text>
          </View>
        )}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ₱{totalPrice.toFixed(2)}</Text>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f6f7fb' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8 },
  itemName: { fontWeight: '600' },
  itemQty: { fontWeight: '500' },
  itemPrice: { fontWeight: '700' },
  totalContainer: { marginTop: 12, alignItems: 'center' },
  totalText: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  checkoutButton: { backgroundColor: '#2ecc71', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  checkoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
