import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const OwnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
      type: String,
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false
    },
    phone: {
      type: String,
      required: [true, 'Please enter your phone number'],
      trim: true
    },
    businessName: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    documents: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true }
      }
    ],
    avatar: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' }
    },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt before saving (only if password is set)
OwnerSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match owner entered password to hashed password
OwnerSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const Owner = mongoose.model('Owner', OwnerSchema);
export default Owner;