"""Run the anatomical GIF generator with safe RGBA compositing.

Pillow's ImageDraw.bitmap expects a 1-bit bitmap in some versions. The anatomical
renderer uses transparent RGBA overlays so muscle highlights can be rotated.
This shim composites those overlays onto the target image and delegates every
other bitmap call to Pillow unchanged.
"""
from pathlib import Path
import runpy
from PIL import ImageDraw

_original_bitmap = ImageDraw.ImageDraw.bitmap


def _safe_bitmap(self, xy, bitmap, fill=None):
    if getattr(bitmap, "mode", None) == "RGBA":
        x, y = int(xy[0]), int(xy[1])
        self._image.paste(bitmap, (x, y), bitmap)
        return None
    return _original_bitmap(self, xy, bitmap, fill=fill)


ImageDraw.ImageDraw.bitmap = _safe_bitmap
runpy.run_path(str(Path(__file__).with_name("generate_workout_gifs.py")), run_name="__main__")
