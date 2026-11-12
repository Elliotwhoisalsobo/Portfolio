#!/usr/bin/env python3
"""Vervangt de placeholder in index.html door de analytics snippet.

Leest GTM_CONTAINER_ID en GA_MEASUREMENT_ID uit de omgeving. Bij deploy door
GitHub Actions zijn dat repository secrets; lokaal komen ze uit .env. De IDs
komen nooit in de repo.
"""
import os
import re
import sys
from pathlib import Path

gtm = os.environ.get("GTM_CONTAINER_ID", "").strip()
ga = os.environ.get("GA_MEASUREMENT_ID", "").strip()
if not gtm and not ga:
    sys.exit("GTM_CONTAINER_ID of GA_MEASUREMENT_ID ontbreekt in de omgeving")
if gtm and not gtm.startswith("GTM-"):
    sys.exit(f"Onverwacht GTM ID: {gtm} (moet beginnen met GTM-)")
if ga and not ga.startswith("G-"):
    sys.exit(f"Onverwacht GA ID: {ga} (moet beginnen met G-)")

# gtag.js is de drager voor zowel Google Analytics 4 als Tag Manager.
snippet = "<!-- GOOGLE ANALYTICS -->\n"
snippet += '<script async src="https://www.googletagmanager.com/gtag/js?id=' + (ga or gtm) + '"></script>\n'
snippet += "<script>\n"
snippet += "  window.dataLayer = window.dataLayer || [];\n"
snippet += "  function gtag(){dataLayer.push(arguments);}\n"
snippet += "  gtag('js', new Date());\n"
if ga:
    snippet += "  gtag('config', '" + ga + "');\n"
if gtm:
    snippet += "  gtag('config', '" + gtm + "');\n"
snippet += "</script>"

path = Path("index.html")
html = path.read_text(encoding="utf-8")
# Accepteert elke commentaarregel die met GTM_INJECT begint, ongeacht de verdere tekst.
matches = list(re.finditer(r"<!--\s*GTM_INJECT[^>]*-->", html))
if not matches:
    sys.exit("Placeholder <!-- GTM_INJECT --> niet gevonden in index.html")
for match in reversed(matches):
    html = html[:match.start()] + snippet + html[match.end():]
path.write_text(html, encoding="utf-8")
print(f"Analytics geinjecteerd: GTM={gtm or 'afwezig'}, GA={ga or 'afwezig'}")
