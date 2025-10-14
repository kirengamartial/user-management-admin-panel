const User = require('../models/User');
const cryptoService = require('../services/cryptoService');
const protobuf = require('protobufjs');
const path = require('path');

class UserController {
  async createUser(req, res) {
    try {
      const { email, role, status } = req.body;

      if (!email || !role || !status) {
        return res.status(400).json({ error: 'Email, role, and status are required' });
      }

      const emailHash = cryptoService.hashEmail(email);
      const signature = cryptoService.signHash(emailHash);

      const userData = {
        email,
        role,
        status,
        createdAt: new Date().toISOString(),
        emailHash,
        signature
      };

      const user = User.create(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = User.findAll();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const user = User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const { email, role, status } = req.body;

      if (!email || !role || !status) {
        return res.status(400).json({ error: 'Email, role, and status are required' });
      }

      const emailHash = cryptoService.hashEmail(email);
      const signature = cryptoService.signHash(emailHash);

      const userData = {
        email,
        role,
        status,
        emailHash,
        signature
      };

      const user = User.update(req.params.id, userData);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const success = User.delete(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUsersPerDay(req, res) {
    try {
      const stats = User.getUsersPerDay(7);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async exportUsers(req, res) {
    try {
      const root = await protobuf.load(path.join(__dirname, '../proto/user.proto'));
      const UserList = root.lookupType('UserList');

      const users = User.findAll();
      const publicKey = cryptoService.getPublicKey();

      const payload = {
        users: users,
        publicKey: publicKey
      };

      const errMsg = UserList.verify(payload);
      if (errMsg) {
        throw Error(errMsg);
      }

      const message = UserList.create(payload);
      const buffer = UserList.encode(message).finish();

      res.set('Content-Type', 'application/octet-stream');
      res.send(Buffer.from(buffer));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getPublicKey(req, res) {
    try {
      const publicKey = cryptoService.getPublicKey();
      res.json({ publicKey });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
