import "dotenv/config";

// The server must never fall back to a guessable signing key: anyone who knows it can forge admin tokens.
const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 16) {
  throw new Error(
    "JWT_SECRET is missing or too short (min 16 chars). Set a long random value in backend/.env - see .env.example."
  );
}

export const JWT_SECRET: string = secret;
