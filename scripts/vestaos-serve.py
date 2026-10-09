#!/usr/bin/env python3
"""Static export server with Next.js-style rewrites for VestaOS demo.

python -m http.server serves the raw directory tree, so a clean URL like
/property-manager/ops/ shows a directory listing instead of ops.html.
This wraps SimpleHTTPRequestHandler and resolves:
    /dir/        -> /dir/index.html, else /dir.html
    /dir         -> /dir.html, else /dir/index.html
so client-side nav + typed deep links both work.

Usage: vestaos-serve.py <root> <port>
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class RewriteHandler(SimpleHTTPRequestHandler):
    # Dynamic routes that only have one prerendered HTML at build time. Any id
    # created/edited at runtime has no static file, so fall back to the
    # placeholder build; the client component reads the real id from the URL.
    DYNAMIC_PREFIXES = (("/properties/", "/properties/__placeholder.html"),)

    def _dynamic_fallback(self, local):
        # Dynamic routes only have one prerendered HTML at build time. Any id
        # created/edited at runtime has no static file, so fall back to the
        # placeholder build; the client component reads the real id from URL.
        #
        # The export may be mounted under a basePath (e.g. /property-manager),
        # so build the fallback from the same directory that contains the
        # matched segment, not from the export root.
        rel = os.path.relpath(local, os.getcwd()).replace(os.sep, "/")
        segments = [s for s in rel.split("/") if s]
        for prefix, fallback in self.DYNAMIC_PREFIXES:
            seg = prefix.strip("/")  # e.g. "properties"
            if seg not in segments:
                continue
            # Drop everything after the segment and append the fallback file.
            head = segments[: segments.index(seg)]
            cand = os.path.join(os.getcwd(), *head, fallback.strip("/"))
            if os.path.isfile(cand):
                return cand
        return None

    def translate_path(self, path):
        local = super().translate_path(path)
        if not os.path.exists(local):
            dyn = self._dynamic_fallback(local)
            if dyn:
                return dyn
        if os.path.isdir(local):
            index = os.path.join(local, "index.html")
            if os.path.isfile(index):
                return index
            # /property-manager/ops/ -> /property-manager/ops.html
            sibling = local.rstrip("/") + ".html"
            if os.path.isfile(sibling):
                return sibling
            dyn = self._dynamic_fallback(local)
            if dyn:
                return dyn
        elif not os.path.exists(local):
            if os.path.isfile(local + ".html"):
                return local + ".html"
            index = os.path.join(local, "index.html")
            if os.path.isfile(index):
                return index
        return local

    def log_message(self, fmt, *args):
        pass  # quiet


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8791
    os.chdir(root)
    ThreadingHTTPServer(("0.0.0.0", port), RewriteHandler).serve_forever()


if __name__ == "__main__":
    main()
