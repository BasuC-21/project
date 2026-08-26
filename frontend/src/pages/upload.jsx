import { useState } from "react";

import {
  UploadCloud,
  Video as VideoIcon,
  Image,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import "./upload.css";

function Upload() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoFile: null,
    thumbnail: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // Validate title
      if (!formData.title.trim()) {
        throw new Error("Please enter a lesson title.");
      }

      // Validate description
      if (!formData.description.trim()) {
        throw new Error("Please enter a lesson description.");
      }

      // Validate video
      if (!formData.videoFile) {
        throw new Error("Please select a video.");
      }

      // Validate thumbnail
      if (!formData.thumbnail) {
        throw new Error("Please select a thumbnail.");
      }

      // Get authentication token
      const token = localStorage.getItem("accessToken");

      if (!token) {
        throw new Error(
          "Please login before uploading a video."
        );
      }

      // Create multipart form data
      const uploadData = new FormData();

      uploadData.append(
        "title",
        formData.title.trim()
      );

      uploadData.append(
        "description",
        formData.description.trim()
      );

      uploadData.append(
        "videoFile",
        formData.videoFile
      );

      uploadData.append(
        "thumbnail",
        formData.thumbnail
      );

      console.log("================================");
      console.log("Starting video upload...");
      console.log("Title:", formData.title);
      console.log(
        "Video:",
        formData.videoFile.name
      );
      console.log(
        "Thumbnail:",
        formData.thumbnail.name
      );

      // Send upload request
      const response = await fetch(
        "https://edutube-backend-3we7.onrender.com/api/v1/videos",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        }
      );

      // Read response safely
      const contentType =
        response.headers.get("content-type") || "";

      const responseText = await response.text();

      let result = {};

      if (contentType.includes("application/json")) {
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error(
            "JSON parsing failed:",
            parseError
          );

          throw new Error(
            `Server returned invalid JSON. HTTP ${response.status}`
          );
        }
      } else {
        console.error(
          "Server returned non-JSON response:",
          response.status
        );

        console.error(
          "Server response:",
          responseText
        );

        throw new Error(
          `Upload failed. Server returned HTTP ${response.status}.`
        );
      }

      console.log("Upload response:", result);

      // Handle HTTP error
      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Video upload failed. HTTP ${response.status}`
        );
      }

      // Success
      console.log("Video uploaded successfully.");
      console.log("================================");

      setMessage(
        "Lesson published successfully!"
      );

      // Clear React state
      setFormData({
        title: "",
        description: "",
        videoFile: null,
        thumbnail: null,
      });

      // Clear HTML form
      document
        .getElementById("upload-video-form")
        ?.reset();

    } catch (err) {
      console.error("Upload failed:", err);

      setError(
        err.message ||
          "Video upload failed."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page">

      {/* NAVBAR */}

      <header className="upload-navbar">
        <div className="upload-navbar-inner">

          <a
            href="/home"
            className="upload-brand"
          >
            <span className="upload-brand-mark">
              E
            </span>

            <span className="upload-brand-name">
              Edu<span>Tube</span>
            </span>
          </a>

          <a
            href="/home"
            className="upload-back"
          >
            <ArrowLeft size={15} />
            Back to Explore
          </a>

        </div>
      </header>


      {/* MAIN */}

      <main className="upload-main">

        {/* INTRO */}

        <section className="upload-intro">

          <span className="upload-eyebrow">
            <Sparkles size={13} />
            CREATE A LESSON
          </span>

          <h1>
            Share what you know.
          </h1>

          <p>
            Upload an educational video
            and publish it instantly on
            EduTube.
          </p>

        </section>


        {/* FORM */}

        <form
          id="upload-video-form"
          className="upload-card"
          onSubmit={handleSubmit}
        >

          {/* LESSON INFORMATION */}

          <div className="upload-section">

            <div className="upload-section-heading">

              <span className="upload-number">
                01
              </span>

              <div>
                <h2>
                  Lesson information
                </h2>

                <p>
                  Give learners a clear idea
                  of what they are about to learn.
                </p>
              </div>

            </div>


            <div className="upload-fields">

              {/* TITLE */}

              <div className="upload-field">

                <label htmlFor="title">
                  Lesson title
                </label>

                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="e.g. Introduction to JavaScript"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* DESCRIPTION */}

              <div className="upload-field">

                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe what learners will discover in this lesson..."
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  required
                />

              </div>

            </div>

          </div>


          <div className="upload-divider"></div>


          {/* MEDIA */}

          <div className="upload-section">

            <div className="upload-section-heading">

              <span className="upload-number">
                02
              </span>

              <div>
                <h2>
                  Lesson media
                </h2>

                <p>
                  Add your video and a
                  thumbnail learners will see
                  before watching.
                </p>
              </div>

            </div>


            <div className="upload-file-grid">

              {/* VIDEO */}

              <label
                className={`upload-file-box ${
                  formData.videoFile
                    ? "selected"
                    : ""
                }`}
              >

                <input
                  type="file"
                  name="videoFile"
                  accept="video/*"
                  onChange={handleChange}
                  required
                />

                <span className="upload-file-icon">
                  <VideoIcon size={24} />
                </span>

                <strong>
                  {formData.videoFile
                    ? formData.videoFile.name
                    : "Choose your video"}
                </strong>

                <span>
                  MP4, WebM or other
                  supported video format
                </span>

              </label>


              {/* THUMBNAIL */}

              <label
                className={`upload-file-box ${
                  formData.thumbnail
                    ? "selected"
                    : ""
                }`}
              >

                <input
                  type="file"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleChange}
                  required
                />

                <span className="upload-file-icon">
                  <Image size={24} />
                </span>

                <strong>
                  {formData.thumbnail
                    ? formData.thumbnail.name
                    : "Choose a thumbnail"}
                </strong>

                <span>
                  JPG, PNG or WebP image
                </span>

              </label>

            </div>

          </div>


          <div className="upload-divider"></div>


          {/* KNOWLEDGE CHECK */}

          <div className="upload-ai-note">

            <div className="upload-ai-icon">
              <Sparkles size={20} />
            </div>

            <div>

              <strong>
                Knowledge Check
              </strong>

              <p>
                Publish your lesson first.
                You can generate a
                topic-based Knowledge Check
                from the lesson page afterward.
              </p>

            </div>

          </div>


          {/* SUCCESS */}

          {message && (
            <div className="upload-success">

              <CheckCircle size={18} />

              <span>
                {message}
              </span>

            </div>
          )}


          {/* ERROR */}

          {error && (
            <div className="upload-error">

              <AlertCircle size={18} />

              <span>
                {error}
              </span>

            </div>
          )}


          {/* SUBMIT */}

          <button
            type="submit"
            className="upload-submit"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="upload-spinner"></span>
                Publishing lesson...
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                Publish lesson
              </>
            )}

          </button>

        </form>

      </main>

    </div>
  );
}

export default Upload;