import React, {useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';

export default function Login({navigation}){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const login = async ()=>{
    try{
      const res = await axios.post('http://10.0.2.2:4000/api/auth/login', {email,password});
      // on real device replace host with backend IP
      if(res.data.token){
        // simple: navigate to Home
        navigation.replace('Home', {token: res.data.token});
      }else alert('Login failed');
    }catch(err){
      alert(err.response?.data?.error || 'Login error');
    }
  };
  return (<View style={styles.container}>
    <Text style={styles.title}>Welcome back</Text>
    <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input}/>
    <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input}/>
    <Button title="Login" onPress={login}/>
    <View style={{height:12}}/>
    <Button title="Register" onPress={()=>navigation.navigate('Register')}/>
  </View>);
}

const styles = StyleSheet.create({
  container:{flex:1,justifyContent:'center',padding:20,backgroundColor:'#f8fafc'},
  title:{fontSize:24,fontWeight:'700',marginBottom:20},
  input:{backgroundColor:'#fff',padding:12,borderRadius:8,marginBottom:10}
});
