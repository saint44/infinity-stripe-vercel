api/create-payment-intent.js
// /api/create-payment-intent.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16"
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { amount, currency, customer_email, metadata } = req.body || {};
    if (!amount || !currency) {
      return res.status(400).json({ error: "amount and currency are required" });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      receipt_email: customer_email,
      metadata: metadata || {},
      automatic_payment_methods: { enabled: true }
    });
    res.json({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
