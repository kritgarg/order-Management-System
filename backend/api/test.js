// Simple test API endpoint for Vercel
export default async function handler(req, res) {
  console.log('🧪 Test endpoint called');

  // CORS configuration for production
  const allowedOrigins = [
    'https://cs-frontend-rust.vercel.app',
    'http://localhost:3000', // for local development
    'http://localhost:5173'  // for Vite dev server
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    res.status(200).json({
      message: 'API test endpoint working!',
      timestamp: new Date().toISOString(),
      vercel: !!process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
      path: req.url,
      method: req.method
    });
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    res.status(500).json({
      message: 'Test endpoint error',
      error: error.message
    });
  }
}
