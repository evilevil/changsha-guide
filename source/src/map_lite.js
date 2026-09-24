/* ===== 高德交互地图（轻量自研瓦片引擎，0 依赖） =====
 * 底图：高德地图瓦片（GCJ-02，与高德 POI 坐标同源，可直接对齐）
 * 离线：自动降级为按真实经纬度投影的示意底图
 * 特性：拖动 / 缩放 / 每日动线 / 标记详情 / 一键唤起高德导航
 */
(function () {
  'use strict';

  /* ---------- 数据（坐标 / 评分 / 营业时间来自高德开放平台，抓取于 2026-09-24）---------- */
  var HOTEL = { lng: 112.978399, lat: 28.239178 };

  var POIS = [
    { id: 'hotel', name: '长沙北辰洲际酒店', lng: 112.978399, lat: 28.239178, cat: 'stay', days: [1,2,3,4,5], addr: '开福区湘江北路三段1500号', note: '全程基地 · 楼下北辰荟有茶颜', poiId: 'B0FFGQP33G', km: 0, min: 0 },
    { id: 'southstation', name: '长沙南站', lng: 113.065510, lat: 28.147093, cat: 'transit', days: [1,5], addr: '雨花区 · 高铁到站/返程', note: '11:50 抵达（以你的车次为准）', km: 20.7, min: 36 },
    { id: 'beichenhui', name: '长沙北辰荟', lng: 112.979240, lat: 28.237722, cat: 'shop', days: [1,5], addr: '湘江大道1500号', rating: '4.7', hours: '10:00–22:00', note: '茶颜悦色 4F · 罗马广场中庭', poiId: 'B0FFMDXAX3', km: 0.3, min: 3 },
    { id: 'binjiang', name: '滨江文化园（三馆一厅）', lng: 112.981392, lat: 28.240778, cat: 'spot', days: [1], addr: '北辰三角洲 · 酒店步行可达', rating: '4.7', note: '景观塔、江景步道；黄昏逆光最好', km: 0.5, min: 5 },
    { id: 'csmuseum', name: '长沙博物馆', lng: 112.980748, lat: 28.241940, cat: 'spot', days: [1,2], addr: '栖凤路与湘江北路交汇西南150米', rating: '4.6', note: '室内备选：下雨/太热就进这里', poiId: 'B0FFFH94ZB', km: 0.6, min: 5 },
    { id: 'bayifen', name: '八一桥原味粉馆（湘雅店）', lng: 112.979501, lat: 28.214181, cat: 'food', days: [1,2,3], addr: '湘雅路212号凯达园', rating: '4.4', hours: '06:00–21:00', cost: '¥14', note: '本地米粉 · 刚下车先嗦一碗', poiId: 'B0IUCC20J7', km: 2.9, min: 8 },
    { id: 'museum', name: '湖南博物院（马王堆）', lng: 112.993499, lat: 28.211876, cat: 'spot', days: [2], addr: '东风路50号', rating: '4.9', hours: '周二至周日 09:00–17:00（国庆 09:00–20:00，最晚入馆19:00）', note: '必做主线 · 需预约 · 只看镇馆', poiId: 'B02DB00018', km: 5.4, min: 16 },
    { id: 'lieshi', name: '湖南烈士公园', lng: 112.996432, lat: 28.209521, cat: 'spot', days: [2], addr: '东风路22号', rating: '4.8', hours: '06:30–22:00', note: '省博出来就是 · 情侣慢走首选', km: 5.7, min: 17 },
    { id: 'ganchangshun', name: '甘长顺（总店）', lng: 112.982982, lat: 28.191581, cat: 'food', days: [2,4], addr: '解放西路136号蓝色地标106室', rating: '4.4', hours: '06:00–02:00', cost: '¥20', note: '长沙人自己吃的粉面', poiId: 'B02DB04DWN', km: 7.2, min: 18 },
    { id: 'yangyuxing', name: '杨裕兴（中山路店）', lng: 112.974334, lat: 28.200551, cat: 'food', days: [2], addr: '中山路347号', rating: '4.4', hours: '06:00–02:00', cost: '¥24', note: '百年粉面老字号 · 与甘长顺二选一', poiId: 'B0HDFCH97Y', km: 5.0, min: 14 },
    { id: 'yuloudong', name: '玉楼东（北正街旗舰店）', lng: 112.975040, lat: 28.200828, cat: 'food', days: [2,4], addr: '北正街32–40号', rating: '4.7', hours: '11:00–14:00 / 17:00–21:00', cost: '¥41', note: '坐下来正经吃一顿湘菜', poiId: 'B0FFL6OU59', km: 5.2, min: 15 },
    { id: 'ifs', name: 'IFS 国金购物中心', lng: 112.978724, lat: 28.192460, cat: 'shop', days: [2], addr: '解放西路188号（五一广场地铁站旁）', rating: '4.9', hours: '10:00–22:00', note: '可跳过 · 空调休息有用', poiId: 'B0HAK9J7KY', km: 6.6, min: 17 },
    { id: 'juzizhou', name: '橘子洲头', lng: 112.962069, lat: 28.186830, cat: 'spot', days: [3], addr: '橘子洲头2号（地铁橘子洲·青莲）', rating: '4.8', hours: '07:00–22:00', note: '必坐观光车/小火车，勿走穿 · 2h 封顶', poiId: 'B0G3AACD5T', km: 8.2, min: 22 },
    { id: 'yuelu', name: '岳麓书院', lng: 112.940805, lat: 28.180397, cat: 'spot', days: [3], addr: '麓山路273号', rating: '4.8', hours: '07:50–17:00（夏令时至17:30）', note: '只走平路，禁止连爬岳麓山', poiId: 'B02DB05TQH', km: 11.0, min: 24 },
    { id: 'xiangqun', name: '向群锅饺（南门口店）', lng: 112.975654, lat: 28.180922, cat: 'food', days: [3], addr: '黄兴南路95号（南门口地铁站2号口步行280米）', rating: '3.9', hours: '07:00–02:00', cost: '¥16', note: '锅饺+拌粉，长沙早餐代表', poiId: 'B0FFF5R5S4', km: 8.4, min: 22 },
    { id: 'wenheyou', name: '超级文和友（海信广场）', lng: 112.969660, lat: 28.189065, cat: 'food', days: [4], addr: '湘江中路36号海信广场1–6层', rating: '4.8', hours: '11:00–02:00', cost: '¥88', note: '队 ≤40min 才进，否则换黄娭毑', poiId: 'B0FFJ0SCDN', km: 7.2, min: 19 },
    { id: 'benluobo', name: '笨罗卜浏阳菜馆（育英街店）', lng: 112.977668, lat: 28.190549, cat: 'food', days: [4], addr: '育英街14号（黄兴铜像附近）', rating: '4.7', hours: '10:20–23:00', cost: '¥50', note: '醋蒸鸡 + 酸菜炒粉皮 · 勿去太平街店', poiId: 'B02DB0VZSW', km: 7.6, min: 19 },
    { id: 'huangayi', name: '黄娭毑口味小龙虾', lng: 112.980947, lat: 28.185641, cat: 'food', days: [4], addr: '高正街54号', rating: '4.6', hours: '12:00–04:00', cost: '¥81', note: '吃日主线 · 虾后配清汤面', poiId: 'B0KA9CKMCV', km: 7.6, min: 19 },
    { id: 'xiezilong', name: '谢子龙影像艺术馆', lng: 112.946265, lat: 28.118255, cat: 'art', days: [5], addr: '潇湘南路一段387号', rating: '4.5', note: '返程日体力好时替换天心阁', poiId: 'B0FFH6RJ8K', km: 16.0, min: 29 },
    { id: 'lizijian', name: '李自健美术馆', lng: 112.949264, lat: 28.118959, cat: 'art', days: [5], addr: '潇湘南路一段385号', rating: '4.9', hours: '周二至周日 09:30–17:30（周一闭馆）', note: '与谢子龙同一片区，可一起看', poiId: 'B0FFGXMQDC', km: 16.0, min: 29 },
    { id: 'tianxin', name: '天心阁', lng: 112.981861, lat: 28.184754, cat: 'skip', days: [5], addr: '天心路17号', rating: '4.6', hours: '日场 08:00–18:00 · 夜场 18:30–00:15', note: '默认跳过：登楼型「来都来了」景点', poiId: 'B02DB03ZUX', km: 7.7, min: 19, avoid: true }
  ];

  var AVOID = [
    { id: 'avoid_pozi', name: '坡子街（整条）', lng: 112.971986, lat: 28.190577, cat: 'skip', days: [], avoid: true, addr: '天心区 · 与黄兴广场地铁站相邻', note: '游客密度高、踩雷店多、性价比不稳；微博避雷贴约 28 次。改去黄娭毑（高正街）/ 玉楼东 / 甘长顺。', poiId: 'B0FFM8QTV4' }
  ];

  var DAYS = [
    { d: 1, label: 'D1 抵达·滨江', order: ['southstation','hotel','bayifen','binjiang','csmuseum','beichenhui'] },
    { d: 2, label: 'D2 省博·烈士公园', order: ['hotel','museum','lieshi','ganchangshun','yuloudong','ifs'] },
    { d: 3, label: 'D3 橘子洲·岳麓', order: ['hotel','xiangqun','juzizhou','yuelu'] },
    { d: 4, label: 'D4 本地馆子日', order: ['hotel','wenheyou','huangayi','benluobo'] },
    { d: 5, label: 'D5 收尾·返杭', order: ['hotel','xiezilong','lizijian','southstation'] }
  ];

  var CAT = {
    stay:    { c: '#f97316', t: '住宿' },
    spot:    { c: '#10b981', t: '景点' },
    food:    { c: '#ef4444', t: '吃饭' },
    shop:    { c: '#8b5cf6', t: '商场' },
    art:     { c: '#06b6d4', t: '美术馆' },
    transit: { c: '#3b82f6', t: '车站' },
    skip:    { c: '#78716c', t: '默认跳过' }
  };

  var TILE = 256, MINZ = 10, MAXZ = 17;
  var TPL_ROAD = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';
  var TPL_SAT  = 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';

  function navUrl(p) {
    return 'https://uri.amap.com/navigation?to=' + p.lng + ',' + p.lat + ',' + encodeURIComponent(p.name) +
           '&mode=car&policy=1&src=changshaGuide&coordinate=gaode&callnative=1';
  }
  function detailUrl(p) {
    return p.poiId ? 'https://ditu.amap.com/place/' + p.poiId
                   : 'https://uri.amap.com/marker?position=' + p.lng + ',' + p.lat + '&name=' + encodeURIComponent(p.name) + '&coordinate=gaode&callnative=1';
  }

  /* ---------- Web Mercator（与高德瓦片同坐标系）---------- */
  var R2D = 180 / Math.PI;
  function lngX(lng, z) { return (lng + 180) / 360 * TILE * Math.pow(2, z); }
  function latY(lat, z) {
    var s = Math.sin(lat * Math.PI / 180);
    return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE * Math.pow(2, z);
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* ---------- 地图引擎 ---------- */
  function MapLite(root) {
    this.root = root;
    this.z = 13;
    this.cx = 0; this.cy = 0;          // 视图中心（世界像素）
    this.tiles = {};                   // key -> img
    this.markers = {};
    this.lines = [];
    this.offline = false;
    this.tileErr = 0;
    this.tileOk = 0;
    this.sat = false;
    this.visible = [];
    this.activeDay = 'all';
    this.popupTarget = null;

    this.layerTiles = el('div', 'gl-tiles');
    this.layerSch = el('div', 'gl-sch');
    this.layerLine = el('div', 'gl-lines');
    this.layerPin = el('div', 'gl-pins');
    root.appendChild(this.layerSch);
    root.appendChild(this.layerTiles);
    root.appendChild(this.layerLine);
    root.appendChild(this.layerPin);

    this.popup = el('div', 'gl-pop');
    this.popup.hidden = true;
    root.appendChild(this.popup);

    this.buildSchematic();
    this.bindInteractions();
    this.resize();
  }

  MapLite.prototype.size = function () {
    return { w: this.root.clientWidth, h: this.root.clientHeight };
  };
  MapLite.prototype.resize = function () { this.render(); };

  /* 屏幕坐标 -> 世界像素 */
  MapLite.prototype.sx = function (lng) { return lngX(lng, this.z); };
  MapLite.prototype.sy = function (lat) { return latY(lat, this.z); };
  MapLite.prototype.originX = function () { return this.cx - this.size().w / 2; };
  MapLite.prototype.originY = function () { return this.cy - this.size().h / 2; };

  MapLite.prototype.setCenter = function (lng, lat) {
    this.cx = lngX(lng, this.z); this.cy = latY(lat, this.z); this.render();
  };

  MapLite.prototype.fit = function (pts, pad) {
    pad = pad == null ? 52 : pad;
    if (!pts.length) return;
    var s = this.size();
    var lngs = pts.map(function (p) { return p[1]; });
    var lats = pts.map(function (p) { return p[0]; });
    var minLng = Math.min.apply(null, lngs), maxLng = Math.max.apply(null, lngs);
    var minLat = Math.min.apply(null, lats), maxLat = Math.max.apply(null, lats);
    var z = MAXZ;
    for (; z > MINZ; z--) {
      var w = lngX(maxLng, z) - lngX(minLng, z);
      var h = latY(minLat, z) - latY(maxLat, z);
      if (w <= s.w - 2 * pad && h <= s.h - 2 * pad) break;
    }
    this.z = z;
    this.cx = (lngX(minLng, z) + lngX(maxLng, z)) / 2;
    this.cy = (latY(minLat, z) + latY(maxLat, z)) / 2;
    this.render();
  };

  MapLite.prototype.zoomAt = function (dz, px, py) {
    var s = this.size();
    px = px == null ? s.w / 2 : px; py = py == null ? s.h / 2 : py;
    var nz = Math.max(MINZ, Math.min(MAXZ, this.z + dz));
    if (nz === this.z) return;
    var k = Math.pow(2, nz - this.z);
    var ox = this.originX(), oy = this.originY();
    var wx = ox + px, wy = oy + py;              // 光标处的世界像素
    this.z = nz;
    this.cx = wx * k - px + s.w / 2;
    this.cy = wy * k - py + s.h / 2;
    this.render();
  };

  /* ---------- 底图瓦片 ---------- */
  MapLite.prototype.tileUrl = function (x, y, z) {
    var tpl = this.sat ? TPL_SAT : TPL_ROAD;
    return tpl.replace('{s}', String((Math.abs(x + y) % 4) + 1)).replace('{x}', x).replace('{y}', y).replace('{z}', z);
  };

  MapLite.prototype.drawTiles = function () {
    var need = {}, s = this.size(), z = this.z;
    var n = Math.pow(2, z);
    var x0 = Math.floor(this.originX() / TILE), x1 = Math.floor((this.originX() + s.w) / TILE);
    var y0 = Math.max(0, Math.floor(this.originY() / TILE)), y1 = Math.min(n - 1, Math.floor((this.originY() + s.h) / TILE));
    var self = this;

    for (var tx = x0; tx <= x1; tx++) {
      for (var ty = y0; ty <= y1; ty++) {
        var wx = ((tx % n) + n) % n, key = z + '/' + tx + '/' + ty;
        need[key] = 1;
        if (this.tiles[key]) continue;
        var img = new Image();
        img.className = 'gl-tile';
        img.decoding = 'async';
        img.alt = '';
        img.onload = function () { self.tileOk++; if (self.tileErr > 0) self.tileErr--; };
        img.onerror = function () {
          self.tileErr++;
          if (self.tileErr >= 6 && !self.offline) { self.goOffline(); }
        };
        img.src = this.tileUrl(wx, ty, z);
        this.layerTiles.appendChild(img);
        this.tiles[key] = img;
      }
    }
    // 回收视野外的瓦片
    Object.keys(this.tiles).forEach(function (k) {
      if (!need[k]) { var t = self.tiles[k]; if (t.parentNode) t.parentNode.removeChild(t); delete self.tiles[k]; }
    });
    // 定位
    Object.keys(this.tiles).forEach(function (k) {
      var p = k.split('/'), txz = +p[1], tyz = +p[2];
      var t = self.tiles[k];
      t.style.left = (txz * TILE - self.originX()) + 'px';
      t.style.top = (tyz * TILE - self.originY()) + 'px';
    });
  };

  MapLite.prototype.goOffline = function () {
    this.offline = true;
    this.layerTiles.innerHTML = '';
    this.tiles = {};
    var st = document.getElementById('gmStatus');
    if (st) st.textContent = '底图：离线示意底图';
    var h = document.getElementById('gmHint');
    if (h) {
      h.hidden = false;
      h.innerHTML = '📴 <strong>当前无网络</strong>：已切到按真实经纬度绘制的示意底图。标记、评分、<strong>一键唤起高德导航</strong>仍然可用（导航需手机有网/有高德 App）。';
    }
  };

  /* ---------- 离线示意底图（真实经纬度投影，随缩放平移联动）---------- */
  var SCH_Z = 13;
  MapLite.prototype.buildSchematic = function () {
    var all = POIS.concat(AVOID);
    var lngs = all.map(function (p) { return p.lng; }), lats = all.map(function (p) { return p.lat; });
    var z = SCH_Z;
    var x0 = lngX(Math.min.apply(null, lngs), z) - 260, x1 = lngX(Math.max.apply(null, lngs), z) + 260;
    var y0 = latY(Math.max.apply(null, lats), z) - 200, y1 = latY(Math.min.apply(null, lats), z) + 240;
    var W = Math.round(x1 - x0), H = Math.round(y1 - y0);
    var px = function (lng) { return lngX(lng, z) - x0; };
    var py = function (lat) { return latY(lat, z) - y0; };
    var s = [];
    s.push('<rect width="' + W + '" height="' + H + '" fill="#0f1720"/>');
    for (var g = Math.ceil(Math.min.apply(null, lngs) * 50) / 50; g <= Math.max.apply(null, lngs); g += 0.02)
      s.push('<line x1="' + px(g).toFixed(1) + '" y1="0" x2="' + px(g).toFixed(1) + '" y2="' + H + '" stroke="rgba(148,163,184,.14)"/>');
    for (var la = Math.ceil(Math.min.apply(null, lats) * 50) / 50; la <= Math.max.apply(null, lats); la += 0.02)
      s.push('<line x1="0" y1="' + py(la).toFixed(1) + '" x2="' + W + '" y2="' + py(la).toFixed(1) + '" stroke="rgba(148,163,184,.14)"/>');
    var river = [[112.9695,28.2600],[112.9655,28.2250],[112.9632,28.2000],[112.9615,28.1850],[112.9590,28.1500],[112.9555,28.1080]];
    s.push('<polyline fill="none" stroke="rgba(56,132,255,.45)" stroke-width="40" stroke-linecap="round" points="' +
      river.map(function (r) { return px(r[0]).toFixed(1) + ',' + py(r[1]).toFixed(1); }).join(' ') + '"/>');
    s.push('<text x="' + px(112.9555).toFixed(1) + '" y="' + py(28.2150).toFixed(1) + '" fill="rgba(147,197,253,.8)" font-size="30" font-family="sans-serif" letter-spacing="10">湘江</text>');
    s.push('<text x="' + px(112.9900).toFixed(1) + '" y="' + py(28.2450).toFixed(1) + '" fill="rgba(148,163,184,.55)" font-size="26" font-family="sans-serif">开福区</text>');
    s.push('<text x="' + px(112.9300).toFixed(1) + '" y="' + py(28.1500).toFixed(1) + '" fill="rgba(148,163,184,.55)" font-size="26" font-family="sans-serif">岳麓区</text>');
    s.push('<text x="' + px(113.0300).toFixed(1) + '" y="' + py(28.1650).toFixed(1) + '" fill="rgba(148,163,184,.55)" font-size="26" font-family="sans-serif">雨花区</text>');
    s.push('<text x="' + px(112.9600).toFixed(1) + '" y="' + py(28.1290).toFixed(1) + '" fill="rgba(148,163,184,.55)" font-size="26" font-family="sans-serif">天心区</text>');
    s.push('<text x="16" y="' + (H - 18) + '" fill="rgba(148,163,184,.6)" font-size="24" font-family="sans-serif">离线示意底图 · 真实经纬度投影 · 非精确路网</text>');

    this.schBox = { x0: x0, y0: y0, W: W, H: H };
    var svg = el('div', 'gl-sch-svg');
    svg.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + s.join('') + '</svg>';
    this.layerSch.appendChild(svg);
    this.schEl = svg;
  };

  MapLite.prototype.drawSchematic = function () {
    var b = this.schBox, k = Math.pow(2, this.z - SCH_Z);
    var e = this.schEl;
    e.style.left = (b.x0 * k - this.originX()) + 'px';
    e.style.top = (b.y0 * k - this.originY()) + 'px';
    e.style.width = (b.W * k) + 'px';
    e.style.height = (b.H * k) + 'px';
  };

  /* ---------- 标记 / 动线 ---------- */
  MapLite.prototype.addMarker = function (p) {
    var self = this;
    var c = (CAT[p.cat] || CAT.spot).c;
    var dot = el('div', 'gl-pin' + (p.avoid ? ' gl-pin-avoid' : ''));
    dot.innerHTML = '<i style="background:' + c + '"></i>';
    dot.title = p.name;
    dot.addEventListener('click', function (ev) {
      ev.stopPropagation();
      self.openPopup(p);
    });
    this.layerPin.appendChild(dot);
    this.markers[p.id] = dot;
  };

  MapLite.prototype.openPopup = function (p) {
    var rows = [];
    if (p.rating) rows.push('<div class="gm-row"><span>高德评分</span><b>' + p.rating + ' ★</b></div>');
    if (p.hours) rows.push('<div class="gm-row"><span>营业时间</span><b>' + p.hours + '</b></div>');
    if (p.cost) rows.push('<div class="gm-row"><span>人均</span><b>' + p.cost + '</b></div>');
    if (p.days && p.days.length) rows.push('<div class="gm-row"><span>安排</span><b>D' + p.days.join(' / D') + '</b></div>');
    this.popup.innerHTML =
      '<button class="gl-pop-x" aria-label="关闭">×</button>' +
      '<h4>' + p.name + (p.avoid ? '' : ' <span class="gm-tag">' + (CAT[p.cat] || CAT.spot).t + '</span>') + '</h4>' +
      (p.addr ? '<p class="gm-addr">📍 ' + p.addr + '</p>' : '') + rows.join('') +
      (p.note ? '<p class="gm-note">' + p.note + '</p>' : '') +
      '<div class="gm-acts">' +
      '<a class="gm-a gm-a-primary" href="' + navUrl(p) + '" target="_blank" rel="noopener">🧭 高德导航</a>' +
      '<a class="gm-a" href="' + detailUrl(p) + '" target="_blank" rel="noopener">高德详情</a>' +
      '</div>';
    this.popup.hidden = false;
    this.popupTarget = p;
    var self = this;
    this.popup.querySelector('.gl-pop-x').addEventListener('click', function () { self.popup.hidden = true; self.popupTarget = null; });
    this.placePopup();
  };

  MapLite.prototype.placePopup = function () {
    var p = this.popupTarget;
    if (!p || this.popup.hidden) return;
    var s = this.size();
    var x = lngX(p.lng, this.z) - this.originX();
    var y = latY(p.lat, this.z) - this.originY();
    var pw = this.popup.offsetWidth || 300, ph = this.popup.offsetHeight || 190;
    var left = Math.min(Math.max(10, x - pw / 2), Math.max(10, s.w - pw - 10));
    var top = y - ph - 18;
    if (top < 8) top = Math.min(s.h - ph - 10, y + 22);
    this.popup.style.left = left + 'px';
    this.popup.style.top = top + 'px';
  };

  MapLite.prototype.drawLines = function (day) {
    this.layerLine.innerHTML = '';
    if (day === 'all') return;
    var d = DAYS.filter(function (x) { return x.d === day; })[0];
    if (!d) return;
    var pts = d.order.map(function (id) {
      return POIS.filter(function (x) { return x.id === id; })[0];
    }).filter(Boolean);
    if (pts.length < 2) return;
    var ox = this.originX(), oy = this.originY();
    var svg = '<svg class="gl-line-svg" xmlns="http://www.w3.org/2000/svg">';
    for (var i = 0; i < pts.length - 1; i++) {
      svg += '<line x1="' + (lngX(pts[i].lng, this.z) - ox).toFixed(1) + '" y1="' + (latY(pts[i].lat, this.z) - oy).toFixed(1) +
             '" x2="' + (lngX(pts[i + 1].lng, this.z) - ox).toFixed(1) + '" y2="' + (latY(pts[i + 1].lat, this.z) - oy).toFixed(1) +
             '" stroke="#f97316" stroke-width="3" stroke-dasharray="8 7" stroke-linecap="round" opacity=".8"/>';
    }
    this.layerLine.innerHTML = svg + '</svg>';
  };

  MapLite.prototype.placePins = function () {
    var self = this, ox = this.originX(), oy = this.originY();
    Object.keys(this.markers).forEach(function (id) {
      var p = self.visible.filter(function (x) { return x.id === id; })[0];      var m = self.markers[id];
      if (!p) { m.hidden = true; return; }
      m.hidden = false;
      m.style.left = (lngX(p.lng, self.z) - ox) + 'px';
      m.style.top = (latY(p.lat, self.z) - oy) + 'px';
    });
  };

  /* ---------- 渲染 ---------- */
  MapLite.prototype.render = function () {
    if (!this.offline) this.drawTiles();
    this.drawSchematic();
    this.drawLines(this.activeDay);
    this.placePins();
    this.placePopup();
  };

  /* ---------- 交互 ---------- */
  MapLite.prototype.bindInteractions = function () {
    var self = this, dragging = false, lastX = 0, lastY = 0, moved = 0;

    this.root.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.gl-pop') || e.target.closest('.gl-pin')) return;
      dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY;
      self.root.classList.add('gl-grabbing');
      try { self.root.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    });
    this.root.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      self.cx -= dx; self.cy -= dy;
      self.render();
    });
    this.root.addEventListener('pointerup', function () {
      dragging = false;
      self.root.classList.remove('gl-grabbing');
      if (moved < 4) { self.popup.hidden = true; self.popupTarget = null; }
    });
    this.root.addEventListener('pointercancel', function () { dragging = false; self.root.classList.remove('gl-grabbing'); });

    this.root.addEventListener('wheel', function (e) {
      e.preventDefault();
      var r = self.root.getBoundingClientRect();
      self.zoomAt(e.deltaY < 0 ? 1 : -1, e.clientX - r.left, e.clientY - r.top);
    }, { passive: false });

    // 双指缩放
    var pinch = null;
    this.root.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) {
        pinch = { d: dist(e.touches), z: self.z };
      }
    }, { passive: true });
    this.root.addEventListener('touchmove', function (e) {
      if (pinch && e.touches.length === 2) {
        var k = dist(e.touches) / pinch.d;
        var nz = Math.round(pinch.z + Math.log2(k));
        nz = Math.max(MINZ, Math.min(MAXZ, nz));
        if (nz !== self.z) { self.z = nz; self.render(); }
      }
    }, { passive: true });
    this.root.addEventListener('touchend', function () { pinch = null; }, { passive: true });

    function dist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
  };

  MapLite.prototype.zoomIn = function () { this.zoomAt(1); };
  MapLite.prototype.zoomOut = function () { this.zoomAt(-1); };
  MapLite.prototype.toggleSat = function () {
    this.sat = !this.sat;
    this.tiles = {};
    this.layerTiles.innerHTML = '';
    this.tileErr = 0;
    var st = document.getElementById('gmStatus');
    if (st && !this.offline) st.textContent = '底图：' + (this.sat ? '高德影像' : '高德瓦片');
    if (!this.offline) this.render();
  };

  /* ---------- 启动 ---------- */
  function boot() {
    var node = document.getElementById('gmMap');
    if (!node) return;
    node.innerHTML = '';
    node.classList.add('gl-map');

    var all = POIS.concat(AVOID);
    var map = new MapLite(node);
    window.__cmap = map;

    all.forEach(function (p) { map.addMarker(p); });

    // 缩放控件
    var ctl = el('div', 'gl-ctl');
    ctl.innerHTML = '<button data-z="in" aria-label="放大">+</button><button data-z="out" aria-label="缩小">−</button>';
    node.appendChild(ctl);
    ctl.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.z === 'in') map.zoomIn(); else map.zoomOut();
    });

    map.visible = all;
    map.activeDay = 'all';

    function renderList(list) {
      var box = document.getElementById('gmList');
      if (!box) return;
      box.innerHTML = list.map(function (p) {
        var meta = [];
        if (p.rating) meta.push(p.rating + '★');
        if (p.cost) meta.push(p.cost);
        if (p.min > 0) meta.push(p.km + 'km/' + p.min + 'min');
        return '<div class="gm-item">' +
          '<span class="gm-dot" style="background:' + ((CAT[p.cat] || CAT.spot).c) + '"></span>' +
          '<div class="gm-item-main"><strong>' + p.name + '</strong><em>' + (meta.join(' · ') || (p.addr || '')) + '</em></div>' +
          '<div class="gm-item-acts">' +
          '<button class="gm-a" data-fly="' + p.id + '">定位</button>' +
          '<a class="gm-a gm-a-primary" href="' + navUrl(p) + '" target="_blank" rel="noopener">导航</a>' +
          '</div></div>';
      }).join('');
      Array.prototype.forEach.call(box.querySelectorAll('[data-fly]'), function (b) {
        b.addEventListener('click', function () {
          var p = all.filter(function (x) { return x.id === b.dataset.fly; })[0];
          if (!p) return;
          map.z = Math.max(map.z, 14);
          map.setCenter(p.lng, p.lat);
          map.openPopup(p);
        });
      });
    }

    function selectDay(d) {
      map.activeDay = d;
      map.popup.hidden = true; map.popupTarget = null;
      var list = d === 'all' ? all : all.filter(function (p) { return (p.days || []).indexOf(d) >= 0; });
      map.visible = list;
      var bounds = list.map(function (p) { return [p.lat, p.lng]; });
      if (bounds.length) map.fit(bounds, d === 'all' ? 60 : 84);
      Array.prototype.forEach.call(document.querySelectorAll('#gmDays button'), function (b) {
        b.classList.toggle('on', String(b.dataset.d) === String(d));
      });
      renderList(list);
    }

    var daysEl = document.getElementById('gmDays');
    daysEl.innerHTML = [{ d: 'all', label: '全部 ' + all.length }].concat(DAYS.map(function (x) { return { d: x.d, label: x.label }; }))
      .map(function (b) { return '<button data-d="' + b.d + '"' + (b.d === 'all' ? ' class="on"' : '') + '>' + b.label + '</button>'; }).join('');
    daysEl.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (b) selectDay(b.dataset.d === 'all' ? 'all' : Number(b.dataset.d));
    });

    document.getElementById('gmLayer').addEventListener('click', function () { map.toggleSat(); });
    document.getElementById('gmFit').addEventListener('click', function () { selectDay(map.activeDay); });

    // 从洲际出发实测
    var driveEl = document.getElementById('gmDriveList');
    if (driveEl) {
      driveEl.innerHTML = POIS.filter(function (p) { return p.min > 0; })
        .sort(function (a, b) { return a.min - b.min; })
        .map(function (p) { return '<li><strong>' + p.name + '</strong>：驾车 <strong>' + p.km + ' km / 约 ' + p.min + ' 分钟</strong></li>'; })
        .join('');
    }
    var avoidEl = document.getElementById('gmAvoidList');
    if (avoidEl) {
      avoidEl.innerHTML = AVOID.map(function (a) {
        return '<li><strong>' + a.name + '</strong>：' + a.note + '</li>';
      }).join('') + '<li><strong>岳麓山登山/索道</strong>：直接撞「逛景点像煎熬」，国庆优先删除</li>' +
        '<li><strong>太平老街 · 火宫殿总店</strong>：与坡子街游客动线重叠，本次不排</li>';
    }

    selectDay('all');
    var ro = window.ResizeObserver ? new ResizeObserver(function () { map.render(); }) : null;
    if (ro) ro.observe(node);
    window.addEventListener('resize', function () { map.render(); });
    setTimeout(function () { map.render(); }, 400);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
