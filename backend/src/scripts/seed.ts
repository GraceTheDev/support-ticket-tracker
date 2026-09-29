import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db';
import { Ticket, Priority, Status } from '../models/Ticket';
import { getNextTicketNumber, resetTicketCounter } from '../models/Counter';
import sample from '../data/sample-tickets.json';

interface SampleTicket {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
}

const start = async (): Promise<void> => {
  await connectDB();

  await Ticket.deleteMany({});
  await resetTicketCounter(0);

  const docs = [];
  for (const item of sample as SampleTicket[]) {
    const ticketNumber = await getNextTicketNumber();
    docs.push(await Ticket.create({ ...item, ticketNumber }));
  }

  console.log(`Seeded ${docs.length} demo tickets:`);
  for (const ticket of docs) {
    console.log(
      `- #${ticket.ticketNumber} ${ticket.title} · Priority: ${ticket.priority} · Status: ${ticket.status}`
    );
  }

  await mongoose.disconnect();
};

start().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
