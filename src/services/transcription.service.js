import fs from "fs";
import path from "path";
import os from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const FFMPEG_PATH =
    process.env.FFMPEG_PATH ||
    "C:\\Users\\basav\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Shared_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build-shared\\bin\\ffmpeg.exe";

const WHISPER_MODEL_PATH =
    process.env.WHISPER_MODEL_PATH ||
    "D:\\Backend_1\\ggml-base.en.bin";

const transcribeVideo = async (videoUrl) => {
    const tempDirectory = await fs.promises.mkdtemp(
        path.join(os.tmpdir(), "edutube-whisper-")
    );

    const videoPath = path.join(
        tempDirectory,
        "video.mp4"
    );

    const transcriptPath = path.join(
        tempDirectory,
        "transcript.txt"
    );

    const modelPath = path.join(
        tempDirectory,
        "ggml-base.en.bin"
    );

    try {
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

        await fs.promises.copyFile(
            WHISPER_MODEL_PATH,
            modelPath
        );

        await execFileAsync(
            FFMPEG_PATH,
            [
                "-y",
                "-i",
                videoPath,
                "-af",
                "whisper=model=ggml-base.en.bin:language=en:destination=transcript.txt:format=text",
                "-f",
                "null",
                "NUL"
            ],
            {
                cwd: tempDirectory,
                windowsHide: true,
                maxBuffer: 10 * 1024 * 1024
            }
        );

        const transcript =
            await fs.promises.readFile(
                transcriptPath,
                "utf8"
            );

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