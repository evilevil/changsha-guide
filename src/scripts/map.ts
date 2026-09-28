/* ===== 高德交互地图（轻量自研瓦片引擎，0 依赖） =====
 * 底图：高德地图瓦片（GCJ-02，与高德 POI 坐标同源，可直接对齐）
 * 离线：自动降级为按真实经纬度投影的示意底图
 * 特性：拖动 / 缩放 / 每日动线 / 标记详情 / 一键唤起高德导航
 */
import { AVOID, CAT, DAYS, POIS, extraAvoid, type Poi } from '../data/pois';

const TILE = 256;
const MINZ = 7;
const MAXZ = 17;
const SCH_Z = 13;
const TPL_ROAD =
  'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';
const TPL_SAT =
  'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';

const ALL: Poi[] = [...POIS, ...AVOID];

function navUrl(p: Poi): string {
  return (
    'https://uri.amap.com/navigation?to=' +
    p.lng +
    ',' +
    p.lat +
    ',' +
    encodeURIComponent(p.name) +
    '&mode=car&policy=1&src=changshaGuide&coordinate=gaode&callnative=1'
  );
}

function detailUrl(p: Poi): string {
  return p.poiId
    ? 'https://ditu.amap.com/place/' + p.poiId
    : 'https://uri.amap.com/marker?position=' +
        p.lng +
        ',' +
        p.lat +
        '&name=' +
        encodeURIComponent(p.name) +
        '&coordinate=gaode&callnative=1';
}

/* ---------- Web Mercator（与高德瓦片同坐标系）---------- */
function lngX(lng: number, z: number): number {
  return ((lng + 180) / 360) * TILE * Math.pow(2, z);
}
function latY(lat: number, z: number): number {
  const s = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE * Math.pow(2, z);
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls?: string,
  html?: string
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}

class MapLite {
  root: HTMLElement;
  z = 13;
  cx = 0;
  cy = 0;
  tiles: Record<string, HTMLImageElement> = {};
  markers: Record<string, HTMLElement> = {};
  layerTiles: HTMLElement;
  layerSch: HTMLElement;
  layerLine: HTMLElement;
  layerPin: HTMLElement;
  popup: HTMLElement;
  popupTarget: Poi | null = null;
  offline = false;
  tileErr = 0;
  tileOk = 0;
  sat = false;
  visible: Poi[] = [];
  activeDay: number | 'all' = 'all';
  schBox = { x0: 0, y0: 0, W: 0, H: 0 };
  schEl!: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
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

  size() {
    return { w: this.root.clientWidth, h: this.root.clientHeight };
  }
  resize() {
    this.render();
  }

  originX() {
    return this.cx - this.size().w / 2;
  }
  originY() {
    return this.cy - this.size().h / 2;
  }

  setCenter(lng: number, lat: number) {
    this.cx = lngX(lng, this.z);
    this.cy = latY(lat, this.z);
    this.render();
  }

  fit(pts: [number, number][], pad = 52) {
    if (!pts.length) return;
    const s = this.size();
    const lngs = pts.map((p) => p[1]);
    const lats = pts.map((p) => p[0]);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    let z = MAXZ;
    for (; z > MINZ; z--) {
      const w = lngX(maxLng, z) - lngX(minLng, z);
      const h = latY(minLat, z) - latY(maxLat, z);
      if (w <= s.w - 2 * pad && h <= s.h - 2 * pad) break;
    }
    this.z = z;
    this.cx = (lngX(minLng, z) + lngX(maxLng, z)) / 2;
    this.cy = (latY(minLat, z) + latY(maxLat, z)) / 2;
    this.render();
  }

  zoomAt(dz: number, px?: number, py?: number) {
    const s = this.size();
    px = px == null ? s.w / 2 : px;
    py = py == null ? s.h / 2 : py;
    const nz = Math.max(MINZ, Math.min(MAXZ, this.z + dz));
    if (nz === this.z) return;
    const k = Math.pow(2, nz - this.z);
    const ox = this.originX();
    const oy = this.originY();
    const wx = ox + px;
    const wy = oy + py;
    this.z = nz;
    this.cx = wx * k - px + s.w / 2;
    this.cy = wy * k - py + s.h / 2;
    this.render();
  }

  /* ---------- 底图瓦片 ---------- */
  tileUrl(x: number, y: number, z: number) {
    const tpl = this.sat ? TPL_SAT : TPL_ROAD;
    return tpl
      .replace('{s}', String((Math.abs(x + y) % 4) + 1))
      .replace('{x}', String(x))
      .replace('{y}', String(y))
      .replace('{z}', String(z));
  }

