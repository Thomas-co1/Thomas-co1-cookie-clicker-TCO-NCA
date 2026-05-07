import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import path from 'path';
import bcrypt from 'bcryptjs';

// Setting NODE_ENV to test before anything else
process.env.NODE_ENV = 'test';

// Import db and routes after setting NODE_ENV
import db from '../../db';
import usersRouter from '../../routes/users';

const app = express();
app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({ secret: 'test', resave: false, saveUninitialized: true }));
app.use('/users', usersRouter);

describe('Authentication Routes', () => {
  beforeEach(() => {
    db.exec('DELETE FROM users');
  });

  describe('Registration', () => {
    it('should render registration page', async () => {
      const res = await request(app).get('/users/register');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Inscription');
    });

    it('should register a new user and redirect to login', async () => {
      const res = await request(app)
        .post('/users/register')
        .send({ username: 'testuser', password: 'password123' });

      expect(res.status).toBe(302);
      expect(res.header.location).toBe('/users/login');

      const user = db.prepare('SELECT * FROM users WHERE username = ?').get('testuser');
      expect(user).toBeDefined();
      expect(user.username).toBe('testuser');
    });
  });

  describe('Login', () => {
    it('should render login page', async () => {
      const res = await request(app).get('/users/login');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Connexion');
    });

    it('should login and redirect to home', async () => {
      const hash = bcrypt.hashSync('password123', 10);
      db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('loginuser', hash);

      const res = await request(app)
        .post('/users/login')
        .send({ username: 'loginuser', password: 'password123' });

      expect(res.status).toBe(302);
      expect(res.header.location).toBe('/');
    });
  });
});
