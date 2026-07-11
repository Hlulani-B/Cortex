# Cortex

Turn lectures, meetings, voice memos, or YouTube videos into clean, structured notes — delivered as a styled PDF you can view instantly or download.

## What it does

Drop in an audio or video file, or paste a YouTube link, and Cortex generates organized notes from the content using Gemini. Notes are rendered into a PDF you can preview in-browser or save.

## Features

- Upload audio or video files (MP3, WAV, MP4, MOV)
- Paste a YouTube link directly — no download needed
- AI-generated structured HTML notes (not just a raw transcript)
- Instant in-browser PDF preview
- Downloadable PDF output
- Duration limit (55 minutes) to keep processing within model limits
- Responsive layout for desktop, tablet, and mobile

## Tech stack

- **Frontend:** React + Vite
- **AI:** Google Gemini API (`gemini-2.5-flash`) for content understanding and HTML note generation
- **YouTube integration:** YouTube Data API v3 (for fetching video duration)
- **File handling:** Gemini File API (resumable upload) for larger media files
- **PDF generation:** client-side HTML-to-PDF rendering
- **Styling:** custom CSS, Archivo Black + Inter fonts

## Setup

1. Clone the repo
```bash
git clone https://github.com/Hlulani-B/cortex.git
cd cortex
npm install
```

2. Create a `.env` file in the root with:
```
VITE_GEMINI_KEY=your_gemini_api_key
VITE_YOUTUBE_API_KEY=your_youtube_data_api_key
```

3. Run the dev server
```bash
npm run dev
```

## Notes

- Gemini API key: from Google AI Studio / Google Cloud Console
- YouTube Data API key: enable "YouTube Data API v3" in Google Cloud Console and generate a key
- Files or videos longer than 55 minutes are rejected client-side to avoid exceeding Gemini's token limits


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
