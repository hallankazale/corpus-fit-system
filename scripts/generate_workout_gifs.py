from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math

OUT = Path("public/gifs")
OUT.mkdir(parents=True, exist_ok=True)
W = H = 420
BG = (250, 250, 249)
BODY = (224, 226, 225)
BODY_DARK = (71, 76, 78)
EQUIP = (181, 184, 184)
EQUIP_DARK = (91, 96, 98)
MUSCLE = (218, 71, 57)
MUSCLE_SOFT = (236, 120, 101)
TEXT = (50, 54, 56)
MUTED = (135, 139, 140)
FPS = 90
FRAMES = 14

try:
    BRAND = ImageFont.truetype("DejaVuSans-Bold.ttf", 14)
except OSError:
    BRAND = ImageFont.load_default()


def lerp(a, b, t):
    return a + (b - a) * t


def wave(i):
    return 0.5 - 0.5 * math.cos(2 * math.pi * i / FRAMES)


def point(x, y):
    return int(x), int(y)


def line(draw, a, b, fill=BODY_DARK, width=11):
    draw.line([point(*a), point(*b)], fill=fill, width=width, joint="curve")


def capsule(draw, a, b, width=18, fill=BODY, outline=BODY_DARK):
    line(draw, a, b, fill=outline, width=width + 5)
    line(draw, a, b, fill=fill, width=width)


def joint(draw, p, radius=8, fill=BODY, outline=BODY_DARK):
    x, y = p
    draw.ellipse((x-radius-2, y-radius-2, x+radius+2, y+radius+2), fill=outline)
    draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill=fill)


def muscle_blob(draw, p, rx, ry, angle=0):
    x, y = p
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.ellipse((x-rx, y-ry, x+rx, y+ry), fill=(*MUSCLE, 235), outline=(*MUSCLE_SOFT, 255), width=2)
    if angle:
        layer = layer.rotate(angle, center=(x, y), resample=Image.Resampling.BICUBIC)
    draw.bitmap((0, 0), layer)


def base():
    image = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((9, 9, W-9, H-9), radius=22, outline=(226, 228, 228), width=2)
    draw.text((W-112, H-31), "CORPUS FIT", font=BRAND, fill=MUTED)
    return image, draw


def equipment_floor(draw):
    draw.line((38, 348, 382, 348), fill=(216, 218, 218), width=3)


def machine_frame(draw, x1=250, y1=55, x2=370, y2=330):
    draw.rounded_rectangle((x1, y1, x2, y2), radius=8, outline=EQUIP_DARK, width=8)
    draw.line((x1+20, y1+20, x2-20, y1+20), fill=EQUIP, width=7)
    draw.rectangle((x2-45, y1+75, x2-20, y2-35), fill=(235, 236, 236), outline=EQUIP_DARK, width=4)
    for y in range(int(y1+95), int(y2-45), 20):
        draw.line((x2-41, y, x2-24, y), fill=(173, 176, 177), width=2)
    draw.ellipse((x1+7, y1+11, x1+25, y1+29), outline=EQUIP_DARK, width=4)


def torso(draw, shoulder, hip, head, view="front"):
    sx, sy = shoulder
    hx, hy = hip
    neck = (sx, sy-18)
    draw.ellipse((head[0]-19, head[1]-22, head[0]+19, head[1]+22), fill=BODY, outline=BODY_DARK, width=5)
    draw.polygon([
        point(sx-31, sy-7), point(sx+31, sy-7), point(hx+24, hy+5), point(hx-24, hy+5)
    ], fill=BODY, outline=BODY_DARK)
    line(draw, neck, shoulder, fill=BODY_DARK, width=5)
    joint(draw, shoulder, 7)
    joint(draw, hip, 8)


