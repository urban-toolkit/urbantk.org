#!/usr/bin/env python3
"""Candidate figures from the arXiv sources of the project papers.

For every site/projects/<slug>.md with an `arxiv:` field, downloads the paper's LaTeX source from arXiv,
finds its figures (IEEE `\\teaser{}`, `figure`, `figure*`, `wrapfigure`, ACM `teaserfigure`), and writes
each figure's graphics as PNG to media-src/figures/<slug>/, with media-src/figures/<slug>/candidates.json
listing the file, caption and label of each. PDF graphics are rendered with PyMuPDF; PNG and JPEG are copied.
Picking and converting the chosen figures is scripts/media/build-figures.mjs.

Needs only PyMuPDF (`pip install pymupdf`). Run from the repo root:
    python3 scripts/media/extract_figures.py [slug ...]
"""
import gzip
import io
import json
import re
import shutil
import sys
import tarfile
import urllib.request
from pathlib import Path

import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parents[2]
PROJECTS = ROOT / 'site' / 'projects'
OUT = ROOT / 'media-src'
RENDER_WIDTH = 2400
EXTENSIONS = ['', '.pdf', '.png', '.jpg', '.jpeg', '.eps']


def arxiv_ids():
    for md in sorted(PROJECTS.glob('*.md')):
        if md.name.startswith('_'):
            continue
        match = re.search(r'^arxiv:\s*"?([0-9.]+)"?\s*$', md.read_text().split('\n---', 1)[0], re.M)
        if match:
            yield md.stem, match.group(1)


def fetch_source(arxiv_id):
    target = OUT / 'arxiv' / arxiv_id
    if target.exists() and any(target.rglob('*.tex')):
        return target
    target.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(f'https://arxiv.org/e-print/{arxiv_id}', headers={'User-Agent': 'urbantk.org figure extractor'})
    data = urllib.request.urlopen(request, timeout=120).read()
    try:
        with tarfile.open(fileobj=io.BytesIO(data), mode='r:*') as tar:
            # Only regular files and directories, and nothing that escapes the target folder.
            members = [m for m in tar.getmembers() if (m.isfile() or m.isdir()) and not Path(m.name).is_absolute() and '..' not in Path(m.name).parts]
            tar.extractall(target, members=members)
    except tarfile.ReadError:
        # A single-file submission is a gzipped .tex.
        (target / 'main.tex').write_bytes(gzip.decompress(data))
    return target


def strip_comments(tex):
    return re.sub(r'(?<!\\)%.*', '', tex)


def read_tex(path, root, seen=None):
    seen = seen or set()
    if path in seen or not path.exists():
        return ''
    seen.add(path)
    tex = strip_comments(path.read_text(errors='ignore'))

    def inline(match):
        name = match.group(1).strip()
        candidate = root / (name if name.endswith('.tex') else f'{name}.tex')
        return read_tex(candidate, root, seen)

    return re.sub(r'\\(?:input|include)\{([^}]+)\}', inline, tex)


def main_tex(root):
    # Shallowest first: sources often keep old drafts, each with its own \documentclass, in subfolders.
    for tex in sorted(root.rglob('*.tex'), key=lambda p: (len(p.relative_to(root).parts), p.name)):
        if re.search(r'^\s*\\documentclass', strip_comments(tex.read_text(errors='ignore')), re.M):
            return tex
    raise SystemExit(f'no \\documentclass in {root}')


def braced(text, start):
    """Returns the contents of the {...} group that opens at text[start], and the index after it."""
    assert text[start] == '{'
    depth = 0
    for i in range(start, len(text)):
        if text[i] == '{' and text[i - 1] != '\\':
            depth += 1
        elif text[i] == '}' and text[i - 1] != '\\':
            depth -= 1
            if depth == 0:
                return text[start + 1:i], i + 1
    return text[start + 1:], len(text)


def command_argument(text, command):
    match = re.search(r'\\' + command + r'\*?\s*(?:\[[^\]]*\])?\s*\{', text)
    if not match:
        return None
    return braced(text, match.end() - 1)[0]


def macros(tex):
    """Argument-free \\newcommand and \\def definitions, such as \\newcommand{\\curio}{Curio}."""
    found = {}
    for match in re.finditer(r'\\(?:re)?newcommand\*?\s*\{?\\([a-zA-Z]+)\}?\s*\{', tex):
        found[match.group(1)] = braced(tex, match.end() - 1)[0]
    for match in re.finditer(r'\\def\s*\\([a-zA-Z]+)\s*\{', tex):
        found[match.group(1)] = braced(tex, match.end() - 1)[0]
    return found


