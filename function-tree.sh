#!/bin/bash

# BACKEND
echo "backend/" > functions-tree.txt

find ./backend -type f \( -name "*.ts" -o -name "*.js" \) ! -path "*/node_modules/*" | sort | while read file; do
  relpath="${file#./backend/}"
  echo "├── $relpath" >> functions-tree.txt

  # Импорты
  grep -E '^\s*(import|const\s+\w+\s*=\s*require)' "$file" | \
    sed -E 's/^\s*/│   ├── [import] /' >> functions-tree.txt

  # Экспорты
  grep -E '^\s*export\s+(default\s+)?(function|const|let|var|class|interface|type)\s+' "$file" | \
    sed -E 's/^\s*/│   ├── [export] /' >> functions-tree.txt

  # Обычные функции
  grep -E '^\s*(export\s+)?(async\s+)?function\s+\w+\s*\(.*\)\s*(:\s*\w+)?\s*{' "$file" | \
    sed -E 's/^\s*/│   ├── /' >> functions-tree.txt

  # Стрелочные функции
  grep -E '^\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s*)?\(?.*\)?\s*=>\s*{' "$file" | \
    sed -E 's/^\s*/│   ├── [arrow] /' >> functions-tree.txt

  # Методы классов
  grep -E '^\s*(public\s+|private\s+|protected\s+)?(static\s+)?(async\s+)?\w+\s*\(.*\)\s*{' "$file" | \
    sed -E 's/^\s*/│   ├── [method] /' >> functions-tree.txt

  # Роуты
  grep -E 'router\.(get|post|put|patch|delete)\([^,]+,\s*[^)]+\)' "$file" | \
    sed -E 's/.*router\.\w+\([^,]+,\s*([^)]+)\).*/│   ├── [route] \1/' >> functions-tree.txt
done

# FRONTEND
echo -e "\nfrontend/" >> functions-tree.txt

find ./frontend \
  -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/.next/*" \
  ! -path "*/.turbo/*" \
  ! -path "*/out/*" \
  ! -path "*/build/*" \
  | sort | while read file; do

  relpath="${file#./frontend/}"
  echo "├── $relpath" >> functions-tree.txt

  # Импорты
  grep -E '^\s*(import|const\s+\w+\s*=\s*require)' "$file" | \
    sed -E 's/^\s*/│   ├── [import] /' >> functions-tree.txt

  # Экспорты
  grep -E '^\s*export\s+(default\s+)?(function|const|let|var|class|interface|type)\s+' "$file" | \
    sed -E 's/^\s*/│   ├── [export] /' >> functions-tree.txt

  # Обычные функции
  grep -E '^\s*(export\s+)?(async\s+)?function\s+\w+\s*\(.*\)\s*(:\s*\w+)?\s*{' "$file" | \
    sed -E 's/^\s*/│   ├── /' >> functions-tree.txt

  # Стрелочные функции
  grep -E '^\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s*)?\(?.*\)?\s*=>\s*{' "$file" | \
    sed -E 's/^\s*/│   ├── [arrow] /' >> functions-tree.txt

  # Методы классов
  grep -E '^\s*(public\s+|private\s+|protected\s+)?(static\s+)?(async\s+)?\w+\s*\(.*\)\s*{' "$file" | \
    sed -E 's/^\s*/│   ├── [method] /' >> functions-tree.txt

  # export default function ComponentName
  grep -E '^\s*export\s+default\s+function\s+\w+' "$file" | \
    sed -E 's/^\s*/│   ├── [export default fn] /' >> functions-tree.txt

  # export default (анонимные компоненты)
  grep -E '^\s*export\s+default\s+\(?.*=>\s*{' "$file" | \
    sed -E 's/^\s*/│   ├── [export default anon] /' >> functions-tree.txt

  # Методы в объектах
  grep -E '^\s*\w+\s*:\s*\(?.*\)?\s*=>\s*{' "$file" | \
    sed -E 's/^\s*/│   ├── [object method] /' >> functions-tree.txt
done

echo "✅ Полный список функций, импортов и экспортов сохранён в: functions-tree.txt"
