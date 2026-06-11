const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { token, formData } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, error: 'No payment token provided.' });
    }

    const charge = await stripe.charges.create({
      amount: 15500,
      currency: 'usd',
      source: token,
      description: `Car Search Fee - ${formData.name}`,
      metadata: {
        name: formData.name || '',
        email: formData.email || '',
        phone: formData.phone || '',
        make: formData.make || '',
        model: formData.model || '',
        yearFrom: formData.yearFrom || '',
        yearTo: formData.yearTo || '',
        budgetMin: formData.budgetMin || '',
        budgetMax: formData.budgetMax || '',
        mileage: formData.mileage || 'Not specified',
        transmission: formData.transmission || 'No preference',
        bodyStyle: formData.bodyStyle || 'No preference',
        color: formData.color || 'No preference',
        notes: formData.notes || 'None',
        searchType: formData.searchType || 'Not specified',
      },
      receipt_email: formData.email,
    });

    return res.status(200).json({ success: true, chargeId: charge.id });

  } catch (error) {
    console.error('Stripe charge error:', error.message);
    return res.status(400).json({ success: false, error: error.message });
  }
};