  drawTiles() {
    const need: Record<string, 1> = {};
    const s = this.size();
    const z = this.z;
    const n = Math.pow(2, z);
    const x0 = Math.floor(this.originX() / TILE);
    const x1 = Math.floor((this.originX() + s.w) / TILE);
    const y0 = Math.max(0, Math.floor(this.originY() / TILE));
    const y1 = Math.min(n - 1, Math.floor((this.originY() + s.h) / TILE));

    for (let tx = x0; tx <= x1; tx++) {
      for (let ty = y0; ty <= y1; ty++) {
        const wx = ((tx % n) + n) % n;
        const key = z + '/' + tx + '/' + ty;
        need[key] = 1;
        if (this.tiles[key]) continue;
        const image = new Image();
        image.className = 'gl-tile';
        image.decoding = 'async';
        image.alt = '';
        image.onload = () => {
          this.tileOk++;
          if (this.tileErr > 0) this.tileErr--;
        };
        image.onerror = () => {
          this.tileErr++;
          if (this.tileErr >= 6 && !this.offline) this.goOffline();
        };
        image.src = this.tileUrl(wx, ty, z);
        this.layerTiles.appendChild(image);
        this.tiles[key] = image;
      }
    }
    // 回收视野外的瓦片
    Object.keys(this.tiles).forEach((k) => {
      if (!need[k]) {
        const t = this.tiles[k];
        if (t.parentNode) t.parentNode.removeChild(t);
        delete this.tiles[k];
      }
    });
    // 定位
    Object.keys(this.tiles).forEach((k) => {
      const p = k.split('/');
      const txz = +p[1];
      const tyz = +p[2];
      const t = this.tiles[k];
      t.style.left = txz * TILE - this.originX() + 'px';
      t.style.top = tyz * TILE - this.originY() + 'px';
    });
  }

  goOffline() {
    this.offline = true;
    this.layerTiles.innerHTML = '';
    this.tiles = {};
    const st = document.getElementById('gmStatus');
    if (st) st.textContent = '底图：离线示意底图';
    const h = document.getElementById('gmHint');
    if (h) {
      h.hidden = false;
      h.innerHTML =
        '📴 <strong>当前无网络</strong>：已切到按真实经纬度绘制的示意底图。标记、评分、<strong>一键唤起高德导航</strong>仍然可用（导航需手机有网/有高德 App）。';
    }
  }

  /* ---------- 离线示意底图（真实经纬度投影，随缩放平移联动）---------- */
  buildSchematic() {
    const lngs = ALL.map((p) => p.lng);
    const lats = ALL.map((p) => p.lat);
    const z = SCH_Z;
    const x0 = lngX(Math.min(...lngs), z) - 260;
    const x1 = lngX(Math.max(...lngs), z) + 260;
    const y0 = latY(Math.max(...lats), z) - 200;
    const y1 = latY(Math.min(...lats), z) + 240;
    const W = Math.round(x1 - x0);
    const H = Math.round(y1 - y0);
    const px = (lng: number) => (lngX(lng, z) - x0).toFixed(1);
    const py = (lat: number) => (latY(lat, z) - y0).toFixed(1);
    const s: string[] = [];
    s.push('<rect width="' + W + '" height="' + H + '" fill="#0f1720"/>');
    for (let g = Math.ceil(Math.min(...lngs) * 50) / 50; g <= Math.max(...lngs); g += 0.02)
      s.push(
        '<line x1="' + px(g) + '" y1="0" x2="' + px(g) + '" y2="' + H + '" stroke="rgba(148,163,184,.14)"/>'
      );
    for (let la = Math.ceil(Math.min(...lats) * 50) / 50; la <= Math.max(...lats); la += 0.02)
      s.push(
        '<line x1="0" y1="' + py(la) + '" x2="' + W + '" y2="' + py(la) + '" stroke="rgba(148,163,184,.14)"/>'
      );
    const river = [
      [112.9695, 28.26],
      [112.9655, 28.225],
      [112.9632, 28.2],
      [112.9615, 28.185],
      [112.959, 28.15],
      [112.9555, 28.108],
    ];
    s.push(
      '<polyline fill="none" stroke="rgba(56,132,255,.45)" stroke-width="40" stroke-linecap="round" points="' +
        river.map((r) => px(r[0]) + ',' + py(r[1])).join(' ') +
        '"/>'
    );
    s.push(
      '<text x="' + px(112.9555) + '" y="' + py(28.215) + '" fill="rgba(147,197,253,.8)" font-size="30" font-family="sans-serif" letter-spacing="10">湘江</text>'
    );
    s.push(
      '<text x="' + px(112.99) + '" y="' + py(28.245) + '" fill="rgba(148,163,184,.55)" font-size="26" font-family="sans-serif">开福区</text>'
    );
    s.push(
      '<text x="' + px(112.93) + '" y="' + py(28.15) + '" fill="rgba(148,163,184,.55)" font-size="26" font-family="sans-serif">岳麓区</text>'
    );
    s.push(
      '<text x="' + px(113.03) + '" y="' + py(28.165) + '" fill="rgba(148,163,184,.55)" font-size="26" font-family="sans-serif">雨花区</text>'
    );
    s.push(
      '<text x="' + px(112.96) + '" y="' + py(28.129) + '" fill="rgba(148,163,184,.55)" font-size="26" font-family="sans-serif">天心区</text>'
    );
    s.push(
      '<text x="16" y="' +
        (H - 18) +
        '" fill="rgba(148,163,184,.6)" font-size="24" font-family="sans-serif">离线示意底图 · 真实经纬度投影 · 非精确路网</text>'
    );

    this.schBox = { x0, y0, W, H };
    const svg = el('div', 'gl-sch-svg');
    svg.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '" preserveAspectRatio="none">' +
      s.join('') +
      '</svg>';
    this.layerSch.appendChild(svg);
    this.schEl = svg;
  }

