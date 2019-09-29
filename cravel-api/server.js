var express = require('express')
var bodyParser = require ('body-parser')
var cors = require ('cors')

const app = express()
const port = 1010
const { authRouter, tripRouter } = require('./routers')


app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send("Welcome to my API")
})

app.use(authRouter)
app.use(tripRouter)

app.listen(port, () => console.log("Server up in port " + port))