import { supabaseAdmin } from '../services/supabaseClient.js';

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export async function requireSupabaseAuth(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token.' });
    }

    // Allow guest users in non-production environments
    if (process.env.NODE_ENV !== 'production' && token === 'mock-guest-token') {
      req.supabaseUser = {
        id: 'guest_user',
        email: 'guest@example.com',
        role: 'authenticated',
        tokenPayload: { sub: 'guest_user' },
      };
      return next();
    }

    // Use Supabase's own API to verify the token (supports both HS256 and ES256)
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase is not configured on the server.' });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      console.log('[AUTH] Supabase token verification failed:', error?.message || 'No user returned');
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }

    req.supabaseUser = {
      id: data.user.id,
      email: data.user.email || null,
      role: data.user.role || 'authenticated',
      tokenPayload: { sub: data.user.id },
    };

    return next();
  } catch (error) {
    console.log('[AUTH] Unexpected auth error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}
