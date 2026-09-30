"""Draws the profile picture, banner and watermark. Needs setup.sh to have run (for the fonts). Run from brand/."""
import math, asyncio
from playwright.async_api import async_playwright
BG="#0E1726"; INK="#F2EFE6"; AMBER="#FFB547"; MINT="#4FD1C5"; DIM="#22324A"
import base64
import os
_b=lambda n: base64.b64encode(open(os.path.expanduser("~/.surprisal_cache/")+n,"rb").read()).decode()
FONTS="@font-face{font-family:Fr;src:url(data:font/ttf;base64,"+_b("Fraunces-VF.ttf")+")}@font-face{font-family:SG;src:url(data:font/ttf;base64,"+_b("SpaceGrotesk-VF.ttf")+")}"

def curve(x0,x1,y0,y1,pmin=0.03,n=200):
    # surprisal -log2 p, p from pmin..1 mapped left->right, y0 top (max), y1 bottom (0)
    ymax=-math.log2(pmin); pts=[]
    for i in range(n+1):
        p=pmin+(1-pmin)*(i/n)**2.2
        s=-math.log2(p)
        x=x0+(x1-x0)*(p-pmin)/(1-pmin); y=y1-(y1-y0)*s/ymax
        pts.append((x,y))
    return "M"+" L".join(f"{x:.1f},{y:.1f}" for x,y in pts), pts, ymax

def pt(x0,x1,y0,y1,p,pmin=0.03):
    ymax=-math.log2(pmin); s=-math.log2(p)
    return x0+(x1-x0)*(p-pmin)/(1-pmin), y1-(y1-y0)*s/ymax

def mark_svg(size, circle=True):
    k=size/800
    x0,x1,y0,y1=250*k,590*k,190*k,560*k
    d,_,_=curve(x0,x1,y0,y1,pmin=0.04)
    dx,dy=pt(x0,x1,y0,y1,0.12,pmin=0.04)
    sw=44*k; ay=y1+62*k
    bg=f'<circle cx="{400*k}" cy="{400*k}" r="{400*k}" fill="{BG}"/>' if circle else f'<rect width="{size}" height="{size}" fill="{BG}"/>'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
{bg}
<line x1="{x0-6*k}" y1="{ay}" x2="{x1+6*k}" y2="{ay}" stroke="{MINT}" stroke-width="{16*k}" stroke-linecap="round"/>
<path d="{d}" fill="none" stroke="{INK}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="{dx}" cy="{dy}" r="{62*k}" fill="{BG}"/>
<circle cx="{dx}" cy="{dy}" r="{46*k}" fill="{AMBER}"/>
</svg>'''

def banner_html():
    W,H=2560,1440
    d,_,_=curve(-40,W+40,120,1380,pmin=0.012)
    grid="".join(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}" stroke="{DIM}" stroke-width="2" opacity=".55"/>' for x in range(0,W+1,80))
    grid+="".join(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}" stroke="{DIM}" stroke-width="2" opacity=".55"/>' for y in range(0,H+1,80))
    dx,dy=pt(-40,W+40,120,1380,0.07,pmin=0.012)
    return f'''<html><head><style>{FONTS}
body{{margin:0;width:{W}px;height:{H}px;background:{BG};overflow:hidden;position:relative}}
.bg{{position:absolute;inset:0}}
.safe{{position:absolute;left:507px;top:508px;width:1546px;height:424px;display:flex;align-items:center;justify-content:center;gap:64px}}
.word{{font-family:Fr;font-variation-settings:'opsz' 144,'SOFT' 50,'WONK' 1;font-weight:600;font-size:210px;color:{INK};letter-spacing:-4px;line-height:1}}
.tag{{white-space:nowrap;font-family:SG;font-weight:500;font-size:46px;color:{INK};opacity:.92;line-height:1.25}}
.tag b{{color:{AMBER};font-weight:600}}
.sub{{white-space:nowrap;font-family:SG;font-size:30px;color:{MINT};margin-top:22px;letter-spacing:3px;text-transform:uppercase;font-weight:600}}
.rule{{width:4px;height:230px;background:{MINT};opacity:.8;border-radius:2px}}
</style></head><body>
<svg class="bg" width="{W}" height="{H}">{grid}
<path d="{d}" fill="none" stroke="{MINT}" stroke-width="10" opacity=".35" stroke-linecap="round"/>
<circle cx="{dx}" cy="{dy}" r="20" fill="{AMBER}" opacity=".9"/></svg>
<div class="safe">
 <div class="word">Surprisal</div>
 <div class="rule"></div>
 <div><div class="tag">Math that sounds wrong<br><b>but is true.</b></div><div class="sub">New video every morning</div></div>
</div></body></html>'''

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/opt/pw-browsers/chromium" if False else None)
        async def shot(html,w,h,out,transparent=False):
            pg=await b.new_page(viewport={"width":w,"height":h})
            await pg.set_content(html); await pg.wait_for_timeout(400)
            await pg.screenshot(path=out,omit_background=transparent); await pg.close()
        await shot(f'<html><body style="margin:0;background:transparent">{mark_svg(800)}</body></html>',800,800,"surprisal-profile-800.png",True)
        await shot(f'<html><body style="margin:0;background:transparent">{mark_svg(150)}</body></html>',150,150,"surprisal-watermark-150.png",True)
        await shot(banner_html(),2560,1440,"surprisal-banner-2560x1440.png")
        await b.close()
asyncio.run(main())
