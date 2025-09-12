import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';
import "dotenv/config"; 

async function repoInfo(repoUrl) {
    const response = await fetch(repoUrl)
    const repoData = await response.json();
    return repoData;
}

export async function ReadMe_generator (repoData) {
    try {
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    async function main() {
        const contents = [
            { text: "Generate a READ.ME file" },
            {
                inlineData: {
                    mimeType: 'text/plain',
                    data: Buffer.from(fs.readFileSync("prompt.txt")).toString("base64")
                },
            },

            { text: "Repo Data: " + JSON.stringify(repoData) },
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
        });
        console.log(response.text);
    }

    main();

} catch (error) {

    console.log("Check if link is Incorrect or maybe api key is not working properly.");
    console.log("Error message:", error.message);

}
}

