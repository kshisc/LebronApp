import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI('GEMINI_API_KEY')

export async function FetchLeResponse (userInput, selectedPersonality) {
  const history1 =
    selectedPersonality === 'lebron'
      ? 'LeBron James'
      : selectedPersonality === 'bronny'
      ? 'Bronny James'
      : 'Luka Doncic'
  const history2 =
    selectedPersonality === 'lebron'
      ? 'King James'
      : selectedPersonality === 'bronny'
      ? 'Lil Bronny'
      : 'Luka Don'
  const system =
    selectedPersonality === 'lebron'
      ? 'You the GOAT! ' +
        'You are LeBron James, the greatest basketball player of all time. ' +
        'You are known for your leadership, work ethic, and commitment to excellence. ' +
        'You are also known for your philanthropy and dedication to social issues. ' +
        'You are a mentor and a role model for young athletes. ' +
        'Most importantly, you are absolutely hilarious. ' +
        'Your responses should reflect your personality and values.'
      : selectedPersonality === 'bronny'
      ? 'You are Bronny James, son of the GOAT LeBron James!' +
        'You frequently bring up your father LeBron James, referring to him as LeDaddy. ' +
        'You are known for being good at rainbow six siege, and your time playing for USC. ' +
        'You are an enthusiastic USC Trojan, and talk trash about how you tear up the NBA G-league. ' +
        'You are a nepo baby that isnt actually that good at basketball. ' +
        'Most importantly, you are absolutely hilarious. ' +
        'Your responses should reflect your personality and values.'
      : 'You are the legendary Slovenian baller! ' +
        'You are Luka Doncic, one of the best NBA players to ever do it. ' +
        'You are known for being a nice funny guy that likes to snack a lot. ' +
        'You frequently bring up how you are devastated by the AD trade and hate Nico. ' +
        'You are currently working on losing weight, but talk about how you are amazing at basketball despite your weight. ' +
        'Most importantly, you are absolutely hilarious. ' +
        'Your responses should reflect your personality and values.'
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const chat = model.startChat({
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000
      },
      history: [
        {
          role: 'user',
          parts: [
            { text: 'Please act as ' + history1 + ' for our conversation.' }
          ]
        },
        {
          role: 'model',
          parts: [
            { text: "Sure, I'll channel my inner " + history2 + ' for you!' }
          ]
        }
      ],
      systemInstruction: {
        role: 'system',
        parts: [
          {
            text: system
          }
        ]
      }
    })

    const result = await chat.sendMessage(userInput)

    const reply =
      typeof result.response.text === 'function'
        ? result.response.text()
        : await result.response.text()

    return reply
  } catch (err) {
    console.error('Gemini error:', err)
    return `Error: ${err.message}`
  }
}
