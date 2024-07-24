const jwt = require('jsonwebtoken')

// Middleware d'authentification
module.exports = (req, res, next) => {
  try {
    // Récupération du token
    const token = req.headers.authorization.split(' ')[1]
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')

    // Récupération de l'ID de l'utilisateur
    const userId = decodedToken.userId
    req.auth = {
      userId: userId
    }
    next()
  } catch(error) {
    res.status(401).json({ error })
  }
}