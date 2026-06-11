module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    siteOpen: false,
    spotsTaken: 5,
    totalSpots: 5,
    spotsRemaining: 0,
  });
};

