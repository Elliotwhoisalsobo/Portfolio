#!/usr/bin/env python3
"""Vervangt de placeholder in index.html door de Google Tag Manager snippet.

Leest GTM_CONTAINER_ID uit de omgeving. Bij deploy door GitHub Actions is dat
een repository secret; lokaal komt het uit .env. Het ID komt nooit in de repo.
"""
import os
import re
import sys
from pathlib import Path

CID = os.environ.get("GTM_CONTAINER_ID", "").strip()
if not CID:
    sys.exit("GTM_CONTAINER_ID ontbreekt in de omgeving")
if not CID.startswith("GTM-"):
    sys.exit(f"Onverwacht ID: {CID} (moet beginnen met GTM-)")

snippet = (
    "<!-- GOOGLE ANALYTICS -->\n"
    '<script async src="https://www.googletagmanager.com/gtm.js?id=' + CID + '"></script>\n'
    "<script>\n"
    "  window.dataLayer = window.dataLayer || [];\n"
    "  function gtag(){dataLayer.push(arguments);}\n"
    "  gtag('js', new Date());\n"
    "  gtag('config', '" + CID + "');\n"
    "</script>"
)

path = Path("index.html")
html = path.read_text(encoding="utf-8")
# Accepteert elke commentaarregel die met GTM_INJECT begint, ongeacht de verdere tekst.
matches = list(re.finditer(r"<!--\s*GTM_INJECT[^>]*-->", html))
if not matches:
    sys.exit("Placeholder <!-- GTM_INJECT --> niet gevonden in index.html")
for match in reversed(matches):
    html = html[:match.start()] + snippet + html[match.end():]
path.write_text(html, encoding="utf-8")
print(f"GTM snippet geinjecteerd met {CID}")
