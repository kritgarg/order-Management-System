import mongoose from 'mongoose';

const rollSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    trim: true
  },
  hardness: {
    type: String,
    required: [true, 'Hardness is required'],
    trim: true
  },
  machining: {
    type: String,
    trim: true
  },
  rollDescription: {
    type: String,
    enum: {
      values: ['SHAFT', 'ROLL', 'REEL', 'CASTING', 'FORGING'],
      message: '{VALUE} is not a valid roll description'
    },
    trim: true
  },
  dimensions: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'casting', 'annealing', 'machining', 'bearing/wobler', 'ready', 'dispached'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Pending'
  },
  grade: {
    type: String,
    enum: {
      values: ['ALLOYS', 'ADAMITE', 'S.G.I', 'W.S.G', 'ACCICULAR', 'CHILL', 'EN-8', 'EN-9'],
      message: '{VALUE} is not a valid grade'
    },
    trim: true
  }
}, {
  timestamps: true
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  broker: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  orderDate: {
    type: Date,
    required: [true, 'Order date is required'],
    validate: {
      validator: function(v) {
        return v instanceof Date && !isNaN(v);
      },
      message: 'Invalid order date'
    }
  },
  expectedDelivery: {
    type: Date,
    validate: {
      validator: function(v) {
        return !v || (v instanceof Date && !isNaN(v));
      },
      message: 'Invalid expected delivery date'
    }
  },
  notes: {
    type: String,
    default: '',
    trim: true
  },
  rolls: {
    type: [rollSchema],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: 'At least one roll is required'
    }
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
orderSchema.index({ companyName: 1 });
orderSchema.index({ orderDate: -1 });
orderSchema.index({ 'rolls.status': 1 });

// Add pre-save middleware to validate dates
orderSchema.pre('save', function(next) {
  if (this.expectedDelivery && this.orderDate && this.expectedDelivery < this.orderDate) {
    next(new Error('Expected delivery date cannot be before order date'));
  }
  next();
});

// Add method to check if order is overdue
orderSchema.methods.isOverdue = function() {
  if (!this.expectedDelivery) return false;
  return new Date() > this.expectedDelivery;
};

// Add static method to find overdue orders
orderSchema.statics.findOverdue = function() {
  return this.find({
    expectedDelivery: { $lt: new Date() },
    'rolls.status': { $ne: 'dispached' }
  });
};

const Order = mongoose.model('Order', orderSchema);

export default Order; 