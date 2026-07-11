import Upload from "./upload";
import Ai from "./youtube";
import PDF from "./pdf";

export default class Connect {
  async getPDF(filename, mediafile) {
    const upload = new Upload();
    const ai = new Ai();
    const pdf = new PDF();

    const htmlString = await upload.media(filename, mediafile);
    
    

    return htmlString;
  }
}