"use strict";

module.exports = {
  Generate: require("./_Generate"),
  UserAgent: require("./_User_Agent"),
  AuthJwt: require("./_AuthJwt"),
  Alert: require("./_Alert"),
  AllowSource: require("./_Allow_Source"),
  Pagination: require("./_Pagination"),
  Get_Settings: require("./_Get_Settings"),
  Google: {
    Drive: require("./gg_gds"),
    Auth: require("./_GoogleAuth"),
  },
  Proxy: {
    Google: require("./_Proxy_Google"),
    Cache: require("./_Proxy_Cache"),
  },
};
