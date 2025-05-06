import React from 'react'
import { TouchableOpacity, StyleSheet, Text, View, Image } from 'react-native'

const ChatButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.chatButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <Image
          source={require('../assets/images/lebron-ball.png')}
          style={styles.buttonImage}
        />
        <View style={styles.textContainer}>
          <Text style={styles.buttonText}>Chat with LeBron</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  chatButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#552583', // Lakers purple
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
    minWidth: 180
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonImage: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#FDB927' // Lakers gold
  },
  textContainer: {
    flex: 1
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14
  },
  subText: {
    color: '#CCCCCC',
    fontSize: 10
  }
})

export default ChatButton
