/**
 * API version 1 routes.
 *
 * @author Emilia Hansson <eh222yn@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import { router as imagesRouter } from './images-router.js'

export const router = express.Router()

router.get('/', (req, res) => res.json({
  message: 'Welcome to version 1 of this API!',
  endpoints: [
    {
      description: 'Gets a list of all images owned by the authenticated user.',
      endpoint: 'GET /images'
    },
    {
      description: 'Create an image.',
      endpoint: 'POST /images'
    },
    {
      description: 'Edits an image.',
      endpoint: 'PUT /images/:id'
    },
    {
      description: 'Partially edits an image.',
      endpoint: 'PATCH /images/:id'
    },
    {
      description: 'Deletes an image.',
      endpoint: 'DELETE /images/:id'
    }
  ]
}))
router.use('/images', imagesRouter)
