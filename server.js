require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const MOVIES = require('./moviedex.json')

const app = express()

app.use(morgan('dev'))
app.use(helmet())
app.use(cors())
app.use(function validateBearerToken(req, res, next){
    const authToken = req.get('Authorization')
    const apiToken = process.env.API_TOKEN
    if (!authToken || authToken.split(' ')[1] !== apiToken){
        return res.status(401).json({Error: "Unauthorized request"})
    }
    next()
})

function handleGetMovies(req, res){
    let response = MOVIES
    const {genre, country, avg_vote} = req.query
    if(genre){
        response = response.filter(movie => 
            movie.genre.toLowerCase().includes(genre.toLowerCase()))
    }
    if(country){
        response = response.filter(movie => 
            movie.country.includes(country))
    }
    if(avg_vote){
        response = response.filter(movie => 
            Number(movie.avg_vote) >= Number(avg_vote))
    }
    res.json(response)
}
app.get('/movies', handleGetMovies)

const PORT = 8000
app.listen(PORT, () => {console.log(`Listening on port ${PORT}`)})