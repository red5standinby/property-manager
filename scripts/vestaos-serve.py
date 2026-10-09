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
    def translate_path(self, path):
        local = super().translate_path(path)
        if os.path.isdir(local):
            index = os.path.join(local, "index.html")
            if os.path.isfile(index):
                return index
            # /property-manager/ops/ -> /property-manager/ops.html
            sibling = local.rstrip("/") + ".html"
            if os.path.isfile(sibling):
                return sibling
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
