from pathlib import Path
from urllib.request import Request, urlopen

BASE = "https://raw.githubusercontent.com/mohamedatef90/exercise-library/main/gifs"
OUT = Path("public/gifs")
OUT.mkdir(parents=True, exist_ok=True)

GIFS = {
    "supino-reto.gif": "EIeI8Vf.gif",
    "flexao.gif": "I4hDWkc.gif",
    "triceps-corda.gif": "dU605di.gif",
    "crunch.gif": "TFqbd8t.gif",
    "prancha.gif": "VBAWRPG.gif",
    "puxada-alta.gif": "LEprlgG.gif",
    "remada-baixa.gif": "fUBheHs.gif",
    "rosca-direta.gif": "25GPyDY.gif",
    "caminhada-inclinada.gif": "rjiM4L3.gif",
    "agachamento.gif": "iYzB0Cz.gif",
    "leg-press.gif": "2Qh2J1e.gif",
    "romeno.gif": "wQ2c4XD.gif",
    "panturrilha.gif": "ykUOVze.gif",
    "desenvolvimento.gif": "znQUdHY.gif",
    "elevacao-lateral.gif": "DsgkuIt.gif",
    "elevacao-pernas.gif": "WhuFnR7.gif",
    "bicicleta.gif": "a8VDgLw.gif",
    "agachamento-goblet.gif": "yn8yg1r.gif",
    "mountain-climber.gif": "RJgzwny.gif",
}

for target_name, source_name in GIFS.items():
    url = f"{BASE}/{source_name}"
    req = Request(url, headers={"User-Agent": "Projeto-Trincado/0.5.3"})
    with urlopen(req, timeout=45) as response:
        payload = response.read()
    if not payload.startswith((b"GIF87a", b"GIF89a")):
        raise RuntimeError(f"GIF invalido: {target_name}")
    if len(payload) < 10000:
        raise RuntimeError(f"GIF pequeno: {target_name}")
    (OUT / target_name).write_bytes(payload)
    print(f"OK {target_name} <- {source_name} ({len(payload)} bytes)")

print(f"{len(GIFS)} GIFs preparados em {OUT}")
