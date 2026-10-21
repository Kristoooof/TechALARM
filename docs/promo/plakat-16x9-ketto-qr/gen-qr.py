# A két QR-kód SVG-jét állítja elő (pip install segno):   python3 gen-qr.py
import segno

LINKS = {
    "qr-weboldal.svg": "https://tech-alarm.vercel.app/",
    "qr-kerdoiv.svg": "https://forms.gle/YcREVdZa2MUa7WGT9",
}
for name, url in LINKS.items():
    segno.make(url, error="m", micro=False).save(f"src/{name}", scale=1, border=0, dark="#000000", light=None, xmldecl=False, svgns=True, nl=False)
    f = f"src/{name}"
    svg = open(f).read()
    n = int(svg.split('width="')[1].split('"')[0])
    svg = svg.replace(f'width="{n}" height="{n}"', f'viewBox="0 0 {n} {n}" shape-rendering="crispEdges"', 1)
    open(f, "w").write(svg)
    print(name, "→", url)
