/**
 * Mongoose model Image.
 *
 * @author Emilia Hansson <eh222yn@student.lnu.se>
 * @version 1.0.0
 */

import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  owner: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageId: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    /**
     * Removes sensitive information by transforming the resulting object.
     *
     * @param {object} doc The mongoose document to be converted.
     * @param {object} ret The plain object response which has been converted.
     */
    transform: function (doc, ret) {
      delete ret._id
      delete ret.__v
      delete ret.imageId
      delete ret.owner
    }
  }
})

schema.virtual('id').get(function () {
  return this._id.toHexString()
})

// Creates a model using the schema.
export const Image = mongoose.model('Image', schema)
