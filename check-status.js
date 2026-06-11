module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const siteOpen = process.env.SITE_OPEN !== 'false';
  const spotsTaken = parseInt(process.env.SPOTS_TAKEN || '0');
  const totalSpots = 5;

  return res.status(200).json({
    siteOpen,
    spotsTaken,
    totalSpots,
    spotsRemaining: totalSpots - spotsTaken,
  });
};
