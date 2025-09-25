import React, {useEffect, useState} from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import axios from 'axios';

export default function Product({route,navigation}){
  const {id} = route.params;
  const [p,setP]=useState(null);
  useEffect(()=>{ fetch(); },[]);
  const fetch = async ()=>{ try{ const res = await axios.get('http://10.0.2.2:4000/api/products/'+id); setP(res.data); }catch(err){console.error(err);} };
  if(!p) return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Loading...</Text></View>;
  return (<View style={styles.container}>
    <Image source={{uri:p.image||'https://via.placeholder.com/300'}} style={styles.img}/>
    <Text style={styles.title}>{p.title}</Text>
    <Text style={styles.price}>₱{p.price}</Text>
    <Text style={{marginTop:12}}>{p.description}</Text>
    <View style={{marginTop:20}}><Button title="Add to Cart" onPress={()=>alert('Add to cart (not fully implemented)')}/></View>
  </View>);
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16,backgroundColor:'#fff'},
  img:{width:'100%',height:300,borderRadius:8},
  title:{fontSize:20,fontWeight:'700',marginTop:12},
  price:{fontSize:18,color:'#0ea5a4',fontWeight:'700'}
});
