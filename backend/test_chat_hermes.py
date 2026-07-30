#!/usr/bin/env python3
"""Standalone test module for chatting with a Hermes gateway."""

import argparse
import json
import os
import ssl
import urllib.error
import urllib.request


def chat(gateway: str, endpoint: str, message: str, timeout: float = 30.0) -> tuple[int | None, str]:
    url = f"{gateway.rstrip('/')}/{endpoint.lstrip('/')}"
    payload = json.dumps({"message": message}).encode()
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            body = resp.read().decode()
            print(f"Status: {resp.status}")
            print(f"Response: {body}")
            return resp.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"HTTP error {e.code}: {body}")
        return e.code, body
    except Exception as e:
        print(f"Request failed: {e}")
        return None, str(e)


def main() -> None:
    parser = argparse.ArgumentParser(description="Test chat with a Hermes gateway")
    parser.add_argument(
        "--gateway",
        default=os.environ.get("HERMES_GATEWAY_URL", "http://127.0.0.1:9119"),
        help="Hermes gateway base URL",
    )
    parser.add_argument(
        "--endpoint",
        default=os.environ.get("HERMES_CHAT_ENDPOINT", "/chat"),
        help="Chat endpoint path",
    )
    parser.add_argument(
        "--message",
        default="Hello, Hermes!",
        help="Message to send",
    )
    args = parser.parse_args()

    print(f"POST {args.gateway}{args.endpoint}")
    print(f"Message: {args.message}")
    chat(args.gateway, args.endpoint, args.message)


if __name__ == "__main__":
    main()
