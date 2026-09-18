#!/bin/bash
# Full self-verification: DB up -> dev server -> HTTP checks -> browser checks
set -u
cd /home/z/my-project
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/nimberlys"

echo "== 1. PostgreSQL =="
if ! (exec 3<>/dev/tcp/127.0.0.1/5432) 2>/dev/null; then
  bun run db:up > .zscripts/pg.log 2>&1 &
  for i in $(seq 1 30); do (exec 3<>/dev/tcp/127.0.0.1/5432) 2>/dev/null && break; sleep 1; done
fi
(exec 3<>/dev/tcp/127.0.0.1/5432) 2>/dev/null && echo "PG up" || { echo "PG FAILED"; exit 1; }

echo "== 2. Schema + seed =="
bunx prisma db push --accept-data-loss --skip-generate 2>&1 | tail -1
bunx tsx prisma/seed.ts 2>&1 | tail -2

echo "== 3. Dev server =="
rm -f dev.log
nohup bun run dev > /dev/null 2>&1 &
for i in $(seq 1 60); do
  curl -s -o /dev/null -w "" --connect-timeout 1 http://localhost:3000 2>/dev/null && break
  sleep 1
done
curl -s -o /dev/null http://localhost:3000 && echo "server up" || { echo "SERVER FAILED"; tail -30 dev.log; exit 1; }

echo "== 4. HTTP checks =="
for path in "/" "/gallery" "/about" "/faq" "/contact" "/blog"; do
  code=$(curl -s -o /tmp/page.html -w "%{http_code}" "http://localhost:3000$path")
  size=$(wc -c < /tmp/page.html)
  echo "GET $path -> $code (${size} bytes)"
done

echo "== 5. Browser: home =="
agent-browser set viewport 1440 900
agent-browser open http://localhost:3000/
agent-browser wait --load networkidle
sleep 2
agent-browser screenshot /home/z/my-project/scripts/verify-home.png
agent-browser errors

echo "== 6. Browser: gallery =="
agent-browser open http://localhost:3000/gallery
agent-browser wait --load networkidle
sleep 2
agent-browser screenshot /home/z/my-project/scripts/verify-gallery.png
agent-browser errors

echo "== 7. dev.log errors =="
grep -iE "error|failed" dev.log | grep -v "favicon" | head -10 || echo "(no errors in dev.log)"
echo "DONE"
