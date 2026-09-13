import io
import json
from pathlib import Path
from urllib.request import Request, urlopen
import cairosvg
from PIL import Image

MANIFEST = "https://raw.githubusercontent.com/bryllim/workout-guide/main/packages/workout-guide/manifest.json"
BASE = "https://raw.githubusercontent.com/bryllim/workout-guide/main/packages/workout-guide"
OUT = Path("public/gifs")
OUT.mkdir(parents=True, exist_ok=True)

TARGETS = {
    "supino-reto.gif": ["Bench Press"],
    "flexao.gif": ["Push-up", "Wide Push-up"],
    "triceps-corda.gif": ["Rope Tricep Pushdown"],
    "crunch.gif": ["Crunch"],
    "prancha.gif": ["Plank", "Plank Shoulder Tap"],
    "puxada-alta.gif": ["Lat Pulldown"],
    "remada-baixa.gif": ["Seated Cable Row"],
    "rosca-direta.gif": ["Barbell Curl", "EZ-Bar Curl"],
    "caminhada-inclinada.gif": ["Treadmill Incline Walk"],
    "agachamento.gif": ["Squat"],
    "leg-press.gif": ["Leg Press"],
    "romeno.gif": ["Dumbbell Romanian Deadlift"],
    "panturrilha.gif": ["Standing Calf Raise"],
    "desenvolvimento.gif": ["Dumbbell Seated Shoulder Press"],
    "elevacao-lateral.gif": ["Lateral Raise"],
    "elevacao-pernas.gif": ["Lying Leg Raise"],
    "bicicleta.gif": ["Cycling"],
    "agachamento-goblet.gif": ["Goblet Squat"],
    "mountain-climber.gif": ["Mountain Climber"],
}

def read(url):
    req = Request(url, headers={"User-Agent": "Projeto-Trincado/0.5.4"})
    with urlopen(req, timeout=45) as response:
        return response.read()

def pick(items, names):
    exact = {x["name"].casefold(): x for x in items}
    for name in names:
        if name.casefold() in exact:
            return exact[name.casefold()]
    for name in names:
        key = name.casefold()
        for item in items:
            if key in item["name"].casefold():
                return item
    raise RuntimeError(str(names))

def raster(svg):
    png = cairosvg.svg2png(bytestring=svg, output_width=512, output_height=512)
    image = Image.open(io.BytesIO(png)).convert("RGBA")
    bg = Image.new("RGBA", (512, 512), "white")
    bg.alpha_composite(image)
    return bg.convert("P", palette=Image.Palette.ADAPTIVE, colors=256)

items = json.loads(read(MANIFEST).decode())
credits = {}
for filename, names in TARGETS.items():
    ex = pick(items, names)
    frames = [raster(read(f"{BASE}/{f['path']}")) for f in ex["frames"][:3]]
    if len(frames) == 1:
        seq = [frames[0], frames[0]]
    elif len(frames) == 2:
        seq = [frames[0], frames[1], frames[0]]
    else:
        seq = [frames[0], frames[1], frames[2], frames[1]]
    durations = [600, 420, 600, 420][:len(seq)]
    seq[0].save(OUT / filename, save_all=True, append_images=seq[1:], duration=durations, loop=0, optimize=True, disposal=2)
    credits[filename] = {"name": ex["name"], "slug": ex["slug"], "license": "CC BY-SA 4.0"}
    print("OK", filename, ex["name"])

(OUT / "ATTRIBUTION.json").write_text(json.dumps({
    "source": "Workout Guide by Bryl Lim",
    "sourceUrl": "https://github.com/bryllim/workout-guide",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "changes": "Frames converted from SVG to 512px looping GIFs.",
    "assets": credits
}, indent=2), encoding="utf-8")
