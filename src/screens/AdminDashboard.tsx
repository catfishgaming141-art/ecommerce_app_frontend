import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import API from '../api';
import io from 'socket.io-client';

const LAN_IP = "192.168.1.24"; // <-- palitan ng actual LAN IP ng PC mo

export default function AdminDashboard({ navigation, route }: any) {
  const token = route.params?.token;
  const user = route.params?.user;

  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [newProduct, setNewProduct] = useState({ title:'', price:'', quantity:'', image:'' });

  useEffect(() => { 
    fetchData();      

    // Setup Socket.IO
    const socket = io(`http://${LAN_IP}:4000`);
    socket.on('connect', () => console.log('Connected to socket server'));
    socket.on('productDeleted', (productId: number) => {
      setProducts(prev => prev.filter(p => p.id !== productId));
    });
    socket.on('newOrder', (order: any) => {
      setOrders(prev => [...prev, order]);
      Alert.alert("New Order", `Order #${order.id} has been placed!`);
    });

    return () => { socket.disconnect(); };
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const fetchData = async () => {
    try {
      const p = await API.get('/products'); 
      setProducts(p.data);

      const o = await API.get('/orders', { headers: { Authorization: 'Bearer ' + token } });
      setOrders(o.data);
    } catch (err) { 
      console.error("Fetch Data Error:", err); 
      Alert.alert("Error", "Cannot fetch products or orders. Check backend and LAN IP.");
    }
  }

  const deleteProduct = async (id: number) => {
    Alert.alert('Confirm', 'Delete this product?', [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await API.delete(`/products/${id}`, { headers: { Authorization: 'Bearer ' + token } });
            setProducts(prev => prev.filter(p => p.id !== id));
            Alert.alert("Deleted", "Product removed successfully!");
          } catch (err) { 
            console.error(err); 
            Alert.alert("Error", "Failed to delete product"); 
          }
        }
      }
    ]);
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await API.put(`/orders/${orderId}`, { status }, { headers: { Authorization: 'Bearer ' + token } });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status });
      Alert.alert("Success", `Order updated to ${status}`);
    } catch (err) { console.error(err); Alert.alert("Error", "Failed to update order"); }
  }

  const addProduct = async () => {
    if (!newProduct.title || !newProduct.price || !newProduct.quantity) return Alert.alert("Error", "Please fill all fields");
    try {
      const res = await API.post('/products', {
        title: newProduct.title,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity),
        image: newProduct.image || `http://${LAN_IP}:4000/assets/placeholder.png`
      }, { headers: { Authorization: 'Bearer ' + token } });

      setProducts(prev => [...prev, res.data]);
      setNewProduct({ title:'', price:'', quantity:'', image:'' });
      setAddModalVisible(false);
      Alert.alert("Success", "Product added!");
    } catch(err) { console.error(err); Alert.alert("Error", "Failed to add product"); }
  }

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === "All" || o.status === statusFilter;
    const matchesSearch = o.user?.name?.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search);
    return matchesStatus && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Admin Dashboard</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Product</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Products</Text>
      <FlatList
        data={products}
        keyExtractor={p => String(p.id)}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <Image source={{ uri: item.image || `http://${LAN_IP}:4000/assets/placeholder.png` }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text>₱{item.price} • Stock: {item.quantity}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteProduct(item.id)}>
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.sectionTitle}>Orders</Text>
      <TextInput style={styles.searchInput} placeholder="Search order # or buyer" value={search} onChangeText={setSearch} />
      <View style={styles.filterContainer}>
        {["All","Pending","Shipped","Completed"].map(status => (
          <TouchableOpacity key={status} style={[styles.filterButton, statusFilter===status&&styles.filterButtonActive]} onPress={()=>setStatusFilter(status)}>
            <Text style={[styles.filterText, statusFilter===status&&styles.filterTextActive]}>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={o=>String(o.id)}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={()=>setSelectedOrder(item)}>
            <View style={styles.orderCard}>
              <Text>Order #{item.id} - {item.user?.name}</Text>
              <Text>Status: {item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Order Modal */}
      <Modal visible={!!selectedOrder} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order #{selectedOrder?.id}</Text>
            <Text>Buyer: {selectedOrder?.user?.name}</Text>
            <FlatList
              data={selectedOrder?.items||[]}
              keyExtractor={(i,idx)=>String(idx)}
              renderItem={({item})=>(
                <View style={styles.orderItem}>
                  <Text>{item.product?.title} x{item.quantity}</Text>
                  <Text>₱{item.price}</Text>
                </View>
              )}
            />
            <View style={styles.statusButtons}>
              <TouchableOpacity style={[styles.statusButton,{backgroundColor:'#f39c12'}]} onPress={()=>updateOrderStatus(selectedOrder.id,'Pending')}><Text style={styles.statusButtonText}>Pending</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.statusButton,{backgroundColor:'#3498db'}]} onPress={()=>updateOrderStatus(selectedOrder.id,'Shipped')}><Text style={styles.statusButtonText}>Shipped</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.statusButton,{backgroundColor:'#2ecc71'}]} onPress={()=>updateOrderStatus(selectedOrder.id,'Completed')}><Text style={styles.statusButtonText}>Completed</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={()=>setSelectedOrder(null)}><Text style={styles.closeButtonText}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Product Modal */}
      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <TextInput placeholder="Title" style={styles.input} value={newProduct.title} onChangeText={t=>setNewProduct({...newProduct,title:t})} />
            <TextInput placeholder="Price" style={styles.input} keyboardType="numeric" value={newProduct.price} onChangeText={t=>setNewProduct({...newProduct,price:t})} />
            <TextInput placeholder="Quantity" style={styles.input} keyboardType="numeric" value={newProduct.quantity} onChangeText={t=>setNewProduct({...newProduct,quantity:t})} />
            <TextInput placeholder="Image URL (optional)" style={styles.input} value={newProduct.image} onChangeText={t=>setNewProduct({...newProduct,image:t})} />
            <TouchableOpacity style={styles.addButton} onPress={addProduct}><Text style={styles.addButtonText}>Add Product</Text></TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={()=>setAddModalVisible(false)}><Text style={styles.closeButtonText}>Close</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:16,backgroundColor:'#f6f7fb'},
  header:{fontSize:24,fontWeight:'700',marginBottom:16},
  sectionTitle:{fontSize:20,fontWeight:'600',marginTop:16,marginBottom:8},
  addButton:{backgroundColor:'#27ae60',padding:10,borderRadius:6,marginBottom:8,alignSelf:'flex-start'},
  addButtonText:{color:'#fff',fontWeight:'700'},
  productCard:{flexDirection:'row',backgroundColor:'#fff',padding:10,borderRadius:8,marginBottom:8,alignItems:'center',shadowColor:'#000',shadowOpacity:0.1,shadowRadius:4,elevation:2},
  productImage:{width:65,height:65,borderRadius:6,marginRight:10,backgroundColor:'#eee'},
  productInfo:{flex:1},
  productTitle:{fontWeight:'700'},
  deleteText:{color:'red',fontSize:20,padding:4},
  orderCard:{backgroundColor:'#fff',padding:10,borderRadius:8,marginBottom:8,shadowColor:'#000',shadowOpacity:0.1,shadowRadius:4,elevation:2},
  searchInput:{borderWidth:1,borderColor:'#ccc',borderRadius:6,padding:6,marginBottom:8},
  filterContainer:{flexDirection:'row',marginBottom:8},
  filterButton:{padding:6,marginRight:6,borderRadius:6,borderWidth:1,borderColor:'#ccc'},
  filterButtonActive:{backgroundColor:'#3498db',borderColor:'#3498db'},
  filterText:{color:'#333'},
  filterTextActive:{color:'#fff'},
  modalBackdrop:{flex:1,backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center',alignItems:'center'},
  modalContent:{width:'90%',backgroundColor:'#fff',borderRadius:8,padding:16},
  modalTitle:{fontSize:20,fontWeight:'700',marginBottom:8},
  orderItem:{flexDirection:'row',justifyContent:'space-between',marginBottom:4},
  statusButtons:{flexDirection:'row',justifyContent:'space-between',marginTop:10},
  statusButton:{flex:1,padding:8,borderRadius:6,marginHorizontal:2,alignItems:'center'},
  statusButtonText:{color:'#fff',fontWeight:'700'},
  closeButton:{backgroundColor:'#e74c3c',padding:8,borderRadius:6,marginTop:12,alignItems:'center'},
  closeButtonText:{color:'#fff',fontWeight:'700'},
  input:{borderWidth:1,borderColor:'#ccc',borderRadius:6,padding:6,marginBottom:8}
});
