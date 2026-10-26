#!/bin/bash
# SessionStart hook: make sure a cloud session has the project's dependencies
# installed, so lint, typecheck, build and the tests can run.
#
# - Cloud sessions only (CLAUDE_CODE_REMOTE=true). Local sessions are untouched.
# - Runs from the repository root, found from this script's own location.
# - Skips the install when node_modules already matches package-lock.json.
# - Uses `npm ci`: installs exactly what package-lock.json says. The only thing
#   it deletes is the node_modules folder, which it then rebuilds.
# - Prints no environment variables and runs no other commands.

set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

fail() {
  echo "CodeBloom session hook FAILED: $1" >&2
  echo "Dependencies are not installed, so lint, typecheck, build and tests will not run." >&2
  echo "Fix: run 'npm ci' in the repository root and read its error output." >&2
  exit 1
}

# The repository root is two folders above this script. Only shell built-ins are
# used here so the root is found even if PATH is broken.
case "${BASH_SOURCE[0]}" in
  */*) SCRIPT_DIR="${BASH_SOURCE[0]%/*}" ;;
  *) SCRIPT_DIR="." ;;
esac
cd "$SCRIPT_DIR/../.." || fail "cannot enter the repository root from $SCRIPT_DIR"
ROOT="$PWD"

[ -f package.json ] || fail "package.json not found in $ROOT"
[ -f package-lock.json ] || fail "package-lock.json not found in $ROOT (npm ci needs it)"
command -v npm >/dev/null 2>&1 || fail "npm is not installed or not on PATH"

# A stamp file inside node_modules records which lockfile it was installed from.
LOCK_HASH="$(sha256sum package-lock.json | cut -d' ' -f1)"
STAMP="node_modules/.codebloom-lock-hash"

if [ -f "$STAMP" ] && [ "$(cat "$STAMP")" = "$LOCK_HASH" ] && [ -x node_modules/.bin/next ]; then
  echo "CodeBloom: node_modules already matches package-lock.json, install skipped."
  exit 0
fi

echo "CodeBloom: installing dependencies with npm ci..."
# npm output goes to stderr so only the short messages above and below reach the session.
if ! npm ci --no-audit --no-fund --loglevel=error >&2; then
  fail "npm ci exited with an error"
fi

echo "$LOCK_HASH" > "$STAMP"
echo "CodeBloom: dependencies installed. Checks: npm run lint | typecheck | build | test:e2e | check:examples | test:runner"
