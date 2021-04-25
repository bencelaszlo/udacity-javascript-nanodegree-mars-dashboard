require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')
const { List } = require('immutable')

require('dotenv').config()

const app = express()
const port = 3001

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

const filterRovers = (roversData) => {
  const roverNames = List(['curiosity', 'opportunity', 'spirit'])

  return roversData.filter(rover => roverNames.includes(rover.name.toLowerCase())).map(rover => {
    return {
      name: rover.name,
      landingDate: rover.landing_date,
      launchDate: rover.launch_date,
      status: rover.status,
      maxDate: rover.max_date
    }
  })
}

app.get('/rovers', async (req, res) => {
  try {
    const url = `https://api.nasa.gov/mars-photos/api/v1/rovers?api_key=${process.env.API_KEY}`
    const rovers = await fetch(url)
    const roversJson = await rovers.json()
    const filteredRovers = filterRovers(roversJson.rovers)
    res.send(filteredRovers)
  } catch (err) {
    console.log('error: ', err)
  }
})

app.get('/rover/:name', async (req, res) => {
  try {
    const name = req.params.name
    const maxDate = req.query.maxDate
    const data = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${name}/photos?earth_date=${maxDate}&api_key=${process.env.API_KEY}`).then(res => res.json())
    res.send(data.photos)
  } catch (err) {
    console.log('error: ', err)
    res.status(500).send(err)
  }
})

app.listen(port, () => console.log(`Mars Dashboard app listening on port ${port}.`))
