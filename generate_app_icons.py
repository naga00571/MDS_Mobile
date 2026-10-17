
from pathlib import Path
from datetime import datetime
import shutil
from PIL import Image, ImageDraw

# MDS Mobile project paths
PROJECT = Path(r"D:\ALL_PROJECTS\MDS\MDS_Mobile")
SOURCE = PROJECT / "src" / "assets" / "images" / "logo3.jpg"
RES = PROJECT / "android" / "app" / "src" / "main" / "res"

# Back up existing launcher icons before replacing them
BACKUP = PROJECT / f"launcher_icon_backup_{datetime.now():%Y%m%d_%H%M%S}"

# Android launcher icon sizes in pixels
DENSITIES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

def main():
    if not SOURCE.exists():
        raise FileNotFoundError(f"Logo not found: {SOURCE}")

    if not RES.exists():
        raise FileNotFoundError(f"Android resources not found: {RES}")

    with Image.open(SOURCE) as original:
        logo = original.convert("RGBA")

    if logo.width != logo.height:
        raise ValueError(
            f"Logo must be square. Current size: "
            f"{logo.width} x {logo.height}"
        )

    print(f"Source logo: {logo.width} x {logo.height}")

    for folder_name, size in DENSITIES.items():
        folder = RES / folder_name
        folder.mkdir(parents=True, exist_ok=True)

        # Back up existing files before overwriting them
        for filename in ("ic_launcher.png", "ic_launcher_round.png"):
            existing = folder / filename
            if existing.exists():
                backup_folder = BACKUP / folder_name
                backup_folder.mkdir(parents=True, exist_ok=True)
                shutil.copy2(existing, backup_folder / filename)

        # Generate the standard square launcher icon
        icon = logo.resize(
            (size, size), Image.Resampling.LANCZOS
        )
        icon.save(folder / "ic_launcher.png", "PNG")

        # Generate a circular launcher icon with transparent corners
        round_icon = icon.copy()
        mask = Image.new("L", (size, size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size - 1, size - 1), fill=255)
        round_icon.putalpha(mask)
        round_icon.save(folder / "ic_launcher_round.png", "PNG")

        print(f"Created icons: {folder_name} ({size} x {size})")

    print("\nIcon generation completed successfully.")
    print(f"Backup folder: {BACKUP}")
    print("Review the icons before building the APK.")

if __name__ == "__main__":
    main()
