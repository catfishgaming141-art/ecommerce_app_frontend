import React, {useState} from 'react';
import { View, Text, Image, Button, StyleSheet, TextInput } from 'react-native';
import API from '../api';

export default function Product({navigation, route}: any){
  const { product, token } = route.params;
  const [qty,setQty] = useState('1');
  // For simplicity, local cart: pass items to Cart screen via params
  function addToCart(){
    navigation.navigate('Cart',{ token, addItem: { product_id: product.id, title: product.title, price: product.price, qty: Number(qty) }});
  }
  return (
    <View style={styles.container}>
      <Image source={{uri:product.image||'https://via.placeholder.com/300'}} style={styles.img} />
      <Text style={{fontSize:20,fontWeight:'700'}}>{product.title}</Text>
      <Text style={{marginVertical:8}}>{product.description}</Text>
      <Text style={{fontSize:18,fontWeight:'700'}}>₱{product.price}</Text>
      <Text>Stock: {product.quantity}</Text>
      <View style={{height:12}} />
      <TextInput keyboardType="numeric" value={qty} onChangeText={setQty} style={styles.input} />
      <Button title="Add to cart" onPress={addToCart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16,backgroundColor:'#f6f7fb'},
  img:{width:'100%',height:240,resizeMode:'cover',borderRadius:12,marginBottom:12},
  input:{width:120,padding:10,backgroundColor:'#fff',borderRadius:8,marginBottom:10}
});
