#!/usr/bin/env python3
"""
upload_photos.py – Fotos → Cloudflare R2

Lädt Fotos aus einem lokalen Ordner (Standard) oder einem Google Photos Album,
prüft ob Personen erkennbar sind, und lädt nur Bilder ohne Menschen in den R2 Bucket.
Bereits vorhandene Bilder werden übersprungen (inkrementeller Upload).

Setup (einmalig):
    pip3 install ultralytics pillow pillow-heif requests tqdm boto3

Für Google Photos (optional, API-Zugriff nötig):
    pip3 install google-auth-oauthlib google-auth-httplib2
    1. https://console.cloud.google.com → Neues Projekt anlegen
    2. APIs & Services → "Photos Library API" aktivieren
    3. APIs & Services → Credentials → "OAuth 2.0 Client ID" (Desktop App) anlegen
    4. JSON herunterladen und als scripts/google_credentials.json speichern

Verwendung (lokaler Ordner – empfohlen):
    python3 scripts/upload_photos.py --folder ~/Pictures/Theo
    python3 scripts/upload_photos.py --folder ~/Pictures/Theo --dry-run

Verwendung (Google Photos API):
    python3 scripts/upload_photos.py --album "Theo"
    python3 scripts/upload_photos.py --album "Theo" --dry-run
"""

import os
import sys
import json
import argparse
import tempfile
from pathlib import Path

import requests
from tqdm import tqdm

# ── Konfiguration ────────────────────────────────────────────────────────────

R2_BUCKET       = "theo-badges-images"  # Cloudflare R2 Bucket
R2_PREFIX       = "dogs/theo/"          # Ordner im Bucket
CONFIDENCE      = 0.5                   # Mindest-Konfidenz für Personenerkennung (0-1)
PERSON_CLASS    = 0                     # COCO Klasse 0 = Person
IMAGE_EXTS_WEB     = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}  # Vom Browser darstellbar
IMAGE_EXTS_CONVERT = {".heic", ".heif"}                                   # Werden zu JPEG konvertiert
IMAGE_EXTS_SKIP    = {".tiff", ".tif", ".bmp", ".raw",                    # Nicht web-kompatibel, kein Support
                      ".cr2", ".nef", ".arw", ".dng", ".orf", ".rw2"}

# R2 S3-API Credentials – werden aus scripts/.env geladen (niemals committen!)
# Cloudflare Dashboard → R2 → "Manage R2 API Tokens" → "Create API Token"
def _load_env():
    env_file = Path(__file__).parent / ".env"
    if env_file.exists():
        for line in env_file.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

