const express = require("express");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;
  console.log(userMessage, ">>>>>>>>>>>>>");
  if (!userMessage) {
    return res
      .status(400)
      .json({ status: 400, replay: "Message is required!" });
  }
  try {
    const result = await model.generateContent(userMessage);
    const response = result.response;
    const text = response.text();
    console.log(text, "?????????");
    res.status(200).json({ status: 200, reply: text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ status: 500, reply: "Something went wrong!" });
  }
});

// function imageToGenerativePart(imagePath, mimeType) {
//   return {
//     inlineData: {
//       data: fs.readFileSync(imagePath).toString("base64"),
//       mimeType,
//     },
//   };
// }
// app.post("/generate-from-image", upload.single("image"), async (req, res) => {
//   const prompt = req.body.prompt || "Deskripsikan gambar";

//   const image = imageToGenerativePart(req.file.path, req.file.mimetype);
//   try {
//     const result = await model.generateContent([prompt, image]);
//     const response = result.response;
//     res.status(200).json({ status: 200, output: response.text() });
//   } catch (error) {
//     res.status(500).json({ status: 500, error: error.message });
//   } finally {
//     fs.unlinkSync(req.file.path);
//   }
// });
// app.post(
//   "/generate-from-document",
//   upload.single("document"),
//   async (req, res) => {
//     const filePath = req.file.path;
//     const buffer = fs.readFileSync(filePath);
//     const base64Data = buffer.toString("base64");
//     const mimeType = req.file.mimetype;

//     try {
//       const documentPart = {
//         inlineData: { data: base64Data, mimeType },
//       };

//       const result = await model.generateContent([
//         "Analisa dokumen lebih detail dan jelas:",
//         documentPart,
//       ]);
//       const response = await result.response;
//       res.json({ output: response.text() });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     } finally {
//       fs.unlinkSync(filePath);
//     }
//   }
// );
// app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
//   const audioBuffer = fs.readFileSync(req.file.path);
//   const base64Audio = audioBuffer.toString("base64");
//   const audioPart = {
//     inlineData: {
//       data: base64Audio,
//       mimeType: req.file.mimetype,
//     },
//   };

//   try {
//     const result = await model.generateContent([
//       "Transkripsikan atau analisis audio berikut:",
//       audioPart,
//     ]);
//     const response = await result.response;
//     res.json({ output: response.text() });
//   } catch (error) {
//     res.status(500).json({ error: err.message });
//   } finally {
//     fs.unlinkSync(req.file.path);
//   }
// });

app.listen(port, () => {
  console.log(`Gemini API Chat Server is running at http://localhost:${port}`);
});
