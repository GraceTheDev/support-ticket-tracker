import { Request, Response, NextFunction } from 'express';
import { HydratedDocument } from 'mongoose';
import { Ticket, Status, TicketDocument } from '../models/Ticket';
import { getNextTicketNumber } from '../models/Counter';
import {
  validateCreateTicket,
  validateUpdateTicket,
  validateQueryFilters,
  validateStatusUpdate,
  validatePriorityUpdate,
} from '../middleware/validateTicket';

type TicketDoc = HydratedDocument<TicketDocument>;

const findTicketByParam = async (
  idParam: string
): Promise<TicketDoc | null> => {
  const numericId = Number(idParam);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return null;
  }
  return Ticket.findOne({ ticketNumber: numericId });
};

export const createTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { errors, data } = validateCreateTicket(req.body);
    if (errors.length) {
      res.status(400).json({ success: false, errors });
      return;
    }

    const ticketNumber = await getNextTicketNumber();
    const ticket = await Ticket.create({ ...data, ticketNumber });
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const listTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { errors, filters } = validateQueryFilters(req.query);
    if (errors.length) {
      res.status(400).json({ success: false, errors });
      return;
    }

    const tickets = await Ticket.find(filters).sort({ ticketNumber: 1 });
    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (err) {
    next(err);
  }
};

export const getTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticket = await findTicketByParam(req.params.id);
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket not found' });
      return;
    }
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const updateTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { errors, data } = validateUpdateTicket(req.body);
    if (errors.length) {
      res.status(400).json({ success: false, errors });
      return;
    }

    if (Object.keys(data).length === 0) {
      res.status(400).json({
        success: false,
        errors: ['Provide at least one field to update'],
      });
      return;
    }

    const ticket = await findTicketByParam(req.params.id);
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket not found' });
      return;
    }

    Object.assign(ticket, data);
    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const updateTicketStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { errors, data } = validateStatusUpdate(req.body);
    if (errors.length) {
      res.status(400).json({ success: false, errors });
      return;
    }

    const ticket = await findTicketByParam(req.params.id);
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket not found' });
      return;
    }

    const previousStatus = ticket.status;
    if (previousStatus === data.status) {
      res.status(400).json({
        success: false,
        errors: [`Ticket is already ${data.status}`],
      });
      return;
    }

    ticket.status = data.status;
    ticket.activity.push({
      message: data.comment,
      type: 'status_change',
      fromStatus: previousStatus,
      toStatus: data.status,
    });

    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const updateTicketPriority = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { errors, data } = validatePriorityUpdate(req.body);
    if (errors.length) {
      res.status(400).json({ success: false, errors });
      return;
    }

    const ticket = await findTicketByParam(req.params.id);
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket not found' });
      return;
    }

    const previousPriority = ticket.priority;
    if (previousPriority === data.priority) {
      res.status(400).json({
        success: false,
        errors: [`Ticket priority is already ${data.priority}`],
      });
      return;
    }

    ticket.priority = data.priority;
    ticket.activity.push({
      message: data.comment,
      type: 'priority_change',
      fromPriority: previousPriority,
      toPriority: data.priority,
    });

    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

export const deleteTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ticket = await findTicketByParam(req.params.id);
    if (!ticket) {
      res.status(404).json({ success: false, error: 'Ticket not found' });
      return;
    }
    await ticket.deleteOne();
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (err) {
    next(err);
  }
};

export const getSummary = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [total, byStatus] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.aggregate<{ _id: Status; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const countsByStatus: Record<Status, number> = {
      Open: 0,
      'In progress': 0,
      Resolved: 0,
    };

    for (const row of byStatus) {
      countsByStatus[row._id] = row.count;
    }

    res.json({
      success: true,
      data: {
        total,
        byStatus: countsByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};
