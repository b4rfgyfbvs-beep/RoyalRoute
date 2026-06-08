// admin-toggle.js
// Password-protected function to open/close the site and reset spots
// Calls Netlify API to update environment variables

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const { password, action, spotsTaken } = JSON.parse(event.body);

    // Check admin password
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || password !== adminPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid password.' }),
      };
    }

    // Use Netlify API to update env vars
    const siteId = process.env.SITE_ID;
    const netlifyToken = process.env.NETLIFY_API_TOKEN;

    if (!siteId || !netlifyToken) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'Missing SITE_ID or NETLIFY_API_TOKEN env vars.' }),
      };
    }

    let newEnvVars = {};

    if (action === 'open') {
      newEnvVars = { SITE_OPEN: 'true', SPOTS_TAKEN: '0' };
    } else if (action === 'close') {
      newEnvVars = { SITE_OPEN: 'false' };
    } else if (action === 'setSpots') {
      newEnvVars = { SPOTS_TAKEN: String(spotsTaken || 0) };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Unknown action.' }),
      };
    }

    // Patch each env var via Netlify API
    for (const [key, value] of Object.entries(newEnvVars)) {
      await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/env/${key}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${netlifyToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });
    }

    // Trigger a redeploy so env vars take effect
    await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/builds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${netlifyToken}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, action }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
