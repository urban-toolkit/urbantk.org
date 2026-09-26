#!/usr/bin/env python3
"""Bubble images for the home page diagram, taken from the 2026 NSF CSSI poster.

The poster's project circles use artwork the site has nowhere else: a crop of Deep Umbra's shadow map,
neural-3d's street view with its sky-visibility scale, Sidewalk Stewards' aerial network, and the
Autark wordmark. This extracts them (with their transparency) into media-src/poster/, where
prepare-assets.mjs picks them up.

Needs PyMuPDF. Run from the repo root:
    python3 scripts/media/poster-bubbles.py "<path to 2026 NSF CSSI Poster-1.pdf>"
"""
import sys
from pathlib import Path

import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'media-src' / 'poster'

# Embedded image xref in the poster PDF -> name under media-src/poster/.
IMAGES = {
    48: 'shadows.png',
    20: 'neural-3d.png',
    28: 'sidewalk.png',
    16: 'autark-wordmark.png',
}


def main(pdf):
    doc = fitz.open(pdf)
    smasks = {xref: smask for xref, smask, *_ in doc[0].get_images(full=True)}
    OUT.mkdir(parents=True, exist_ok=True)
    for xref, name in IMAGES.items():
        pix = fitz.Pixmap(doc, xref)
        if smasks.get(xref):
            pix = fitz.Pixmap(pix, fitz.Pixmap(doc, smasks[xref]))
        if pix.n - pix.alpha != 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)
        pix.save(OUT / name)
        print(f'{name:22s} {pix.width}x{pix.height}{" with alpha" if pix.alpha else ""}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
