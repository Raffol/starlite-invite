#!/usr/bin/env bash
# Быстрая диагностика: запусти из корня проекта — bash check.sh
echo "Папка:      $(pwd)"
echo "Node:       $(node -v 2>/dev/null || echo 'НЕ УСТАНОВЛЕН')  (нужен 18 или новее)"
echo "npm:        $(npm -v 2>/dev/null || echo 'НЕ УСТАНОВЛЕН')"
echo
for f in package.json index.html vite.config.js src/main.js src/App.vue src/styles.css \
         src/components/StarSky.vue src/components/OrnatePanel.vue \
         src/components/ChoiceCard.vue src/components/WishBurst.vue \
         shared/options.js api/notify.js; do
  [ -f "$f" ] && echo "  есть      $f" || echo "  НЕТ ФАЙЛА $f"
done
echo
[ -d node_modules/vite ] && echo "node_modules: установлены" || echo "node_modules: НЕТ — запусти npm install"