  drawSchematic() {
    const b = this.schBox;
    const k = Math.pow(2, this.z - SCH_Z);
    const e = this.schEl;
    e.style.left = b.x0 * k - this.originX() + 'px';
    e.style.top = b.y0 * k - this.originY() + 'px';
    e.style.width = b.W * k + 'px';
    e.style.height = b.H * k + 'px';
  }

  /* ---------- 标记 / 动线 ---------- */
  addMarker(p: Poi) {
    const c = (CAT[p.cat] || CAT.spot).c;
    const dot = el('div', 'gl-pin' + (p.avoid ? ' gl-pin-avoid' : ''));
    dot.innerHTML = '<i style="background:' + c + '"></i>';
    dot.title = p.name;
    dot.addEventListener('click', (ev) => {
      ev.stopPropagation();
      this.openPopup(p);
    });
    this.layerPin.appendChild(dot);
    this.markers[p.id] = dot;
  }

  openPopup(p: Poi) {
    const rows: string[] = [];
    if (p.rating) rows.push('<div class="gm-row"><span>高德评分</span><b>' + p.rating + ' ★</b></div>');
    if (p.hours) rows.push('<div class="gm-row"><span>营业时间</span><b>' + p.hours + '</b></div>');
    if (p.cost) rows.push('<div class="gm-row"><span>人均</span><b>' + p.cost + '</b></div>');
    if (p.days && p.days.length)
      rows.push('<div class="gm-row"><span>安排</span><b>D' + p.days.join(' / D') + '</b></div>');
    this.popup.innerHTML =
      '<button class="gl-pop-x" aria-label="关闭">×</button>' +
      '<h4>' +
      p.name +
      (p.avoid ? '' : ' <span class="gm-tag">' + (CAT[p.cat] || CAT.spot).t + '</span>') +
      '</h4>' +
      (p.addr ? '<p class="gm-addr">📍 ' + p.addr + '</p>' : '') +
      rows.join('') +
      (p.note ? '<p class="gm-note">' + p.note + '</p>' : '') +
      '<div class="gm-acts">' +
      '<a class="gm-a gm-a-primary" href="' + navUrl(p) + '" target="_blank" rel="noopener">🧭 高德导航</a>' +
      '<a class="gm-a" href="' + detailUrl(p) + '" target="_blank" rel="noopener">高德详情</a>' +
      '</div>';
    this.popup.hidden = false;
    this.popupTarget = p;
    this.popup.querySelector('.gl-pop-x')!.addEventListener('click', () => {
      this.popup.hidden = true;
      this.popupTarget = null;
    });
    this.placePopup();
  }

  placePopup() {
    const p = this.popupTarget;
    if (!p || this.popup.hidden) return;
    const s = this.size();
    const x = lngX(p.lng, this.z) - this.originX();
    const y = latY(p.lat, this.z) - this.originY();
    const pw = this.popup.offsetWidth || 300;
    const ph = this.popup.offsetHeight || 190;
    const left = Math.min(Math.max(10, x - pw / 2), Math.max(10, s.w - pw - 10));
    let top = y - ph - 18;
    if (top < 8) top = Math.min(s.h - ph - 10, y + 22);
    this.popup.style.left = left + 'px';
    this.popup.style.top = top + 'px';
  }

