"use strict";
const parser = require("ua-parser-js");

module.exports = async (req, res) => {
  const client_ip =
    req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

  const ua = parser(req.headers["user-agent"]);

  const data = {
    os_name: ua?.os?.name,
    os_version: ua?.os?.version,
    bs_name: ua?.browser?.name,
    bs_version: ua?.browser?.version,
    bs_major: ua?.browser?.major,
    client_ip: client_ip,
    user_agent: ua?.ua,
  };

  return data;
};
