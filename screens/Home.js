import React, {useEffect, useState} from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

export default function Home({navigation, route}){
  const [products,setProducts]=useState([]);
  useEffect(()=>{ fetch(); },[]);
  const fetch = async ()=>{
    try{
      const res = await axios.get('http://10.0.2.2:4000/api/products');
      setProducts(res.data);
    }catch(err){ console.error(err); }
  };
  return (<View style={styles.container}>
    <Text style={styles.header}>Lazada-like Store</Text>
    <FlatList data={products} keyExtractor={p=>String(p.id)} numColumns={2} renderItem={({item})=>(
      <TouchableOpacity style={styles.card} onPress={()=>navigation.navigate('Product',{id:item.id})}>
        <Image source={{uri:item.image||'https://via.placeholder.com/150'}} style={styles.img}/>
        <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>₱{item.price}</Text>
      </TouchableOpacity>
    )}/>
  </View>);
}

const styles = StyleSheet.create({
  container:{flex:1,padding:10,backgroundColor:'#eef2ff'},
  header:{fontSize:20,fontWeight:'700',marginBottom:8,alignSelf:'center'},
  card:{flex:1,margin:8,backgroundColor:'#fff',borderRadius:10,padding:10,elevation:2},
  img:{width:'100%',height:120,borderRadius:8,marginBottom:6},
  title:{fontWeight:'600'},
  price:{color:'#0ea5a4',fontWeight:'700'}
});
