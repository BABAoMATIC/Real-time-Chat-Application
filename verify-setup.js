#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Real-Time Chat App Setup...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'server.js',
  'client/package.json',
  'client/src/App.js',
  'client/src/index.js',
  'README.md'
];

let allFilesExist = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check package.json dependencies
console.log('\n📦 Checking backend dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['express', 'socket.io', 'cors', 'uuid'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('  ❌ Error reading package.json');
  allFilesExist = false;
}

// Check client dependencies
console.log('\n📦 Checking frontend dependencies:');
try {
  const clientPackageJson = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
  const requiredClientDeps = ['react', 'socket.io-client', '@mui/material'];
  
  requiredClientDeps.forEach(dep => {
    if (clientPackageJson.dependencies && clientPackageJson.dependencies[dep]) {
      console.log(`  ✅ ${dep}: ${clientPackageJson.dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('  ❌ Error reading client/package.json');
  allFilesExist = false;
}

// Check if node_modules exists
console.log('\n📚 Checking installations:');
if (fs.existsSync('node_modules')) {
  console.log('  ✅ Backend node_modules installed');
} else {
  console.log('  ❌ Backend node_modules missing - run "npm install"');
  allFilesExist = false;
}

if (fs.existsSync('client/node_modules')) {
  console.log('  ✅ Frontend node_modules installed');
} else {
  console.log('  ❌ Frontend node_modules missing - run "cd client && npm install"');
  allFilesExist = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 Setup verification PASSED!');
  console.log('\n🚀 Ready to start the application:');
  console.log('   ./start.sh');
  console.log('\n   OR manually:');
  console.log('   npm start (backend)');
  console.log('   cd client && npm start (frontend)');
  console.log('\n📱 Then visit: http://localhost:3000');
} else {
  console.log('❌ Setup verification FAILED!');
  console.log('\n🔧 Please fix the missing components above and run this script again.');
}
console.log('='.repeat(50));