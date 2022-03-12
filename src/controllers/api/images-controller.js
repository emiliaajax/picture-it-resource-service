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
        description: req.body.description
      })

      await image.save()

      res
        .status(201)
        .json(image)
    } catch (error) {
      next(error)
    }
  }

  // async edit (req, res, next) {
  //   await fetch(`https://courselab.lnu.se/picture-it/images/api/v1/images/${id}`, {
  //     method: 'PUT',
  //     headers: {
  //       'X-API-Private-Token': process.env.PERSONAL_ACCESS_TOKEN
  //     },
  //     body: {
  //       data: req.body.data,
  //       contentType: req.body.contentType
  //     }
  //   })
  // }
}
