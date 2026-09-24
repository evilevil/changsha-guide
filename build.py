#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 changsha-guide 打包成「单文件 HTML」（零外部依赖、可离线、可直接上传）。

- 图片：WebP + base64 内联；按 CSS 类去重（每张图只内联一次）
- 地图：自研轻量瓦片引擎（无 Leaflet 等第三方库），高德瓦片 + 离线示意底图
- 自动画质搜索：在体积上限内挑选最高画质参数

用法：
    python3 build.py                 # 自动搜索，产出 standalone.html
    python3 build.py --max-kb 480    # 指定体积上限
    python3 build.py --w 440 --q 56  # 固定画质参数
"""
import argparse
import base64
import pathlib
import re
import shutil
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent
TMP = ROOT.parent / "build_tmp"
OUT = ROOT / "standalone.html"
SRC = ROOT  # 由 --src 覆盖：源模板、src/、images/ 所在目录

# 画质候选：从高到低，取第一个满足体积上限的
PRESETS = [(760, 68), (620, 62), (520, 58), (460, 54), (400, 52), (360, 48), (330, 45), (300, 42)]


# ---------------------------------------------------------------- CSS 压缩
def minify_css(css: str) -> str:
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    css = re.sub(r"\s+", " ", css)
    css = re.sub(r"\s*([{}:;,>~+])\s*", r"\1", css)
    css = css.replace(";}", "}")
    return css.strip()


# ---------------------------------------------------------------- 图片处理
def find_images() -> list:
    names = set()
    for f in (SRC / "images").glob("*.jpg"):
        names.add(f.stem)
    return sorted(names)


def compress(name: str, w: int, q: int) -> pathlib.Path:
    dst = TMP / f"{name}.webp"
    src = SRC / "images" / f"{name}.jpg"
    if not src.exists():
        return None
    subprocess.run(
        ["cwebp", "-quiet", "-q", str(q), "-resize", str(w), "0", "-m", "6", "-metadata", "none",
         str(src), "-o", str(dst)],
        check=True,
    )
    return dst


# ---------------------------------------------------------------- 组装
def build(w: int, q: int, verbose: bool = True) -> tuple:
    TMP.mkdir(exist_ok=True)
    html = (SRC / "index.html").read_text(encoding="utf-8")

    # 1. 去掉外链字体
    html = re.sub(r'\s*<link rel="preconnect"[^>]*>', "", html)
    html = re.sub(r'\s*<link href="https://fonts\.googleapis\.com[^>]*>', "", html)

    # 2. 压缩内联样式
    def _mini(m):
        return "<style>" + minify_css(m.group(1)) + "</style>"
    html = re.sub(r"<style>(.*?)</style>", _mini, html, flags=re.S)

    # 3. 图片 -> CSS 类（去重内联）
    used = sorted(set(re.findall(r'src="images/([a-z0-9\-]+)\.jpg"', html)))
    img_css = [
        ".imgbox{display:block;width:100%;background-size:cover;background-position:center;"
        "background-repeat:no-repeat;border-radius:.5rem}",
        ".day-photos .imgbox{height:120px}",
    ]
    missing = []
    for n in used:
        webp = compress(n, w, q)
        if webp is None:
            missing.append(n)
            continue
        b64 = base64.b64encode(webp.read_bytes()).decode()
        img_css.append(".im-%s{background-image:url(data:image/webp;base64,%s)}" % (n, b64))
    if missing:
        sys.exit(f"缺少图片: {missing}")

    IMG_TAG = re.compile(r'<img\b([^>]*?)\bsrc="images/([a-z0-9\-]+)\.jpg"([^>]*?)/?>', re.S)

    def to_box(m):
        attrs = (m.group(1) + " " + m.group(3)).replace("\n", " ")
        name = m.group(2)
        cls = re.search(r'class="([^"]*)"', attrs)
        sty = re.search(r'style="([^"]*)"', attrs)
        alt = re.search(r'alt="([^"]*)"', attrs)
        classes = ["imgbox", "im-" + name]
        height = None
        style = []
        if cls:
            classes.extend(cls.group(1).split())
        if sty:
            for part in sty.group(1).split(";"):
                part = part.strip()
                if not part or part.startswith("object-fit"):
                    continue
                if part.startswith("height:"):
                    height = part.split(":", 1)[1].strip()
                if part.startswith("width:") and "180px" in part:
                    style.append(part)
        if height is None:
            height = "160px" if cls and "food-photo" in cls.group(1) else "120px"
        style.append("height:" + height)
        return '<span class="%s" style="%s" role="img" aria-label="%s"></span>' % (
            " ".join(classes), ";".join(style), alt.group(1) if alt else "",
        )

    html, n_img = IMG_TAG.subn(to_box, html)

    # 4. 地图板块 + 样式
    mapcss = minify_css((SRC / "src" / "map.css").read_text(encoding="utf-8"))
    html = html.replace("</head>", "<style>%s\n%s</style>\n</head>" % ("".join(img_css), mapcss), 1)

    sec = (SRC / "src" / "map_section.html").read_text(encoding="utf-8")
    anchor = "    <!-- 天气与出发 -->"
    if anchor not in html:
        sys.exit("地图板块插入点未找到")
    html = html.replace(anchor, sec + "\n" + anchor, 1)

    # 5. 地图引擎（纯 JS，无第三方库）
    app = (SRC / "src" / "map_lite.js").read_text(encoding="utf-8")
    if "</script" in app.lower():
        sys.exit("map_lite.js 含 </script")
    html = html.replace("</body>", "<script>\n%s\n</script>\n</body>" % app, 1)

    OUT.write_text(html, encoding="utf-8")
    if verbose:
        print(f"   画质 w={w} q={q} · 图片标签 {n_img} 个 · 去重内联 {len(used)} 张")
    return OUT.stat().st_size, len(used)


def main():
    global SRC, OUT
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-kb", type=int, default=480, help="单文件体积上限（KB）")
    ap.add_argument("--w", type=int, default=None, help="固定图片宽度")
    ap.add_argument("--q", type=int, default=None, help="固定图片质量")
    ap.add_argument("--src", default=None, help="源目录（含 index.html / src/ / images/）")
    ap.add_argument("--out", default=None, help="输出文件路径")
    a = ap.parse_args()

    if a.src:
        SRC = pathlib.Path(a.src).resolve()
    if a.out:
        OUT = pathlib.Path(a.out).resolve()

    if not shutil.which("cwebp"):
        sys.exit("未找到 cwebp，请先安装：brew install webp")

    limit = a.max_kb * 1024
    if a.w and a.q:
        size, n = build(a.w, a.q)
        print(f"\nOK  -> {OUT}\n    {size/1024:,.0f} KB · {n} 张图")
        if size > limit:
            print(f"    ⚠ 超过上限 {a.max_kb} KB（可调小 --w/--q）")
        return

    best = None
    for (w, q) in PRESETS:
        size, n = build(w, q)
        flag = "OK" if size <= limit else "超出"
        print(f"   试 w={w:>3} q={q:<3} -> {size/1024:6,.0f} KB  {flag}")
        if size <= limit:
            best = (w, q, size, n)
            break

    if not best:
        sys.exit(f"所有画质档位都超过 {a.max_kb} KB，请提高 --max-kb")
    w, q, size, n = best
    size, n = build(w, q, verbose=False)
    print(f"\nOK  -> {OUT}")
    print(f"   最终画质 w={w} q={q} · {size/1024:,.0f} KB（上限 {a.max_kb} KB，余量 {(limit-size)/1024:,.0f} KB）· {n} 张图去重内联 · 零外部依赖")


if __name__ == "__main__":
    main()
