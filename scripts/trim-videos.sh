#!/bin/bash

# Trim all videos to 2 seconds for faster loading
# Creates trimmed versions in videos-short directory

VIDEO_DIR="/Users/justinwu/Cursor/justinzwu.com-1/public/assets/videos"
OUTPUT_DIR="/Users/justinwu/Cursor/justinzwu.com-1/public/assets/videos-short"

mkdir -p "$OUTPUT_DIR"

# Get original total size
original_size=$(du -sh "$VIDEO_DIR"/*.mp4 2>/dev/null | awk '{sum+=$1} END {print sum}')

# Process only .mp4 files
for video in "$VIDEO_DIR"/*.mp4; do
  if [ -f "$video" ]; then
    filename=$(basename "$video")
    output="$OUTPUT_DIR/$filename"
    
    echo "Trimming: $filename"
    
    # Trim to first 2 seconds, re-encode for smaller size
    # -t 2 = duration of 2 seconds
    # -c:v libx264 = H.264 codec (widely compatible)
    # -crf 28 = good quality/size balance
    # -preset fast = reasonable encoding speed
    # -an = no audio (not needed for visual popups)
    ffmpeg -y -i "$video" -t 2 -c:v libx264 -crf 28 -preset fast -an -movflags +faststart "$output" 2>/dev/null
    
    if [ -f "$output" ]; then
      orig_size=$(ls -lh "$video" | awk '{print $5}')
      new_size=$(ls -lh "$output" | awk '{print $5}')
      echo "  ✓ $orig_size → $new_size"
    else
      echo "  ✗ Failed"
    fi
  fi
done

echo ""
echo "Done! Trimmed videos saved to: $OUTPUT_DIR"
echo ""
echo "Original folder size:"
du -sh "$VIDEO_DIR"/*.mp4 | tail -1
echo ""
echo "New folder size:"
du -sh "$OUTPUT_DIR"/*.mp4 | tail -1
