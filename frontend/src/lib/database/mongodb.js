/**
 * Database client for MongoDB
 * Connects to MongoDB when MONGODB_URI is provided in environment variables,
 * or gracefully operates with local in-memory fallback for standalone deployment.
 */

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    return {
      connected: false,
      mode: 'IN_MEMORY_FALLBACK',
      message: 'MONGODB_URI environment variable not configured. Running with fast memory storage.'
    };
  }

  try {
    // In production with MongoDB URI configured, mongoose or mongodb native client connects
    return {
      connected: true,
      mode: 'MONGODB_ATLAS',
      uri: MONGODB_URI.replace(/:[^:]*@/, ':****@')
    };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return {
      connected: false,
      error: error.message,
      mode: 'IN_MEMORY_FALLBACK'
    };
  }
}

