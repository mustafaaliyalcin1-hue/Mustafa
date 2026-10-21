"""Packs src/EjderhaBP + src/EjderhaRP into ejderha_binicileri.mcaddon (a zip Minecraft opens directly)."""
import os, zipfile
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, 'ejderha_binicileri.mcaddon')
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for pack in ('EjderhaBP', 'EjderhaRP'):
        root = os.path.join(here, 'src', pack)
        for d, _, files in os.walk(root):
            for f in sorted(files):
                p = os.path.join(d, f)
                z.write(p, os.path.join(pack, os.path.relpath(p, root)))
print(out, os.path.getsize(out), 'bytes')
