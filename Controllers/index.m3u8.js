const path = require("path");
const fs = require("fs-extra");
const request = require("request");
const os = require("os");

const { Files, Storage } = require(`../Models`);

module.exports = async (req, res) => {
  try {
    const { slug, quality } = req.params;
    if (!slug) return res.status(404).end();
    let storageDir = path.join(global.dir, ".storage"),
      storageFile = path.join(storageDir, `${slug}-${quality}`),
      cacheDir = path.join(global.dir, ".cache", slug),
      cacheFile = path.join(cacheDir, `${quality}`),
      sv_ip;

    if (!fs.existsSync(storageFile)) {
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir);
      }
      let file = await Files.Lists.findOne({
        where: {
          slug,
        },
        attributes: ["id"],
        include: [
          {
            model: Files.Videos,
            as: "videos",
            attributes: ["storageId"],
            where: {
              quality,
              active: 1,
            },
            required: true,
          },
        ],
      });

      if (!file) return res.status(404).end();

      let storageId = file?.videos[0]?.storageId;

      let storage = await Storage.Lists.findOne({
        where: {
          id: storageId,
        },
        attributes: ["sv_ip"],
      });

      if (!storage) return res.status(404).end();

      sv_ip = storage?.sv_ip;
      fs.writeFileSync(storageFile, JSON.stringify(storage), "utf8");
    } else {
      let file_read = fs.readFileSync(storageFile, "utf8");
      let storage = JSON.parse(file_read);
      sv_ip = storage?.sv_ip;
    }

    const url = `http://${sv_ip}:8889/hls/${slug}/file_${quality}.mp4/index.m3u8`;
    let data = await getRequest(url);
    let m3u8 = await M3U8({ data, slug, quality });

    return res.status(200).end(m3u8);
  } catch (error) {
    console.log(error);
    return res.status(403).end();
  }
};
function M3U8({ data, slug, quality }) {
  try {
    return new Promise(function (resolve, reject) {
      const array = [];
      data.forEach((k, i) => {
        if (isNaN(k)) {
          if (!k.match(/EXT-X-MAP:URI=(.*?)-/gm)) {
            array.push(k);
          }
        } else {
          array.push(`//localhost/${slug}/${quality}-${k}.png`);
        }
      });
      resolve(array.join(os.EOL));
    });
  } catch (error) {
    return;
  }
}
function getRequest(url) {
  try {
    return new Promise(function (resolve, reject) {
      request(url, function (err, response, body) {
        const array = [],
          html = body.split(/\r?\n/),
          regex = /seg-(.*?)-/gm;

        html.forEach((k, i) => {
          if (k.match(regex)) {
            let nameitem = k.match(regex);
            let numitem = nameitem
              .toString()
              .replace("seg-", "")
              .replace("-", "")
              .replace(".ts", "")
              .replace("-v1", "")
              .replace("-a1", "");
            array.push(numitem);
          } else {
            if (k) {
              array.push(k.trim());
            }
          }
        });

        resolve(array);
      });
    });
  } catch (error) {
    return;
  }
}
