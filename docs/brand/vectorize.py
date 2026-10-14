"""A TechALARM logó (raszteres PNG) vektorizálása: potrace + színátmenetek.
   python3 vectorize.py   →   logo.svg, logo-mark.svg, logo-dark.svg
Csak a `potracer` és a `numpy`/`Pillow` kell hozzá (pip install potracer)."""
import numpy as np
from PIL import Image
import potrace

SRC = "logo-eredeti.png"
S = 3  # felskálázás a pontos kontúrhoz

im = Image.open(SRC).convert("RGB")
A = np.asarray(im).astype(np.float32)
H, W, _ = A.shape
# „tinta” = fehértől való távolság (0..1)
ink = (254.0 - A.min(axis=2)) / 254.0
ink = np.clip(ink, 0, 1)


def trace(x0, y0, x1, y1, mask=None, turd=6):
    sub = ink[y0:y1, x0:x1].copy()
    if mask is not None:
        sub = sub * mask[y0:y1, x0:x1]
    up = Image.fromarray((sub * 255).astype(np.uint8)).resize(((x1 - x0) * S, (y1 - y0) * S), Image.LANCZOS)
    bm = potrace.Bitmap(np.asarray(up) < 120)  # a potracer fordítva értelmezi a logikai tömböt
    pl = bm.trace(turdsize=turd * S, alphamax=1.05, opticurve=True, opttolerance=0.35)
    curves = []
    for c in pl:
        pts = [(c.start_point.x, c.start_point.y)]
        seg = []
        for s in c.segments:
            if s.is_corner:
                seg.append(("L", s.c.x, s.c.y, s.end_point.x, s.end_point.y))
            else:
                seg.append(("C", s.c1.x, s.c1.y, s.c2.x, s.c2.y, s.end_point.x, s.end_point.y))
        curves.append((c.start_point, seg))
    return curves


def path_d(curves, ox, oy):
    f = lambda v, o: f"{v / S + o:.2f}"
    out = []
    for sp, seg in curves:
        d = f"M{f(sp.x, ox)} {f(sp.y, oy)}"
        for s in seg:
            if s[0] == "L":
                d += f"L{f(s[1], ox)} {f(s[2], oy)}L{f(s[3], ox)} {f(s[4], oy)}"
            else:
                d += f"C{f(s[1], ox)} {f(s[2], oy)} {f(s[3], ox)} {f(s[4], oy)} {f(s[5], ox)} {f(s[6], oy)}"
        out.append(d + "Z")
    return "".join(out)


def bbox(curve, ox, oy):
    sp, seg = curve
    xs = [sp.x / S + ox]
    ys = [sp.y / S + oy]
    for s in seg:
        xs.append(s[-2] / S + ox)
        ys.append(s[-1] / S + oy)
    return min(xs), min(ys), max(xs), max(ys)


def stops(mask, direction, n=5):
    """Színátmenet-megállók: a maszkon belüli pixelek mediánszíne az adott irány mentén."""
    ys, xs = np.nonzero(mask)
    t = xs * direction[0] + ys * direction[1]
    lo, hi = t.min(), t.max()
    res = []
    for i in range(n):
        a, b = lo + (hi - lo) * i / n, lo + (hi - lo) * (i + 1) / n
        sel = (t >= a) & (t <= b)
        if sel.sum() < 20:
            continue
        col = np.median(A[ys[sel], xs[sel]], axis=0)
        res.append(((i + 0.5) / n, tuple(int(v) for v in col)))
    p0 = (xs[np.argmin(t)], ys[np.argmin(t)])
    p1 = (xs[np.argmax(t)], ys[np.argmax(t)])
    return res, p0, p1


def grad(gid, mask, direction):
    st, p0, p1 = stops(mask, direction)
    # a megállókat 0..1-re húzzuk ki
    s0 = st[0][0]
    s1 = st[-1][0]
    g = f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{p0[0]}" y1="{p0[1]}" x2="{p1[0]}" y2="{p1[1]}">'
    for o, c in st:
        g += f'<stop offset="{(o - s0) / (s1 - s0):.3f}" stop-color="#{c[0]:02x}{c[1]:02x}{c[2]:02x}"/>'
    return g + "</linearGradient>"


# ---------- 1) címer (felső rész) ----------
SX0, SY0, SX1, SY1 = 330, 140, 930, 790
shield = trace(SX0, SY0, SX1, SY1, turd=10)
boxes = [bbox(c, SX0, SY0) for c in shield]
ring_idx = [i for i, b in enumerate(boxes) if (b[2] - b[0]) > 200]
ex_idx = [i for i, b in enumerate(boxes) if (b[2] - b[0]) <= 200]
# a gyűrű: külső + belső kontúr (a külső a nagyobb)
ring_idx.sort(key=lambda i: -(boxes[i][2] - boxes[i][0]) * (boxes[i][3] - boxes[i][1]))
outer_i, inner_i = ring_idx[0], ring_idx[1]
d_ring = path_d([shield[outer_i], shield[inner_i]], SX0, SY0)
d_outer = path_d([shield[outer_i]], SX0, SY0)
d_inner = path_d([shield[inner_i]], SX0, SY0)
d_ex = path_d([shield[i] for i in ex_idx], SX0, SY0)

