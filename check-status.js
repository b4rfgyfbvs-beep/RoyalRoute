// check-status.js
// Returns whether the site is open and how many spots are taken
// Uses Netlify Blobs for persistent storage

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // We use environment variables set via admin function as simple storage
    // SITE_OPEN: "true" or "false"
    // SPOTS_TAKEN: "0" through "5"
    const siteOpen = process.env.SITE_OPEN !== 'false'; // default open
    const spotsTaken = parseInt(process.env.SPOTS_TAKEN || '0');
    const totalSpots = 5;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        siteOpen,
        spotsTaken,
        totalSpots,
        spotsRemaining: totalSpots - spotsTaken,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
