/**
 * Mongoose configuration.
 *
 * @author Emilia Hansson <eh222yn@student.lnu.se>
 * @version 1.0.0
 */

import mongoose from 'mongoose'

/**
 * Establishes a connection to a database.
 *
 * @returns {Promise} Resolves to this if established successfully.
 */
export const connectDB = async () => {
  const { connection } = mongoose

  // Binds connections to events
  connection.on('connected', () => console.log('MongoDB connection opened.'))
  connection.on('error', err => console.error(`MongoDB connection error occurred: ${err}`))
  connection.on('disconnected', () => console.log('MongoDB is disconnected'))

  // Closes the connection if the Node.js process ends.
  process.on('SIGINT', () => {
    connection.close(() => {
      console.log('MongoDB disconnected due to application termination')
      process.exit(0)
    })
  })

  // Connects to the server
  return mongoose.connect(process.env.DB_CONNECTION_STRING)
}
