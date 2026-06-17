import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
      trim: true
    },
    moveInDate: {
      type: Date,
      required: [true, 'Please select a move-in date']
    },
    status: {
      type: String,
      enum: ['pending', 'seen', 'accepted', 'rejected'],
      default: 'pending'
    },
    ownerReply: {
      type: String,
      default: '',
      trim: true
    },
    repliedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

const Inquiry = mongoose.model('Inquiry', InquirySchema);
export default Inquiry;