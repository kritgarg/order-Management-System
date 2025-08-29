const fs = require('fs');
const path = require('path');

const envContent = `# API Configuration
VITE_API_URL=https://order-management-system-backend-amber.vercel.app/api

# Development (uncomment for local development)
# VITE_API_URL=http://localhost:3000/api
`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully at:', envPath);
  console.log('📝 Content:');
  console.log(envContent);
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
}
