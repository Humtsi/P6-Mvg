const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// POST => Création de compte
exports.signup = (req, res, next) => {
    // Hash du MDP (10 fois)
    bcrypt.hash(req.body.password, 10)

    // Utilisation du hash pour créer un utilisateur
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      })

      // Enregistrement
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }))
    })
    .catch(error => res.status(500).json({ error }))
}

// POST => Connexion
exports.login = (req, res, next) => {
    // Vérification de l'existence de l'utilisateur
    User.findOne({ email: req.body.email })
    .then(user => {
        if (!user) {
            return res.status(401).json({ message: 'Paire login/mot de passe incorrecte'})
        }
         // Comparaison des hashs
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (!valid) {
                return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' })
            }
            res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    { userId: user._id },
                    'RANDOM_TOKEN_SECRET',
                    { expiresIn: '24h' }
                )
            })
        })
        .catch(error => res.status(500).json({ error }))
    })
    .catch(error => res.status(500).json({ error }))
}