def expand(latex, defined):
    for _ in range(3):
        latex = re.sub(r'\\([a-zA-Z]+)(?![a-zA-Z])(\{\})?\s?', lambda m: defined.get(m.group(1), m.group(0)) + (' ' if m.group(1) in defined and m.group(0).endswith(' ') else ''), latex)
    return latex


def plain(latex, defined=None):
    latex = expand(latex, defined or {})
    text = re.sub(r'\\(?:cite|ref|autoref|cref|Cref|label)\{[^}]*\}', '', latex)
    text = re.sub(r'\\(?:textbf|textit|emph|textsc|texttt|mathrm|mathbf|textrm|underline)\{([^{}]*)\}', r'\1', text)
    text = re.sub(r'\\[a-zA-Z]+\*?(\[[^\]]*\])?', ' ', text)
    text = text.replace('~', ' ').replace('\\%', '%').replace('\\&', '&').replace('--', '-')
    text = re.sub(r'[{}$\\]', '', text)
    return re.sub(r'\s+', ' ', text).strip()


def figure_blocks(tex):
    for match in re.finditer(r'\\begin\{(figure\*?|wrapfigure|teaserfigure)\}(.*?)\\end\{\1\}', tex, re.S):
        yield match.group(1), match.group(2)
    for match in re.finditer(r'\\teaser\s*\{', tex):
        yield 'teaser', braced(tex, match.end() - 1)[0]


def resolve(name, root, graphic_dirs):
    for directory in [root, *graphic_dirs]:
        for extension in EXTENSIONS:
            candidate = directory / f'{name}{extension}'
            if candidate.is_file():
                return candidate
    matches = [p for p in root.rglob(f'{Path(name).name}*') if p.suffix.lower() in EXTENSIONS[1:]]
    return matches[0] if matches else None


def render(source, target):
    suffix = source.suffix.lower()
    if suffix in ('.png', '.jpg', '.jpeg'):
        shutil.copyfile(source, target.with_suffix(suffix))
        return target.with_suffix(suffix)
    if suffix == '.pdf':
        with fitz.open(source) as doc:
            page = doc[0]
            zoom = RENDER_WIDTH / page.rect.width
            page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False).save(target.with_suffix('.png'))
        return target.with_suffix('.png')
    return None  # EPS needs Ghostscript; left for manual handling.


def extract(slug, arxiv_id):
    root = fetch_source(arxiv_id)
    tex = read_tex(main_tex(root), root)
    defined = macros(tex)
    graphic_dirs = [root / d for d in re.findall(r'\{([^{}]+)\}', command_argument(tex, 'graphicspath') or '')]
    out = OUT / 'figures' / slug
    shutil.rmtree(out, ignore_errors=True)
    out.mkdir(parents=True)
    candidates = []
    for number, (kind, body) in enumerate(figure_blocks(tex), start=1):
        caption = plain(command_argument(body, 'caption') or '', defined)
        label = (command_argument(body, 'label') or '').strip()
        graphics = re.findall(r'\\includegraphics\*?\s*(?:\[[^\]]*\])?\s*\{([^}]+)\}', body)
        for part, name in enumerate(graphics, start=1):
            source = resolve(name.strip(), root, graphic_dirs)
            entry = {'id': f'{number:02d}-{part}', 'kind': kind, 'label': label, 'caption': caption, 'source': str(source.relative_to(root)) if source else name, 'parts': len(graphics)}
            if source:
                written = render(source, out / entry['id'])
                entry['file'] = written.name if written else None
            else:
                entry['file'] = None
            candidates.append(entry)
    (out / 'candidates.json').write_text(json.dumps({'slug': slug, 'arxiv': arxiv_id, 'candidates': candidates}, indent=2) + '\n')
    usable = sum(1 for c in candidates if c.get('file'))
    print(f'{slug:14s} arXiv:{arxiv_id}  {len(candidates)} graphics, {usable} rendered -> {out.relative_to(ROOT)}')


if __name__ == '__main__':
    wanted = set(sys.argv[1:])
    for slug, arxiv_id in arxiv_ids():
        if not wanted or slug in wanted:
            try:
                extract(slug, arxiv_id)
            except Exception as error:  # keep going: one broken source should not stop the rest
                print(f'{slug:14s} arXiv:{arxiv_id}  FAILED: {error}')
