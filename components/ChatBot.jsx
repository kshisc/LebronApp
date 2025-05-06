import React, { useState, useRef, useEffect } from 'react'
import { FetchLeResponse } from '../configs/OpenAIClient'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Platform,
  Keyboard,
  useWindowDimensions
} from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'

const ChatBot = ({ onClose, visible }) => {
  const { width } = useWindowDimensions()
  const bubbleMaxWidth = width * 0.8
  const textContainerMaxWidth = bubbleMaxWidth - 38

  // personalities: lebron, bronny, luka
  const personalities = ['lebron', 'bronny', 'luka']
  const labels = {
    lebron: 'LeBron James',
    bronny: 'Bronny James',
    luka: 'Luka Dončić'
  }
  const initialGreeting = {
    lebron: [
      {
        id: 1,
        text: "What's up, young blood! LeBron James here! What can I help you with today? You trying to improve your game or just chat with the GOAT?",
        isUser: false
      }
    ],
    bronny: [
      {
        id: 1,
        text: "Yo, what's up! Bronny James here, son of the King! Ask me anything about hoops or life.",
        isUser: false
      }
    ],
    luka: [
      {
        id: 1,
        text: 'Hey there! Luka Dončić at your service—ready to talk basketball and more.',
        isUser: false
      }
    ]
  }
  const [selectedPersonality, setSelectedPersonality] = useState('lebron')
  const [messagesByPersonality, setMessagesByPersonality] =
    useState(initialGreeting)
  const messages = messagesByPersonality[selectedPersonality]
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollViewRef = useRef(null)
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 500)).current

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 70,
        friction: 12
      }).start()
    } else {
      Animated.spring(slideAnim, {
        toValue: 500,
        useNativeDriver: true,
        tension: 70,
        friction: 12
      }).start()
    }
  }, [visible, slideAnim])

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true })
    }
  }, [messages])

  const handleSend = async () => {
    if (!inputText.trim()) return
    const userText = inputText.trim()
    // append user message for current personality
    setMessagesByPersonality(prev => ({
      ...prev,
      [selectedPersonality]: [
        ...prev[selectedPersonality],
        { id: Date.now(), text: userText, isUser: true }
      ]
    }))
    setInputText('')
    setIsTyping(true)
    if (Platform.OS !== 'web') Keyboard.dismiss()

    try {
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000))
      const botText = await FetchLeResponse(userText, selectedPersonality)
      setMessagesByPersonality(prev => ({
        ...prev,
        [selectedPersonality]: [
          ...prev[selectedPersonality],
          { id: Date.now(), text: botText, isUser: false }
        ]
      }))
    } catch (err) {
      setMessagesByPersonality(prev => ({
        ...prev,
        [selectedPersonality]: [
          ...prev[selectedPersonality],
          { id: Date.now(), text: `Error: ${err.message}`, isUser: false }
        ]
      }))
    } finally {
      setIsTyping(false)
    }
  }

  // switch personalities
  const handleSelect = p => {
    setSelectedPersonality(p)
  }

  if (!visible) {
    return null
  }

  return (
    <BlurView intensity={30} style={styles.overlay}>
      <Animated.View
        style={[
          styles.chatContainer,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* personality tabs */}
        <View style={styles.tabContainer}>
          {personalities.map(p => (
            <TouchableOpacity
              key={p}
              onPress={() => handleSelect(p)}
              style={[
                styles.tab,
                selectedPersonality === p && styles.activeTab
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedPersonality === p && styles.activeTabText
                ]}
              >
                {labels[p]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Image
              source={
                selectedPersonality === 'lebron'
                  ? require('../assets/images/lebron.png')
                  : selectedPersonality === 'bronny'
                  ? require('../assets/images/bronny.png')
                  : require('../assets/images/luka.png')
              }
              style={styles.avatar}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>
                {labels[selectedPersonality]}
              </Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Online</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name='close' size={24} color='#FFF' />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(message => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.botBubble,
                { maxWidth: bubbleMaxWidth }
              ]}
            >
              {!message.isUser && (
                <Image
                  source={
                    selectedPersonality === 'lebron'
                      ? require('../assets/images/lebron.png')
                      : selectedPersonality === 'bronny'
                      ? require('../assets/images/bronny.png')
                      : require('../assets/images/luka.png')
                  }
                  style={styles.messageBubbleAvatar}
                />
              )}
              <View
                style={[
                  styles.messageTextContainer,
                  message.isUser
                    ? styles.userTextContainer
                    : styles.botTextContainer,
                  {
                    maxWidth: message.isUser
                      ? bubbleMaxWidth
                      : textContainerMaxWidth
                  }
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userText : styles.botText
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View
              style={[
                styles.messageBubble,
                styles.botBubble,
                { maxWidth: bubbleMaxWidth }
              ]}
            >
              <Image
                source={require('../assets/images/lebron-ball.png')}
                style={styles.messageBubbleAvatar}
              />
              <View
                style={[
                  styles.messageTextContainer,
                  styles.botTextContainer,
                  { maxWidth: textContainerMaxWidth }
                ]}
              >
                <Text style={styles.typingIndicator}>
                  {labels[selectedPersonality]} is typing...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={`Ask ${labels[selectedPersonality]} something...`}
            value={inputText}
            onChangeText={setInputText}
            multiline
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name='send'
              size={20}
              color={inputText.trim() ? '#FFF' : '#A0A0A0'}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </BlurView>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'flex-end'
  },
  chatContainer: {
    backgroundColor: '#1c1c1c',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#552583' // Lakers purple
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  headerTextContainer: {
    justifyContent: 'center'
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6
  },
  statusText: {
    color: '#CCCCCC',
    fontSize: 12
  },
  closeButton: {
    padding: 8
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#212121'
  },
  messagesContent: {
    padding: 16
  },
  messageBubble: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginBottom: 12,
    flexShrink: 1,
    flexWrap: 'wrap'
  },
  userBubble: {
    alignSelf: 'flex-end'
  },
  botBubble: {
    alignSelf: 'flex-start'
  },
  messageBubbleAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    alignSelf: 'flex-end'
  },
  messageTextContainer: {
    padding: 12,
    marginBottom: 2,
    borderRadius: 20,
    maxWidth: '75%',
    flexShrink: 1,
    alignSelf: 'flex-start'
  },
  userTextContainer: {
    backgroundColor: '#FDB927', // Lakers gold
    borderTopRightRadius: 4
  },
  botTextContainer: {
    backgroundColor: '#333',
    borderTopLeftRadius: 4
  },
  messageText: {
    fontSize: 16,
    flexShrink: 1,
    flexWrap: 'wrap'
  },
  userText: {
    color: '#000'
  },
  botText: {
    color: '#FFF'
  },
  typingIndicator: {
    color: '#CCC',
    fontStyle: 'italic'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#292929',
    borderTopWidth: 1,
    borderTopColor: '#333'
  },
  input: {
    flex: 1,
    backgroundColor: '#3A3A3A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    color: '#FFFFFF',
    maxHeight: 100
  },
  sendButton: {
    backgroundColor: '#552583', // Lakers purple
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: '#444'
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1c1c1c'
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center'
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FDB927'
  },
  tabText: {
    color: '#CCC',
    fontWeight: 'bold'
  },
  activeTabText: {
    color: '#FFF'
  }
})

export default ChatBot
