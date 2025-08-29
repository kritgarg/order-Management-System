// Environment configuration
const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'https://order-management-system-backend-amber.vercel.app/api',
  
  // Environment
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.DEV || false,
  IS_PROD: import.meta.env.PROD || false,
  
  // Debug info
  DEBUG: import.meta.env.DEV || false,
};

// Log configuration in development
if (config.DEBUG) {
  console.log('🔧 Environment Configuration:', {
    API_URL: config.API_URL,
    NODE_ENV: config.NODE_ENV,
    IS_DEV: config.IS_DEV,
    IS_PROD: config.IS_PROD,
  });
}

export default config;
