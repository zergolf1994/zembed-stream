"use strict";

const request = require("request");
const queryString = require("query-string");
const GoogleAuth = require(`./_GoogleAuth`);

module.exports = async (file) => {
  try {
    if (!file) return;

    const data = {};
    const url = `https://docs.google.com/get_video_info?docid=${file?.source}`;
    let headers = {};

    let token = await GoogleAuth.Rand({ userId: file?.uid });

    if (token) {
      headers.Authorization = `${token?.token_type} ${token?.access_token}`;
    }

    return new Promise(function (resolve, reject) {
      request(
        {
          url,
          proxy: "http://qjqkvcqd-rotate:72gpvbukvn4v@p.webshare.io:80",
          headers,
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            const parsed = queryString.parse(body);
            data.status = parsed.status;
            if (parsed.status == "ok") {
              data.title = parsed.title;
              if (parsed.fmt_stream_map) {
                const fmt_stream_map = parsed.fmt_stream_map.split(",");
                fmt_stream_map.forEach((k, i) => {
                  const [q, link] = k.split("|");
                  const size = q
                    .toString()
                    .replace(37, 1080)
                    .replace(22, 720)
                    .replace(59, 480)
                    .replace(18, 360);
                  if (link) {
                    data[size] = link;
                  }
                  /*if (size == 1080) {
                    data["1080"] = link;
                  }
                  if (size == 720) {
                    data[720] = link;
                  }
                  if (size == 480) {
                    data.file_480 = link;
                  }
                  if (size == 360) {
                    data.file_360 = link;
                  }*/
                });
              }
              data.cookie = JSON.stringify(response.headers["set-cookie"]);
              data.timestamp = Date.now();
            } else {
              data.error_code = parsed.errorcode;
              data.error_text = parsed.reason;
              //console.log(parsed)
            }
          } else {
            data.status = false;
          }
          resolve(data);
        }
      );
    });
  } catch (error) {
    console.error(error);
    return;
  }
};
