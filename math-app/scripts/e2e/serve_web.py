#!/usr/bin/env python3
"""Static server for the expo web export with SPA fallback for /play/<id>."""
import http.server
import os
import re
import sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/mq-web"
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8081


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def send_head(self):
        path = self.path.split("?")[0]
        # expo-router dynamic route: /play/<levelId> -> play/[levelId].html
        if re.match(r"^/play/[^/]+$", path):
            self.path = "/play/[levelId].html"
        elif path != "/" and not path.endswith(".html") and not os.path.exists(
            os.path.join(ROOT, path.lstrip("/"))
        ):
            self.path = "/index.html"
        return super().send_head()

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