_load_env()
R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY = os.environ.get("R2_ACCESS_KEY", "")
R2_SECRET_KEY = os.environ.get("R2_SECRET_KEY", "")
R2_ENDPOINT   = os.environ.get("R2_ENDPOINT",
                    f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com")

SCRIPTS_DIR = Path(__file__).parent

# ── Lokaler Ordner ───────────────────────────────────────────────────────────

def convert_to_jpeg(src: Path, dest_dir: Path) -> Path:
    """Konvertiert HEIC/HEIF zu JPEG. Gibt den Pfad zur konvertierten Datei zurück."""
    try:
        # pillow-heif registriert HEIC-Support in Pillow
        import pillow_heif
        pillow_heif.register_heif_opener()
    except ImportError:
        print("❌  pillow-heif nicht installiert:")
        print("    pip3 install pillow-heif")
        sys.exit(1)

    from PIL import Image
    dest = dest_dir / (src.stem + ".jpg")
    img = Image.open(src)
    img.save(dest, "JPEG", quality=92)
    return dest

def list_local_photos(folder: Path, convert_dir: Path | None = None) -> list[Path]:
    """Gibt alle web-kompatiblen Bilddateien zurück. HEIC/HEIF werden zu JPEG konvertiert."""
    photos = []
    to_convert = []
    skipped_format = []

    for f in sorted(folder.iterdir()):
        ext = f.suffix.lower()
        if not f.is_file():
            continue
        if ext in IMAGE_EXTS_WEB:
            photos.append(f)
        elif ext in IMAGE_EXTS_CONVERT:
            to_convert.append(f)
        elif ext in IMAGE_EXTS_SKIP:
            skipped_format.append(f.name)

    if skipped_format:
        skipped_exts = ", ".join(sorted(set(Path(f).suffix.lower() for f in skipped_format)))
        print(f"⚠️   {len(skipped_format)} Dateien übersprungen (nicht web-kompatibel): {skipped_exts}")

    if to_convert:
        if convert_dir is None:
            convert_dir = folder / "converted_jpeg"
        convert_dir.mkdir(exist_ok=True)
        print(f"🔄  {len(to_convert)} HEIC/HEIF-Dateien werden nach JPEG konvertiert → {convert_dir}")
        bar = tqdm(to_convert, unit="Datei", ncols=80, colour="yellow", desc="Konvertiere")
        for f in bar:
            bar.set_description(f"{f.name[:30]:<30}")
            try:
                converted = convert_to_jpeg(f, convert_dir)
                photos.append(converted)
            except Exception as e:
                tqdm.write(f"❌  {f.name} – Konvertierung fehlgeschlagen: {e}")

    return sorted(photos, key=lambda f: f.name)

# ── Google Photos (optional) ─────────────────────────────────────────────────

def get_google_photos(album_name: str) -> list[dict]:
    """Lädt Fotos via Google Photos API (benötigt google-auth-oauthlib)."""
    try:
        from google.auth.transport.requests import Request
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
    except ImportError:
        print("❌  Google Auth Bibliotheken nicht installiert.")
        print("    pip3 install google-auth-oauthlib google-auth-httplib2")
        sys.exit(1)

    CREDENTIALS_FILE = SCRIPTS_DIR / "google_credentials.json"
    TOKEN_FILE       = SCRIPTS_DIR / "google_token.json"
    SCOPES           = ["https://www.googleapis.com/auth/photoslibrary.readonly"]

    # Auth
    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
        if creds and creds.scopes and not all(s in creds.scopes for s in SCOPES):
            creds = None
            TOKEN_FILE.unlink()

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CREDENTIALS_FILE.exists():
                print(f"❌  {CREDENTIALS_FILE} nicht gefunden.")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        TOKEN_FILE.write_text(creds.to_json())

    headers = {"Authorization": f"Bearer {creds.token}"}

    # Album suchen
    album_id = None
    page_token = None
    while True:
        params = {"pageSize": 50}
        if page_token:
            params["pageToken"] = page_token
        resp = requests.get(
            "https://photoslibrary.googleapis.com/v1/albums",
            headers=headers, params=params
        )
        if resp.status_code != 200:
            print(f"❌  Google Photos API Fehler {resp.status_code}: {resp.text}")
            sys.exit(1)
        data = resp.json()
        for album in data.get("albums", []):
            if album.get("title") == album_name:
                album_id = album["id"]
                break
        if album_id or not data.get("nextPageToken"):
            break
        page_token = data["nextPageToken"]

    if not album_id:
        print(f"❌  Album '{album_name}' nicht gefunden.")
        sys.exit(1)

    # Fotos laden
    photos = []
    page_token = None
    while True:
        body: dict = {"albumId": album_id, "pageSize": 100}
        if page_token:
            body["pageToken"] = page_token
        resp = requests.post(
            "https://photoslibrary.googleapis.com/v1/mediaItems:search",
            headers=headers, json=body
        )
        resp.raise_for_status()
        data = resp.json()
        for item in data.get("mediaItems", []):
            if item.get("mimeType", "").startswith("image/"):
                photos.append(item)
        page_token = data.get("nextPageToken")
        if not page_token:
            break

    return photos

# ── R2 Bucket ────────────────────────────────────────────────────────────────

def get_r2_client():
    """Erstellt einen boto3 S3-Client für Cloudflare R2."""
    try:
        import boto3
    except ImportError:
        print("❌  boto3 nicht installiert. Bitte ausführen:")
        print("    pip3 install boto3")
        sys.exit(1)
    if not R2_ACCOUNT_ID or not R2_ACCESS_KEY or not R2_SECRET_KEY:
        print("❌  R2 API Credentials fehlen im Script (R2_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY).")
        print("    Cloudflare Dashboard → R2 → 'Manage R2 API Tokens' → 'Create API Token'")
        sys.exit(1)
    from botocore.config import Config
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )

def get_existing_keys() -> set[str]:
    """Gibt alle vorhandenen Keys im R2 Bucket zurück (via S3-API)."""
    client = get_r2_client()
    keys = set()
    paginator = client.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=R2_BUCKET, Prefix=R2_PREFIX):
        for obj in page.get("Contents", []):
            keys.add(obj["Key"])
    return keys

