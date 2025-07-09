#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🛒 Shop Buddy Setup Script');
console.log('==========================\n');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function setup() {
  console.log('This script will help you set up your Shop Buddy application.\n');
  
  // Check if .env already exists
  if (fs.existsSync('.env')) {
    console.log('⚠️  .env file already exists!');
    const overwrite = await question('Do you want to overwrite it? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  console.log('Please provide your API keys:\n');
  
  // Get OpenAI API key
  const openaiKey = await question('Enter your OpenAI API key: ');
  if (!openaiKey.trim()) {
    console.log('❌ OpenAI API key is required!');
    rl.close();
    return;
  }
  
  // Get SerpAPI key
  const serpKey = await question('Enter your SerpAPI key: ');
  if (!serpKey.trim()) {
    console.log('❌ SerpAPI key is required!');
    rl.close();
    return;
  }
  
  // Get port (optional)
  const port = await question('Enter server port (default: 5000): ') || '5000';
  
  // Create .env file
  const envContent = `# OpenAI API Configuration
OPENAI_API_KEY=${openaiKey}

# SerpAPI Configuration
SERPAPI_KEY=${serpKey}

# Server Configuration
PORT=${port}
`;
  
  try {
    fs.writeFileSync('.env', envContent);
    console.log('\n✅ .env file created successfully!');
    console.log('\nNext steps:');
    console.log('1. Run "npm install" to install backend dependencies');
    console.log('2. Run "cd client && npm install" to install frontend dependencies');
    console.log('3. Run "npm run dev" to start the application');
    console.log('\nYour application will be available at:');
    console.log('- Frontend: http://localhost:3000');
    console.log(`- Backend: http://localhost:${port}`);
    
  } catch (error) {
    console.log('❌ Error creating .env file:', error.message);
  }
  
  rl.close();
}

setup(); 