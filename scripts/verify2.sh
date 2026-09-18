#!/bin/bash
# Home page deep verification (server restart included)
set -u
cd /home/z/my-project
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/nimberlys"

# PG
if ! (exec 3<>/dev/tcp/127.0.0.1/5432) 2>/dev/null; then
  bun run db:up > .zscripts/pg.log 2>&1 &
  for i in $(seq 1 30); do (exec 3<>/dev/tcp/127.0.0.1/5432) 2>/dev/null && break; sleep 1; done
fi

# Server (warm up)
if ! curl -s -o /dev/null --connect-timeout 1 http://localhost:3000; then
  rm -f dev.log
  nohup bun run dev > /dev/null 2>&1 &
  for i in $(seq 1 90); do
    curl -s -o /dev/null --connect-timeout 1 http://localhost:3000 2>/dev/null && break
    sleep 1
  done
  curl -s -o /dev/null http://localhost:3000/  # trigger home compile
fi
echo "server ready"

agent-browser set viewport 1440 900
agent-browser open http://localhost:3000/
agent-browser wait --load networkidle
agent-browser wait --text "Where Little Hearts" || echo "WARN: hero text not found"
sleep 3
agent-browser screenshot /home/z/my-project/scripts/verify-home-hero.png

# Welcome section
agent-browser find text "A second home where your child is truly known" scrollintoview 2>/dev/null || agent-browser scroll down 900
sleep 1.5
agent-browser screenshot /home/z/my-project/scripts/verify-home-welcome.png

# Gallery section (scroll to bottom-ish)
agent-browser find text "View the Full Gallery" scrollintoview 2>/dev/null || agent-browser scroll down 3000
sleep 1.5
agent-browser screenshot /home/z/my-project/scripts/verify-home-gallery.png

echo "== console errors =="
agent-browser errors
echo "== dev.log tail =="
grep -iE "error" dev.log | grep -viE "favicon|Download the React DevTools" | head -5 || echo "(clean)"
echo DONE
