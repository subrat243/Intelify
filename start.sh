#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if command -v docker-compose >/dev/null 2>&1; then
  compose=(docker-compose)
elif docker compose version >/dev/null 2>&1; then
  compose=(docker compose)
else
  echo "Docker Compose is required but was not found." >&2
  echo "Install it with: sudo apt update && sudo apt install docker-compose" >&2
  exit 1
fi

echo "Starting Intelify with: ${compose[*]}"
exec "${compose[@]}" up --build "$@"