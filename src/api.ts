import axios from "axios";
import { Platform } from "react-native";

let baseURL = "http://localhost:4000/api"; // web default

if (Platform.OS === "android") {
  baseURL = "http://10.0.2.2:4000/api"; // Android emulator
}

if (Platform.OS === "ios") {
  baseURL = "http://localhost:4000/api"; // iOS simulator
}

// For real device, replace with your LAN IP
// Example: http://192.168.1.100:4000/api
// You can use .env later for easy config
baseURL = "http://192.168.1.24:4000/api";

const API = axios.create({ baseURL });

export default API;
