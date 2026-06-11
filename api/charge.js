const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  try {
    const { token, formData } = req.body;
    if (!token) return res.status(400).json({ success: false, error: 'No payment token provided.' });
    const charge = await stripe.charges.create({
      amount: 15500,
      currency: 'usd',
      source: token,
      description: `Car Search Fee - Royal Route Industries`,
      metadata: { name: formData.name || '', email: formData.email || '', phone: formData.phone || '', make: formData.make || '', budgetMin: formData.budgetMin || '', budgetMax: formData.budgetMax || '' },
      receipt_email: formData.email,
    });
    return res.status(200).json({ success: true, chargeId: charge.id });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
