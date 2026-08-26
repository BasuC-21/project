import fs from "fs";
import path from "path";
import os from "os";
import { nodewhisper } from "nodejs-whisper";

const transcribeVideo = async (videoUrl) => {
    const totalStart = Date.now();

    const tempDirectory = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), "edutube-whisper-")
    );

    const videoPath = path.join(
        tempDirectory,
        "video.mp4"
    );

    const modelDirectory = path.join(
        os.tmpdir(),
        "edutube-whisper-models"
    );

    try {
        await fs.promises.mkdir(
            modelDirectory,
            {
                recursive: true
            }
        );

        console.log("[Whisper] Starting video download...");

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
            `[Whisper] Video download completed in ${
                ((Date.now() - downloadStart) / 1000).toFixed(2)
            }s`
        );

        console.log(
            `[Whisper] Video size: ${
                (videoBuffer.length / 1024 / 1024).toFixed(2)
            } MB`
        );

        console.log(
            "[Whisper] Starting Whisper transcription..."
        );

        const whisperStart = Date.now();

        const result = await nodewhisper(
            videoPath,
            {
                modelName: "base.en",
                modelRootPath: modelDirectory,
                autoDownloadModelName: "base.en",

                withCuda: false,

                whisperOptions: {
                    outputInText: true,
                    outputInSrt: false,
                    outputInVtt: false,
                    outputInCsv: false,
                    outputInJson: false,
                    outputInJsonFull: false,
                    outputInLrc: false,
                    outputInWords: false,
                    wordTimestamps: false,
                    translateToEnglish: false,
                    noGpu: true
                }
            }
        );

        console.log(
            `[Whisper] Whisper completed in ${
                ((Date.now() - whisperStart) / 1000).toFixed(2)
            }s`
        );

        const transcript =
            typeof result === "string"
                ? result
                : result?.toString?.() || "";

        const cleanedTranscript =
            transcript
                .replace(/\r/g, " ")
                .replace(/\n+/g, " ")
                .replace(/\s+/g, " ")
                .trim();

        console.log(
            `[Whisper] Transcript length: ${cleanedTranscript.length} characters`
        );

        if (!cleanedTranscript) {
            throw new Error(
                "No speech could be detected in the video."
            );
        }

        console.log(
            `[Whisper] Total transcription time: ${
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