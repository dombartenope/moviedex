require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const MOVIES = require('./moviedex.json')

const app = express()

const morganSettings = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSettings))
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

app.use((error, req, res, next) => {
    let response
    if(process.env.NODE_ENV === 'production'){
        response = {error: {message: 'server error'}}
    } else {
        response = { error }
    }
    res.status(500).json(response)
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

const PORT = process.env.PORT || 8000
app.listen(PORT)