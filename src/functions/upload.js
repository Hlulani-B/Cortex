import { showToast } from "./toast";

const apiKey = import.meta.env.VITE_GEMINI_KEY;

class Upload {
  async uploadFile(mediafile) {
    const startRes = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "X-Goog-Upload-Protocol": "resumable",
          "X-Goog-Upload-Command": "start",
          "X-Goog-Upload-Header-Content-Length": mediafile.size,
          "X-Goog-Upload-Header-Content-Type": mediafile.type,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file: { display_name: mediafile.name } }),
      }
    );

    const uploadUrl = startRes.headers.get("X-Goog-Upload-URL");

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Length": mediafile.size,
        "X-Goog-Upload-Offset": "0",
        "X-Goog-Upload-Command": "upload, finalize",
      },
      body: mediafile,
    });

    const fileInfo = await uploadRes.json();
    return fileInfo.file;
  }

  async waitForActive(fileUri) {
    let file = { state: "PROCESSING" };
    while (file.state === "PROCESSING") {
      await new Promise((r) => setTimeout(r, 3000));
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileUri}?key=${apiKey}`);
      file = await res.json();
    }
    if (file.state === "FAILED") throw new Error("Gemini file processing failed");
    return file;
  }

  async media(filename, mediafile) {
    try {
      showToast("Uploading file");
      const uploaded = await this.uploadFile(mediafile);
      const file = await this.waitForActive(uploaded.name);

      showToast("Transcribing and building notes");
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { file_data: { file_uri: file.uri, mime_type: file.mimeType } },
                  { text: "Turn this into clean, structured HTML notes. Only send the HTML. this is made for a student.study. make it look professional. make the notes very detailed. explain the notes." },
                ],
              },
            ],
          }),
        }
      );

      if (!res.ok) throw new Error(`Gemini request failed (${res.status}): ${await res.text()}`);
      const data = await res.json();

      showToast("Almost finished");
      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/^```html\s*/i, "").replace(/```\s*$/, "").trim();
      return text;
    } catch (error) {
      console.log(error.message);
      throw error;
    }
  }
}

export default Upload;