import { Router } from 'express';
import {
  createTicket,
  listTickets,
  getTicket,
  updateTicket,
  updateTicketStatus,
  updateTicketPriority,
  deleteTicket,
  getSummary,
} from '../controllers/ticketController';

const router = Router();

router.get('/summary', getSummary);
router.route('/').get(listTickets).post(createTicket);
router.route('/:id').get(getTicket).patch(updateTicket).delete(deleteTicket);
router.patch('/:id/status', updateTicketStatus);
router.patch('/:id/priority', updateTicketPriority);

export default router;
