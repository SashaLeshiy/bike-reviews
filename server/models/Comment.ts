import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
  bikeId: {
    type: String,
    required: true,
    ref: 'Bike'
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  user: {
    username: String,
    firstName: String,
    lastName: String
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Comment', CommentSchema)