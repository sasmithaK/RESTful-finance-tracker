const express = require("express");
const router = express.Router();
const dashboardController = require("../controlers/dashboard.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/", verifyToken, dashboardController.getDashboard);

module.exports = router