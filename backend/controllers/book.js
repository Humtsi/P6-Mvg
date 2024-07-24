const Book = require('../models/Book')
const fs = require('fs')

// POST => Enregistrement d'un livre
exports.createBook = (req, res, next) => {

  // Récupération et nettoyage de la requete
  const bookObject = JSON.parse(req.body.book)
  delete bookObject._id
  delete bookObject._userId

  // Creation du nouveau livre
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  })
  
  book.save()
  res.status(201).json({message: 'Objet enregistré !'})
}

// GET => Récupération d'un livre via l'ID
exports.getOneBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
  .then((book) => {
    res.status(200).json(book)
  })
  .catch((error) => {
    res.status(404).json({error: error})
  })
}

// PUT => Modification d'un livre
exports.modifyBook = (req, res, next) => {

  // Récupération de la requête et nettoyage
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body }

  delete bookObject._userId

  // Récupération du livre existant
  Book.findOne({_id: req.params.id})
  .then((book) => {

    // Vérification de l'ID de l'auteur
    if (book.userId != req.auth.userId) {
      res.status(403).json({ message : 'Not authorized'})
    } else {

      if (req.file) {
        // Suppression ancienne image si changement
        const fileName = book.imageUrl.split('/images/')[1]
        fs.unlink(`images/${fileName}`, () => {})
      }

      // Mise à jour du livre
      Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
      .then(() => res.status(200).json({message : 'Objet modifié !'}))
      .catch(error => res.status(401).json({ error }))
    }
  })
  .catch((error) => {
    res.status(400).json({ error })
  })
}

// DELETE => Suppression d'un livre
exports.deleteBook = (req, res, next) => {

  // Récupération du livre
  Book.findOne({ _id: req.params.id})
  .then(book => {

    // Vérification de l'ID de l'auteur
    if (book.userId != req.auth.userId) {
      res.status(401).json({message: 'Not authorized'})
    } else {

      // Suppression de l'image puis du livre
      const filename = book.imageUrl.split('/images/')[1]
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({_id: req.params.id})
        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
        .catch(error => res.status(401).json({ error }))
      })
    }
  })
  .catch((error) => {
    res.status(500).json({ error })
  })
}

// GET => Récupération de tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find()
  .then((books) => {
      res.status(200).json(books)
    }
  ).catch((error) => {
      res.status(400).json({error: error})
    }
  )
}

// POST => Création d'une note
exports.rateBook = (req, res, next) => {
  // Vérification de la note
  if (0 <= req.body.rating <= 5) {

    const ratingObject = { ...req.body, grade: req.body.rating }
    delete ratingObject._id

    Book.findOne({_id: req.params.id})
    .then(book => {
      // Récupération des notes
      const ratings = book.ratings

      // Ajout de la nouvelle note
      ratings.push(ratingObject)

      // Calcul moyenne des notes
      const totalRatings = book.ratings.length
      let totalGrade = 0

      book.ratings.forEach(rating => {
        totalGrade += rating.grade
      })

      averageGrades = totalGrade / totalRatings

      // Arrondi au dixieme
      book.averageRating = Math.round(averageGrades * 10) / 10

      // Mise à jour du livre avec la nouvelle note ainsi que la nouvelle moyenne des notes
      Book.updateOne({ _id: req.params.id }, { ratings: ratings, averageRating: averageGrades, _id: req.params.id })
      .then(() => { res.status(201).json(book)})
      .catch(error => { res.status(400).json( { error })})
    })
    .catch((error) => {
      res.status(404).json({error: error})
    })
  } else {
    res.status(400).json({ message: 'La note doit être comprise entre 1 et 5' })
  }
}

// GET => Récupération des 3 livres les mieux notés
exports.getBestRating = (req, res, next) => {
  Book.find()
  .sort({ averageRating: -1 })  // Tri par note moyenne décroissante
  .limit(3)
  .then(books => {
    res.status(200).json(books)
  })
  .catch(error => {
    res.status(400).json({ error: error.message })
  })
}