import React, { useState, useRef, useEffect } from 'react'
import { Linking } from 'react-native'
import { TouchableOpacity } from 'react-native'
import { useFonts } from 'expo-font'
import DatePicker from 'react-datepicker' //for web
import Game from './Game'
import 'react-datepicker/dist/react-datepicker.css'
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Platform,
  ScrollView,
  TextInput
} from 'react-native'
import { Audio } from 'expo-av'
import DateTimePicker from '@react-native-community/datetimepicker'
import { StatusBar } from 'expo-status-bar'
import { db } from '../configs/FirebaseConfig'
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc
} from 'firebase/firestore'
import ChatButton from './ChatButton'
import ChatBot from './ChatBot'

export default function Alarm () {
  const [alarmTime, setAlarmTime] = useState(null)
  const [alarmTriggered, setAlarmTriggered] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [userId, setUserId] = useState('') // Replace with real user ID if needed
  const [fontsLoaded] = useFonts({
    Sport: require('../assets/fonts/SportingOutline-x3e85.ttf'),
    text: require('../assets/fonts/JerseyM54-aLX9.ttf')
  })
  const [isChatVisible, setIsChatVisible] = useState(false)

  const soundRef = useRef(null)
  const scrollViewRef = useRef(null)

  // 🔔 Listen for alarms sent to this user
  useEffect(() => {
    if (!userId) return

    const alarmRef = collection(db, 'Alarms')
    const unsubscribe = onSnapshot(alarmRef, snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          const data = change.doc.data()

          if (data.toUser === userId) {
            const alarmTime = new Date(data.alarmTime)
            const now = new Date()
            const delay = alarmTime.getTime() - now.getTime()

            if (delay <= 0) {
              triggerAlarm()
            } else {
              Alert.alert('A friend set an alarm for you...')

              setTimeout(() => {
                triggerAlarm()
              }, delay)
            }

            try {
              await deleteDoc(doc(db, 'Alarms', change.doc.id))
            } catch (e) {
              console.error('Error deleting alarm:', e)
            }
          }
        }
      })
    })

    return () => unsubscribe()
  }, [userId])

  const handleSetAlarm = () => {
    if (!alarmTime) {
      Alert.alert('Please pick a time!')
      return
    }

    const now = new Date()
    const delay = alarmTime.getTime() - now.getTime()

    if (delay <= 0) {
      Alert.alert('Please choose a future time!')
      return
    }

    Alert.alert('Alarm set! LeBron will wake you up 😤')

    setTimeout(() => {
      triggerAlarm()
    }, delay)
  }

  const toScopeVenmo = async () => {
    const url = 'https://account.venmo.com/u/scopeusc'
    const supported = await Linking.canOpenURL(url)

    if (supported) {
      await Linking.openURL(url)
    } else {
      Alert.alert("Can't open Venmo link 😢")
    }
  }

  const handleSendToFriend = async () => {
    if (!alarmTime) {
      Alert.alert('Please pick a time!')
      return
    }

    const now = new Date()
    const delay = alarmTime.getTime() - now.getTime()

    if (delay <= 0) {
      Alert.alert('Please choose a future time!')
      return
    }

    if (!recipient) {
      Alert.alert("Enter friend's user ID")
      return
    }

    await addDoc(collection(db, 'Alarms'), {
      fromUser: userId,
      toUser: recipient,
      alarmTime: alarmTime.toISOString(),
      triggered: false,
      createdAt: new Date().toISOString()
    })

    Alert.alert('Sent LeBron alarm to friend!')
  }
  const handlePress = () => {
    alert('Button Pressed!')
  }
  const triggerAlarm = async () => {
    setAlarmTriggered(true)
    await playAudio()
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 300)
  }

  const playAudio = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require('./../assets/images/lebron-song.mp3'),
      { shouldPlay: true, isLooping: true }
    )
    soundRef.current = sound
    await sound.playAsync()
  }

  const stopAlarm = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync()
        await soundRef.current.unloadAsync()
        soundRef.current = null
      } catch (e) {
        console.log('Error stopping audio:', e)
      }
    }
    setAlarmTriggered(false)
  }

  if (!fontsLoaded) {
    return <Text>Loading...</Text>
  }

  // Toggle chat visibility
  const toggleChat = () => {
    setIsChatVisible(prev => !prev)
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Chat overlay */}
      <ChatBot visible={isChatVisible} onClose={toggleChat} />

      {alarmTriggered ? (
        <Game
          onGameEnd={() => {
            stopAlarm()
            Alert.alert('LEBRON IS PLEASED. Alarm stopped. 🏆')
          }}
        />
      ) : (
        <>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContainer}
          >
            <Image
              source={require('./../assets/images/lebron-background.png')}
              style={{
                width: '100%',
                height: 520,
                maxWidth: 400,
                alignSelf: 'center'
              }}
            />
            <View style={styles.container}>
              <Text style={styles.title}>Wake Up With LeBron 🏆</Text>
              <Text style={styles.subText}>Enter your username below:</Text>
              <TextInput
                style={styles.input}
                placeholder='Example: LeBron_the_GOAT123'
                value={userId}
                onChangeText={setUserId}
              />
              <Text style={styles.subText}>
                Enter your friend's username below:
              </Text>
              <TextInput
                style={styles.input}
                placeholder='Example: Lame_Bronny_1'
                value={recipient}
                onChangeText={setRecipient}
              />

              {Platform.OS === 'web' ? (
                <View style={styles.webPickerContainer}>
                  <Text style={styles.pickerLabel}>⏰ Select Alarm Time</Text>
                  <DatePicker
                    selected={alarmTime}
                    onChange={date => setAlarmTime(date)}
                    showTimeSelect
                    timeIntervals={15}
                    timeCaption='Time'
                    dateFormat='MMMM d, yyyy h:mm aa'
                    className='custom-datepicker'
                  />
                </View>
              ) : (
                <DateTimePicker
                  value={alarmTime || new Date()}
                  mode='datetime'
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setAlarmTime(selectedDate)
                    }
                  }}
                />
              )}

              <View style={{ marginVertical: 10 }}>
                <TouchableOpacity
                  onPress={handleSetAlarm}
                  style={{
                    backgroundColor: '#552583',
                    margin: 7,
                    paddingVertical: 15,
                    paddingHorizontal: 30,
                    borderRadius: 25,
                    alignItems: 'center'
                  }}
                >
                  <Text
                    style={{
                      color: '#FDB927',
                      fontSize: 20,
                      fontFamily: 'text'
                    }}
                  >
                    Set Alarm For Myself ⏰
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSendToFriend}
                  style={{
                    backgroundColor: '#FDB927',
                    margin: 7,
                    paddingVertical: 15,
                    paddingHorizontal: 30,
                    borderRadius: 25,
                    alignItems: 'center'
                  }}
                >
                  <Text
                    style={{
                      color: '#552583',
                      fontSize: 20,
                      fontFamily: 'text'
                    }}
                  >
                    Send Alarm to Friend 📨
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    toScopeVenmo()
                  }}
                  style={{
                    backgroundColor: '#552583',
                    margin: 7,
                    paddingVertical: 15,
                    paddingHorizontal: 30,
                    borderRadius: 25,
                    alignItems: 'center'
                  }}
                >
                  <Text
                    style={{
                      color: '#FDB927',
                      fontSize: 20,
                      fontFamily: 'text'
                    }}
                  >
                    Donate to a Sad and Struggling Organization 💛
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <StatusBar style='light' />
          </ScrollView>

          {/* ✅ Only visible when alarm is NOT triggered */}
          <ChatButton onPress={toggleChat} />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFDD0'
  },
  container: {
    backgroundColor: '#FFFDD0',
    marginTop: -20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '100%',
    padding: 15
  },
  title: {
    fontSize: 30,
    color: '#552583',
    fontFamily: 'Sport',
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#FDB927',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    color: '#552583'
  },
  notification: {
    marginTop: 20,
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%'
  },
  notificationText: {
    fontSize: 20,
    fontFamily: 'text',
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center'
  },
  subText: {
    fontSize: 16,
    fontFamily: 'text',
    color: '#552583'
  },
  gif: {
    width: 200,
    height: 150,
    resizeMode: 'contain'
  },
  ball: {
    position: 'absolute'
  },

  webPickerContainer: {
    //for web
    marginVertical: 15,
    alignItems: 'center',
    backgroundColor: '#FFFDD0',
    padding: 15
  },
  pickerLabel: {
    fontSize: 16,
    fontFamily: 'text',
    marginBottom: 10,
    textAlign: 'center',
    color: '#552583'
  }
})
