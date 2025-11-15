# Vehicle Theft Complaint System

A full-featured web application for filing and managing vehicle theft complaints online. This system allows users to register, file complaints, upload supporting documents, and track their complaint status in real-time. Administrators can manage and update complaint statuses.

## Features

### User Features
- ✅ User Registration & Authentication (JWT-based)
- ✅ File Vehicle Theft Complaints with detailed information
- ✅ Upload supporting documents (photos, RC book, etc.)
- ✅ View and track complaint status
- ✅ Search and filter complaints
- ✅ Receive case updates
- ✅ Responsive, modern UI design

### Admin Features
- ✅ View all complaints
- ✅ Update complaint status (Pending, Under Investigation, Resolved, Closed)
- ✅ Assign officers to cases
- ✅ Add case updates
- ✅ Search and filter complaints

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database
- **JWT** - Authentication
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling (Modern, responsive design)
- **Vanilla JavaScript** - Client-side logic

## Project Structure

```
vechile_theft_system/
├── server.js              # Main server file
├── package.json           # Dependencies
├── README.md              # Documentation
├── .gitignore            # Git ignore file
├── vehicle_theft.db      # SQLite database (auto-generated)
├── uploads/              # Uploaded documents directory
└── public/               # Frontend files
    ├── index.html        # Main HTML file
    ├── styles.css        # Stylesheet
    └── app.js            # Client-side JavaScript
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=development
```

If you don't create a `.env` file, the default values will be used.

### Step 3: Start the Server

```bash
# Development mode (with auto-reload using nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Step 4: Access the Application

Open your web browser and navigate to:
```
http://localhost:3000
```

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User's full name
- `email` - Unique email address
- `phone` - Phone number
- `password` - Hashed password
- `role` - User role (user/admin)
- `createdAt` - Registration timestamp

### Complaints Table
- `id` - Primary key
- `userId` - Foreign key to users table
- `vehicleNumber` - Vehicle registration number
- `vehicleType` - Type of vehicle
- `vehicleModel` - Vehicle model
- `vehicleColor` - Vehicle color
- `theftDate` - Date and time of theft
- `theftLocation` - Location where theft occurred
- `description` - Additional description
- `complainantName` - Complainant's name
- `complainantPhone` - Complainant's phone
- `complainantEmail` - Complainant's email
- `complainantAddress` - Complainant's address
- `status` - Complaint status
- `assignedOfficer` - Assigned officer name
- `caseNumber` - Unique case number
- `documents` - Comma-separated document filenames
- `createdAt` - Complaint submission timestamp
- `updatedAt` - Last update timestamp

### Updates Table
- `id` - Primary key
- `complaintId` - Foreign key to complaints table
- `message` - Update message
- `updatedBy` - Who made the update
- `createdAt` - Update timestamp

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/me` - Get current user (requires authentication)

### Complaints (User)
- `POST /api/complaints` - Submit a new complaint (requires authentication)
- `GET /api/complaints` - Get user's complaints (requires authentication)
  - Query params: `status`, `search`
- `GET /api/complaints/:id` - Get single complaint details (requires authentication)

### Complaints (Admin)
- `GET /api/admin/complaints` - Get all complaints (requires admin role)
  - Query params: `status`, `search`
- `PATCH /api/admin/complaints/:id` - Update complaint status (requires admin role)

### File Access
- `GET /uploads/:filename` - Access uploaded files

## Usage Guide

### For Users

1. **Register/Login**
   - Click "Register" to create a new account
   - Fill in your details and create a password
   - Or click "Login" if you already have an account

2. **File a Complaint**
   - Click "File Complaint" in the navigation
   - Fill in all required vehicle information
   - Enter theft details (date, location)
   - Provide your contact information
   - Upload supporting documents (optional)
   - Submit the form

3. **Track Your Complaint**
   - Go to "Dashboard" to view all your complaints
   - Use search to find specific cases
   - Filter by status
   - Click "View Details" to see full information and updates

### For Administrators

1. **Access Admin Dashboard**
   - Login with an admin account
   - Click "Admin" in the navigation

2. **Manage Complaints**
   - View all submitted complaints
   - Search and filter complaints
   - Click "Update Status" on any complaint
   - Change status, assign officer, and add update message
   - View detailed complaint information

## Creating an Admin User

To create an admin user, you can manually update the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Or modify the registration endpoint in `server.js` to assign admin role based on specific criteria.

## File Upload

- Maximum file size: 10MB per file
- Maximum files per complaint: 5 files
- Allowed file types: Images (JPEG, JPG, PNG, GIF), Documents (PDF, DOC, DOCX)
- Uploaded files are stored in the `uploads/` directory

## Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- File type validation
- File size limits
- SQL injection protection (parameterized queries)
- CORS enabled

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, change the `PORT` in your `.env` file.

### Database Errors
The database file is auto-generated on first run. If you encounter database errors:
1. Delete `vehicle_theft.db` file
2. Restart the server to recreate the database

### File Upload Issues
Ensure the `uploads/` directory exists and has write permissions.

## Future Enhancements

- Email notifications for status updates
- SMS notifications
- Police station integration
- Advanced reporting and analytics
- Mobile app
- Multi-language support
- Print complaint receipt
- Export complaints to PDF/Excel

## Deployment

This application cannot be hosted on GitHub Pages (it requires a Node.js backend).

**Quick Deployment Options:**

1. **Render** (Recommended - Free): See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions
2. **Railway**: Easy deployment with GitHub integration
3. **Heroku**: Popular platform (paid)
4. **Vercel**: Great for Node.js apps (free tier)

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Deploy to Render

1. Push your code to GitHub
2. Sign up at [Render.com](https://render.com)
3. Create a new Web Service
4. Connect your GitHub repository
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variables:
   - `JWT_SECRET` (your secret key)
   - `NODE_ENV=production`
8. Deploy!

## License

ISC

## Support

For issues or questions, please open an issue in the repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Deployment Status

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

To deploy using the button above:
1. Click the button
2. Sign up/login to Render
3. Follow the setup wizard
4. Your app will be deployed automatically!
