/**
 * Module for the ImagesController.
 *
 * @author Emilia Hansson <eh222yn@student.lnu.se>
 * @version 1.0.0
 */

import { Image } from '../../models/image.js'
import createError from 'http-errors'

/**
 * Encapsulates a controller.
 */
export class ImagesController {
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
   * Sends a JSON response containing one task.
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @param {Function} next Express next middleware function.
   */
  find (req, res, next) {
    res.json(req.image)
  }
}
