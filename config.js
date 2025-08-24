// /api/config.js
export default function handler(req, res) {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
  if (!key) {
    return res.status(500).json({ error: "Publishable key not set" });
  }
  res.json({ publishableKey: key });
}
