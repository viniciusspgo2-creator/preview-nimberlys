#!/bin/bash
set -u
cd /home/z/my-project
export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/nimberlys"

if ! (exec 3<>/dev/tcp/127.0.0.1/5432) 2>/dev/null; then
  bun run db:up > .zscripts/pg.log 2>&1 &
  for i in $(seq 1 30); do (exec 3<>/dev/tcp/127.0.0.1/5432) 2>/dev/null && break; sleep 1; done
fi
if ! curl -s -o /dev/null --connect-timeout 1 http://localhost:3000; then
  rm -f dev.log
  nohup bun run dev > /dev/null 2>&1 &
  for i in $(seq 1 90); do curl -s -o /dev/null --connect-timeout 1 http://localhost:3000 2>/dev/null && break; sleep 1; done
fi
echo "server ready"
agent-browser set viewport 1440 900
agent-browser open http://localhost:3000/
agent-browser wait --load networkidle
agent-browser wait --text "Where Little Hearts"
sleep 2.5

# Welcome section — heading is centered, find its parent section
agent-browser eval "document.querySelector('section[aria-label]').scrollIntoView()" 2>/dev/null
agent-browser eval "const h=[...document.querySelectorAll('h2')].find(e=>e.textContent.includes('second home')); h.closest('section').scrollIntoView({block:'start'}); 'ok'"
sleep 2
agent-browser screenshot /home/z/my-project/scripts/v3-welcome.png

# Gallery section on home
agent-browser eval "const h=[...document.querySelectorAll('h2')].find(e=>e.textContent.includes('Nimberly')); if(h && h.textContent.includes('Life at Nimberly')){h.closest('section').scrollIntoView({block:'start'})}; 'ok'"
sleep 2
agent-browser screenshot /home/z/my-project/scripts/v3-home-gallery.png

# Lightbox test on gallery page
agent-browser open http://localhost:3000/gallery
agent-browser wait --load networkidle
sleep 2
agent-browser eval "document.querySelector('section button[aria-label]')?.click(); 'clicked'"
sleep 1.5
agent-browser screenshot /home/z/my-project/scripts/v3-lightbox.png
agent-browser eval "document.querySelector('[role=dialog]') ? 'LIGHTBOX OPEN' : 'LIGHTBOX MISSING'"

# Mobile viewport check (home)
agent-browser set viewport 390 844
agent-browser open http://localhost:3000/
agent-browser wait --load networkidle
sleep 2.5
agent-browser screenshot /home/z/my-project/scripts/v3-mobile.png
echo "ALL DONE"
