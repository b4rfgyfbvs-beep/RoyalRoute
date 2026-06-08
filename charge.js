const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { token, formData } = JSON.parse(event.body);

    // Check if site is open and spots available
    const siteOpen = process.env.SITE_OPEN !== 'false';
    const spotsTaken = parseInt(process.env.SPOTS_TAKEN || '0');

    if (!siteOpen || spotsTaken >= 5) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Sorry, we are fully booked right now.' }),
      };
    }

    // Charge the card
    const charge = await stripe.charges.create({
      amount: 15500,
      currency: 'usd',
      source: token,
      description: `Car Search Fee - ${formData.name}`,
      metadata: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        make: formData.make,
        model: formData.model || '',
        yearFrom: formData.yearFrom,
        yearTo: formData.yearTo,
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        mileage: formData.mileage || 'Not specified',
        transmission: formData.transmission || 'No preference',
        bodyStyle: formData.bodyStyle || 'No preference',
        color: formData.color || 'No preference',
        notes: formData.notes || 'None',
      },
      receipt_email: formData.email,
    });

    // Update spots count via Netlify API
    const newSpotsTaken = spotsTaken + 1;
    const siteId = process.env.SITE_ID;
    const netlifyToken = process.env.NETLIFY_API_TOKEN;

    if (siteId && netlifyToken) {
      // Update SPOTS_TAKEN
      await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/env/SPOTS_TAKEN`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${netlifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: String(newSpotsTaken) }),
      });

      // If fully booked, close the site
      if (newSpotsTaken >= 5) {
        await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/env/SITE_OPEN`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${netlifyToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value: 'false' }),
        });

        // Trigger redeploy
        await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/builds`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${netlifyToken}`, 'Content-Type': 'application/json' },
        });
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, chargeId: charge.id, spotsTaken: newSpotsTaken }),
    };

  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
