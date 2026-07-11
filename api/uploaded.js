// api/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import multer from "multer";
import fs from "fs";

const upload = multer({ dest: "/tmp/uploads" });
const apiKey = process.env.GEMINI_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

export const config = {
  api: { bodyParser: false },
};

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      resolve(result);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await runMiddleware(req, res, upload.single("media"));

    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let result;

    if (req.file) {
      const filePath = req.file.path;
      const mimeType = req.file.mimetype;

      const uploaded = await fileManager.uploadFile(filePath, {
        mimeType,
        displayName: req.file.originalname,
      });

      let file = uploaded.file;
      while (file.state === "PROCESSING") {
        await new Promise((r) => setTimeout(r, 3000));
        file = await fileManager.getFile(file.name);
      }
      if (file.state === "FAILED") {
        throw new Error("Gemini file processing failed");
      }

      result = await model.generateContent([
        { fileData: { fileUri: file.uri, mimeType: file.mimeType } },
        { text: "Turn this into clean, structured HTML notes. Only send the HTML." },
      ]);

      fs.unlinkSync(filePath);
    } else {
      if (!prompt) {
        return res.status(400).json({ error: "Missing prompt" });
      }
      result = await model.generateContent(prompt);
    }

    res.status(200).json({ html: result.response.text() });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Gemini request failed" });
  }
}