def draw_person(draw, shoulder, hip, head, elbows, hands, knees, feet, highlights=()):
    torso(draw, shoulder, hip, head)
    for elbow, hand in zip(elbows, hands):
        capsule(draw, shoulder, elbow, 17)
        capsule(draw, elbow, hand, 15)
        joint(draw, elbow, 7)
        joint(draw, hand, 5)
    for knee, foot in zip(knees, feet):
        capsule(draw, hip, knee, 20)
        capsule(draw, knee, foot, 17)
        joint(draw, knee, 8)
        joint(draw, foot, 5)

    # Anatomical emphasis. These are deliberately simplified, original illustrations.
    for name in highlights:
        if name == "chest":
            muscle_blob(draw, (shoulder[0]-14, shoulder[1]+14), 16, 12)
            muscle_blob(draw, (shoulder[0]+14, shoulder[1]+14), 16, 12)
        elif name == "back":
            muscle_blob(draw, (shoulder[0], shoulder[1]+25), 26, 28)
        elif name == "shoulder":
            muscle_blob(draw, (shoulder[0]-31, shoulder[1]), 10, 13)
            muscle_blob(draw, (shoulder[0]+31, shoulder[1]), 10, 13)
        elif name == "biceps":
            for elbow in elbows:
                muscle_blob(draw, ((shoulder[0]+elbow[0])/2, (shoulder[1]+elbow[1])/2), 8, 14)
        elif name == "triceps":
            for elbow in elbows:
                muscle_blob(draw, ((shoulder[0]+elbow[0])/2+4, (shoulder[1]+elbow[1])/2), 7, 14)
        elif name == "abs":
            muscle_blob(draw, (shoulder[0], (shoulder[1]+hip[1])/2+6), 14, 27)
        elif name == "quads":
            for knee in knees:
                muscle_blob(draw, ((hip[0]+knee[0])/2, (hip[1]+knee[1])/2), 10, 20)
        elif name == "hamstrings":
            for knee in knees:
                muscle_blob(draw, ((hip[0]+knee[0])/2+3, (hip[1]+knee[1])/2), 9, 18)
        elif name == "glutes":
            muscle_blob(draw, (hip[0]-10, hip[1]), 16, 13)
            muscle_blob(draw, (hip[0]+10, hip[1]), 16, 13)
        elif name == "calves":
            for knee, foot in zip(knees, feet):
                muscle_blob(draw, ((knee[0]+foot[0])/2, (knee[1]+foot[1])/2), 8, 17)


def standing(draw, t, motion="neutral", highlights=()):
    shoulder=(170,145); hip=(170,235); head=(170,99)
    knees=[(151,294),(189,294)]; feet=[(145,347),(195,347)]
    if motion == "press":
        elbows=[(140,lerp(178,112,t)),(200,lerp(178,112,t))]
        hands=[(130,lerp(150,73,t)),(210,lerp(150,73,t))]
    elif motion == "lateral":
        elbows=[(lerp(149,105,t),lerp(185,148,t)),(lerp(191,235,t),lerp(185,148,t))]
        hands=[(lerp(140,64,t),lerp(220,148,t)),(lerp(200,276,t),lerp(220,148,t))]
    elif motion == "curl":
        elbows=[(145,190),(195,190)]
        hands=[(140,lerp(245,162,t)),(200,lerp(245,162,t))]
    elif motion == "pushdown":
        elbows=[(145,185),(195,185)]
        hands=[(145,lerp(172,242,t)),(195,lerp(172,242,t))]
    else:
        elbows=[(145,190),(195,190)]; hands=[(142,245),(198,245)]
    draw_person(draw, shoulder, hip, head, elbows, hands, knees, feet, highlights)
    return elbows,hands


def squat(draw, t, goblet=False):
    shoulder=(170,lerp(140,178,t)); hip=(170,lerp(232,275,t)); head=(170,lerp(95,133,t))
    knees=[(lerp(151,132,t),lerp(293,302,t)),(lerp(189,208,t),lerp(293,302,t))]
    feet=[(130,347),(210,347)]
    elbows=[(145,190),(195,190)]; hands=[(150,220),(190,220)]
    draw_person(draw, shoulder, hip, head, elbows, hands, knees, feet, ("quads","glutes"))
    if goblet:
        draw.ellipse((156,192,184,220), fill=EQUIP_DARK)
    else:
        draw.line((110,131,230,131), fill=EQUIP_DARK, width=9)
        draw.rectangle((100,118,111,144), fill=EQUIP_DARK)
        draw.rectangle((230,118,241,144), fill=EQUIP_DARK)
        draw.line((94,60,94,348), fill=EQUIP, width=7)
        draw.line((246,60,246,348), fill=EQUIP, width=7)


