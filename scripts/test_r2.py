#!/usr/bin/env python3
"""
test_r2.py – R2 Verbindung testen

Prüft ob die Credentials in scripts/.env korrekt sind und der Bucket erreichbar ist.

Verwendung:
    python3 scripts/test_r2.py
"""

import os
import sys
from pathlib import Path

# .env laden
env_file = Path(__file__).parent / ".env"
if env_file.exists():
    for line in env_file.read_text().splitlines():
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY = os.environ.get("R2_ACCESS_KEY", "")
R2_SECRET_KEY = os.environ.get("R2_SECRET_KEY", "")
R2_ENDPOINT   = os.environ.get("R2_ENDPOINT", f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com")
R2_BUCKET     = "theo-badges-images"

print("🔍  R2 Verbindungstest")
print(f"    Account ID:  {R2_ACCOUNT_ID[:8]}...{R2_ACCOUNT_ID[-4:]}")
print(f"    Access Key:  {R2_ACCESS_KEY[:6]}...{R2_ACCESS_KEY[-4:]}")
print(f"    Secret Key:  {R2_SECRET_KEY[:6]}...{R2_SECRET_KEY[-4:]}")
print(f"    Endpoint:    {R2_ENDPOINT}")
print()

try:
    import boto3
    from botocore.config import Config
except ImportError:
    print("❌  boto3 nicht installiert: pip3 install boto3")
    sys.exit(1)

client = boto3.client(
    "s3",
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    region_name="auto",
    config=Config(signature_version="s3v4"),
)

# Test 1: Alle Buckets listen
print("1️⃣   Buckets auflisten...")
try:
    resp = client.list_buckets()
    buckets = [b["Name"] for b in resp.get("Buckets", [])]
    if buckets:
        print(f"    ✅  {len(buckets)} Bucket(s) gefunden: {', '.join(buckets)}")
    else:
        print("    ⚠️   Keine Buckets gefunden (Token hat möglicherweise keine list-Berechtigung)")
except Exception as e:
    print(f"    ❌  Fehler: {e}")

# Test 2: Bucket direkt ansprechen
print(f"2️⃣   Bucket '{R2_BUCKET}' prüfen...")
try:
    resp = client.list_objects_v2(Bucket=R2_BUCKET, MaxKeys=5)
    count = resp.get("KeyCount", 0)
    print(f"    ✅  Bucket erreichbar – {count} Objekte (max 5 abgerufen)")
    for obj in resp.get("Contents", []):
        print(f"        • {obj['Key']} ({obj['Size']} Bytes)")
except Exception as e:
    print(f"    ❌  Fehler: {e}")

# Test 3: Schreibzugriff testen
print("3️⃣   Schreibzugriff testen...")
try:
    client.put_object(Bucket=R2_BUCKET, Key="test_connection.txt", Body=b"ok")
    client.delete_object(Bucket=R2_BUCKET, Key="test_connection.txt")
    print("    ✅  Schreiben und Löschen funktioniert")
except Exception as e:
    print(f"    ❌  Fehler: {e}")

print()
print("✅  Test abgeschlossen.")
