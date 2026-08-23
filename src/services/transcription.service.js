import fs from "fs";
import path from "path";
import os from "os";
import ffmpegPath from "ffmpeg-static";
import nodewhisper from "nodejs-whisper";

const transcribeVideo = async (videoUrl) => {
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
            "Starting Whisper transcription..."
        );

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

        if (!cleanedTranscript) {
            throw new Error(
                "No speech could be detected in the video."
            );
        }

        console.log(
            "Whisper transcription completed."
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