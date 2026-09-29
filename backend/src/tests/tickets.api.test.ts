import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../app';
import { Ticket } from '../models/Ticket';
import { resetTicketCounter } from '../models/Counter';

let mongo: MongoMemoryServer;

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

after(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

beforeEach(async () => {
  await Ticket.deleteMany({});
  await resetTicketCounter(0);
});

describe('tickets API', () => {
  it('creates a ticket with a unique numeric id and timestamps', async () => {
    const res = await request(app)
      .post('/api/tickets')
      .send({
        title: 'Cannot reset password',
        description: 'Reset link fails',
        priority: 'high',
      })
      .expect(201);

    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Cannot reset password');
    assert.equal(res.body.data.priority, 'high');
    assert.equal(res.body.data.status, 'Open');
    assert.equal(res.body.data.id, 1);
    assert.ok(res.body.data.createdAt);
    assert.ok(res.body.data.updatedAt);
  });

  it('rejects empty titles and invalid priorities', async () => {
    const emptyTitle = await request(app)
      .post('/api/tickets')
      .send({ title: '', priority: 'high' })
      .expect(400);

    assert.equal(emptyTitle.body.success, false);
    assert.ok(Array.isArray(emptyTitle.body.errors));

    const badPriority = await request(app)
      .post('/api/tickets')
      .send({ title: 'Something', priority: 'critical' })
      .expect(400);

    assert.equal(badPriority.body.success, false);
  });

  it('runs the acceptance scenario: create, move, filter, summary', async () => {
    const high = await request(app)
      .post('/api/tickets')
      .send({
        title: 'Cannot reset password',
        description: 'Reset link fails',
        priority: 'high',
      })
      .expect(201);

    await request(app)
      .post('/api/tickets')
      .send({
        title: 'Billing portal timeout',
        description: 'Page hangs on load',
        priority: 'medium',
      })
      .expect(201);

    const id = high.body.data.id as string;

    await request(app)
      .patch(`/api/tickets/${id}/status`)
      .send({
        status: 'In progress',
        comment: 'Investigating the reset link failure.',
      })
      .expect(200);

    const resolved = await request(app)
      .patch(`/api/tickets/${id}/status`)
      .send({
        status: 'Resolved',
        comment: 'Re-sent reset email and confirmed login works.',
      })
      .expect(200);

    assert.equal(resolved.body.data.status, 'Resolved');
    assert.notEqual(resolved.body.data.updatedAt, high.body.data.updatedAt);

    const openOnly = await request(app)
      .get('/api/tickets')
      .query({ status: 'Open' })
      .expect(200);

    assert.equal(openOnly.body.count, 1);
    assert.equal(openOnly.body.data[0].title, 'Billing portal timeout');

    const search = await request(app)
      .get('/api/tickets')
      .query({ search: 'password' })
      .expect(200);

    assert.equal(search.body.count, 1);

    const byPriority = await request(app)
      .get('/api/tickets')
      .query({ priority: 'medium' })
      .expect(200);

    assert.equal(byPriority.body.count, 1);

    const summary = await request(app).get('/api/tickets/summary').expect(200);

    assert.equal(summary.body.data.total, 2);
    assert.equal(summary.body.data.byStatus.Open, 1);
    assert.equal(summary.body.data.byStatus.Resolved, 1);
    assert.equal(summary.body.data.byStatus['In progress'], 0);
  });

  it('rejects invalid status updates', async () => {
    const created = await request(app)
      .post('/api/tickets')
      .send({ title: 'Printer jam', priority: 'low' })
      .expect(201);

    const res = await request(app)
      .patch(`/api/tickets/${created.body.data.id}/status`)
      .send({ status: 'Closed' })
      .expect(400);

    assert.equal(res.body.success, false);
  });

  it('requires a comment when changing status', async () => {
    const created = await request(app)
      .post('/api/tickets')
      .send({ title: 'VPN drops', priority: 'medium' })
      .expect(201);

    const res = await request(app)
      .patch(`/api/tickets/${created.body.data.id}/status`)
      .send({ status: 'In progress' })
      .expect(400);

    assert.ok(
      res.body.errors.some((e: string) => /comment/i.test(e))
    );
  });

  it('lets an agent change priority with a comment', async () => {
    const created = await request(app)
      .post('/api/tickets')
      .send({
        title: 'Monitor display issue',
        description: 'Small flicker on one screen',
        priority: 'low',
      })
      .expect(201);

    const res = await request(app)
      .patch(`/api/tickets/${created.body.data.id}/priority`)
      .send({
        priority: 'high',
        comment: 'Affects the entire department after investigation.',
      })
      .expect(200);

    assert.equal(res.body.data.priority, 'high');
    assert.equal(res.body.data.activity.length, 1);
    assert.equal(res.body.data.activity[0].type, 'priority_change');
  });

  it('keeps summary counts correct after re-query (persistence within DB)', async () => {
    await Ticket.create([
      {
        ticketNumber: 1,
        title: 'Cannot reset password',
        description: 'demo',
        priority: 'high',
        status: 'Resolved',
      },
      {
        ticketNumber: 2,
        title: 'Billing portal timeout',
        description: 'demo',
        priority: 'medium',
        status: 'Open',
      },
    ]);

    const first = await request(app).get('/api/tickets/summary').expect(200);
    const second = await request(app).get('/api/tickets/summary').expect(200);

    assert.deepEqual(first.body.data, second.body.data);
    assert.equal(second.body.data.total, 2);
  });
});
