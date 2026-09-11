from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math

OUT = Path("public/gifs")
OUT.mkdir(parents=True, exist_ok=True)
W, H = 240, 174
BG = (10, 15, 20)
PANEL = (19, 27, 35)
FG = (234, 240, 244)
MUTED = (137, 151, 161)
ACCENT = (184, 255, 61)
EQUIP = (92, 108, 119)
FPS = 90

try:
    FONT = ImageFont.truetype("DejaVuSans-Bold.ttf", 16)
    SMALL = ImageFont.truetype("DejaVuSans.ttf", 11)
except OSError:
    FONT = ImageFont.load_default()
    SMALL = ImageFont.load_default()

def pt(x, y): return (int(x), int(y))
def lerp(a, b, t): return a + (b-a)*t

def line(d, a, b, fill=FG, width=6):
    d.line([pt(*a), pt(*b)], fill=fill, width=width, joint="curve")

def joint(d, p, r=5, fill=ACCENT):
    x,y=p; d.ellipse((x-r,y-r,x+r,y+r), fill=fill)

def person(d, head, shoulder, hip, knee_l, foot_l, knee_r, foot_r, hand_l=None, hand_r=None, elbow_l=None, elbow_r=None):
    hx,hy=head; d.ellipse((hx-9,hy-9,hx+9,hy+9), outline=FG, width=4)
    line(d, shoulder, hip)
    line(d, hip, knee_l); line(d, knee_l, foot_l)
    line(d, hip, knee_r); line(d, knee_r, foot_r)
    if hand_l:
        e = elbow_l or ((shoulder[0]+hand_l[0])/2, (shoulder[1]+hand_l[1])/2)
        line(d, shoulder, e); line(d, e, hand_l)
    if hand_r:
        e = elbow_r or ((shoulder[0]+hand_r[0])/2, (shoulder[1]+hand_r[1])/2)
        line(d, shoulder, e); line(d, e, hand_r)
    for p in [shoulder, hip, knee_l, knee_r]: joint(d,p,4)

def base(title, subtitle):
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    d.rounded_rectangle((6,6,W-6,H-6), radius=18, fill=PANEL)
    d.text((14,11), title, font=FONT, fill=FG)
    d.text((14,31), subtitle, font=SMALL, fill=MUTED)
    d.line((14,H-20,W-14,H-20), fill=(39,52,61), width=2)
    return im,d

def phase(i, n=10):
    return 0.5 - 0.5*math.cos(2*math.pi*i/n)

def upright(d, t, arm="down", squat=False, hinge=False):
    cx=120
    if squat:
        hip=(cx, lerp(92,116,t)); sh=(cx, lerp(62,80,t)); head=(cx,lerp(45,63,t))
        kl=(lerp(105,91,t),lerp(126,132,t)); kr=(lerp(135,149,t),lerp(126,132,t)); fl=(88,150); fr=(152,150)
    elif hinge:
        hip=(120,100); sh=(lerp(120,151,t), lerp(65,88,t)); head=(lerp(120,164,t),lerp(45,70,t)); kl=(105,132); kr=(135,132); fl=(95,150);fr=(145,150)
    else:
        hip=(cx,105); sh=(cx,68); head=(cx,47); kl=(107,132);kr=(133,132);fl=(100,151);fr=(140,151)
    if arm=="press":
        hl=(lerp(92,102,t),lerp(76,37,t)); hr=(lerp(148,138,t),lerp(76,37,t)); el=(98,lerp(69,52,t)); er=(142,lerp(69,52,t))
    elif arm=="lateral":
        hl=(lerp(108,70,t),lerp(91,68,t)); hr=(lerp(132,170,t),lerp(91,68,t)); el=(lerp(112,92,t),lerp(79,70,t)); er=(lerp(128,148,t),lerp(79,70,t))
    elif arm=="curl":
        hl=(100,lerp(112,77,t)); hr=(140,lerp(112,77,t)); el=(104,90);er=(136,90)
    else:
        hl=(103,112);hr=(137,112);el=(105,88);er=(135,88)
    person(d,head,sh,hip,kl,fl,kr,fr,hl,hr,el,er)
    return hl,hr