def render(kind, t):
    im, draw = base()
    equipment_floor(draw)

    if kind == "squat":
        squat(draw,t)
    elif kind == "goblet":
        squat(draw,t,True)
    elif kind == "press":
        _,hands=standing(draw,t,"press",("shoulder","triceps"))
        for h in hands: draw.ellipse((h[0]-11,h[1]-7,h[0]+11,h[1]+7),fill=EQUIP_DARK)
        draw.line((122,300,218,300), fill=EQUIP, width=6)
    elif kind == "lateral":
        _,hands=standing(draw,t,"lateral",("shoulder",))
        for h in hands: draw.ellipse((h[0]-10,h[1]-7,h[0]+10,h[1]+7),fill=EQUIP_DARK)
    elif kind == "curl":
        _,hands=standing(draw,t,"curl",("biceps",))
        draw.line((hands[0][0]-11,hands[0][1],hands[1][0]+11,hands[1][1]),fill=EQUIP_DARK,width=8)
    elif kind == "pushdown":
        machine_frame(draw,264,48,372,330)
        _,hands=standing(draw,t,"pushdown",("triceps",))
        pulley=(280,76)
        draw.line((pulley[0],pulley[1],170,153),fill=EQUIP_DARK,width=3)
        draw.line((145,lerp(168,236,t),195,lerp(168,236,t)),fill=EQUIP_DARK,width=5)
    elif kind == "pulldown":
        machine_frame(draw,255,45,372,330)
        shoulder=(165,155); hip=(165,245); head=(165,109)
        y=lerp(80,160,t); elbows=[(130,lerp(130,188,t)),(200,lerp(130,188,t))]; hands=[(112,y),(218,y)]
        knees=[(150,290),(180,290)]; feet=[(145,343),(190,343)]
        draw_person(draw,shoulder,hip,head,elbows,hands,knees,feet,("back","biceps"))
        draw.line((102,y,228,y),fill=EQUIP_DARK,width=8)
        draw.line((165,58,165,y),fill=EQUIP_DARK,width=3)
        draw.rounded_rectangle((126,268,204,284),8,fill=EQUIP_DARK)
    elif kind == "row":
        machine_frame(draw,280,65,377,328)
        shoulder=(160,158); hip=(160,246); head=(160,111)
        x=lerp(240,188,t); elbows=[(lerp(205,171,t),178),(lerp(205,171,t),196)]; hands=[(x,184),(x,201)]
        knees=[(145,290),(182,290)]; feet=[(140,343),(190,343)]
        draw_person(draw,shoulder,hip,head,elbows,hands,knees,feet,("back","biceps"))
        draw.line((240,193,292,193),fill=EQUIP_DARK,width=3)
        draw.line((238,175,238,210),fill=EQUIP_DARK,width=7)
        draw.rounded_rectangle((123,265,205,281),8,fill=EQUIP_DARK)
    elif kind == "bench":
        draw.line((70,274,270,274),fill=EQUIP_DARK,width=12)
        draw.line((92,274,77,346),fill=EQUIP,width=8); draw.line((248,274,265,346),fill=EQUIP,width=8)
        shoulder=(145,250); hip=(215,258); head=(105,246)
        y=lerp(148,218,t); elbows=[(128,lerp(195,230,t)),(194,lerp(195,230,t))]; hands=[(130,y),(200,y)]
        knees=[(245,282),(255,288)]; feet=[(258,343),(305,343)]
        draw_person(draw,shoulder,hip,head,elbows,hands,knees,feet,("chest","triceps"))
        draw.line((91,y,239,y),fill=EQUIP_DARK,width=9)
        draw.rectangle((75,y-16,91,y+16),fill=EQUIP_DARK); draw.rectangle((239,y-16,255,y+16),fill=EQUIP_DARK)
    elif kind == "pushup":
        shoulder=(130,lerp(210,236,t)); hip=(220,lerp(225,242,t)); head=(85,lerp(202,228,t))
        elbows=[(112,lerp(255,276,t)),(150,lerp(255,276,t))]; hands=[(105,315),(150,315)]
        knees=[(270,255),(280,260)]; feet=[(323,310),(338,312)]
        draw_person(draw,shoulder,hip,head,elbows,hands,knees,feet,("chest","triceps","abs"))
    elif kind == "hinge":
        a=lerp(0,47,t); rad=math.radians(a)
        hip=(170,235); shoulder=(170+92*math.sin(rad),145+42*(1-math.cos(rad))); head=(shoulder[0]+8,shoulder[1]-47)
        knees=[(151,294),(189,294)]; feet=[(145,347),(195,347)]; elbows=[(shoulder[0]-15,shoulder[1]+45),(shoulder[0]+15,shoulder[1]+45)]; hands=[(elbows[0][0],lerp(245,306,t)),(elbows[1][0],lerp(245,306,t))]
        draw_person(draw,shoulder,hip,head,elbows,hands,knees,feet,("hamstrings","glutes"))
        draw.line((hands[0][0]-34,hands[0][1],hands[1][0]+34,hands[1][1]),fill=EQUIP_DARK,width=9)
    elif kind == "calf":
        shoulder=(170,145); hip=(170,235); head=(170,99); lift=lerp(0,-14,t)
        knees=[(151,294+lift),(189,294+lift)]; feet=[(145,347+lift),(195,347+lift)]; elbows=[(145,190),(195,190)]; hands=[(142,245),(198,245)]
        draw_person(draw,shoulder,hip,head,elbows,hands,knees,feet,("calves",))
        draw.line((120,351,220,351),fill=EQUIP_DARK,width=8)
    elif kind == "legpress":
        draw.line((69,306,142,225),fill=EQUIP_DARK,width=12); draw.rounded_rectangle((83,259,157,286),8,fill=EQUIP)
        hip=(145,260); shoulder=(113,235); head=(88,216)
        knee=(lerp(194,237,t),lerp(258,218,t)); foot=(lerp(242,292,t),lerp(200,151,t))
        elbows=[(101,261),(117,269)]; hands=[(91,286),(110,294)]; knees=[knee,(knee[0]+8,knee[1]+8)]; feet=[foot,(foot[0]+8,foot[1]+8)]
        draw_person(draw,shoulder,hip,head,elbows,hands,knees,feet,("quads","glutes"))
        draw.line((280,95,330,179),fill=EQUIP_DARK,width=13); draw.line((250,195,337,143),fill=EQUIP,width=7)
    elif kind == "crunch":
        shoulder=(lerp(145,176,t),lerp(250,218,t)); hip=(220,270); head=(shoulder[0]-37,shoulder[1]-20)
        elbows=[(shoulder[0]-20,shoulder[1]+5),(shoulder[0]+9,shoulder[1]-8)]; hands=[(head[0]-4,head[1]+4),(head[0]+8,head[1]+10)]
        knees=[(272,250),(278,257)]; feet=[(318,315),(336,319)]
        draw_person(draw,shoulder,hip,head,elbows,hands,knees,feet,("abs",))
        draw.line((70,323,350,323),fill=(211,213,213),width=5)
    elif kind == "plank":
        shoulder=(135,210); hip=(220,231); head=(90,199); elbows=[(110,264),(128,267)]; hands=[(83,286),(112,288)]; knees=[(275,248),(286,251)]; feet=[(331,302),(346,304)]
        draw_person(draw,shoulder,hip,head,elbows,hands,knees,feet,("abs","shoulder"))
        draw.line((55,316,367,316),fill=(211,213,213),width=5)
    elif kind == "legraise":
        shoulder=(135,255); hip=(210,270); head=(95,246); angle=math.radians(lerp(8,58,t))
        elbows=[(128,280),(150,284)]; hands=[(108,304),(135,307)]
        knee=(210+65*math.cos(angle),270-65*math.sin(angle)); foot=(210+130*math.cos(angle),270-130*math.sin(angle))
        knees=[knee,(knee[0]+5,knee[1]+7)]; feet=[foot,(foot[0]+5,foot[1]+7)]
        draw_person(draw,shoulder,hip,head,elbows,hands,knees,feet,("abs",))
        draw.line((58,325,360,325),fill=(211,213,213),width=5)
    elif kind == "mountain":
        shoulder=(133,205); hip=(218,230); head=(88,194); elbows=[(115,260),(143,264)]; hands=[(103,302),(142,305)]
        k1=(lerp(270,205,t),lerp(255,281,t)); k2=(lerp(205,276,t),lerp(281,255,t)); feet=[(330,306),(337,309)]
        draw_person(draw,shoulder,hip,head,elbows,hands,[k1,k2],feet,("abs","quads","shoulder"))
        draw.line((55,316,367,316),fill=(211,213,213),width=5)
    elif kind == "walk":
        draw.line((55,325,350,260),fill=EQUIP_DARK,width=12); draw.line((60,338,355,273),fill=EQUIP,width=5)
        shoulder=(178,149); hip=(178,238); head=(178,102); swing=lerp(-22,22,t)
        elbows=[(153,190),(203,190)]; hands=[(145+swing,238),(210-swing,238)]
        knees=[(153+swing*0.4,294),(203-swing*0.4,294)]; feet=[(138+swing,334),(218-swing,334)]
        draw_person(draw,shoulder,hip,head,elbows,hands,knees,feet,("quads","glutes","calves"))
        draw.line((308,190,335,265),fill=EQUIP_DARK,width=7); draw.line((288,189,332,189),fill=EQUIP_DARK,width=7)
    elif kind == "bike":
        draw.ellipse((102,235,195,328),outline=EQUIP_DARK,width=8); draw.ellipse((242,235,335,328),outline=EQUIP_DARK,width=8)
        draw.line((150,281,232,281),fill=EQUIP_DARK,width=8); draw.line((232,281,267,215),fill=EQUIP_DARK,width=8); draw.line((267,215,198,205),fill=EQUIP_DARK,width=8)
        shoulder=(205,145); hip=(218,224); head=(202,98); elbows=[(235,175),(247,178)]; hands=[(270,198),(280,202)]
        ang=2*math.pi*t; knee1=(218+42*math.cos(ang),265+23*math.sin(ang)); knee2=(218-42*math.cos(ang),265-23*math.sin(ang)); feet=[(151,281),(289,281)]
        draw_person(draw,shoulder,hip,head,elbows,hands,[knee1,knee2],feet,("quads","glutes","calves"))
    else:
        standing(draw,t,"neutral",())

    return im


SPECS = {
    "agachamento.gif": "squat",
    "agachamento-goblet.gif": "goblet",
    "bicicleta.gif": "bike",
    "caminhada-inclinada.gif": "walk",
    "crunch.gif": "crunch",
    "desenvolvimento.gif": "press",
    "elevacao-lateral.gif": "lateral",
    "elevacao-pernas.gif": "legraise",
    "flexao.gif": "pushup",
    "leg-press.gif": "legpress",
    "mountain-climber.gif": "mountain",
    "panturrilha.gif": "calf",
    "prancha.gif": "plank",
    "puxada-alta.gif": "pulldown",
    "remada-baixa.gif": "row",
    "romeno.gif": "hinge",
    "rosca-direta.gif": "curl",
    "supino-reto.gif": "bench",
    "triceps-corda.gif": "pushdown",
}

for filename, kind in SPECS.items():
    frames = [render(kind, wave(i)) for i in range(FRAMES)]
    frames[0].save(
        OUT / filename,
        save_all=True,
        append_images=frames[1:],
        duration=FPS,
        loop=0,
        optimize=True,
    )

print(f"Generated {len(SPECS)} anatomical offline GIFs in {OUT}")
