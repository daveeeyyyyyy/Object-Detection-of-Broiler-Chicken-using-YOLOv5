import mongoose from "mongoose";

const BroilerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Broiler",
    },
    count: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Broiler ||
  mongoose.model("Broiler", BroilerSchema);