def gif_frames(kind, title, subtitle):
    frames=[]
    for i in range(10):
        t=phase(i)
        im,d=base(title,subtitle)
        d.text((14,H-16), "movimento controlado", font=SMALL, fill=ACCENT)
        if kind in {"squat","goblet"}:
            upright(d,t,squat=True)
            if kind=="goblet": d.ellipse((111,70,129,88),fill=EQUIP)
        elif kind=="press":
            hl,hr=upright(d,t,arm="press"); line(d,(hl[0]-9,hl[1]),(hr[0]+9,hr[1]),EQUIP,5)
        elif kind=="lateral":
            hl,hr=upright(d,t,arm="lateral")
            for x,y in [hl,hr]: d.ellipse((x-5,y-5,x+5,y+5),fill=EQUIP)
        elif kind=="curl":
            hl,hr=upright(d,t,arm="curl"); line(d,(hl[0]-5,hl[1]),(hr[0]+5,hr[1]),EQUIP,4)
        elif kind=="hinge":
            upright(d,t,hinge=True); line(d,(92,lerp(112,121,t)),(170,lerp(112,121,t)),EQUIP,5)
        elif kind=="calf":
            upright(d,0); y=lerp(151,143,t); d.line((88,153,152,153),fill=EQUIP,width=3); d.ellipse((95,y-3,105,y+3),fill=ACCENT); d.ellipse((135,y-3,145,y+3),fill=ACCENT)
        elif kind=="pulldown":
            upright(d,0); y=lerp(42,76,t); line(d,(80,y),(160,y),EQUIP,4); line(d,(120,68),(85,y),FG,5); line(d,(120,68),(155,y),FG,5)
        elif kind=="row":
            upright(d,0); x=lerp(184,143,t); line(d,(120,77),(x,86),FG,5); d.rectangle((184,80,194,92),fill=EQUIP); line(d,(x,86),(188,86),EQUIP,2)
        elif kind=="pushup":
            y=lerp(90,111,t); d.ellipse((46,y-10,64,y+8),outline=FG,width=4); line(d,(64,y),(118,y+4)); line(d,(118,y+4),(178,126)); line(d,(84,y+1),(70,134)); line(d,(130,y+8),(117,134)); d.line((54,137,188,137),fill=EQUIP,width=3)
        elif kind=="bench":
            y=lerp(74,101,t); d.line((55,124,180,124),fill=EQUIP,width=6); d.ellipse((73,98,91,116),outline=FG,width=4); line(d,(91,107),(143,110)); line(d,(103,108),(98,y)); line(d,(128,109),(133,y)); line(d,(88,y),(143,y),EQUIP,5)
        elif kind=="triceps":
            upright(d,0); y=lerp(79,112,t); line(d,(120,68),(104,89)); line(d,(104,89),(100,y)); line(d,(120,68),(136,89));line(d,(136,89),(140,y)); d.line((120,38,120,77),fill=EQUIP,width=2)
        elif kind=="crunch":
            y=lerp(106,88,t); d.line((50,137,190,137),fill=EQUIP,width=3); d.ellipse((75,y-9,93,y+9),outline=FG,width=4); line(d,(92,y),(133,119)); line(d,(133,119),(155,137)); line(d,(133,119),(116,137))
        elif kind=="plank":
            d.line((45,137,194,137),fill=EQUIP,width=3); d.ellipse((56,89,74,107),outline=FG,width=4); line(d,(74,99),(142,112)); line(d,(142,112),(184,129)); line(d,(93,104),(82,134)); line(d,(127,109),(119,134))
        elif kind=="legraise":
            d.line((45,137,192,137),fill=EQUIP,width=3); d.ellipse((57,108,75,126),outline=FG,width=4); line(d,(75,117),(126,126)); a=lerp(0,54,t); rad=math.radians(a); end=(126+56*math.cos(rad),126-56*math.sin(rad)); line(d,(126,126),end)
        elif kind=="legpress":
            d.line((64,132,100,94),fill=EQUIP,width=8); d.ellipse((74,101,92,119),outline=FG,width=4); hip=(99,122); knee=(lerp(121,146,t),lerp(112,91,t)); foot=(lerp(145,172,t),lerp(91,67,t)); line(d,(91,111),hip);line(d,hip,knee);line(d,knee,foot); d.line((176,52,190,82),fill=EQUIP,width=8)
        elif kind=="walk":
            upright(d,t*0.15); d.line((41,151,198,151),fill=EQUIP,width=3); d.line((42,151,192,123),fill=ACCENT,width=3)
        elif kind=="bike":
            d.ellipse((69,102,111,144),outline=EQUIP,width=4); d.ellipse((139,102,181,144),outline=EQUIP,width=4); line(d,(90,123),(132,123),EQUIP,4);line(d,(132,123),(153,92),EQUIP,4);line(d,(153,92),(118,83),EQUIP,4); d.ellipse((111,46,129,64),outline=FG,width=4);line(d,(120,65),(129,93));line(d,(129,93),(151,93)); line(d,(129,92),(118,123)); ang=2*math.pi*i/10; knee=(118+20*math.cos(ang),123+10*math.sin(ang)); line(d,(118,123),knee); line(d,knee,(91,123))
        elif kind=="mountain":
            d.line((45,137,194,137),fill=EQUIP,width=3); d.ellipse((55,84,73,102),outline=FG,width=4); line(d,(73,94),(129,106)); line(d,(92,98),(81,134)); hip=(129,106); line(d,hip,(lerp(151,116,t),lerp(118,128,t))); line(d,(lerp(151,116,t),lerp(118,128,t)),(176,134)); line(d,hip,(155,132))
        frames.append(im)
    return frames

