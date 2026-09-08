#!/bin/zsh
cd "${0:A:h}"
if curl --silent --fail http://127.0.0.1:5180/api/plan >/dev/null; then
  open 'http://127.0.0.1:5180/'
else
  npm run dev -- --open
fi
