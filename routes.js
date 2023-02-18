"use strict";

const express = require("express");
const router = express.Router();
const Control = require("./Controllers");

router.route("/:slug/:quality-:seg.(png|html)").get(Control.HLS);
//router.route("/:slug/:quality-m3u8").get(Control.M3U8Index);

router.all("*", async (req, res) => {
  res.status(404).end();
});

module.exports = router;
