#!/usr/bin/env python3
"""Generate launcher icons from src/assets/images/logo.png (same mark as in-app)."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
LOGO_PATH = ROOT / "src/assets/images/logo.png"
MASTER_PATH = ROOT / "src/assets/images/app-icon-1024.png"
RES_BASE = ROOT / "android/app/src/main/res"
IOS_DIR = ROOT / "ios/MyTaskManagerMobile/Images.xcassets/AppIcon.appiconset"
LAUNCH_LOGO_DIR = ROOT / "ios/MyTaskManagerMobile/Images.xcassets/LaunchLogo.imageset"
ANDROID_DRAWABLE = ROOT / "android/app/src/main/res/drawable-nodpi"

SIZE = 1024

# loginTheme.glassBg base — matches dark header / web mark on black
BG = (0, 0, 0)
MARK_GLOW = (38, 136, 87)
MARK_SOLID = (38, 136, 87)
MARK_HIGHLIGHT = (55, 151, 99)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def lerp_rgb(c1: tuple[int, int, int], c2: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return (lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t))


def black_background(size: int) -> Image.Image:
    return Image.new("RGBA", (size, size), (*BG, 255))


def load_brand_mark(canvas_size: int) -> Image.Image:
    """Crisp mark: logo.png silhouette + brand greens (same shape as in-app)."""
    logo = Image.open(LOGO_PATH).convert("RGBA")
    bbox = logo.getbbox()
    if not bbox:
        raise SystemExit(f"No visible pixels in {LOGO_PATH}")
    logo = logo.crop(bbox)
    alpha = logo.split()[3]

    target_h = int(canvas_size * 0.44)
    target_w = max(1, int(logo.width * target_h / logo.height))

    hr = 24
    hr_w, hr_h = logo.width * hr, logo.height * hr
    hr_alpha = alpha.resize((hr_w, hr_h), Image.Resampling.LANCZOS)
    hr_alpha = hr_alpha.filter(ImageFilter.GaussianBlur(radius=0.85))

    grad = Image.new("RGBA", (hr_w, hr_h))
    gpx = grad.load()
    for y in range(hr_h):
        t = y / max(1, hr_h - 1)
        c = lerp_rgb(MARK_HIGHLIGHT, MARK_SOLID, min(1.0, t * 0.95))
        for x in range(hr_w):
            gpx[x, y] = (*c, hr_alpha.getpixel((x, y)))

    mark = grad.resize((target_w, target_h), Image.Resampling.LANCZOS)
    mark = mark.filter(ImageFilter.UnsharpMask(radius=1.2, percent=110, threshold=2))

    layer = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    ox = (canvas_size - target_w) // 2
    oy = (canvas_size - target_h) // 2 + int(canvas_size * 0.015)
    layer.paste(mark, (ox, oy), mark)
    return layer


def glow_from_mark(mark: Image.Image, color: tuple[int, int, int], blur: int, alpha_scale: float) -> Image.Image:
    glow = Image.new("RGBA", mark.size, (0, 0, 0, 0))
    gpx = glow.load()
    mpx = mark.load()
    w, h = mark.size
    for y in range(h):
        for x in range(w):
            _, _, _, a = mpx[x, y]
            if a:
                gpx[x, y] = (*color, min(255, int(a * alpha_scale)))
    return glow.filter(ImageFilter.GaussianBlur(radius=blur))


def export_launch_mark(canvas_size: int) -> Image.Image:
    """Transparent canvas with centered logo mark (for splash / launch)."""
    return load_brand_mark(canvas_size)


def write_launch_assets() -> None:
    LAUNCH_LOGO_DIR.mkdir(parents=True, exist_ok=True)
    ios_scales = [
        ("launch-logo.png", 120),
        ("launch-logo@2x.png", 240),
        ("launch-logo@3x.png", 360),
    ]
    for name, px in ios_scales:
        export_launch_mark(px).save(LAUNCH_LOGO_DIR / name, "PNG")

    contents = {
        "images": [
            {"filename": "launch-logo.png", "idiom": "universal", "scale": "1x"},
            {"filename": "launch-logo@2x.png", "idiom": "universal", "scale": "2x"},
            {"filename": "launch-logo@3x.png", "idiom": "universal", "scale": "3x"},
        ],
        "info": {"author": "xcode", "version": 1},
    }
    (LAUNCH_LOGO_DIR / "Contents.json").write_text(json.dumps(contents, indent=2) + "\n")

    ANDROID_DRAWABLE.mkdir(parents=True, exist_ok=True)
    export_launch_mark(512).save(ANDROID_DRAWABLE / "splash_logo.png", "PNG")


def compose_master() -> Image.Image:
    canvas = black_background(SIZE)
    mark = load_brand_mark(SIZE)

    halo = glow_from_mark(mark, MARK_GLOW, blur=18, alpha_scale=0.28)
    canvas = Image.alpha_composite(canvas, halo)
    canvas = Image.alpha_composite(canvas, mark)

    return canvas.convert("RGB")


def write_android(master: Image.Image) -> None:
    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }
    for folder, px in sizes.items():
        out_dir = RES_BASE / folder
        out_dir.mkdir(parents=True, exist_ok=True)
        icon = master.resize((px, px), Image.Resampling.LANCZOS)
        icon.save(out_dir / "ic_launcher.png", "PNG")
        icon.save(out_dir / "ic_launcher_round.png", "PNG")


def write_ios(master: Image.Image) -> None:
    IOS_DIR.mkdir(parents=True, exist_ok=True)
    ios_sizes = [
        ("icon-20@2x.png", 40),
        ("icon-20@3x.png", 60),
        ("icon-29@2x.png", 58),
        ("icon-29@3x.png", 87),
        ("icon-40@2x.png", 80),
        ("icon-40@3x.png", 120),
        ("icon-60@2x.png", 120),
        ("icon-60@3x.png", 180),
        ("icon-1024.png", 1024),
    ]
    for name, px in ios_sizes:
        master.resize((px, px), Image.Resampling.LANCZOS).save(IOS_DIR / name, "PNG")


def main() -> None:
    master = compose_master()
    master.save(MASTER_PATH, "PNG")
    write_android(master)
    write_ios(master)
    write_launch_assets()
    print(f"Wrote {MASTER_PATH}")


if __name__ == "__main__":
    main()
