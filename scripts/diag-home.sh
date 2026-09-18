#!/bin/bash
set -u
cd /home/z/my-project
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/nimberlys"

if ! (exec 3<>/dev/tcp/127.0.0.1/5432) 2>/dev/null; then
  bun run db:up > .zscripts/pg.log 2>&1 &
  for i in $(seq 1 30); do (exec 3<>/dev/tcp/127.0.0.1/5432) 2>/dev/null && break; sleep 1; done
fi

pkill -f "next dev" 2>/dev/null; sleep 1
rm -f dev.log
nohup bun run dev > /dev/null 2>&1 &
for i in $(seq 1 90); do
  curl -s -o /dev/null --connect-timeout 1 http://localhost:3000 2>/dev/null && break
  sleep 1
done
echo "--- server up, fetching / (full stream, 60s max) ---"
curl -s --max-time 60 http://localhost:3000/ -o /tmp/home.html
wc -c /tmp/home.html
echo "--- key markers ---"
grep -o "Where Little Hearts" /tmp/home.html | head -1
grep -o "splash-root" /tmp/home.html | head -1
grep -o "hero-classroom" /tmp/home.html | head -1
grep -o "photo-group-room" /tmp/home.html | head -1
grep -o "VoiceMessage\|voice" /tmp/home.html | head -2
echo "--- last 500 chars of body ---"
python3 - <<'EOF'
import re
html = open('/tmp/home.html').read()
body = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.S)
text = re.sub(r'<[^>]+>', ' ', body)
text = re.sub(r'\s+', ' ', text)
print(text[-600:])
EOF
echo "--- dev.log (all) ---"
cat dev.log | grep -vE "^\s*$" | tail -25
echo DONE
