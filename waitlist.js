// waitlist.js
// Saves customer email to a simple log (console/Netlify logs)
// In production you'd connect this to Mailchimp, Airtable, etc.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { email, name } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Email is required.' }),
      };
    }

    // Log to Netlify function logs (visible in your Netlify dashboard)
    console.log(`WAITLIST SIGNUP: ${name || 'Unknown'} — ${email} — ${new Date().toISOString()}`);

    // TODO: Connect to Mailchimp, Airtable, or your email provider here

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
