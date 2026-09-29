import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  validateCreateTicket,
  validateUpdateTicket,
  validateQueryFilters,
  validateStatusUpdate,
  validatePriorityUpdate,
} from '../middleware/validateTicket';

describe('validateCreateTicket', () => {
  it('accepts a valid ticket payload', () => {
    const result = validateCreateTicket({
      title: 'Cannot reset password',
      description: 'Reset link fails',
      priority: 'high',
    });

    assert.equal(result.errors.length, 0);
    assert.equal(result.data.title, 'Cannot reset password');
    assert.equal(result.data.priority, 'high');
    assert.equal(result.data.status, 'Open');
  });

  it('rejects an empty title', () => {
    const result = validateCreateTicket({
      title: '   ',
      priority: 'medium',
    });

    assert.ok(result.errors.some((e) => /title/i.test(e)));
  });

  it('rejects an invalid priority', () => {
    const result = validateCreateTicket({
      title: 'Broken login',
      priority: 'urgent',
    });

    assert.ok(result.errors.some((e) => /priority/i.test(e)));
  });

  it('rejects an invalid status when provided', () => {
    const result = validateCreateTicket({
      title: 'Broken login',
      priority: 'low',
      status: 'Closed',
    });

    assert.ok(result.errors.some((e) => /status/i.test(e)));
  });
});

describe('validateUpdateTicket', () => {
  it('normalizes status transitions', () => {
    const result = validateUpdateTicket({ status: 'in progress' });
    assert.equal(result.errors.length, 0);
    assert.equal(result.data.status, 'In progress');
  });

  it('rejects empty title updates', () => {
    const result = validateUpdateTicket({ title: '' });
    assert.ok(result.errors.some((e) => /title/i.test(e)));
  });
});

describe('validateQueryFilters', () => {
  it('builds search and filter query', () => {
    const result = validateQueryFilters({
      search: 'password',
      status: 'Open',
      priority: 'high',
    });

    assert.equal(result.errors.length, 0);
    assert.equal(result.filters.status, 'Open');
    assert.equal(result.filters.priority, 'high');
    assert.ok(result.filters.title);
  });

  it('rejects invalid filter status', () => {
    const result = validateQueryFilters({ status: 'Done' });
    assert.ok(result.errors.some((e) => /status/i.test(e)));
  });
});

describe('validateStatusUpdate', () => {
  it('requires a comment and valid status', () => {
    const result = validateStatusUpdate({ status: 'In progress', comment: 'Working on it' });
    assert.equal(result.errors.length, 0);
    assert.equal(result.data.status, 'In progress');
  });

  it('rejects missing comment', () => {
    const result = validateStatusUpdate({ status: 'Resolved', comment: '   ' });
    assert.ok(result.errors.some((e) => /comment/i.test(e)));
  });
});

describe('validatePriorityUpdate', () => {
  it('requires a comment when changing priority', () => {
    const result = validatePriorityUpdate({ priority: 'high', comment: '' });
    assert.ok(result.errors.some((e) => /comment/i.test(e)));
  });
});