  drawLines(day: number | 'all') {
    this.layerLine.innerHTML = '';
    if (day === 'all') return;
    const d = DAYS.filter((x) => x.d === day)[0];
    if (!d) return;
    const pts = d.order
      .map((id) => POIS.filter((x) => x.id === id)[0])
      .filter(Boolean);
    if (pts.length < 2) return;
    const ox = this.originX();
    const oy = this.originY();
    let svg = '<svg class="gl-line-svg" xmlns="http://www.w3.org/2000/svg">';
    for (let i = 0; i < pts.length - 1; i++) {
      svg +=
        '<line x1="' + (lngX(pts[i].lng, this.z) - ox).toFixed(1) +
        '" y1="' + (latY(pts[i].lat, this.z) - oy).toFixed(1) +
        '" x2="' + (lngX(pts[i + 1].lng, this.z) - ox).toFixed(1) +
        '" y2="' + (latY(pts[i + 1].lat, this.z) - oy).toFixed(1) +
        '" stroke="#f97316" stroke-width="3" stroke-dasharray="8 7" stroke-linecap="round" opacity=".8"/>';
    }
    this.layerLine.innerHTML = svg + '</svg>';
  }

  placePins() {
    const ox = this.originX();
    const oy = this.originY();
    Object.keys(this.markers).forEach((id) => {
      const p = this.visible.filter((x) => x.id === id)[0];
      const m = this.markers[id];
      if (!p) {
        m.hidden = true;
        return;
      }
      m.hidden = false;
      m.style.left = lngX(p.lng, this.z) - ox + 'px';
      m.style.top = latY(p.lat, this.z) - oy + 'px';
    });
  }

  /* ---------- 渲染 ---------- */
  render() {
    if (!this.offline) this.drawTiles();
    this.drawSchematic();
    this.drawLines(this.activeDay);
    this.placePins();
    this.placePopup();
  }

  /* ---------- 交互 ---------- */
  bindInteractions() {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let moved = 0;

    this.root.addEventListener('pointerdown', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.gl-pop') || target.closest('.gl-pin')) return;
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      this.root.classList.add('gl-grabbing');
      try {
        this.root.setPointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    });
    this.root.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      this.cx -= dx;
      this.cy -= dy;
      this.render();
    });
    this.root.addEventListener('pointerup', () => {
      dragging = false;
      this.root.classList.remove('gl-grabbing');
      if (moved < 4) {
        this.popup.hidden = true;
        this.popupTarget = null;
      }
    });
    this.root.addEventListener('pointercancel', () => {
      dragging = false;
      this.root.classList.remove('gl-grabbing');
    });

    this.root.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const r = this.root.getBoundingClientRect();
        this.zoomAt(e.deltaY < 0 ? 1 : -1, e.clientX - r.left, e.clientY - r.top);
      },
      { passive: false }
    );

    // 双指缩放
    let pinch: { d: number; z: number } | null = null;
    const dist = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    this.root.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length === 2) pinch = { d: dist(e.touches), z: this.z };
      },
      { passive: true }
    );
    this.root.addEventListener(
      'touchmove',
      (e) => {
        if (pinch && e.touches.length === 2) {
          const k = dist(e.touches) / pinch.d;
          let nz = Math.round(pinch.z + Math.log2(k));
          nz = Math.max(MINZ, Math.min(MAXZ, nz));
          if (nz !== this.z) {
            this.z = nz;
            this.render();
          }
        }
      },
      { passive: true }
    );
    this.root.addEventListener('touchend', () => (pinch = null), { passive: true });
  }

  zoomIn() {
    this.zoomAt(1);
  }
  zoomOut() {
    this.zoomAt(-1);
  }
  toggleSat() {
    this.sat = !this.sat;
    this.tiles = {};
    this.layerTiles.innerHTML = '';
    this.tileErr = 0;
    const st = document.getElementById('gmStatus');
    if (st && !this.offline) st.textContent = '底图：' + (this.sat ? '高德影像' : '高德瓦片');
    if (!this.offline) this.render();
  }
}

