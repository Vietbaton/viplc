const https = require("https");
const http = require("http");

const API_URL = "https://wtxmd52.tele68.com/v1/txmd5/sessions";
const PORT = process.env.PORT || 3000;

function fetchSessions() {
  return new Promise((resolve, reject) => {
    https
      .get(API_URL, (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          try { resolve(JSON.parse(data)); }
          catch (err) { reject(new Error("Lỗi parse JSON: " + err.message)); }
        });
      })
      .on("error", (err) => reject(new Error("Lỗi kết nối: " + err.message)));
  });
}

function buildOutput(data) {
  const list = data.list ?? [];
  const typeStat = data.typeStat ?? {};
  const tCount = typeStat.TAI ?? 0;
  const xCount = typeStat.XIU ?? 0;
  const total = tCount + xCount;
  const history = list.map((item) => ({
    id: item.id,
    result: item.resultTruyenThong,
    dices: item.dices,
    point: item.point,
  }));
  const accuracy = total > 0
    ? parseFloat(((Math.max(tCount, xCount) / total) * 100).toFixed(2))
    : null;
  return {
    history,
    stats: { total, tCount, xCount, accuracy, correctPredictions: Math.max(tCount, xCount), totalPredictions: total },
    total: list.length,
  };
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/" || req.url === "/sessions") {
    try {
      const raw = await fetchSessions();
      const output = buildOutput(raw);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(output, null, 2));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại port ${PORT}`);
});
