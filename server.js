const express = require('express')
const loader = require('./src/loaders')
const app = express()
const port = process.env.PORT || 3000

const startServer = async () => {
  loader({ expressApp: app })

  app.listen(port, () => {
    console.log('server started on port', port)
  })
}

startServer()
