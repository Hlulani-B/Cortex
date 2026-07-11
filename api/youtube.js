
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { youtubeUrl } = req.body; // send this from frontend instead of file
    if (!youtubeUrl) return res.status(400).json({ error: "Missing youtubeUrl" });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      { fileData: { fileUri: youtubeUrl } },
      { text: "Turn this into clean, structured HTML notes. Only send the HTML." },
    ]);

    res.status(200).json({ html: result.response.text() });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Gemini request failed" });
  }
}