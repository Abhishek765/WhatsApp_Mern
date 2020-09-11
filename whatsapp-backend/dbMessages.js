import mongoose from "mongoose";

// schema
const whatsappSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  received: Boolean,
});

// Creating the model with collection messagecontent
export default mongoose.model("messagecontent", whatsappSchema);
