"""Download the professional exercise GIF set used by Projeto Trincado.

The files are pinned to ExerciseGymGifsDB v1.1.0 so builds are reproducible.
This is for prototype/testing distribution; third-party media licensing must be
reviewed before a commercial/Play Store release.
"""
from pathlib import Path
from urllib.request import Request, urlopen

BASE = "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0"
OUT = Path("public/gifs")
OUT.mkdir(parents=True, exist_ok=True)

GIFS = {
    "supino-reto.gif": "pectorals/barbell-bench-press.gif",
    "flexao.gif": "pectorals/push-up.gif",
    "triceps-corda.gif": "triceps/cable-pushdown-with-rope-attachment.gif",
    "crunch.gif": "abs/crunch-floor.gif",
    "prancha.gif": "abs/weighted-front-plank.gif",
    "puxada-alta.gif": "lats/cable-lat-pulldown-full-range-of-motion.gif",
    "remada-baixa.gif": "upper-back/cable-seated-row.gif",
    "rosca-direta.gif": "biceps/barbell-curl.gif",
    "caminhada-inclinada.gif": "cardio/walking-on-incline-treadmill.gif",
    "agachamento.gif": "glutes/barbell-full-squat.gif",
    "leg-press.gif": "glutes/sled-45-leg-press.gif",
    "romeno.gif": "glutes/barbell-romanian-deadlift.gif",
    "panturrilha.gif": "calves/lever-standing-calf-raise.gif",
    "desenvolvimento.gif": "delts/dumbbell-seated-shoulder-press.gif",
    "elevacao-lateral.gif": "delts/dumbbell-lateral-raise.gif",
    "elevacao-pernas.gif": "abs/lying-leg-raise-flat-bench.gif",
    "bicicleta.gif": "cardio/stationary-bike-walk.gif",
    "agachamento-goblet.gif": "quads/dumbbell-goblet-squat.gif",
    "mountain-climber.gif": "cardio/mountain-climber.gif",
}

for target_name, upstream_path in GIFS.items():
    url = f"{BASE}/{upstream_path}"
    request = Request(url, headers={"User-Agent": "Projeto-Trincado-Build/0.5.2"})
    with urlopen(request, timeout=45) as response:
        payload = response.read()
    if not payload.startswith((b"GIF87a", b"GIF89a")):
        raise RuntimeError(f"Arquivo inválido para {target_name}: {url}")
    if len(payload) < 10_000:
        raise RuntimeError(f"GIF muito pequeno para {target_name}: {len(payload)} bytes")
    (OUT / target_name).write_bytes(payload)
    print(f"OK {target_name}: {len(payload)} bytes")

missing = [name for name in GIFS if not (OUT / name).exists()]
if missing:
    raise RuntimeError(f"GIFs ausentes: {missing}")

print(f"{len(GIFS)} GIFs profissionais preparados em {OUT}")
