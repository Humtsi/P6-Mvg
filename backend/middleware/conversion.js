const sharp = require('sharp')

module.exports = async (req, res, next) => {

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const { buffer, originalname } = req.file
  const name = originalname.split('.')[0]
  const ref = `${name}-${Date.now()}.webp`

  try {
    await sharp(buffer)
    .webp({ quality: 20 })
    .toFile('./images/' + ref)

    req.file.filename = ref
    req.file.path = `./images/${ref}`
    next()

  } catch (error) {
    res.status(400).json({ error: 'Image processing failed' })
  }
}