// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { LogBox, StyleSheet, Text, View, YellowBox, TextInput, Button } from 'react-native';
import * as firebase from 'firebase'
import 'firebase/firestore'
import {GiftedChat} from 'react-native-gifted-chat'

const firebaseConfig = {
  apiKey: "AIzaSyAjbt9G7Fd5HWvvGbx08vlbxwig2t2AU8o",
  authDomain: "chatonline-react.firebaseapp.com",
  projectId: "chatonline-react",
  storageBucket: "chatonline-react.appspot.com",
  messagingSenderId: "1061940206007",
  appId: "1:1061940206007:web:4a8fffa3e8740e8988f032"
};

if(firebase.apps.length == 0){
  firebase.initializeApp(firebaseConfig);  
}

LogBox.ignoreLogs(['Setting a timer for a long period of time'])

const db = firebase.firestore()
const chatsRef = db.collection('chats')


export default function App() {
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(()=>{
    readUser()
    const unsubscribe = chatsRef.onSnapshot(querySnapshot=>{
      const messagesFirestore = querySnapshot.docChanges().filter(({type})=> type == 'added').map(({doc})=>{
        const message = doc.data()
        return {...message, createdAt: message.createdAt.toDate()}
      }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      appendedMessages(messagesFirestore)
    })
    return () => unsubscribe()
  }, [])

  const appendedMessages = useCallback((messages)=>{
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  }, [messages])

  async function readUser() {
    const user = await AsyncStorage.getItem('user')
    if(user){
      setUser(JSON.parse(user))
    }
  }

  async function handlePress(){
    const _id = Math.random().toString(36).substring(7)
    const user = {_id, name}
    await AsyncStorage.setItem('user', JSON.stringify(user))
    setUser(user)
  }

  async function handleSend(messages){
    const writes = messages.map(m => chatsRef.add(m))
    await Promise.all(writes)
  }

  if(!user){
    return <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Coloque seu nome" value={name} onChangeText={setName} />
      <Button color='gray' onPress={handlePress} title="Entre no Chat"/>
    </View>
  }
  return (
     <GiftedChat messages={messages} user={user} placeholder="Escreva uma mensagem" onSend={handleSend} />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: 'gray',
    borderRadius:20,
  },

});
