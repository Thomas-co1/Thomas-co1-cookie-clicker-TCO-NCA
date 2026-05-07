import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import path from 'path';

// Mocking the database
vi.mock('../../db', () => {
  return {
    default: {
      prepare: vi.fn().mockReturnValue({
        run: vi.fn(),
        get: vi.fn()
      }),
      exec: vi.fn()
    }
  };
});

import usersRouter from '../../routes/users';
import db from '../../db';

const app = express();
app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use('/users', usersRouter);

describe('Registration Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /users/register should render registration page', async () => {
    const res = await request(app).get('/users/register');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Inscription');
  });

  it('POST /users/register should redirect on success', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({ username: 'newuser', password: 'password123' });

    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/users/login');
  });

  it('POST /users/register should show error if fields are missing', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({ username: '', password: '' });

    expect(res.status).toBe(200);
    expect(res.text).toContain('Veuillez remplir tous les champs.');
  });
});
