/**
 * The starting point of the application.
 *
 * @author Emilia Hansson <eh222yn@student.lnu.se>
 * @version 1.0.0
 */

import express from 'express'
import logger from 'morgan'
import { router } from './routes/router.js'
import { connectDB } from './config/mongoose.js'
import helmet from 'helmet'

try {
  // Connects to MongoDB.
  await connectDB()

  // Creates an Express application.
  const app = express()

  // Sets HTTP headers to make application more secure.
  app.use(helmet())

  // Sets up a morgan logger using the dev format for log entries.
  app.use(logger('dev'))

  // Parses requests of the content type application/json.
  app.use(express.json({ limit: '500kb' }))

  // Registers routes.
  app.use('/', router)

  // Error handler.
  app.use(function (err, req, res, next) {
    err.status = err.status || 500

    if (req.app.get('env') !== 'development') {
      if (err.status === 500) {
        err.message = 'An unexpected condition was encountered.'
      }

      if (err.status === 400) {
        err.message = 'The request cannot or will not be processed due to something that is perceived to be a client error (for example validation error)'
      }

      if (err.status === 403) {
        err.message = 'The request contained valid data and was understood by the server, but the server is refusing action due to the authenticated user not having the necessary permissions for the resource.'
      }

      if (err.status === 404) {
        err.message = 'The requested resource was not found.'
      }

      return res
        .status(err.status)
        .json({
          status: err.status,
          message: err.message
        })
    }

    // Development only!
    return res
      .status(err.status)
      .json({
        status: err.status,
        message: err.message,
        cause: err.cause
          ? {
              status: err.cause.status,
              message: err.cause.message,
              stack: err.cause.stack
            }
          : null,
        stack: err.stack
      })
  })

  // Starts the HTTP server listening for connections.
  app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
    console.log('Press Ctrl-C to terminate...')
  })
} catch (error) {
  console.error(error)
  process.exitCode = 1
}
