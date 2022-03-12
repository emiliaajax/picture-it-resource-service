/**
 * Images routes.
 *
 * @author Emilia Hansson <eh222yn@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import jwt from 'jsonwebtoken'
import createError from 'http-errors'
import { ImagesController } from '../../../controllers/api/images-controller.js'

export const router = express.Router()

const controller = new ImagesController()

/**
 * Authenticates the request.
 *
 * @param {object} req Express request object.
 * @param {object} res Express response object.
 * @param {Function} next Express next middleware function.
 */
const authenticateJWT = (req, res, next) => {
  try {
    const [authenticationScheme, token] = req.headers.authorization?.split(' ')

    if (authenticationScheme !== 'Bearer') {
      throw new Error('Invalid authentication scheme')
    }

    const payload = jwt.verify(token, Buffer.from(process.env.ACCESS_TOKEN_SECRET, 'base64').toString('ascii'),
      {
        algorithms: 'RS256'
      })
    req.user = {
      username: payload.sub,
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email
    }

    next()
  } catch (error) {
    const err = createError(403)
    err.cause = error
    next(err)
  }
}

router.param('id', (req, res, next, id) => controller.loadImage(req, res, next, id))

router.get('/',
  authenticateJWT,
  (req, res, next) => controller.findAll(req, res, next)
)

router.get('/:id',
  authenticateJWT,
  (req, res, next) => controller.find(req, res, next)
)

router.post('/',
  authenticateJWT,
  (req, res, next) => controller.create(req, res, next)
)

router.put('/:id',
  authenticateJWT,
  (req, res, next) => controller.edit(req, res, next)
)

router.patch('/:id',
  authenticateJWT,
  (req, res, next) => controller.partialEdit(req, res, next)
)
