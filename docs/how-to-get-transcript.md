# How to Get Transcripts for Analysis

This guide explains how to obtain transcripts from YouTube videos for recipe analysis and content creation.

## Prerequisites

- Install `yt2md` tool
- Install `yt-dlp` for audio download
- Install `whisper` for audio transcription (with small model)

## Method 1: Using Available Subtitles (Default)

When subtitles are available and working, use `yt2md` with the `--language` parameter:

```bash
yt2md --category Fitness --language pl --kindle --skip-verification --cloud --url https://www.youtube.com/watch?v=cQFjn6RGOfk
```

Replace `pl` with the appropriate language code (e.g., `en` for English).

## Method 2: Using Auto-Generated Subtitles

When subtitles are broken or missing, try fetching auto-generated subtitles using the `--auto-generated` parameter:

```bash
yt2md --category Fitness --language pl --kindle --skip-verification --cloud --auto-generated --url https://www.youtube.com/watch?v=hi83ihotYjU
```

## Method 3: Audio Download and Whisper Transcription

When no subtitles are available at all:

### Step 1: Download Audio

Use `yt-dlp` with the `-x` parameter to extract audio:

```bash
yt-dlp -x https://www.youtube.com/watch?v=GFUD7PhsSUw
```

This will download the audio file (typically in .opus or .m4a format).

### Step 2: Transcribe with Whisper

Use Whisper to generate transcript from the audio file. Recommended to use the small model for speed:

```bash
whisper '.\PASTA rybna z makreli i awokado..opus' --model small --language Polish
```

Replace the filename with your actual audio file and adjust the language as needed.

### Step 3: Manual Analysis

Analyze the generated transcript manually to extract recipe information, ingredients, and instructions.

## Future Plans

A feature is planned to allow passing the transcript file path directly for automated analysis.