# maszkok a színátmenetekhez (a teljes képen)
yy, xx = np.mgrid[0:H, 0:W]
shield_region = (yy >= SY0) & (yy < SY1) & (xx >= SX0) & (xx < SX1)
ink_m = ink > 0.5
ex_box = (xx > 560) & (xx < 695) & (yy > 305) & (yy < 640)
ex_mask = ink_m & shield_region & ex_box
ring_l = ink_m & shield_region & ~ex_box & (xx < 627)
ring_r = ink_m & shield_region & ~ex_box & (xx >= 627)
g_l = grad("gl", ring_l, (0.55, 0.85))
g_r = grad("gr", ring_r, (0.45, 0.9))
g_e = grad("ge", ex_mask, (0.3, 0.95))

# ---------- 2) szöveg ----------
TX0, TY0, TX1, TY1 = 70, 780, 1200, 1060
text = trace(TX0, TY0, TX1, TY1, turd=4)
navy, blue = [], []
for c in text:
    x0, y0, x1, y1 = bbox(c, TX0, TY0)
    cx, cy = int((x0 + x1) / 2), int((y0 + y1) / 2)
    # a kontúr szegélyén mintavételezünk: a mediánszín a kontúr bbox „tinta” pixeleiből
    sub = A[int(y0):int(y1) + 1, int(x0):int(x1) + 1].reshape(-1, 3)
    m = (254 - sub.min(axis=1)) > 120
    if m.sum() == 0:
        continue
    col = np.median(sub[m], axis=0)
    (blue if col[2] > 200 and col[0] < 80 and col[1] > 90 else navy).append(c)
d_navy = path_d(navy, TX0, TY0)
d_blue = path_d(blue, TX0, TY0)
NAVY = "#0b1649"
nav_px = A[790:1060, 70:1200].reshape(-1, 3)
nav_px = nav_px[(nav_px.max(axis=1) < 90)]
if len(nav_px):
    c = np.median(nav_px, axis=0).astype(int)
    NAVY = f"#{c[0]:02x}{c[1]:02x}{c[2]:02x}"
bl_px = A[800:950, 520:1170].reshape(-1, 3)
bl_px = bl_px[(bl_px[:, 2] > 200) & (bl_px[:, 0] < 60)]
BLUE = "#0a78ff"
if len(bl_px):
    c = np.median(bl_px, axis=0).astype(int)
    BLUE = f"#{c[0]:02x}{c[1]:02x}{c[2]:02x}"

defs = f"<defs>{g_l}{g_r}{g_e}"
defs += f'<clipPath id="cl"><rect x="0" y="0" width="627" height="{H}"/></clipPath><clipPath id="cr"><rect x="627" y="0" width="{W}" height="{H}"/></clipPath></defs>'

mark_body = (
    f'<path d="{d_outer}" fill="#fff"/>'
    f'<g clip-path="url(#cl)"><path d="{d_ring}" fill="url(#gl)" fill-rule="evenodd"/></g>'
    f'<g clip-path="url(#cr)"><path d="{d_ring}" fill="url(#gr)" fill-rule="evenodd"/></g>'
    f'<path d="{d_ex}" fill="url(#ge)" fill-rule="evenodd"/>'
)


def svg(vb, body, defs_=defs):
    x, y, w, h = vb
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}">{defs_}{body}</svg>\n'


# teljes logó (átlátszó háttér, fehér belső pajzs)
full = svg((60, 150, 1140, 910), mark_body + f'<path d="{d_navy}" fill="{NAVY}" fill-rule="evenodd"/><path d="{d_blue}" fill="{BLUE}" fill-rule="evenodd"/>')
open("logo.svg", "w").write(full)
# csak a címer
mx0, my0, mx1, my1 = boxes[outer_i]
pad = 6
open("logo-mark.svg", "w").write(svg((mx0 - pad, my0 - pad, mx1 - mx0 + 2 * pad, my1 - my0 + 2 * pad), mark_body))
# sötét háttérre: világos szöveg
dark = svg((60, 150, 1140, 910), mark_body + f'<path d="{d_navy}" fill="#ffffff" fill-rule="evenodd"/><path d="{d_blue}" fill="#4db8ff" fill-rule="evenodd"/>')
open("logo-dark.svg", "w").write(dark)
print("navy", NAVY, "blue", BLUE, "curves", len(shield), len(text), "navy/blue", len(navy), len(blue))
print("mark bbox", boxes[outer_i])
