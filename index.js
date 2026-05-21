const https = require("https");

const API_URL = "https://wtxmd52.tele68.com/v1/txmd5/sessions";

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

  // Lấy lịch sử: chỉ giữ các trường cần thiết
  const history = list.map((item) => ({
    id: item.id,
    result: item.resultTruyenThong,
    dices: item.dices,
    point: item.point,
  }));

  // Tính accuracy dựa trên tỉ lệ TAI/XIU
  const accuracy = total > 0
    ? parseFloat(((Math.max(tCount, xCount) / total) * 100).toFixed(2))
    : null;

  return {
    history,
    stats: {
      total,
      tCount,
      xCount,
      accuracy,
      correctPredictions: Math.max(tCount, xCount),
      totalPredictions: total,
    },
    total: list.length,
  };
}

async function main() {
  try {
    console.log("Đang tải dữ liệu từ API...\n");
    const raw = await fetchSessions();
    const output = buildOutput(raw);
    console.log("=== Tạo bàn in đẹp ✅ ===\n");
    console.log(JSON.stringify(output, null, 2));
  } catch (err) {
    console.error("❌ Lỗi:", err.message);
    process.exit(1);
  }
}

main();
