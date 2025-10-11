Place optimized intro video here:
File name: intro.mp4
Recommended encoding:
- Container: MP4 (H.264 Baseline or Main Profile)
- Resolution: 720x900 (portrait polygon shape) or 720x1280 if full portrait
- Frame rate: 30 fps (lower to 24 if size needs reduction)
- Target duration: 10.015 seconds
- Bitrate: ~1200-1500 kbps VBR (2-pass) to keep quality with glow edges
- Audio: None (remove audio track)

ffmpeg example command:
ffmpeg -i source.mov -vf "scale=720:-2:flags=lanczos,format=yuv420p" -c:v libx264 -profile:v main -pix_fmt yuv420p -r 30 -movflags +faststart -t 10.015 -an -b:v 1400k -maxrate 1600k -bufsize 2800k intro.mp4

If produced longer clip, you can trim:
ffmpeg -i long.mp4 -ss 0 -t 10.015 -c copy trimmed.mp4

After placing intro.mp4, rebuild or restart dev server if not auto-detected.
