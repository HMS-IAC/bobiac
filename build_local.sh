#!/bin/bash

# Exit immediately if a command fails
set -e

# Flags
CLEAN=false
LAUNCH=false

# Parse command-line options
while getopts "rl" opt; do
  case $opt in
    r)
      CLEAN=true
      ;;
    l)
      LAUNCH=true
      ;;
  esac
done

# Clean build if -r is passed
if [ "$CLEAN" = true ]; then
  echo "🧹 Cleaning _build/ directory..."
  rm -rf _build/
  echo "📁 Verifying _build/ is empty..."
  if [ ! -d "_build" ]; then
    echo "✅ _build/ has been removed successfully."
  else
    echo "❌ _build/ still exists or wasn't removed properly:"
    ls -la _build/
  fi
fi

# Build the book
echo "🔧 Building Jupyter Book with Sphinx..."
python -m sphinx -a . -b html _build/html
echo "📘 Book built successfully at _build/html/"

# update notebook html styles
echo "🎨 Applying HTML styles to headers..."
python "$(dirname "$0")/update_html_styles.py" _build/html/content
echo "✅ HTML styles applied successfully."

# Prepare built notebook downloads in _build/html/notebooks/ and 
# prepare built colab notebook in _build/html/colab_notebooks/
echo "📁 Preparing notebooks for download and colab..."
for notebook in $(find content/ -name "*.ipynb"); do
  rel_path="${notebook#content/}"  # remove 'content/' prefix
  notebook_teacher_path="_build/html/notebooks_teacher/$rel_path"
  notebook_path="_build/html/notebooks/$rel_path"
  colab_path="_build/html/colab_notebooks/$rel_path"

  notebook_teacher_dir=$(dirname "$notebook_teacher_path")
  notebook_dir=$(dirname "$notebook_path")
  colab_dir=$(dirname "$colab_path")

  mkdir -p "$notebook_teacher_dir"
  mkdir -p "$notebook_dir"
  mkdir -p "$colab_dir"

  echo "📓 Processing $rel_path..."
  python3 "$(dirname "$0")/update_notebooks.py" "$notebook" "$notebook_teacher_path" true
  python3 "$(dirname "$0")/update_notebooks.py" "$notebook" "$notebook_path" false
  python3 "$(dirname "$0")/update_notebooks_colab.py" "$notebook" "$colab_path" true
done

echo "✅ Updated notebooks copied to _build/html/notebooks_teacher/"
echo "✅ Updated notebooks copied to _build/html/notebooks/"
echo "✅ Colab notebooks copied to _build/html/colab_notebooks/"

# Prepare PDF downloads in _build/html/pdfs/
echo "📁 Copying PDF files to _build/html/pdfs/..."
for pdf in $(find content/ -name "*.pdf"); do
  rel_path="${pdf#content/}"  # remove 'content/' prefix
  out_path="_build/html/pdfs/$rel_path"
  out_dir=$(dirname "$out_path")
  mkdir -p "$out_dir"
  echo "📄 Copying $rel_path..."
  cp "$pdf" "$out_path"
done

echo "✅ PDF files copied to _build/html/pdfs/"

# Launch local server if -l passed
if [ "$LAUNCH" = true ]; then
  echo "🛑 Checking for existing server on port 8000..."

  # Use Python subprocess with timeout to avoid hanging
  echo "🔍 Checking port status..."
  PID=$(python3 -c "
import subprocess
try:
    p = subprocess.run(['lsof', '-ti', 'tcp:8000'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, timeout=3)
    print(p.stdout.decode().strip())
except subprocess.TimeoutExpired:
    print('')
"
  )

  if [ -n "$PID" ]; then
    echo "⚠️ Port 8000 in use by PID $PID — killing it..."
    kill -9 "$PID"
    echo "⏳ Waiting for port 8000 to free up..."
    sleep 2
    for i in {1..5}; do
      if lsof -ti tcp:8000 >/dev/null; then
        echo "⏳ Port 8000 still in use... waiting..."
        sleep 1
      else
        break
      fi
    done
    echo "✅ Port 8000 is now free."
  fi

  echo "🚀 Launching local server at http://localhost:8000 ..."
  cd _build/html
  python -m http.server 8000 &
  SERVER_PID=$!
  cd ../../
  sleep 1  # Give the server time to start
  echo "🌐 Opening browser to http://localhost:8000/index.html ..."
  python -m webbrowser http://localhost:8000/index.html
  wait $SERVER_PID
fi