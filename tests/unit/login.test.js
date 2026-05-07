import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import path from 'path';
import bcrypt from 'bcryptjs';

// Mocking the database
vi.mock('../../db', () => {
  return {
    default: {
      prepare: vi.fn()
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

describe('Login Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /users/login should render login page', async () => {
    const res = await request(app).get('/users/login');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Connexion');
  });

  it('POST /users/login should redirect on success', async () => {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const mockUser = { id: 1, username: 'testuser', password: hashedPassword };
    
    db.prepare.mockReturnValue({
      get: vi.fn().mockReturnValue(mockUser)
    });

    const res = await request(app)
      .post('/users/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.status).toBe(302);
    expect(res.header.location).toBe('/');
  });

  it('POST /users/login should show error on failure', async () => {
    db.prepare.mockReturnValue({
      get: vi.fn().mockReturnValue(null)
    });

    const res = await request(app)
      .post('/users/login')
      .send({ username: 'wronguser', password: 'wrongpassword' });

    expect(res.status).toBe(200);
    expect(res.text).toContain('Identifiants invalides.');
  });
});