SPECS = {
    "agachamento.gif": ("squat","Agachamento","quadril para trás"),
    "agachamento-goblet.gif": ("goblet","Goblet squat","carga junto ao peito"),
    "bicicleta.gif": ("bike","Bicicleta","cadência constante"),
    "caminhada-inclinada.gif": ("walk","Caminhada inclinada","passos firmes"),
    "crunch.gif": ("crunch","Crunch","feche as costelas"),
    "desenvolvimento.gif": ("press","Desenvolvimento","empurre acima da cabeça"),
    "elevacao-lateral.gif": ("lateral","Elevação lateral","sem embalo"),
    "elevacao-pernas.gif": ("legraise","Elevação de pernas","controle a lombar"),
    "flexao.gif": ("pushup","Flexão","corpo em linha"),
    "leg-press.gif": ("legpress","Leg press","controle a descida"),
    "mountain-climber.gif": ("mountain","Mountain climber","quadril estável"),
    "panturrilha.gif": ("calf","Panturrilha","pausa no topo"),
    "prancha.gif": ("plank","Prancha","core firme"),
    "puxada-alta.gif": ("pulldown","Puxada alta","cotovelos para baixo"),
    "remada-baixa.gif": ("row","Remada baixa","escápulas para trás"),
    "romeno.gif": ("hinge","Levantamento romeno","quadril recua"),
    "rosca-direta.gif": ("curl","Rosca direta","cotovelos fixos"),
    "supino-reto.gif": ("bench","Supino reto","desça com controle"),
    "triceps-corda.gif": ("triceps","Tríceps corda","cotovelos fixos"),
}

for filename, (kind,title,subtitle) in SPECS.items():
    frames=gif_frames(kind,title,subtitle)
    frames[0].save(OUT/filename, save_all=True, append_images=frames[1:], duration=FPS, loop=0, optimize=True)
print(f"Generated {len(SPECS)} offline GIFs in {OUT}")
