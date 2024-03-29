// models/Orders.js
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number
});

const OrderSchema = new mongoose.Schema({
  orderID: {
    type: String,
    required: true,
    unique: true
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  waiterID: {
    type: String,
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
    enum: ['pending', 'created', 'sent', 'in-progress', 'ready', 'complete', 'cancelled'],
    default: 'created'
  },
  statusLog: [
    {
      status: String,
      changedBy: String,
      changedAt: Date
    }
  ]
});

export default mongoose.model('Order', OrderSchema);
