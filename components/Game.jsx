import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions
} from 'react-native'

const { width, height } = Dimensions.get('window')

export default function Game ({ onGameEnd }) {
  const ballPos = useRef(
    new Animated.ValueXY({
      x: width / 2 - 70 / 2,
      y: height - 200
    })
  ).current

  const [score, setScore] = useState(0)
  const [clapRain, setClapRain] = useState(false)
  const GRAVITY = 1000 // pixels/s²

  const resetBall = () => {
    ballPos.setValue({
      x: width / 2 - 70 / 2,
      y: height - 200
    })
  }

  const checkScore = (x, y) => {
    const centerX = 160
    const centerY = 220

    const hoopW = 70
    const hoopH = 100
    const hoopX = centerX - hoopW / 2
    const hoopY = centerY - hoopH / 2

    if (x > hoopX && x < hoopX + hoopW && y > hoopY && y < hoopY + hoopH) {
      console.log('SCORE!')
      setScore(prev => prev + 1)
      setClapRain(true)

      setTimeout(() => setClapRain(false), 1800)
    }
  }

  const shootBall = (vx, vy) => {
    const duration = 1300
    const frameRate = 1000 / 60
    const steps = duration / frameRate

    const startX = ballPos.x._value
    const startY = ballPos.y._value

    const velocityX = vx * 300
    const velocityY = vy * 300

    let currentStep = 0

    const interval = setInterval(() => {
      const t = (currentStep * frameRate) / 1000
      const x = startX + velocityX * t
      const y = startY + velocityY * t + 0.5 * GRAVITY * t * t

      ballPos.setValue({ x, y })

      currentStep++

      if (currentStep > steps) {
        clearInterval(interval)

        console.log(
          'Ball landed at:',
          Math.round(ballPos.x._value),
          Math.round(ballPos.y._value)
        )
        checkScore(ballPos.x._value, ballPos.y._value)

        setTimeout(() => {
          resetBall()
        }, 1300)
      }
    }, frameRate)
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gesture) => {
        shootBall(gesture.vx, gesture.vy)
      }
    })
  ).current

  useEffect(() => {
    if (score >= 3) {
      onGameEnd?.()
    }
  })

  const renderClaps = () => {
    const numClaps = 15
    const spacing = width / numClaps

    return Array.from({ length: numClaps }).map((_, i) => {
      const fallAnim = new Animated.Value(0)

      const delay = Math.random() * 300
      const duration = 1300 + Math.random() * 700
      const startOffset = -150 + Math.random() * 100

      const leftPos = i * spacing + spacing / 2 - 16 // center each emoji horizontally

      Animated.timing(fallAnim, {
        toValue: height + 100,
        duration,
        delay,
        useNativeDriver: true
      }).start()

      return (
        <Animated.Text
          key={i}
          style={[
            styles.clap,
            {
              top: startOffset,
              left: leftPos,
              transform: [{ translateY: fallAnim }]
            }
          ]}
        >
          👏
        </Animated.Text>
      )
    })
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Image
        source={require('./../assets/images/crowd-background.png')}
        style={styles.bg}
      />
      <Text style={styles.score}>BASKETS MADE: {score}/3</Text>
      <Text style={styles.instruction}>Swipe up to shoot!</Text>

      <Image
        source={require('./../assets/images/hoop.jpg')}
        style={styles.hoop}
      />

      {clapRain && renderClaps()}

      <Animated.Image
        source={require('./../assets/images/lebron-ball.png')}
        style={[
          styles.ball,
          {
            transform: ballPos.getTranslateTransform()
          }
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center'
  },
  bg: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  hoop: {
    width: 170,
    height: 170,
    position: 'absolute',
    top: 170,
    borderWidth: 3,
    borderColor: 'red'
  },
  ball: {
    width: 70,
    height: 70,
    position: 'absolute',
    left: 0,
    top: 0
  },
  score: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: 'rgb(229, 187, 20)',
    padding: 10,
    borderRadius: 5,
    marginTop: 30,
    zIndex: 1
  },
  instruction: {
    color: '#fff',
    fontSize: 16,
    backgroundColor: 'rgb(121, 51, 187)',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    zIndex: 1
  },
  clap: {
    position: 'absolute',
    fontSize: 50
  }
})
