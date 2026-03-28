/** Must match the secret used when signing tokens in UserController. */
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn(
    '[auth] JWT_SECRET is not set. Tokens use a default secret — set JWT_SECRET on your host for security.'
  );
}

module.exports = { JWT_SECRET };
