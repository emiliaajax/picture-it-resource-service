/**
 * Module for the ImagesController.
 *
 * @author Emilia Hansson <eh222yn@student.lnu.se>
 * @version 1.0.0
 */

import { Image } from '../../models/image.js'
import createError from 'http-errors'
import fetch from 'node-fetch'
import validator from 'validator'

/**
 * Encapsulates a controller.
 */
export class ImagesController {
  /**
   * Authorizes the user.
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @param {Function} next Express next middleware function.
   * @returns {Function} Express next middleware function.
   */
  async authorize (req, res, next) {
    if (req.user.id !== req.image.owner) {
      next(createError(403))
    }
    next()
  }

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
        return next(createError(404))
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
      const images = await Image.find({ owner: req.user.id })

      res
        .status(200)
        .json(images)
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
    res
      .status(200)
      .json(req.image)
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
      const response = await fetch(process.env.IMAGE_SERVICE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN
        },
        body: JSON.stringify({
          data: req.body.data,
          contentType: req.body.contentType
        })
      })

      const data = await response.json()

      const image = new Image({
        owner: req.user.id,
        imageUrl: data.imageUrl,
        description: validator.escape(req.body.description),
        imageId: data.id
      })

      await image.save()

      const location = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${image._id}`
      )

      res
        .location(location.href)
        .status(201)
        .json(image)
    } catch (error) {
      let err = error
      if (error.name === 'ValidationError') {
        err = createError(400)
        err.cause = error
      }
      next(err)
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
      if (!req.body.data || !req.body.contentType || !req.body.description) {
        next(createError(400))
      }

      await fetch(process.env.IMAGE_SERVICE_URL + `${req.image.imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN
        },
        body: JSON.stringify({
          data: req.body.data,
          contentType: req.body.contentType
        })
      })

      req.image.description = validator.escape(req.body.description)

      await req.image.save()

      res
        .status(204)
        .end()
    } catch (error) {
      let err = error
      if (error.name === 'ValidationError') {
        err = createError(400)
        err.cause = error
      }
      next(err)
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
        await fetch(process.env.IMAGE_SERVICE_URL + `${req.image.imageId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN
          },
          body: JSON.stringify(imageData)
        })
      }

      if (req.body.description) {
        req.image.description = validator.escape(req.body.description)
        await req.image.save()
      }

      res
        .status(204)
        .end()
    } catch (error) {
      let err = error
      if (error.name === 'ValidationError') {
        err = createError(400)
        err.cause = error
      }
      next(err)
    }
  }

  /**
   * Deletes an image.
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @param {Function} next Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      await fetch(process.env.IMAGE_SERVICE_URL + `${req.image.imageId}`, {
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
