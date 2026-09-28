#!/usr/bin/env python3
"""Find slide-/sidenumre i kursusmaterialets originaler (PDF og PPTX).

Bygger et tekstindeks pr. side (pdftotext) eller slide (PPTX-XML) og søger i det.
Læser kun; ændrer intet i materialet.

    python3 scripts/sideindeks.py byg  ../fed/kilde  /tmp/fed-idx.json
    python3 scripts/sideindeks.py find /tmp/fed-idx.json "Lektion 17" "useState" "useEffect"
    python3 scripts/sideindeks.py find /tmp/fed-idx.json --fil React "useState"

Kode vist som billeder i slides findes ikke i teksten; slå dem op ved at
rendere siden: pdftoppm -f N -l N -r 150 -png fil.pdf /tmp/side
"""
import glob
import json
import os
import re
import subprocess
import sys
import zipfile


def pdf_pages(path):
    info = subprocess.run(["pdfinfo", path], capture_output=True, text=True).stdout
    m = re.search(r"Pages:\s+(\d+)", info)
    n = int(m.group(1)) if m else 0
    out = []
    for p in range(1, n + 1):
        t = subprocess.run(["pdftotext", "-f", str(p), "-l", str(p), "-layout", path, "-"], capture_output=True, text=True).stdout
        out.append(re.sub(r"\s+", " ", t))
    return out


def pptx_slides(path):
    z = zipfile.ZipFile(path)
    names = sorted(
        (n for n in z.namelist() if re.match(r"ppt/slides/slide\d+\.xml$", n)),
        key=lambda s: int(re.search(r"(\d+)\.xml$", s).group(1)),
    )
    return [" ".join(re.findall(r"<a:t>([^<]*)</a:t>", z.read(n).decode("utf8", "ignore"))) for n in names]


def build(root, out):
    idx = {}
    files = glob.glob(os.path.join(root, "**", "*.pdf"), recursive=True) + glob.glob(os.path.join(root, "**", "*.pptx"), recursive=True)
    for f in sorted(files):
        rel = os.path.relpath(f, root)
        try:
            idx[rel] = pdf_pages(f) if f.endswith(".pdf") else pptx_slides(f)
            print(f"{len(idx[rel]):4d}  {rel}")
        except Exception as e:  # beskadigede filer springes over
            print(f"SPRUNGET OVER {rel}: {e}")
    json.dump(idx, open(out, "w"))


def find(index, terms):
    idx = json.load(open(index))
    only = None
    if terms and terms[0] == "--fil":
        only, terms = terms[1].lower(), terms[2:]
    for f, pages in idx.items():
        if only and only not in f.lower():
            continue
        for term in terms:
            hits = [i + 1 for i, t in enumerate(pages) if term.lower() in t.lower()]
            if hits:
                print(f"{f} | {term!r}: {hits}")


if __name__ == "__main__":
    if len(sys.argv) >= 4 and sys.argv[1] == "byg":
        build(sys.argv[2], sys.argv[3])
    elif len(sys.argv) >= 4 and sys.argv[1] == "find":
        find(sys.argv[2], sys.argv[3:])
    else:
        print(__doc__)
