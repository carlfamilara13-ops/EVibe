const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gtfsController');

router.get('/nearby', ctrl.nearby);
router.get('/route', ctrl.routeByNumber);
router.get('/route/:id/stops', ctrl.routeStops);
router.get('/stop/:id/routes', ctrl.stopRoutes);
router.get('/search', ctrl.search);
router.get('/commute', ctrl.commute);

module.exports = router;
