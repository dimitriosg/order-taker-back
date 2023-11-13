import mongoose from 'mongoose';

const orderCounterSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    lastIncrement: {
        type: Number,
        required: true,
        default: 0
    }
});

const OrderCounter = mongoose.model('OrderCounter', orderCounterSchema);

export default OrderCounter;
