import { GoogleGenerativeAI } from "@google/generative-ai";
import { showToast } from "./toast";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

class Ai {
  async getHtml(url) {
    try {
      const result = await model.generateContent([
        { fileData: { fileUri: url } },
        { text: "Turn this into clean, structured HTML notes. Only send the HTML.put some styles and make it pretty. This is made for a student to study. Make it look professional. make the notes very detailed explain what the notes mean go in depth. make the html fit in a A4 paper pdf" },
      ]);

      showToast("Almost there.");
      let text = result.response.text();
      text = text.replace(/^```html\s*/i, "").replace(/```\s*$/, "").trim();
      return text;
    } catch (error) {
      console.log(error.message);
    }
  }
}

export default Ai;