const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const bookRoutes = require('./routes/book')
const userRoutes = require('./routes/user')
const path = require('path')

// Connexion à la base de données
mongoose.connect('mongodb+srv://Humtsi:coucou456@cluster0.9eioysk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
  { useNewUrlParser: true,
    useUnifiedTopology: true 
  })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'))

// Création de l'application
const app = express()

// Middleware gérant les erreurs de CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    next()
})

// Middleware permettant à Express d'extraire le corps JSON des requêtes POST
app.use(bodyParser.json())

// Enregistrement des routeurs
app.use('/api/books', bookRoutes)
app.use('/api/auth', userRoutes)

// Gestion de la ressource images de manière statique
app.use('/images', express.static(path.join(__dirname, 'images')))

module.exports = app