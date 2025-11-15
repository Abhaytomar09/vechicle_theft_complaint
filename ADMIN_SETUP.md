# Admin Login Setup Guide

This guide explains how to create an admin user and access the admin dashboard.

## Method 1: Using the Admin Script (Recommended)

1. **First, register a regular user** through the web interface:
   - Go to `http://localhost:3000`
   - Click "Register"
   - Fill in your details and create an account

2. **Run the admin script** to make that user an admin:
   ```bash
   node make-admin.js
   ```

3. **Follow the prompts**:
   - The script will show all users
   - Enter the email of the user you want to make admin
   - The user will be upgraded to admin role

4. **Login as admin**:
   - Go to the login page
   - Use the same email and password you registered with
   - After login, you'll see an "Admin" link in the navigation
   - Click "Admin" to access the admin dashboard

## Method 2: Manual Database Update

If you prefer to update the database manually:

1. **Install SQLite CLI** (if not already installed)

2. **Open the database**:
   ```bash
   sqlite3 vehicle_theft.db
   ```

3. **View all users**:
   ```sql
   SELECT id, name, email, role FROM users;
   ```

4. **Update a user to admin** (replace email with actual email):
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

5. **Verify the update**:
   ```sql
   SELECT id, name, email, role FROM users WHERE email = 'your-email@example.com';
   ```

6. **Exit SQLite**:
   ```sql
   .exit
   ```

7. **Login** with that user's credentials on the web interface

## Admin Features

Once logged in as an admin, you can:

- ✅ View all complaints from all users
- ✅ Search and filter complaints
- ✅ Update complaint status (Pending, Under Investigation, Resolved, Closed)
- ✅ Assign officers to cases
- ✅ Add case updates/notes
- ✅ View detailed complaint information with all updates

## Multiple Admins

You can create multiple admin users by running the script multiple times or updating multiple users in the database.

## Troubleshooting

**Q: I don't see the Admin link after login**
- Make sure you updated the user's role to 'admin' in the database
- Try logging out and logging back in
- Clear your browser cache/localStorage

**Q: I get "Access denied" when accessing admin endpoints**
- The JWT token might have the old role. Logout and login again
- Verify the role in database: `SELECT email, role FROM users WHERE email = 'your-email@example.com';`

**Q: I can't find the database file**
- The database is created automatically when you first start the server
- Look for `vehicle_theft.db` in the project root directory
- If it doesn't exist, start the server once: `npm start`

## Security Note

⚠️ **Important**: In production, you should:
- Use a more secure method to create admins (e.g., environment variable, admin setup endpoint with special key)
- Never expose the database file publicly
- Consider adding email verification for admin accounts
