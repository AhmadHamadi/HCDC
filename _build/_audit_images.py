"""Verify every <img src="/..."> in every built HTML page points at a file
that exists on disk. Fails loud if anything is missing so Vercel deploys
don't ship 404 images."""
import os, re, glob, urllib.parse

BS = chr(92)
ROOT = os.path.abspath(os.path.dirname(__file__) + "/..")
SKIP_DIR_PREFIXES = ("_build", "assets", ".git", "node_modules")
SKIP_ROOT_NAMES = ("_about", "_blog", "_contact", "_live", "_payment", "_peter", "_story")

missing = {}
ok_count = 0

for p in glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True):
    rel = os.path.relpath(p, ROOT).replace(BS, "/")
    parts = rel.split("/")
    if parts[0] in SKIP_DIR_PREFIXES:
        continue
    if len(parts) == 1 and (parts[0].startswith(SKIP_ROOT_NAMES) or "Dental Services in Hamilton" in parts[0] or parts[0].startswith("hero_")):
        continue
    if any("Hamilton Care Dental Centre_files" in seg or "hero_aboutus_ourstory_files" in seg for seg in parts):
        continue

    with open(p, "r", encoding="utf-8") as f:
        src = f.read()
    for m in re.finditer(r'<img[^>]*\bsrc=["\']([^"\']+)["\']', src):
        url = m.group(1)
        if not url.startswith("/"):
            continue
        local = urllib.parse.unquote(url.lstrip("/"))
        full = os.path.join(ROOT, local.replace("/", os.sep))
        if os.path.exists(full):
            ok_count += 1
        else:
            missing.setdefault(url, []).append(rel)

print("OK image refs:", ok_count)
print("Missing image refs:", len(missing))
for url, pages in sorted(missing.items()):
    print("  " + url + "  used in " + str(len(pages)) + " page(s), e.g. " + pages[0])

raise SystemExit(0 if not missing else 1)
