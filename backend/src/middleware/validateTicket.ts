import { FilterQuery } from 'mongoose';
import {
  PRIORITIES,
  STATUSES,
  Priority,
  Status,
  TicketDocument,
} from '../models/Ticket';

export interface CreateTicketBody {
  title?: unknown;
  description?: unknown;
  priority?: unknown;
  status?: unknown;
}

export interface UpdateTicketBody {
  title?: unknown;
  description?: unknown;
  priority?: unknown;
  status?: unknown;
  comment?: unknown;
}

export interface StatusUpdateBody {
  status?: unknown;
  comment?: unknown;
}

export interface PriorityUpdateBody {
  priority?: unknown;
  comment?: unknown;
}

export interface TicketQuery {
  search?: unknown;
  status?: unknown;
  priority?: unknown;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
}

export type UpdateTicketData = Partial<CreateTicketData>;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const normalizePriority = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : String(value ?? '');

const normalizeStatus = (value: unknown): string => {
  if (typeof value !== 'string') return String(value ?? '');
  const trimmed = value.trim();
  const match = STATUSES.find(
    (status) => status.toLowerCase() === trimmed.toLowerCase()
  );
  return match ?? trimmed;
};

const isPriority = (value: string): value is Priority =>
  (PRIORITIES as readonly string[]).includes(value);

const isStatus = (value: string): value is Status =>
  (STATUSES as readonly string[]).includes(value);

export const validateCreateTicket = (
  body: CreateTicketBody
): { errors: string[]; data: CreateTicketData } => {
  const errors: string[] = [];

  if (!isNonEmptyString(body?.title)) {
    errors.push('Title is required and cannot be empty');
  }

  const priority = normalizePriority(body?.priority);
  if (!isPriority(priority)) {
    errors.push('Priority must be one of: low, medium, high');
  }

  let status: Status = 'Open';
  if (body?.status !== undefined) {
    const normalized = normalizeStatus(body.status);
    if (!isStatus(normalized)) {
      errors.push('Status must be one of: Open, In progress, Resolved');
    } else {
      status = normalized;
    }
  }

  return {
    errors,
    data: {
      title: typeof body?.title === 'string' ? body.title.trim() : '',
      description:
        typeof body?.description === 'string' ? body.description.trim() : '',
      priority: isPriority(priority) ? priority : 'low',
      status,
    },
  };
};

export const validateUpdateTicket = (
  body: UpdateTicketBody
): { errors: string[]; data: UpdateTicketData } => {
  const errors: string[] = [];
  const data: UpdateTicketData = {};

  if (body?.title !== undefined) {
    if (!isNonEmptyString(body.title)) {
      errors.push('Title cannot be empty');
    } else {
      data.title = body.title.trim();
    }
  }

  if (body?.description !== undefined) {
    data.description =
      typeof body.description === 'string' ? body.description.trim() : '';
  }

  if (body?.priority !== undefined) {
    const priority = normalizePriority(body.priority);
    if (!isPriority(priority)) {
      errors.push('Priority must be one of: low, medium, high');
    } else {
      data.priority = priority;
    }
  }

  if (body?.status !== undefined) {
    const status = normalizeStatus(body.status);
    if (!isStatus(status)) {
      errors.push('Status must be one of: Open, In progress, Resolved');
    } else {
      data.status = status;
    }
  }

  return { errors, data };
};

export const validateQueryFilters = (
  query: TicketQuery
): { errors: string[]; filters: FilterQuery<TicketDocument> } => {
  const errors: string[] = [];
  const filters: FilterQuery<TicketDocument> = {};

  if (query.search !== undefined && String(query.search).trim() !== '') {
    filters.title = { $regex: String(query.search).trim(), $options: 'i' };
  }

  if (query.status !== undefined && String(query.status).trim() !== '') {
    const status = normalizeStatus(query.status);
    if (!isStatus(status)) {
      errors.push('Status must be one of: Open, In progress, Resolved');
    } else {
      filters.status = status;
    }
  }

  if (query.priority !== undefined && String(query.priority).trim() !== '') {
    const priority = normalizePriority(query.priority);
    if (!isPriority(priority)) {
      errors.push('Priority must be one of: low, medium, high');
    } else {
      filters.priority = priority;
    }
  }

  return { errors, filters };
};

export const validateStatusUpdate = (
  body: StatusUpdateBody
): { errors: string[]; data: { status: Status; comment: string } } => {
  const errors: string[] = [];

  if (!isNonEmptyString(body?.comment)) {
    errors.push('A comment is required when changing status');
  }

  const status = normalizeStatus(body?.status);
  if (!isStatus(status)) {
    errors.push('Status must be one of: Open, In progress, Resolved');
  }

  return {
    errors,
    data: {
      status: isStatus(status) ? status : 'Open',
      comment: typeof body?.comment === 'string' ? body.comment.trim() : '',
    },
  };
};

export const validatePriorityUpdate = (
  body: PriorityUpdateBody
): { errors: string[]; data: { priority: Priority; comment: string } } => {
  const errors: string[] = [];

  if (!isNonEmptyString(body?.comment)) {
    errors.push('A comment is required when changing priority');
  }

  const priority = normalizePriority(body?.priority);
  if (!isPriority(priority)) {
    errors.push('Priority must be one of: low, medium, high');
  }

  return {
    errors,
    data: {
      priority: isPriority(priority) ? priority : 'low',
      comment: typeof body?.comment === 'string' ? body.comment.trim() : '',
    },
  };
};

export { normalizeStatus, PRIORITIES, STATUSES };
