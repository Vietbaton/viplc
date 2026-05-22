// worker.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/txmd5') {
      const res = await fetch('https://wtxmd52.tele68.com/v1/txmd5/sessions');
      const data = await res.json();
      const latest = data.list[0];
      const dices = latest.dices;
      
      const result = {
        phien: String(latest.id),
        xuc_xac_1: dices[0],
        xuc_xac_2: dices[1], 
        xuc_xac_3: dices[2],
        tong: latest.point,
        ket_qua: latest.resultTruyenThong === 'TAI' ? 'Tài' : 'Xỉu',
        md5_raw: `${latest.id}:abc123{${dices.join('-')}}x1`,
        update_at: new Date().toISOString(),
        betting_info: {
          phien_cuoc: latest.id + 1,
          trang_thai: "Đang cược"
        }
      };
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not found', { status: 404 });
  }
}
