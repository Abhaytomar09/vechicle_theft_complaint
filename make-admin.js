const sqlite3 = require('sqlite3').verbose();
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const db = new sqlite3.Database('vehicle_theft.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
});

// List all users
function listUsers() {
  db.all('SELECT id, name, email, phone, role FROM users', [], (err, users) => {
    if (err) {
      console.error('Error fetching users:', err.message);
      rl.close();
      db.close();
      return;
    }

    if (users.length === 0) {
      console.log('\nNo users found in the database.');
      console.log('Please register a user first through the web interface.\n');
      rl.close();
      db.close();
      return;
    }

    console.log('\nCurrent Users:');
    console.log('─'.repeat(80));
    console.log('ID  | Name              | Email                    | Role');
    console.log('─'.repeat(80));
    users.forEach(user => {
      const roleBadge = user.role === 'admin' ? '⭐ ADMIN' : '👤 User';
      console.log(`${String(user.id).padEnd(3)} | ${user.name.padEnd(17)} | ${user.email.padEnd(23)} | ${roleBadge}`);
    });
    console.log('─'.repeat(80));

    makeAdminPrompt();
  });
}

function makeAdminPrompt() {
  rl.question('\nEnter the email of the user you want to make admin: ', (email) => {
    if (!email.trim()) {
      console.log('Email cannot be empty. Please try again.\n');
      makeAdminPrompt();
      return;
    }

    // Check if user exists
    db.get('SELECT id, name, email, role FROM users WHERE email = ?', [email.trim()], (err, user) => {
      if (err) {
        console.error('Error:', err.message);
        rl.close();
        db.close();
        return;
      }

      if (!user) {
        console.log(`\n❌ User with email "${email.trim()}" not found.`);
        rl.question('Would you like to try again? (y/n): ', (answer) => {
          if (answer.toLowerCase() === 'y') {
            makeAdminPrompt();
          } else {
            rl.close();
            db.close();
          }
        });
        return;
      }

      if (user.role === 'admin') {
        console.log(`\n✅ User "${user.name}" (${user.email}) is already an admin.`);
        rl.question('Would you like to make another user admin? (y/n): ', (answer) => {
          if (answer.toLowerCase() === 'y') {
            makeAdminPrompt();
          } else {
            rl.close();
            db.close();
          }
        });
        return;
      }

      // Update user to admin
      db.run(
        'UPDATE users SET role = ? WHERE email = ?',
        ['admin', email.trim()],
        function(err) {
          if (err) {
            console.error('Error updating user:', err.message);
            rl.close();
            db.close();
            return;
          }

          console.log(`\n✅ Success! User "${user.name}" (${user.email}) has been made an admin.`);
          console.log('\nThey can now:');
          console.log('  • Login with their regular credentials');
          console.log('  • Access the Admin Dashboard');
          console.log('  • View and manage all complaints');
          console.log('  • Update complaint statuses');
          console.log('  • Assign officers to cases\n');

          rl.question('Would you like to make another user admin? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y') {
              listUsers();
            } else {
              rl.close();
              db.close();
            }
          });
        }
      );
    });
  });
}

// Start
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║        Vehicle Theft System - Admin User Manager            ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

listUsers();
