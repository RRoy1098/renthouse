import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const TenantSchema = new mongoose.Schema(
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
      required: [true, 'Please enter a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false // Won't return in queries by default
    },
    phone: {
      type: String,
      required: [true, 'Please enter your phone number'],
      trim: true
    },
    avatar: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' }
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    preferences: {
      budgetMin: { type: Number, default: 0, min: 0 },
      budgetMax: { type: Number, default: 1000000 },
      preferredLocations: [{ type: String, trim: true }],
      roomType: { 
        type: String, 
        enum: ['single', 'double', 'flat', 'PG', ''], 
        default: '' 
      }
    },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt before saving
TenantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
TenantSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Tenant = mongoose.model('Tenant', TenantSchema);
export default Tenant;