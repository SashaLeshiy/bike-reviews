import mongoose from 'mongoose'

const BikeSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  url: String,
  image: String,
  name: String,
  commentsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  parsedAt: Date,
  updatedAt: Date
})

export default mongoose.model('Bike', BikeSchema)