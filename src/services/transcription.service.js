import fs from "fs";
import path from "path";
import os from "os";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const transcribeVideo = async (videoUrl) => {
    const totalStart = Date.now();

    const tempDirectory = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), "edutube-transcription-")
    );

    const videoPath = path.join(
        tempDirectory,
        "video.mp4"
    );

    try {
        console.log("[Transcription] Downloading video...");

        const downloadStart = Date.now();

        const response = await fetch(videoUrl);

        if (!response.ok) {
            throw new Error(
                `Unable to download video. HTTP ${response.status}`
            );
        }

        const videoBuffer = Buffer.from(
            await response.arrayBuffer()
        );

        await fs.promises.writeFile(
            videoPath,
            videoBuffer
        );

        console.log(
            `[Transcription] Video downloaded in ${
                ((Date.now() - downloadStart) / 1000).toFixed(2)
            }s`
        );

        console.log(
            `[Transcription] Video size: ${
                (videoBuffer.length / 1024 / 1024).toFixed(2)
            } MB`
        );

        console.log(
            "[Transcription] Starting OpenAI transcription..."
        );

        const transcriptionStart = Date.now();

        const transcription =
            await openai.audio.transcriptions.create({
                file: fs.createReadStream(videoPath),
                model: "gpt-4o-mini-transcribe"
            });

        console.log(
            `[Transcription] OpenAI transcription completed in ${
                ((Date.now() - transcriptionStart) / 1000).toFixed(2)
            }s`
        );

        const transcript =
            transcription?.text || "";

        const cleanedTranscript =
            transcript
                .replace(/\r/g, " ")
                .replace(/\n+/g, " ")
                .replace(/\s+/g, " ")
                .trim();

        console.log(
            `[Transcription] Transcript length: ${cleanedTranscript.length} characters`
        );

        if (!cleanedTranscript) {
            throw new Error(
                "No speech could be detected in the video."
            );
        }

        console.log(
            `[Transcription] Total time: ${
                ((Date.now() - totalStart) / 1000).toFixed(2)
            }s`
        );

        return cleanedTranscript;
    } finally {
        await fs.promises.rm(
            tempDirectory,
            {
                recursive: true,
                force: true
            }
        );
    }
};

export {
    transcribeVideo
};