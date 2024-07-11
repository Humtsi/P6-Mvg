const Book = require('../models/Book')
const fs = require('fs')

exports.createBook = (req, res, next) => {

  const bookObject = JSON.parse(req.body.book)
  delete bookObject._id
  delete bookObject._userId

  const ref = req.file.filename
  
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${ref}`
  })
  
  book.save()
  res.status(201).json({message: 'Objet enregistré !'})
}

exports.getOneBook = (req, res, next) => {
  Book.findOne({_id: req.params.id})
  .then((book) => {
    res.status(200).json(book)
  })
  .catch((error) => {
    res.status(404).json({error: error})
  })
}

exports.modifyBook = async (req, res, next) => {

  const ref = req.file.filename

  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${ref}`
  } : { ...req.body }

  delete bookObject._userId

  Book.findOne({_id: req.params.id})
  .then((book) => {
    if (book.userId != req.auth.userId) {
      res.status(403).json({ message : 'Not authorized'})
    } else {
      const exName = book.imageUrl.split('/images/')[1]
      fs.unlink(`images/${exName}`, () => {})

      Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
      .then(() => res.status(200).json({message : 'Objet modifié!'}))
      .catch(error => res.status(401).json({ error }))
    }
  })
  .catch((error) => {
    res.status(400).json({ error })
  })
}

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
  .then(book => {
    if (book.userId != req.auth.userId) {
      res.status(401).json({message: 'Not authorized'})
    } else {
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

exports.rateBook = (req, res, next) => {

  Book.findOne({_id: req.params.id})
  .then((book) => {

    const newRating = {
      userId: req.auth.userId,
      grade: req.body.rating
    }

    book.ratings.push(newRating)

    const totalRatings = book.ratings.length
    let totalGrade = 0

    book.ratings.forEach(rating => {
      totalGrade += rating.grade
    })

    book.averageRating = totalGrade / totalRatings
    return book.save()
  })
  .then(savedBook => {
    res.status(200).json({book: savedBook})
  })
  .catch(
    (error) => {
      res.status(404).json({error: error})
    }
  )
}

exports.bestRating = (req, res, next) => {
  Book.find()
  .sort({ averageRating: -1 })  // Tri par note moyenne décroissante
  .limit(3)
  .then(books => {
    res.status(200).json(books)
  })
  .catch(error => {
    res.status(500).json({ error: error.message })
  });
}