const storageService = require('../services/storageService');
const { getStatus } = require('../config/db');

// @desc    Get complete dashboard overview statistics
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await storageService.getDashboardStats();
    const dbStatus = getStatus();

    res.json({
      success: true,
      data: {
        ...stats,
        system: {
          database: dbStatus.mode,
          connected: dbStatus.connected,
          serverTime: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
