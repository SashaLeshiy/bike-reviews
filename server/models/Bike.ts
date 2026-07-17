import mongoose from 'mongoose'

const BikeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  url: String,
  link: String,
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

export default mongoose.models.Bike || mongoose.model('Bike', BikeSchema)