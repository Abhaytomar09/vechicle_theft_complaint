const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('vehicle_theft.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
  
  createAdminUser();
});

async function createAdminUser() {
  const email = 'admin@gmail.com';
  const password = 'admin123';
  const name = 'Admin User';
  const phone = '0000000000';
  
  try {
    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Error checking user:', err.message);
        db.close();
        process.exit(1);
      }
      
      if (user) {
        // User exists, update to admin if not already
        if (user.role !== 'admin') {
          db.run('UPDATE users SET role = ? WHERE email = ?', ['admin', email], function(err) {
            if (err) {
              console.error('Error updating user to admin:', err.message);
              db.close();
              process.exit(1);
            }
            console.log('✅ Admin user updated successfully!');
            console.log('\nAdmin Login Credentials:');
            console.log('─'.repeat(50));
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            console.log('─'.repeat(50));
            console.log('\nYou can now login at: http://localhost:3000');
            db.close();
          });
        } else {
          // Check if password needs to be updated
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) {
            // Update password
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email], function(err) {
              if (err) {
                console.error('Error updating password:', err.message);
                db.close();
                process.exit(1);
              }
              console.log('✅ Admin user already exists. Password updated!');
              console.log('\nAdmin Login Credentials:');
              console.log('─'.repeat(50));
              console.log(`Email: ${email}`);
              console.log(`Password: ${password}`);
              console.log('─'.repeat(50));
              console.log('\nYou can now login at: http://localhost:3000');
              db.close();
            });
          } else {
            console.log('✅ Admin user already exists with correct credentials!');
            console.log('\nAdmin Login Credentials:');
            console.log('─'.repeat(50));
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            console.log('─'.repeat(50));
            console.log('\nYou can now login at: http://localhost:3000');
            db.close();
          }
        }
      } else {
        // User doesn't exist, create admin user
        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(
          'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
          [name, email, phone, hashedPassword, 'admin'],
          function(err) {
            if (err) {
              console.error('Error creating admin user:', err.message);
              db.close();
              process.exit(1);
            }
            
            console.log('✅ Admin user created successfully!');
            console.log('\nAdmin Login Credentials:');
            console.log('─'.repeat(50));
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            console.log('─'.repeat(50));
            console.log('\nYou can now login at: http://localhost:3000');
            console.log('\nAfter login, you will see an "Admin" link in the navigation.');
            db.close();
          }
        );
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    db.close();
    process.exit(1);
  }
}
