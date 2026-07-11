import { useState, useRef, useEffect } from "react";
import "./App.css";
import Connect from "./functions/connect";
import PDF from "./functions/pdf";
import Ai from "./functions/youtube";
import { YoutubeTranscript } from "youtube-transcript";
import { showToast } from "./functions/toast";

export default function App() {
  const [mode, setMode] = useState("upload"); // "upload" | "youtube"
  const [file, setFile] = useState(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | processing | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [htmlString, setHtmlString] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  const fileInputRef = useRef(null);
async function getYoutubeDuration(url) {
  const videoId = extractVideoId(url); // parse ?v= or youtu.be/ID
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`
  );
  const data = await res.json();
  const iso = data.items?.[0]?.contentDetails?.duration;
  return iso ? parseISO8601Duration(iso) : null; // returns seconds
}

function extractVideoId(url) {
  const match = url.match(/(?:youtu\.be\/|v=)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function parseISO8601Duration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  return h * 3600 + m * 60 + s;
}
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const isVideoOrAudio = (f) =>
    f && (f.type.startsWith("video/") || f.type.startsWith("audio/"));




 function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
}

const handleFile = async (f) => {
  if (!isVideoOrAudio(f)) {
    setErrorMsg("Please upload an audio or video file.");
    setStatus("error");
    return;
  }

  try {
    const duration = await getVideoDuration(f);
    if (duration > 55 * 60) {
      setErrorMsg("Please upload a file under 55 minutes.");
      setStatus("error");
      return;
    }
  } catch {
    // duration check failed (e.g. some audio formats) — let it through
  }

  setFile(f);
  if (!filename) setFilename(f.name.replace(/\.[^/.]+$/, ""));
  setErrorMsg("");
  setStatus("idle");
};


  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    // reset so selecting the same file again still fires onChange
    e.target.value = "";
  };

  const resetMedia = () => {
    setFile(null);
    setYoutubeUrl("");
    setHtmlString(null);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setStatus("idle");
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canGenerate =
    status !== "processing" &&
    ((mode === "upload" && file) ||
      (mode === "youtube" && youtubeUrl.trim().length > 0));
const handleGenerate = async () => {
  showToast("Go and get some coffee, this may take a while :)")
  setStatus("processing");
  setErrorMsg("");

  try {
    let html;

    if (mode === "youtube") {
      const duration = await getYoutubeDuration(youtubeUrl);
      if (duration !== null && duration > 55 * 60) {
        setErrorMsg("Please use a YouTube video under 55 minutes.");
        setStatus("error");
        return;
      }

      const ai = new Ai();
      html = await ai.getHtml(youtubeUrl);
    } else {
      const connect = new Connect();
      const name = filename.trim() || "notes";
      html = await connect.getPDF(name, file);
    }

    setHtmlString(html);
    showToast("Now we are done.")
    const pdf = new PDF();
    const blobUrl = await pdf.viewPdf(html);
    setPdfUrl(blobUrl);

    setStatus("done");
    setShowViewer(true);
    setYoutubeUrl("");
  } catch (err) {
    console.error(err);
    setErrorMsg("Something went wrong generating your notes. Please try again.");
    setStatus("error");
  }
};
  const handleDownload = () => {
    if (!htmlString) return;
    const pdf = new PDF();
    pdf.downloadPdf(filename.trim() || "notes", htmlString);
  };

  return (
    <div className="wrap">
     

      <div className="hero">
        <div>
          <div className="stack">
            <div className="l1">RECORD</div>
            <div className="l2">UPLOAD</div>
            <div className="l3">TRANSCRIBE</div>
            <div className="l4">DOWNLOAD</div>
          </div>
          <p className="sub">
            Drop in a lecture, a voice memo, a meeting recording — or paste a
            YouTube link — and get back clean, styled notes as a PDF in
            minutes.
          </p>
        </div>

        <div className="card">
          <div className="mode-tabs">
            <button
              className={mode === "upload" ? "tab active" : "tab"}
              onClick={() => {
                setMode("upload");
                setErrorMsg("");
              }}
            >
              Upload file
            </button>
            <button
              className={mode === "youtube" ? "tab active" : "tab"}
              onClick={() => {
                setMode("youtube");
                setErrorMsg("");
              }}
            >
              YouTube link
            </button>
          </div>

          {mode === "upload" ? (
            <div
              className={`drop ${isDragging ? "dragging" : ""} ${
                file ? "has-file" : ""
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*"
                hidden
                onChange={handleInputChange}
              />
              <div className="drop-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F9FAF4"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v12" />
                  <path d="M7 8l5-5 5 5" />
                  <path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                </svg>
              </div>
              {file ? (
                <>
                  <h3>{file.name}</h3>
                  <p>{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                  <button type="button" className="choose-btn" onClick={openFileDialog}>
                    Choose a different file
                  </button>
                </>
              ) : (
                <>
                  <h3>Upload audio or video</h3>
                  <p>MP3, WAV, MP4, MOV — </p>
                  <button type="button" className="choose-btn" onClick={openFileDialog}>
                    Choose file
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="yt-input-wrap">
              <input
                type="url"
                className="yt-input"
                placeholder="Paste a YouTube link..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>
          )}

          <input
            type="text"
            className="name-input"
            placeholder="Name your notes (optional)"
           value={filename || ""}
            onChange={(e) => setFilename(e.target.value)}
          />

          {status === "processing" && (
            <>
              <div className="stage">
                <span style={{ animationDuration: ".9s" }}></span>
                <span style={{ animationDuration: "1.2s" }}></span>
                <span style={{ animationDuration: ".8s" }}></span>
                <span style={{ animationDuration: "1.4s" }}></span>
                <span style={{ animationDuration: "1s" }}></span>
                <span style={{ animationDuration: "1.3s" }}></span>
                <span style={{ animationDuration: ".9s" }}></span>
                <span style={{ animationDuration: "1.1s" }}></span>
              </div>
              <p className="status-text">Transcribing and building your notes...</p>
            </>
          )}

          {errorMsg && <p className="error-text">{errorMsg}</p>}

          <div className="action-row">
            <button
              className="generate-btn"
              disabled={!canGenerate}
              onClick={handleGenerate}
            >
              {status === "processing" ? "Working..." : "Generate notes"}
            </button>
            {(file || youtubeUrl) && (
              <button className="reset-btn" onClick={resetMedia}>
                Clear
              </button>
            )}
          </div>

          {status === "done" && (
            <div className="action-row">
              <button className="view-btn" onClick={() => setShowViewer(true)}>
                View PDF
              </button>
              <button className="download-btn" onClick={handleDownload}>
                Download PDF
              </button>
            </div>
          )}

          <div className="pill-row">
            <div className="pill">AI notes</div>
            <div className="pill">Styled PDF</div>
            <div className="pill">Instant view</div>
          </div>
        </div>
      </div>

      <div className="features">
        <div className="feat">
          <div className="num">01</div>
          <h4>Any recording</h4>
          <p>Lectures, interviews, meetings, or a YouTube link — doesn't matter.</p>
        </div>
        <div className="feat">
          <div className="num">02</div>
          <h4>Real notes, not a transcript</h4>
          <p>Structured, styled, and organized — ready to read, not a wall of text.</p>
        </div>
        <div className="feat">
          <div className="num">03</div>
          <h4>View or download</h4>
          <p>Open it right in the browser, or save the PDF for later.</p>
        </div>
      </div>

      {showViewer && pdfUrl && (
        <div className="modal-overlay" onClick={() => setShowViewer(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>{filename.trim() || "notes"}.pdf</span>
              <div className="modal-actions">
                <button className="download-btn small" onClick={handleDownload}>
                  Download
                </button>
                <button className="close-btn" onClick={() => setShowViewer(false)}>
                  ✕
                </button>
              </div>
            </div>
            <iframe src={pdfUrl} title="PDF preview" className="pdf-frame" />
          </div>
        </div>
      )}
    </div>
  );
}