def upload_to_r2(path: Path, key: str) -> None:
    """Lädt eine Datei in den R2 Bucket hoch."""
    client = get_r2_client()
    ext = path.suffix.lower()
    content_type = "image/jpeg" if ext in {".jpg", ".jpeg"} else f"image/{ext.lstrip('.')}"
    client.upload_file(str(path), R2_BUCKET, key, ExtraArgs={"ContentType": content_type})

# ── Personenerkennung ────────────────────────────────────────────────────────

def load_model():
    """Lädt das YOLO-Modell (wird beim ersten Start heruntergeladen ~6 MB)."""
    from ultralytics import YOLO
    return YOLO("yolov8n.pt")  # nano – schnell, ausreichend genau

def has_person(model, image_path: Path) -> bool:
    """Gibt True zurück wenn eine Person erkannt wurde."""
    results = model(str(image_path), verbose=False)
    for result in results:
        for box in result.boxes:
            if int(box.cls) == PERSON_CLASS and float(box.conf) >= CONFIDENCE:
                return True
    return False

# ── Hauptprogramm ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Fotos → R2 Upload (lokal oder Google Photos)")
    source = parser.add_mutually_exclusive_group(required=False)
    source.add_argument("--folder", type=Path, help="Lokaler Ordner mit Fotos (empfohlen)")
    source.add_argument("--album",  help="Google Photos Album-Name")
    parser.add_argument("--dry-run",       action="store_true", help="Nur simulieren, nichts hochladen")
    parser.add_argument("--skip-r2-check", action="store_true", help="R2-Prüfung überspringen, alle Bilder verarbeiten")
    parser.add_argument("--upload-preview", action="store_true", help="Bilder aus preview_upload/ direkt in R2 hochladen (nach manuellem Review)")
    args = parser.parse_args()

    # ── Modus: preview_upload/ direkt hochladen ───────────────────────────────
    if args.upload_preview:
        # Suche preview_upload: erst in photos/, dann im Projektroot
        photos_subdir = SCRIPTS_DIR.parent / "photos" / "preview_upload"
        root_subdir   = SCRIPTS_DIR.parent / "preview_upload"
        preview_dir   = photos_subdir if photos_subdir.exists() else root_subdir
        if not preview_dir.exists() or not any(preview_dir.iterdir()):
            print(f"❌  Keine Bilder in {preview_dir} gefunden.")
            print("    Zuerst --dry-run ausführen und Bilder manuell prüfen.")
            sys.exit(1)
        photos = list_local_photos(preview_dir)
        print(f"📂  {len(photos)} Bilder aus preview_upload/ werden hochgeladen...")
        if not args.skip_r2_check:
            print("🪣  Vorhandene Dateien im R2 Bucket prüfen...")
            existing = get_existing_keys()
            print(f"    {len(existing)} Dateien bereits vorhanden")
        else:
            print("⏩  R2-Prüfung übersprungen (--skip-r2-check)")
            existing = set()
        uploaded = skipped_existing = errors = 0
        bar = tqdm(photos, unit="Foto", ncols=80, colour="cyan")
        for photo_path in bar:
            bar.set_description(f"{photo_path.name[:30]:<30}")
            key = f"{R2_PREFIX}{photo_path.name}"
            if key in existing:
                tqdm.write(f"⏭️   {photo_path.name} – bereits vorhanden")
                skipped_existing += 1
                continue
            try:
                upload_to_r2(photo_path, key)
                tqdm.write(f"✅  {photo_path.name} – hochgeladen")
                uploaded += 1
            except Exception as e:
                tqdm.write(f"❌  {photo_path.name} – Upload-Fehler: {e}")
                errors += 1
        print(f"""
📊  Zusammenfassung:
    ✅  Hochgeladen:        {uploaded}
    ⏭️   Bereits vorhanden: {skipped_existing}
    ❌  Fehler:             {errors}
""")
        sys.exit(0)

    if not args.folder and not args.album:
        parser.print_help()
        print("\n💡  Tipp: Fotos aus Google Photos exportieren und --folder verwenden:\n"
              "    python3 scripts/upload_photos.py --folder ~/Pictures/Theo --dry-run")
        sys.exit(0)

    uploaded = skipped_person = skipped_existing = errors = 0

    # Dry-run Vorschau-Ordner vorbereiten (vorher löschen für sauberen Stand)
    dry_run_ok     = None
    dry_run_person = None
    if args.dry_run:
        import shutil
        base = args.folder.expanduser().resolve() if args.folder else SCRIPTS_DIR
        dry_run_ok     = base / "preview_upload"
        dry_run_person = base / "preview_person"
        for d in (dry_run_ok, dry_run_person):
            if d.exists():
                shutil.rmtree(d)
            d.mkdir()
        print(f"📂  Dry-run Vorschau-Ordner (neu erstellt):")
        print(f"    ✅  {dry_run_ok}")
        print(f"    👤  {dry_run_person}")

    if args.skip_r2_check:
        print("⏩  R2-Prüfung übersprungen (--skip-r2-check)")
        existing = set()
    else:
        print("🪣  Vorhandene Dateien im R2 Bucket prüfen...")
        existing = get_existing_keys()
        print(f"    {len(existing)} Dateien bereits vorhanden")

    print("🤖  YOLO-Modell laden...")
    model = load_model()

    def process_photo(photo_path: Path, key: str) -> None:
        nonlocal uploaded, skipped_person, skipped_existing, errors
        filename = photo_path.name

        if key in existing:
            tqdm.write(f"⏭️   {filename} – bereits vorhanden")
            skipped_existing += 1
            return

        try:
            person_found = has_person(model, photo_path)
        except Exception as e:
            tqdm.write(f"❌  {filename} – Erkennungs-Fehler: {e}")
            errors += 1
            return

        if person_found:
            tqdm.write(f"👤  {filename} – Person erkannt, übersprungen")
            skipped_person += 1
            if args.dry_run:
                import shutil
                shutil.copy2(photo_path, dry_run_person / filename)
            return

        if args.dry_run:
            import shutil
            shutil.copy2(photo_path, dry_run_ok / filename)
            tqdm.write(f"✅  {filename} – würde hochgeladen (dry-run)")
        else:
            try:
                upload_to_r2(photo_path, key)
                tqdm.write(f"✅  {filename} – hochgeladen")
                uploaded += 1
            except Exception as e:
                tqdm.write(f"❌  {filename} – Upload-Fehler: {e}")
                errors += 1

    if args.folder:
        # ── Lokaler Ordner ──
        folder = args.folder.expanduser().resolve()
        if not folder.exists():
            print(f"❌  Ordner nicht gefunden: {folder}")
            sys.exit(1)
        photos_local = list_local_photos(folder)
        print(f"📁  {len(photos_local)} Bilder in {folder}")
        print("\n🚀  Verarbeitung startet...\n")

        bar = tqdm(photos_local, unit="Foto", ncols=80, colour="green")
        for photo_path in bar:
            bar.set_description(f"{photo_path.name[:30]:<30}")
            process_photo(photo_path, f"{R2_PREFIX}{photo_path.name}")

    else:
        # ── Google Photos API ──
        print(f"📚  Google Photos Album '{args.album}' laden...")
        photos_api = get_google_photos(args.album)
        print(f"    {len(photos_api)} Bilder im Album")
        print("\n🚀  Verarbeitung startet...\n")

        with tempfile.TemporaryDirectory() as tmpdir:
            bar = tqdm(photos_api, unit="Foto", ncols=80, colour="green")
            for photo in bar:
                filename = photo["filename"]
                bar.set_description(f"{filename[:30]:<30}")

                tmp_path = Path(tmpdir) / filename
                try:
                    url = photo["baseUrl"] + "=d"
                    tmp_path.write_bytes(requests.get(url, timeout=30).content)
                except Exception as e:
                    tqdm.write(f"❌  {filename} – Download-Fehler: {e}")
                    errors += 1
                    continue

                process_photo(tmp_path, f"{R2_PREFIX}{filename}")

    summary = f"""
📊  Zusammenfassung:
    ✅  {"Würde hochgeladen" if args.dry_run else "Hochgeladen"}:  {uploaded if not args.dry_run else len(list(dry_run_ok.iterdir())) if dry_run_ok else 0}
    👤  Person erkannt:        {skipped_person}
    ⏭️   Bereits vorhanden:    {skipped_existing}
    ❌  Fehler:                {errors}
"""
    if args.dry_run and dry_run_ok:
        summary += f"""
    📂  Vorschau-Ordner:
        ✅  {dry_run_ok}
        👤  {dry_run_person}
"""
    print(summary)

if __name__ == "__main__":
    main()
