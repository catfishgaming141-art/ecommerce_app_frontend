import React, {useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';

export default function Register({navigation}){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const register = async ()=>{
    try{
      const res = await axios.post('http://10.0.2.2:4000/api/auth/register', {name,email,password});
      if(res.data.ok) navigation.replace('Login');
      else alert('Register failed');
    }catch(err){ alert(err.response?.data?.error || 'Register error'); }
  };
  return (<View style={styles.container}>
    <Text style={styles.title}>Create account</Text>
    <TextInput placeholder="Full name" value={name} onChangeText={setName} style={styles.input}/>
    <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input}/>
    <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input}/>
    <Button title="Register" onPress={register}/>
  </View>);
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',padding:20,backgroundColor:'#f8fafc'},
  title:{fontSize:22,fontWeight:'700',marginBottom:12},
  input:{backgroundColor:'#fff',padding:12,borderRadius:8,marginBottom:10}
});