/* ---------- 启动 ---------- */
function boot() {
  const node = document.getElementById('gmMap');
  if (!node) return;
  node.innerHTML = '';
  node.classList.add('gl-map');

  const map = new MapLite(node);

  ALL.forEach((p) => map.addMarker(p));

  // 缩放控件
  const ctl = el('div', 'gl-ctl');
  ctl.innerHTML =
    '<button data-z="in" aria-label="放大">+</button><button data-z="out" aria-label="缩小">−</button>';
  node.appendChild(ctl);
  ctl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    if ((b as HTMLElement).dataset.z === 'in') map.zoomIn();
    else map.zoomOut();
  });

  map.visible = ALL;
  map.activeDay = 'all';

  function renderList(list: Poi[]) {
    const box = document.getElementById('gmList');
    if (!box) return;
    box.innerHTML = list
      .map((p) => {
        const meta: string[] = [];
        if (p.rating) meta.push(p.rating + '★');
        if (p.cost) meta.push(p.cost);
        if (p.min && p.min > 0) meta.push(p.km + 'km/' + p.min + 'min');
        return (
          '<div class="gm-item">' +
          '<span class="gm-dot" style="background:' + (CAT[p.cat] || CAT.spot).c + '"></span>' +
          '<div class="gm-item-main"><strong>' + p.name + '</strong><em>' +
          (meta.join(' · ') || p.addr || '') +
          '</em></div>' +
          '<div class="gm-item-acts">' +
          '<button class="gm-a" data-fly="' + p.id + '">定位</button>' +
          '<a class="gm-a gm-a-primary" href="' + navUrl(p) + '" target="_blank" rel="noopener">导航</a>' +
          '</div></div>'
        );
      })
      .join('');
    box.querySelectorAll<HTMLElement>('[data-fly]').forEach((b) => {
      b.addEventListener('click', () => {
        const p = ALL.filter((x) => x.id === b.dataset.fly)[0];
        if (!p) return;
        map.z = Math.max(map.z, 14);
        map.setCenter(p.lng, p.lat);
        map.openPopup(p);
      });
    });
  }

  function selectDay(d: number | 'all') {
    map.activeDay = d;
    map.popup.hidden = true;
    map.popupTarget = null;
    const list = d === 'all' ? ALL : ALL.filter((p) => (p.days || []).indexOf(d) >= 0);
    map.visible = list;
    const bounds = list.map((p) => [p.lat, p.lng] as [number, number]);
    if (bounds.length) map.fit(bounds, d === 'all' ? 60 : 84);
    document.querySelectorAll<HTMLElement>('#gmDays button').forEach((b) => {
      b.classList.toggle('on', String(b.dataset.d) === String(d));
    });
    renderList(list);
  }

  const daysEl = document.getElementById('gmDays');
  if (daysEl) {
    const dayButtons: { d: string | number; label: string }[] = [
      { d: 'all', label: '全部 ' + ALL.length },
      ...DAYS.map((x) => ({ d: x.d as string | number, label: x.label })),
    ];
    daysEl.innerHTML = dayButtons
      .map(
        (b) =>
          '<button data-d="' + b.d + '"' + (b.d === 'all' ? ' class="on"' : '') + '>' + b.label + '</button>'
      )
      .join('');
    daysEl.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('button') as HTMLElement | null;
      if (b) selectDay(b.dataset.d === 'all' ? 'all' : Number(b.dataset.d));
    });
  }

  document.getElementById('gmLayer')?.addEventListener('click', () => map.toggleSat());
  document.getElementById('gmFit')?.addEventListener('click', () => selectDay(map.activeDay));

  // 从洲际出发实测
  const driveEl = document.getElementById('gmDriveList');
  if (driveEl) {
    driveEl.innerHTML = POIS.filter((p) => (p.min || 0) > 0)
      .sort((a, b) => (a.min || 0) - (b.min || 0))
      .map((p) => '<li><strong>' + p.name + '</strong>：驾车 <strong>' + p.km + ' km / 约 ' + p.min + ' 分钟</strong></li>')
      .join('');
  }
  const avoidEl = document.getElementById('gmAvoidList');
  if (avoidEl) {
    avoidEl.innerHTML =
      AVOID.map((a) => '<li><strong>' + a.name + '</strong>：' + a.note + '</li>').join('') +
      extraAvoid.map((t) => '<li>' + t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') + '</li>').join('');
  }

  selectDay('all');
  const ro = window.ResizeObserver ? new ResizeObserver(() => map.render()) : null;
  if (ro) ro.observe(node);
  window.addEventListener('resize', () => map.render());
  window.setTimeout(() => map.render(), 400);
}

export function initMap() {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
}
