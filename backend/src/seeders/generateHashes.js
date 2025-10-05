const bcrypt = require('bcrypt');

async function generatePasswords() {
  console.log('🔐 Generating password hashes...\n');
  
  const passwords = [
    { username: 'superadmin', password: 'superadmin123' },
    { username: 'admin', password: 'admin123' },
    { username: 'panitia', password: 'panitia123' },
    { username: 'viewer', password: 'viewer123' }
  ];

  console.log('-- Password hashes for SQL insert:');
  console.log('INSERT INTO users (username, password, role, nama, email, status) VALUES');
  
  for (let i = 0; i < passwords.length; i++) {
    const { username, password } = passwords[i];
    const hash = await bcrypt.hash(password, 10);
    
    const roles = {
      'superadmin': 'super_admin',
      'admin': 'admin', 
      'panitia': 'moderator',
      'viewer': 'viewer'
    };
    
    const names = {
      'superadmin': 'Super Administrator',
      'admin': 'Administrator',
      'panitia': 'Panitia MUSDA', 
      'viewer': 'Viewer'
    };
    
    const email = `${username}@himperra.com`;
    const role = roles[username];
    const nama = names[username];
    
    const comma = i === passwords.length - 1 ? ';' : ',';
    
    console.log(`('${username}', '${hash}', '${role}', '${nama}', '${email}', 'active')${comma}`);
  }
  
  console.log('\n📋 Login credentials:');
  passwords.forEach(p => {
    console.log(`Username: ${p.username}, Password: ${p.password}`);
  });
}

generatePasswords();