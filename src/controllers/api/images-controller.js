/**
 * Module for the ImagesController.
 *
 * @author Emilia Hansson <eh222yn@student.lnu.se>
 * @version 1.0.0
 */

import { Image } from '../../models/image.js'
import createError from 'http-errors'
import fetch from 'node-fetch'

/**
 * Encapsulates a controller.
 */
export class ImagesController {
  /**
   * Provides req.image to the routes if id is present.
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @param {Function} next Express next middleware function.
   * @param {string} id The value of the id.
   */
  async loadImage (req, res, next, id) {
    try {
      const image = await Image.findById(id)

      if (!image) {
        next(createError(404))
        return
      }

      req.image = image
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing all tasks.
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @param {Function} next Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      const images = await Image.find()

      res.json(images)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing one task.
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @param {Function} next Express next middleware function.
   */
  find (req, res, next) {
    res.json(req.image)
  }

  /**
   * Creates a new image.
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @param {Function} next Express next middleware function.
   */
  async create (req, res, next) {
    try {
      const response = await fetch('https://courselab.lnu.se/picture-it/images/api/v1/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN
        },
        body: JSON.stringify({
          data: Buffer.from(req.body.data, 'base64'),
          contentType: req.body.contentType
        })
      })

      const data = await response.json()

      const image = new Image({
        imageUrl: data.imageUrl,
        description: req.body.description,
        imageId: data.id
      })

      await image.save()

      res
        .status(201)
        .json(image)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Edits an existing image.
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @param {Function} next Express next middleware function.
   */
  async edit (req, res, next) {
    try {
      await fetch(`https://courselab.lnu.se/picture-it/images/api/v1/images/${req.image.imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN
        },
        body: JSON.stringify({
          data: Buffer.from(req.body.data, 'base64'),
          contentType: req.body.contentType
        })
      })

      req.image.description = req.body.description

      await req.image.save()

      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Partially edits an existing image.
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @param {Function} next Express next middleware function.
   */
  async partialEdit (req, res, next) {
    try {
      if (req.body.data || req.body.contentType) {
        const imageData = {}
        if (req.body.data) {
          imageData.data = req.body.data
        }
        if (req.body.contentType) {
          imageData.contentType = req.body.contentType
        }
        await fetch(`https://courselab.lnu.se/picture-it/images/api/v1/images/${req.image.imageId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN
          },
          body: JSON.stringify(imageData)
        })
      }

      if (req.body.description) {
        req.image.description = req.body.description
        await req.image.save()
      }

      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes image.
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @param {Function} next Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      await fetch(`https://courselab.lnu.se/picture-it/images/api/v1/images/${req.image.imageId}`, {
        method: 'DELETE',
        headers: {
          'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN
        }
      })

      await req.image.deleteOne()

      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }
}
