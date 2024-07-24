const sharp = require('sharp')

// Middleware de redimmensionnement
module.exports = async (req, res, next) => {

    // Vérification de l'existance du fichier
    if (req.file) {

        // Récupération des éléments
        const { buffer, originalname } = req.file

        // Renommage
        const name = originalname.split('.')[0]
        const ref = `${name}-${Date.now()}.webp`

        try {
            // Redimensionnement de l'image
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

    else {
        next()
    }
}