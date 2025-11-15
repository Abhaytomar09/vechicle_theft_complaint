const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and documents are allowed.'));
    }
  }
});

// Initialize Database
const db = new sqlite3.Database('vehicle_theft.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    
    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS complaints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      vehicleNumber TEXT NOT NULL,
      vehicleType TEXT NOT NULL,
      vehicleModel TEXT NOT NULL,
      vehicleColor TEXT NOT NULL,
      theftDate TEXT NOT NULL,
      theftLocation TEXT NOT NULL,
      description TEXT,
      complainantName TEXT NOT NULL,
      complainantPhone TEXT NOT NULL,
      complainantEmail TEXT NOT NULL,
      complainantAddress TEXT,
      status TEXT DEFAULT 'pending',
      assignedOfficer TEXT,
      caseNumber TEXT UNIQUE,
      documents TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      complaintId INTEGER NOT NULL,
      message TEXT NOT NULL,
      updatedBy TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaintId) REFERENCES complaints(id)
    )`);
  }
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate case number
const generateCaseNumber = () => {
  return 'VTC-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
};

// API Routes

// Register User
app.post('/api/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, password } = req.body;

  try {
    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (user) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      db.run(
        'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
        [name, email, phone, hashedPassword],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to register user' });
          }

          // Generate JWT
          const token = jwt.sign(
            { id: this.lastID, email, role: 'user' },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: this.lastID, name, email, phone, role: 'user' }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login User
app.post('/api/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  });
});

// Get Current User
app.get('/api/me', authenticateToken, (req, res) => {
  db.get('SELECT id, name, email, phone, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  });
});

// Submit Complaint
app.post('/api/complaints', authenticateToken, upload.array('documents', 5), (req, res) => {
  // Manual validation for FormData (express-validator doesn't work well with multipart/form-data)
  const {
    vehicleNumber,
    vehicleType,
    vehicleModel,
    vehicleColor,
    theftDate,
    theftLocation,
    description,
    complainantName,
    complainantPhone,
    complainantEmail,
    complainantAddress
  } = req.body;

  // Validation
  const errors = [];
  if (!vehicleNumber || !vehicleNumber.trim()) {
    errors.push({ field: 'vehicleNumber', message: 'Vehicle number is required' });
  }
  if (!vehicleType || !vehicleType.trim()) {
    errors.push({ field: 'vehicleType', message: 'Vehicle type is required' });
  }
  if (!vehicleModel || !vehicleModel.trim()) {
    errors.push({ field: 'vehicleModel', message: 'Vehicle model is required' });
  }
  if (!theftDate || !theftDate.trim()) {
    errors.push({ field: 'theftDate', message: 'Theft date is required' });
  }
  if (!theftLocation || !theftLocation.trim()) {
    errors.push({ field: 'theftLocation', message: 'Theft location is required' });
  }
  if (!complainantName || !complainantName.trim()) {
    errors.push({ field: 'complainantName', message: 'Complainant name is required' });
  }
  if (!complainantPhone || !complainantPhone.trim()) {
    errors.push({ field: 'complainantPhone', message: 'Complainant phone is required' });
  }
  if (!complainantEmail || !complainantEmail.trim()) {
    errors.push({ field: 'complainantEmail', message: 'Complainant email is required' });
  } else {
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(complainantEmail.trim())) {
      errors.push({ field: 'complainantEmail', message: 'Valid email is required' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors[0].message, errors: errors });
  }

  const documents = req.files ? req.files.map(file => file.filename).join(',') : '';
  const caseNumber = generateCaseNumber();

  db.run(
    `INSERT INTO complaints (
      userId, vehicleNumber, vehicleType, vehicleModel, vehicleColor,
      theftDate, theftLocation, description, complainantName,
      complainantPhone, complainantEmail, complainantAddress,
      caseNumber, documents
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.user.id, vehicleNumber, vehicleType, vehicleModel, vehicleColor,
      theftDate, theftLocation, description || '', complainantName,
      complainantPhone, complainantEmail, complainantAddress || '',
      caseNumber, documents
    ],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to submit complaint' });
      }

      // Add initial update
      db.run(
        'INSERT INTO updates (complaintId, message, updatedBy) VALUES (?, ?, ?)',
        [this.lastID, 'Complaint filed successfully. Case number: ' + caseNumber, complainantName]
      );

      res.status(201).json({
        message: 'Complaint submitted successfully',
        caseNumber,
        complaintId: this.lastID
      });
    }
  );
});

// Get User's Complaints
app.get('/api/complaints', authenticateToken, (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT * FROM complaints WHERE userId = ?';
  const params = [req.user.id];

  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }

  if (search) {
    query += ' AND (vehicleNumber LIKE ? OR caseNumber LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY createdAt DESC';

  db.all(query, params, (err, complaints) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(complaints);
  });
});

// Get Single Complaint
app.get('/api/complaints/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.get(
    'SELECT * FROM complaints WHERE id = ? AND userId = ?',
    [id, req.user.id],
    (err, complaint) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      // Get updates
      db.all(
        'SELECT * FROM updates WHERE complaintId = ? ORDER BY createdAt DESC',
        [id],
        (err, updates) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ ...complaint, updates: updates || [] });
        }
      );
    }
  );
});

// Middleware to check admin role from database
const checkAdminRole = (req, res, next) => {
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
  });
};

// Get All Complaints (Admin)
app.get('/api/admin/complaints', authenticateToken, checkAdminRole, (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT * FROM complaints';
  const params = [];

  if (status && status !== 'all') {
    query += ' WHERE status = ?';
    params.push(status);
  }

  if (search) {
    query += (params.length > 0 ? ' AND' : ' WHERE') + ' (vehicleNumber LIKE ? OR caseNumber LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY createdAt DESC';

  db.all(query, params, (err, complaints) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(complaints);
  });
});

// Get Single Complaint (Admin)
app.get('/api/admin/complaints/:id', authenticateToken, checkAdminRole, (req, res) => {
  const { id } = req.params;

  db.get(
    'SELECT * FROM complaints WHERE id = ?',
    [id],
    (err, complaint) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      // Get updates
      db.all(
        'SELECT * FROM updates WHERE complaintId = ? ORDER BY createdAt DESC',
        [id],
        (err, updates) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ ...complaint, updates: updates || [] });
        }
      );
    }
  );
});

// Update Complaint Status (Admin)
app.patch('/api/admin/complaints/:id', authenticateToken, checkAdminRole, (req, res) => {
  const { id } = req.params;
  const { status, assignedOfficer, message } = req.body;

  db.run(
    'UPDATE complaints SET status = ?, assignedOfficer = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
    [status, assignedOfficer || null, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update complaint' });
      }

      if (message) {
        db.run(
          'INSERT INTO updates (complaintId, message, updatedBy) VALUES (?, ?, ?)',
          [id, message, req.user.email]
        );
      }

      res.json({ message: 'Complaint updated successfully' });
    }
  );
});

// Serve favicon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

// Serve uploaded files
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);
  res.sendFile(filepath, (err) => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// Serve frontend (only for non-API routes)
app.get('*', (req, res, next) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
