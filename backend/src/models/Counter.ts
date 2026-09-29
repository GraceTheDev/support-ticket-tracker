import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

export async function getNextTicketNumber(): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(
    'ticket',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
}

export async function resetTicketCounter(value = 0): Promise<void> {
  await Counter.findByIdAndUpdate(
    'ticket',
    { seq: value },
    { upsert: true, new: true }
  );
}
