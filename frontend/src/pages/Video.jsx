import { useEffect, useState } from "react";
import {
  Heart,
  Bookmark,
  UserPlus,
  Eye,
  Clock3,
  ArrowRight,
  Check,
  MessageCircle,
  PlayCircle,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

import "./Video.css";

function Video() {
  const [video, setVideo] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);

  const [quizOpen, setQuizOpen] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);

  const videoId = new URLSearchParams(
    window.location.search
  ).get("id");
  useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(
        "https://edutube-backend-3we7.onrender.com/api/v1/users/current-user",
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "accessToken"
            )}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setCurrentUser(result.data);
      }
    } catch (error) {
      console.error(
        "Could not fetch current user:",
        error
      );
    }
  };

  fetchCurrentUser();
}, []);

  const quizQuestions = Array.isArray(video?.quiz)
    ? video.quiz.map((question) => ({
        question: question.question,
        options: Array.isArray(question.options)
          ? question.options
          : [],
        answer: question.correctAnswer,
      }))
    : [];

  const generateQuizForCurrentVideo = async (
    currentVideo
  ) => {
    if (!currentVideo || !videoId) {
      return;
    }

    setQuizLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://edutube-backend-3we7.onrender.com/api/v1/videos/${videoId}/generate-quiz`,
        {
          method: "POST",
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      const responseText =
        await response.text();

      let data = {};

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Server returned invalid JSON. HTTP ${response.status}`
          );
        }
      } else {
        throw new Error(
          `Quiz request failed with HTTP ${response.status}.`
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to generate Knowledge Check"
        );
      }

      const generatedQuiz =
        Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data?.quiz)
          ? data.data.quiz
          : [];

      if (!generatedQuiz.length) {
        throw new Error(
          "The server returned an empty Knowledge Check."
        );
      }

      setVideo((previousVideo) => ({
        ...previousVideo,
        quiz: generatedQuiz,
      }));

      setQuizIndex(0);
      setQuizScore(0);
      setQuizAnswers([]);
      setSelectedAnswer(null);
      setQuizFinished(false);
      setQuizOpen(true);
      setError("");
    } catch (err) {
      console.error(
        "Knowledge Check generation failed:",
        err
      );

      setError(
        err.message ||
          "Knowledge Check could not be generated."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        if (!videoId) {
          throw new Error(
            "Video ID is missing"
          );
        }

        const response = await fetch(
          `https://edutube-backend-3we7.onrender.com/api/v1/videos/${videoId}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch video"
          );
        }

        if (!data.data) {
          throw new Error(
            "Video data was not returned by the server"
          );
        }

        setVideo(data.data);
      } catch (err) {
        console.error(err);
        setError(
          err.message ||
            "Failed to load video"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    const loadLikeStatus = async () => {
      const token =
        localStorage.getItem(
          "accessToken"
        );

      if (!token || !videoId) {
        setLiked(false);
        return;
      }

      try {
        const response = await fetch(
          `https://edutube-backend-3we7.onrender.com/api/v1/likes/video/${videoId}/status`,
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch like status"
          );
        }

        setLiked(
          Boolean(data.data?.liked)
        );
      } catch (err) {
        console.error(
          "Failed to load like status:",
          err
        );
      }
    };

    loadLikeStatus();
  }, [videoId]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!videoId) {
        return;
      }

      try {
        const response = await fetch(
          `https://edutube-backend-3we7.onrender.com/api/v1/comments/video/${videoId}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch comments"
          );
        }

        setComments(
          Array.isArray(data.data)
            ? data.data
            : []
        );
      } catch (err) {
        console.error(
          "Failed to fetch comments:",
          err
        );
      }
    };

    fetchComments();
  }, [videoId]);

 useEffect(() => {
  const loadSubscriptionStatus = async () => {
    console.log("LOAD SUBSCRIPTION STATUS RUNNING");
    
    const creatorId = video?.owner?._id;
    const token = localStorage.getItem("accessToken");

    if (!creatorId || !token) {
      setSubscribed(false);
      return;
    }

    try {
      const response = await fetch(
        "https://edutube-backend-3we7.onrender.com/api/v1/subscriptions/u",
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("SUBSCRIPTION DATA:", data);

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load subscription status"
        );
      }

     const subscriptions = Array.isArray(data.data)
  ? data.data
  : [];

const isSubscribed = subscriptions.some(
  (subscription) => {
    const channelId =
      subscription?.channel?._id ||
      subscription?.channel;

    return String(channelId) === String(creatorId);
  }
);

setSubscribed(isSubscribed);
    } catch (err) {
      console.error(
        "Failed to load subscription status:",
        err
      );

      setSubscribed(false);
    }
  };

  loadSubscriptionStatus();
}, [
  video?.owner?._id
]);

  const handleLike = async () => {
    const token =
      localStorage.getItem(
        "accessToken"
      );

    if (!token) {
      setError(
        "Please login to like this lesson."
      );
      return;
    }

    setLikeLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://edutube-backend-3we7.onrender.com/api/v1/likes/video/${videoId}`,
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to like video"
        );
      }

      setLiked(
        Boolean(
          data.data?.liked ??
            data.liked
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Failed to like video"
      );
    } finally {
      setLikeLoading(false);
    }
  };

  const handleSave = () => {
    if (!videoId || !currentUser?._id) {
      return;
    }

    try {
      const savedVideos =
        JSON.parse(
          localStorage.getItem(
            `edutube_saved_videos_${currentUser?._id}`
          ) || "[]"
        );

      const current =
        Array.isArray(savedVideos)
          ? savedVideos
          : [];

      if (
        current.includes(videoId)
      ) {
        const updated =
          current.filter(
            (id) => id !== videoId
          );

        localStorage.setItem(
          `edutube_saved_videos_${currentUser?._id}`,
          JSON.stringify(updated)
        );

        setSaved(false);
      } else {
        const updated = [
          ...current,
          videoId,
        ];

        localStorage.setItem(
          `edutube_saved_videos_${currentUser?._id}`,
          JSON.stringify(updated)
        );

        setSaved(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubscribe = async () => {
  const creatorId = video?.owner?._id;
  const token = localStorage.getItem("accessToken");

  if (!creatorId || !token) {
    return;
  }

  try {
    const response = await fetch(
      `https://edutube-backend-3we7.onrender.com/api/v1/subscriptions/c/${creatorId}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to update subscription"
      );
    }

    setSubscribed(
      Boolean(data.data?.subscribed)
    );
  } catch (err) {
    console.error(
      "Failed to update subscription:",
      err
    );
  }
};

  const handleAddComment = async (
    event
  ) => {
    event.preventDefault();

    const token =
      localStorage.getItem(
        "accessToken"
      );

    if (!token) {
      setError(
        "Please login to comment."
      );
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    setCommentLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://edutube-backend-3we7.onrender.com/api/v1/comments/video/${videoId}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            content:
              commentText.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add comment"
        );
      }

      if (data.data) {
        setComments(
          (previousComments) => [
            data.data,
            ...previousComments,
          ]
        );
      }

      setCommentText("");
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Failed to add comment"
      );
    } finally {
      setCommentLoading(false);
    }
  };

const startQuiz = async () => {
    setError("");

    await generateQuizForCurrentVideo(video);
};

  const closeQuiz = () => {
    setQuizOpen(false);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswers([]);
    setQuizFinished(false);
    setSelectedAnswer(null);
  };

  const handleSelectAnswer = (option) => {
    setSelectedAnswer(option);

    setQuizAnswers((previousAnswers) => {
      const updatedAnswers = [...previousAnswers];
      updatedAnswers[quizIndex] = option;
      return updatedAnswers;
    });
  };

  const handlePreviousQuestion = () => {
    if (quizIndex === 0) {
      return;
    }

    const previousIndex = quizIndex - 1;

    setQuizIndex(previousIndex);
    setSelectedAnswer(
      quizAnswers[previousIndex] || null
    );
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      return;
    }

    const updatedAnswers = [...quizAnswers];
    updatedAnswers[quizIndex] = selectedAnswer;
    setQuizAnswers(updatedAnswers);

    if (
      quizIndex ===
      quizQuestions.length - 1
    ) {
      const finalScore =
        quizQuestions.reduce(
          (score, question, index) =>
            score +
            (updatedAnswers[index] ===
            question.answer
              ? 1
              : 0),
          0
        );

      setQuizScore(finalScore);
      setQuizFinished(true);
      return;
    }

    const nextIndex = quizIndex + 1;

    setQuizIndex(nextIndex);
    setSelectedAnswer(
      updatedAnswers[nextIndex] || null
    );
  };

  const retryQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswers([]);
    setQuizFinished(false);
    setSelectedAnswer(null);
  };

  const getInitial = (name) => {
    return (
      name
        ?.charAt(0)
        ?.toUpperCase() ||
      "E"
    );
  };

  if (loading) {
    return (
      <div className="video-page-loader">
        <div className="video-loader-spinner"></div>

        <p>
          Preparing your lesson...
        </p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="video-page-error">
        <div className="video-error-icon">
          !
        </div>

        <h2>
          Lesson unavailable
        </h2>

        <p>
          {error ||
            "We couldn't find this lesson."}
        </p>

        <a href="/home">
          Back to EduTube
        </a>
      </div>
    );
  }

  const currentQuestion =
    quizQuestions[quizIndex];

  const quizProgress =
    quizQuestions.length > 0
      ? ((quizIndex + 1) /
          quizQuestions.length) *
        100
      : 0;

  return (
    <div className="video-page">
      <header className="video-navbar">
        <div className="video-navbar-inner">
          <a
            href="/home"
            className="video-brand"
          >
            <span className="video-brand-mark">
              E
            </span>

            <span className="video-brand-name">
              Edu<span>Tube</span>
            </span>
          </a>

          <nav className="video-nav">
            <a
              href="/home"
              className="video-nav-link active"
            >
              Explore
            </a>

            <a
              href="/home"
              className="video-nav-link"
            >
              My Learning
            </a>

            <a
              href="/home"
              className="video-nav-link"
            >
              Collection
            </a>

            <a
              href="/upload"
              className="video-nav-link"
            >
              Upload Lesson
            </a>
          </nav>

          <a
            href="/"
            className="video-account"
          >
            Account
          </a>
        </div>
      </header>

      <main className="video-main">
        <button
          className="video-back-button"
          onClick={() => {
            window.location.href =
              "/home";
          }}
        >
          <ArrowLeft size={15} />
          Back to Explore
        </button>

        <section className="video-player-section">
          <div className="video-player-wrapper">
            <video
              className="video-main-player"
              controls
              poster={
                video.thumbnail
              }
            >
              <source
                src={
                  video.videoFile
                }
                type="video/mp4"
              />

              Your browser does not support
              video playback.
            </video>
          </div>
        </section>

        <section className="video-lesson-header">
          <div className="video-lesson-title-area">
            <span className="video-lesson-badge">
              <Sparkles size={11} />
              LESSON
            </span>

            <h1>
              {video.title}
            </h1>

            <p className="video-description">
              {video.description ||
                "Continue learning with this lesson on EduTube."}
            </p>
          </div>

          <div className="video-meta">
            <span>
              <Eye size={14} />

              {Number(
                video.views || 0
              ).toLocaleString()}{" "}
              views
            </span>

            <span className="video-meta-dot">
              •
            </span>

            <span>
              <Clock3 size={14} />

              {Math.round(
                video.duration || 0
              )}{" "}
              sec
            </span>
          </div>
        </section>

        <section className="video-creator-actions">
          <div className="video-creator">
            {video.owner?.avatar ? (
              <img
                src={
                  video.owner.avatar
                }
                alt=""
                className="video-creator-avatar"
              />
            ) : (
              <div className="video-creator-avatar fallback">
                {getInitial(
                  video.owner?.username
                )}
              </div>
            )}

            <div className="video-creator-info">
              <strong>
                {video.owner?.fullName ||
                  video.owner?.username ||
                  "EduTube Creator"}
              </strong>

              <span>
                @
                {video.owner?.username ||
                  "creator"}
              </span>
            </div>
          </div>

          <div className="video-action-group">
            <button
              className={`video-action-button ${
                liked ? "liked" : ""
              }`}
              onClick={
                handleLike
              }
              disabled={
                likeLoading
              }
            >
              <Heart
                size={16}
                fill={
                  liked
                    ? "currentColor"
                    : "none"
                }
              />

              {liked
                ? "Liked"
                : "Like"}
            </button>

            <button
              className={`video-action-button ${
                saved ? "saved" : ""
              }`}
              onClick={
                handleSave
              }
            >
              <Bookmark
                size={16}
                fill={
                  saved
                    ? "currentColor"
                    : "none"
                }
              />

              {saved
                ? "Saved"
                : "Save"}
            </button>

            <button
              className={`video-action-button subscribe ${
                subscribed
                  ? "subscribed"
                  : ""
              }`}
              onClick={
                handleSubscribe
              }
            >
              <UserPlus size={16} />

              {subscribed
                ? "Subscribed"
                : "Subscribe"}
            </button>
          </div>
        </section>

        <section className="video-learning-grid">
          <article className="video-learning-card">
            <div className="video-card-icon">
              <Check size={21} />
            </div>

            <div>
              <span className="video-card-label">
                LEARNING OBJECTIVES
              </span>

              <h2>
                What you'll learn
              </h2>

              <ul className="video-objective-list">
                <li>
                  <span>
                    <Check size={13} />
                  </span>

                  Understand the main concepts
                </li>

                <li>
                  <span>
                    <Check size={13} />
                  </span>

                  Practice what you learn
                </li>

                <li>
                  <span>
                    <Check size={13} />
                  </span>

                  Build practical knowledge
                </li>
              </ul>
            </div>
          </article>

          <article className="video-quiz-card">
            <div className="video-quiz-decoration">
              <Sparkles size={38} />
            </div>

            <span className="video-card-label">
              KNOWLEDGE CHECK
            </span>

            <h2>
              Ready to test yourself?
            </h2>

            <p>
              {quizLoading
                ? "Preparing your Knowledge Check..."
                : quizQuestions.length > 0
                ? `${quizQuestions.length} questions generated from this lesson.`
                : "Take a short quiz after this lesson and see how much you remember."}
            </p>

            <button
              className="video-quiz-button"
              onClick={
                startQuiz
              }
              disabled={
                quizLoading
              }
            >
              <PlayCircle size={16} />

              {quizLoading
                ? "Generating Quiz..."
                : quizQuestions.length >
                  0
                ? "Start Knowledge Check"
                : "Generate Knowledge Check"}

              <ArrowRight size={15} />
            </button>
          </article>
        </section>

        <section className="video-comments">
          <div className="video-comments-heading">
            <div>
              <span className="video-card-label">
                COMMUNITY
              </span>

              <h2>
                Discussion
              </h2>
            </div>

            <span className="video-comment-count">
              <MessageCircle size={14} />

              {comments.length}
            </span>
          </div>

          <form
            className="video-comment-form"
            onSubmit={
              handleAddComment
            }
          >
            <div className="video-comment-input">
              <span className="video-input-icon">
                <MessageCircle size={17} />
              </span>

              <textarea
                placeholder="Share something you learned..."
                value={
                  commentText
                }
                onChange={(e) =>
                  setCommentText(
                    e.target.value
                  )
                }
                rows="2"
              />
            </div>

            <div className="video-comment-submit-row">
              <span>
                Be respectful and helpful.
              </span>

              <button
                type="submit"
                disabled={
                  commentLoading ||
                  !commentText.trim()
                }
              >
                {commentLoading
                  ? "Posting..."
                  : "Post comment"}
              </button>
            </div>
          </form>

          {error && (
            <div className="video-inline-error">
              {error}
            </div>
          )}

          <div className="video-comment-list">
            {comments.length ===
            0 ? (
              <div className="video-empty-comments">
                <div className="video-empty-icon">
                  <MessageCircle
                    size={25}
                  />
                </div>

                <h3>
                  Start the conversation
                </h3>

                <p>
                  Be the first learner to share
                  your thoughts.
                </p>
              </div>
            ) : (
              comments.map(
                (comment) => (
                  <article
                    className="video-comment-card"
                    key={
                      comment._id
                    }
                  >
                    {comment.owner
                      ?.avatar ? (
                      <img
                        src={
                          comment.owner
                            .avatar
                        }
                        alt=""
                        className="video-comment-avatar"
                      />
                    ) : (
                      <div className="video-comment-avatar fallback">
                        {getInitial(
                          comment.owner
                            ?.username
                        )}
                      </div>
                    )}

                    <div className="video-comment-body">
                      <div className="video-comment-top">
                        <strong>
                          {comment.owner
                            ?.fullName ||
                            comment.owner
                              ?.username ||
                            "EduTube User"}
                        </strong>

                        <span>
                          @
                          {comment.owner
                            ?.username ||
                            "user"}
                        </span>
                      </div>

                      <p>
                        {
                          comment.content
                        }
                      </p>
                    </div>
                  </article>
                )
              )
            )}
          </div>
        </section>
      </main>

      {quizOpen && (
        <div className="video-quiz-modal">
          <div className="video-quiz-modal-card">
            {!quizFinished ? (
              <>
                <div className="video-quiz-modal-top">
                  <div>
                    <span className="video-card-label">
                      KNOWLEDGE CHECK
                    </span>

                    <h2>
                      Test what you learned.
                    </h2>
                  </div>

                  <button
                    className="video-quiz-close"
                    onClick={
                      closeQuiz
                    }
                  >
                    ×
                  </button>
                </div>

                <div className="video-quiz-progress">
                  <span>
                    Question{" "}
                    {quizIndex + 1}{" "}
                    of{" "}
                    {
                      quizQuestions.length
                    }
                  </span>

                  <div className="video-quiz-progress-track">
                    <div
                      className="video-quiz-progress-bar"
                      style={{
                        width: `${quizProgress}%`,
                      }}
                    />
                  </div>
                </div>

                {currentQuestion && (
                  <div className="video-quiz-question">
                    <h3>
                      {
                        currentQuestion.question
                      }
                    </h3>

                    <div className="video-quiz-options">
                      {currentQuestion.options.map(
                        (
                          option,
                          index
                        ) => (
                          <button
                            key={`${option}-${index}`}
                            className={`video-quiz-option ${
                              selectedAnswer ===
                              option
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              handleSelectAnswer(
                                option
                              )
                            }
                          >
                            <span>
                              {
                                option
                              }
                            </span>

                            {selectedAnswer ===
                              option && (
                              <Check
                                size={16}
                              />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div
                  className="video-quiz-navigation"
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <button
                    type="button"
                    className="video-quiz-next"
                    onClick={
                      handlePreviousQuestion
                    }
                    disabled={
                      quizIndex === 0
                    }
                    style={{
                      opacity:
                        quizIndex === 0
                          ? 0.5
                          : 1,
                      cursor:
                        quizIndex === 0
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <ArrowLeft
                      size={16}
                    />
                    Previous Question
                  </button>

                  <button
                    type="button"
                    className="video-quiz-next"
                    disabled={
                      !selectedAnswer
                    }
                    onClick={
                      handleNextQuestion
                    }
                  >
                    {quizIndex ===
                    quizQuestions.length -
                      1
                      ? "Finish Quiz"
                      : "Next Question"}

                    <ArrowRight
                      size={16}
                    />
                  </button>
                </div>
              </>
            ) : (
              <div className="video-quiz-result">
                <div className="video-quiz-result-icon">
                  <Sparkles
                    size={30}
                  />
                </div>

                <span className="video-card-label">
                  KNOWLEDGE CHECK COMPLETE
                </span>

                <h2>
                  You scored{" "}
                  {quizScore} /{" "}
                  {
                    quizQuestions.length
                  }
                </h2>

                <p>
                  {quizScore ===
                  quizQuestions.length
                    ? "Excellent. You mastered this lesson."
                    : quizScore >=
                      Math.ceil(
                        quizQuestions.length *
                          0.6
                      )
                    ? "Great work. You have a solid understanding."
                    : "Keep learning. Rewatch the lesson and try again."}
                </p>

                <div className="video-quiz-result-actions">
                  <button
                    className="video-quiz-retry"
                    onClick={
                      retryQuiz
                    }
                  >
                    Try Again
                  </button>

                  <button
                    className="video-quiz-result-close"
                    onClick={
                      closeQuiz
                    }
                  >
                    Back to Lesson
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Video;