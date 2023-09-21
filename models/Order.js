import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderID: {
    type: String,
    required: true,
    unique: true
  },
  waiterID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cashierID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'in-progress', 'READY!', 'HALF ready', 'COMPLETE', 'ON HOLD', 'cancelled'],
    default: 'sent'
  },
  statusLog: [
    {
      status: String,
      changedBy: mongoose.Schema.Types.ObjectId,
      changedAt: Date
    }
  ]
});

export default mongoose.model('Order', OrderSchema);
