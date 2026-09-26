import 'dotenv/config'
import { aiChat, aiInfo } from '../src/generator/ai'

const main = async () => {
  console.log('aiInfo', aiInfo())
  const t0 = Date.now()
  const out = await aiChat(
    'Balas JSON: {"heading":"Uji","body":"Ini contoh singkat."}',
    { maxTokens: 1600 },
  )
  console.log('latency ms:', Date.now() - t0)
  console.log('output:', out.slice(0, 300))
  process.exit(0)
}
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
