"""Check kit/buffer.py's queries and a real post payload against Buffer's live GraphQL schema
(introspection needs no key). Run after changing kit/buffer.py:

    ~/.surprisal_venv/bin/python -m kit.buffer_schema_check [<episode folder>]
"""
import sys
from pathlib import Path

import requests
from graphql import build_client_schema, coerce_input_value, get_introspection_query, parse, validate

from kit import buffer


def main():
    r = requests.post(buffer.API, json={"query": get_introspection_query()}, timeout=60)
    schema = build_client_schema(r.json()["data"])
    schema._validation_errors = []  # Buffer's schema has a harmless deprecation mismatch; check our queries only
    ok = True
    for name in ("Q_ORGS", "Q_CHANNELS", "M_CREATE", "Q_POST"):
        errs = validate(schema, parse(getattr(buffer, name)))
        print(name, "ok" if not errs else errs)
        ok &= not errs
    ep = Path(sys.argv[1] if len(sys.argv) > 1 else "episodes/_example-zip").resolve()
    caps = buffer.captions(ep)
    t = schema.get_type("CreatePostInput")
    for svc, c in caps.items():
        inp = {"channelId": "x", "text": c["text"], "schedulingType": "automatic", "mode": "customScheduled",
               "dueAt": "2030-01-01T09:00:00.000Z", "metadata": c["metadata"],
               "assets": [{"video": {"url": "https://example.com/v.mp4", "metadata": {"thumbnailOffset": 0}}}]}
        errs = []
        try:
            from graphql.pyutils import Undefined
            if coerce_input_value(inp, t) is Undefined:
                errs.append("payload does not fit CreatePostInput")
        except Exception as e:  # graphql-core 3.3 raises with the path in the message
            errs.append(str(e))
        print(f"CreatePostInput[{svc}]", "ok" if not errs else errs)
        ok &= not errs
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
