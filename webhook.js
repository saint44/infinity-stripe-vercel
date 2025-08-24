// /api/webhook.js
import Stripe from "stripe";

// Raw body is required for webhook verification on Vercel
export const config = {
  api: {
    bodyParser: false
  }
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        console.log("✅ Payment succeeded:", pi.id);
        // TODO: call your Infinity agent or internal API here
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        console.warn("❌ Payment failed:", pi.id);
        break;
      }
      case "charge.succeeded": {
        const charge = event.data.object;
        console.log("💸 Charge captured:", charge.id);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    res.status(500).send("Webhook handler error");
  }
}
