const path = require("path");
const fs = require("fs-extra");
const request = require("request");

const { Files, Storages } = require(`../Models`);

module.exports = async (req, res) => {
  try {
    const { slug, quality, seg } = req.params;
    const ext = req.params[0];
    if (!slug || !quality || !seg) return res.status(404).end();

    let storageDir = path.join(global.dir, ".storage"),
      storageFile = path.join(storageDir, `${slug}-${quality}`),
      cacheDir = path.join(global.dir, ".cache", slug),
      cacheFile = path.join(cacheDir, `${quality}-${seg}`),
      data = {};

    if (!fs.existsSync(storageFile)) {
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      let file = await Files.Lists.findOne({
        where: {
          slug,
        },
        attributes: ["id"],
        include: [
          {
            model: Files.Datas,
            as: "datas",
            where: {
              active: 1,
              type: "video",
              name: quality,
            },
            required: true,
          },
        ],
      });

      if (!file) return res.status(404).end();


      const video = file?.datas[0];
      let storageId = video?.storageId;
      
      let storage = await Storages.Lists.findOne({
        where: {
          id: storageId,
        },
        attributes: ["sv_ip"],
      });

      if (!storage) return res.status(404).end();

      data.sv_ip = storage?.sv_ip
      data.file_name = video?.value;
      
      fs.writeFileSync(storageFile, JSON.stringify(data), "utf8");
    } else {
      let file_read = fs.readFileSync(storageFile, "utf8");
      let storage = JSON.parse(file_read);
      data.sv_ip = storage?.sv_ip
      data.file_name = storage?.file_name;
    }

    /*if (fs.existsSync(cacheFile)) {
      let cache = fs.readFileSync(cacheFile);
      res.set("Content-Type", ext == "html" ? "text/html" : `image/${ext}`);
      res.set("Cache-control", "public, max-age=31536000");
      res.set("CDN-Cache", "HIT");
      return res.status(200).end(cache);
    }*/

    const url = `http://${data.sv_ip}:8889/hls/${slug}/${data.file_name}/seg-${seg}-v1-a1.ts`;

    let buffers = [];
    let length = 0;
    request({ url }, (err, resp, body) => {})
      .on("response", function (res) {
        res.headers["content-type"] =
          ext == "html" ? "text/html" : `image/${ext}`;
        res.headers["Cache-control"] = "public, max-age=31536000";
      })
      /*.on("data", function (chunk) {
        length += chunk.length;
        buffers.push(chunk);
      })
      .on("end", function () {
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }
        if (!fs.existsSync(cacheFile)) {
          fs.writeFileSync(cacheFile, Buffer.concat(buffers), "utf8");
        }
      })*/
      .pipe(res);
  } catch (error) {
    return res.status(403).end();
  }
};
