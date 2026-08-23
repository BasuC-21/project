import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Play,
  Clock3,
  Eye,
  ArrowUpRight,
  BookOpen,
  Sparkles,
  Code2,
  BrainCircuit,
  Lightbulb,
  Layers3,
  UserRound,
  X,
  TrendingUp,
} from "lucide-react";

import "./Home.css";

function Home() {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("explore");
  const [showProfile, setShowProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
const [savingProfile, setSavingProfile] = useState(false);
const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          "https://edutube-backend-3we7.onrender.com/api/v1/videos"
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch videos"
          );
        }

        setVideos(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);
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

  const filteredVideos = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return videos;
    }

    return videos.filter((video) => {
      return (
        video.title?.toLowerCase().includes(value) ||
        video.description?.toLowerCase().includes(value) ||
        video.owner?.username?.toLowerCase().includes(value)
      );
    });
  }, [videos, search]);

  const trendingVideos = useMemo(() => {
    return [...filteredVideos]
      .sort(
        (a, b) =>
          Number(b.views || 0) -
          Number(a.views || 0)
      )
      .slice(0, 3);
  }, [filteredVideos]);

  const recommendedVideos = filteredVideos.slice(0, 6);

  const learningVideos = useMemo(() => {
    try {
      const viewedIds = JSON.parse(
        localStorage.getItem("edutube_viewed_videos") || "[]"
      );

      return viewedIds
        .map((id) => videos.find((video) => video._id === id))
        .filter(Boolean);
    } catch {
      return [];
    }
  }, [videos]);

  const collectionVideos = useMemo(() => {
    try {
      const savedIds = JSON.parse(
        localStorage.getItem("edutube_saved_videos") || "[]"
      );

      return savedIds
        .map((id) => videos.find((video) => video._id === id))
        .filter(Boolean);
    } catch {
      return [];
    }
  }, [videos]);

  const totalViews = videos.reduce(
    (total, video) =>
      total + Number(video.views || 0),
    0
  );

  const openVideo = (videoId) => {
    try {
      const viewedIds = JSON.parse(
        localStorage.getItem("edutube_viewed_videos") || "[]"
      );

      const updatedViewedIds = [
        videoId,
        ...viewedIds.filter((id) => id !== videoId),
      ].slice(0, 20);

      localStorage.setItem(
        "edutube_viewed_videos",
        JSON.stringify(updatedViewedIds)
      );
    } catch (storageError) {
      console.warn(
        "Could not save learning history:",
        storageError
      );
    }

    window.location.href = `/video?id=${videoId}`;
  };

  const navigateToSection = (section) => {
    setActiveSection(section);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const handleLogout = async () => {
  try {
    await fetch(
      "https://edutube-backend-3we7.onrender.com/api/v1/users/logout",
      {
        method: "POST",
        credentials: "include",
      }
    );
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    localStorage.removeItem("accessToken");

    window.location.href = "/login";
  }
};

  const getInitial = (username) => {
    return (
      username?.charAt(0)?.toUpperCase() || "E"
    );
  };

  return (
    <div className="home-page">

      {/* ================= HEADER ================= */}

      <header className="home-header">
        <div className="home-header-inner">

          <a href="/home" className="home-logo">
            <span className="home-logo-mark">
              E
            </span>

            <span className="home-logo-name">
              Edu<span>Tube</span>
            </span>
          </a>

          <nav className="home-nav">
            <button
              type="button"
              className={`home-nav-link ${
                activeSection === "explore" ? "active" : ""
              }`}
              onClick={() => navigateToSection("explore")}
            >
              Explore
            </button>

            <button
              type="button"
              className={`home-nav-link ${
                activeSection === "learning" ? "active" : ""
              }`}
              onClick={() => navigateToSection("learning")}
            >
              My Learning
            </button>

            <button
              type="button"
              className={`home-nav-link ${
                activeSection === "collection" ? "active" : ""
              }`}
              onClick={() => navigateToSection("collection")}
            >
              Collection
            </button>

            <a
              href="/upload"
              className="home-nav-link home-upload-link"
            >
              Upload Lesson
            </a>
          </nav>

         <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
  <button
    type="button"
    className="home-account"
   onClick={() => {
  setShowProfile(true);
  window.scrollTo({ top: 0, behavior: "smooth" });
}}
  >
    <span className="home-account-icon">
      <UserRound size={14} />
    </span>

    <span>Profile</span>
  </button>

  <button
    type="button"
    className="home-account"
    onClick={handleLogout}
  >
    <span className="home-account-icon">
      <UserRound size={14} />
    </span>

    <span>Logout</span>
  </button>
</div>
        </div>
      </header>



      <main className="home-main">
        {showProfile && (
  <section
    style={{
      maxWidth: "850px",
      margin: "0 auto",
      padding: "40px 24px",
    }}
  >
    <button
      type="button"
      onClick={() => setShowProfile(false)}
      style={{
        padding: "9px 16px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        background: "#fff",
        cursor: "pointer",
        marginBottom: "25px",
      }}
    >
      ← Back to Home
    </button>

   <div
  style={{
    padding: "40px",
    borderRadius: "22px",
    background: "linear-gradient(145deg, #ffffff, #f7f5ff)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.10)",
    textAlign: "center",
    border: "1px solid rgba(102,87,233,0.10)",
  }}
>
      <img
        src={currentUser?.avatar}
        alt="Profile"
       style={{
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "4px solid #fff",
  boxShadow: "0 8px 25px rgba(102,87,233,0.22)",
  display: "block",
  margin: "0 auto",
}}
      />
      {editingProfile && (
  <div style={{ marginTop: "12px" }}>
    <label
      style={{
        cursor: "pointer",
        padding: "9px 16px",
        borderRadius: "8px",
        background: "#eee",
        display: "inline-block",
      }}
    >
      Change Photo

      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          setAvatarFile(e.target.files[0] || null);
        }}
      />
    </label>

    {avatarFile && (
      <p style={{ marginTop: "8px", fontSize: "12px" }}>
        Selected: {avatarFile.name}
      </p>
    )}
  </div>
)}

      <h2 style={{ margin: "18px 0 5px" }}>
        My Profile
      </h2>
<h3
  style={{
    margin: "18px 0 5px",
    fontSize: "24px",
    fontWeight: "700",
    color: "#29252f",
  }}
>
  {currentUser?.fullName}
</h3>

<p
  style={{
    margin: "0 0 6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#6657e9",
  }}
>
  @{currentUser?.username}
</p>
<p
  style={{
    margin: "8px 0 20px",
    fontSize: "13px",
    color: "#77727c",
  }}
>
  {currentUser?.email}
</p>
<button
  type="button"
 onClick={() => setEditingProfile(true)}
  style={{
  marginTop: "15px",
  padding: "12px 26px",
  border: "none",
  borderRadius: "10px",
  background: "#6657e9",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px",
  boxShadow: "0 6px 16px rgba(102,87,233,0.20)",
  transition: "transform 0.2s ease",
}}
>
  Edit Profile
</button>
    </div>
  </section>
)}
        {editingProfile && (
  <div
    style={{
      marginTop: "25px",
      textAlign: "left",
    }}
  >
    <label>Full Name</label>

    <input
      type="text"
      value={currentUser?.fullName || ""}
      onChange={(e) =>
        setCurrentUser({
          ...currentUser,
          fullName: e.target.value,
        })
      }
      style={{
  width: "100%",
  padding: "12px 14px",
  marginTop: "7px",
  marginBottom: "15px",
  boxSizing: "border-box",
  border: "1px solid #ddd9e8",
  borderRadius: "10px",
  outline: "none",
  fontSize: "14px",
  color: "#29252f",
  background: "#faf9fd",
}}
      
    />

    <label>Email</label>

    <input
      type="email"
      value={currentUser?.email || ""}
      onChange={(e) =>
        setCurrentUser({
          ...currentUser,
          email: e.target.value,
        })
      }
      style={{
        width: "100%",
        padding: "12px",
        marginTop: "7px",
        marginBottom: "15px",
        boxSizing: "border-box",
      }}
    />

    <button
      type="button"
      onClick={() => setEditingProfile(false)}
     style={{
  padding: "10px 20px",
  marginRight: "8px",
  border: "1px solid #ddd9e8",
  borderRadius: "9px",
  background: "#fff",
  color: "#55505c",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px",
}}
      
    >
      Cancel
    </button>

   <button
  type="button"
  disabled={savingProfile}
  onClick={async () => {
    setSavingProfile(true);
    setProfileMessage("");

    try {
       if (avatarFile) {
        const avatarData = new FormData();

        avatarData.append("avatar", avatarFile);

        const avatarResponse = await fetch(
          "https://edutube-backend-3we7.onrender.com/api/v1/users/avatar",
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "accessToken"
              )}`,
            },
            body: avatarData,
          }
        );

        const avatarResult =
          await avatarResponse.json();

        if (!avatarResponse.ok) {
          throw new Error(
            avatarResult?.message ||
              "Could not update profile photo"
          );
        }

        setCurrentUser(avatarResult.data);
        setAvatarFile(null);
      }

      const response = await fetch(
        "https://edutube-backend-3we7.onrender.com/api/v1/users/update-account",
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "accessToken"
            )}`,
          },
          body: JSON.stringify({
            fullName: currentUser?.fullName,
            email: currentUser?.email,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Could not update profile"
        );
      }

      setCurrentUser(result.data);
      setEditingProfile(false);
      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      setProfileMessage(error.message);
    } finally {
      setSavingProfile(false);
    }
  }}
  style={{
  padding: "10px 20px",
  border: "none",
  borderRadius: "9px",
  background: "#6657e9",
  color: "#fff",
  cursor: savingProfile ? "not-allowed" : "pointer",
  opacity: savingProfile ? 0.6 : 1,
  fontWeight: "600",
  fontSize: "13px",
  boxShadow: "0 5px 14px rgba(102,87,233,0.18)",
}}
  
>
  {savingProfile ? "Saving..." : "Save Changes"}
</button>

  </div>
)}
{profileMessage && (
  <p
    style={{
      marginTop: "15px",
      fontSize: "13px",
      fontWeight: "600",
      color: profileMessage
        .toLowerCase()
        .includes("success")
        ? "green"
        : "crimson",
    }}
  >
    {profileMessage}
  </p>
)}

        {activeSection !== "explore" && (
          <section className="home-section">
            <div className="home-section-header">
              <div>
                <span className="home-section-label">
                  {activeSection === "learning"
                    ? "MY LEARNING"
                    : "COLLECTION"}
                </span>

                <h2 className="home-section-title">
                  {activeSection === "learning"
                    ? "Continue your learning."
                    : "Your saved lessons."}
                </h2>
              </div>

              <span className="home-section-count">
                {activeSection === "learning"
                  ? `${learningVideos.length} lessons`
                  : `${collectionVideos.length} saved`}
              </span>
            </div>

            {activeSection === "learning" &&
              learningVideos.length === 0 && (
                <div className="home-message">
                  No learning history yet. Open a lesson from Explore
                  and it will appear here.
                </div>
              )}

            {activeSection === "collection" &&
              collectionVideos.length === 0 && (
                <div className="home-message">
                  Your collection is empty. Use the Save button on a
                  lesson to add it here.
                </div>
              )}

            <div className="home-video-grid">
              {(activeSection === "learning"
                ? learningVideos
                : collectionVideos
              ).map((video) => (
                <article
                  key={video._id}
                  className="home-video-card"
                  onClick={() => openVideo(video._id)}
                >
                  <div className="home-thumbnail">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                    />

                    <span className="home-play-badge">
                      <Play
                        size={17}
                        fill="currentColor"
                      />
                    </span>
                  </div>

                  <div className="home-video-body">
                    <h3 className="home-video-title">
                      {video.title}
                    </h3>

                    <p className="home-video-description">
                      {video.description ||
                        "Continue learning on EduTube."}
                    </p>

                    <div className="home-video-footer">
                      <span className="home-owner-name">
                        {video.owner?.username ||
                          "EduTube Creator"}
                      </span>

                      <span className="home-views">
                        <Eye size={11} />
                        {Number(
                          video.views || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="home-hero">

          <div className="home-hero-content">

            <div className="home-eyebrow">
              <Sparkles size={12} />
              YOUR LEARNING SPACE
            </div>

            <h1 className="home-hero-title">
              What are you
              <br />
              <span className="home-accent">
                curious about?
              </span>
            </h1>

            <p className="home-hero-description">
              Discover lessons, explore new skills,
              and keep building your knowledge one
              idea at a time.
            </p>

            <div className="home-search">

              <Search size={19} />

              <input
                type="text"
                placeholder="Search lessons, topics or creators..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  className="home-clear-search"
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}

            </div>

            <div className="home-hero-stats">

              <span className="home-hero-stat">
                <Layers3 size={12} />
                {videos.length} lessons
              </span>

              <span className="home-hero-stat">
                <Eye size={12} />
                {totalViews.toLocaleString()} views
              </span>

              <span className="home-hero-stat">
                <Sparkles size={12} />
                Learn at your pace
              </span>

            </div>

          </div>


          <div className="home-hero-visual">

            <div className="home-orbit-one"></div>

            <div className="home-orbit-two"></div>

            <div className="home-visual-center">
              <BrainCircuit size={40} />
            </div>

            <div className="home-floating home-floating-build">
              <Code2 size={14} />
              BUILD
            </div>

            <div className="home-floating home-floating-discover">
              <Lightbulb size={14} />
              DISCOVER
            </div>

          </div>

        </section>


        {/* ================= SKILLS ================= */}

        <section className="home-section">

          <div className="home-section-header">

            <div>

              <span className="home-section-label">
                EXPLORE BY SKILL
              </span>

              <h2 className="home-section-title">
                Where do you want to grow?
              </h2>

            </div>

          </div>


          <div className="home-skill-grid">

            <div className="home-skill-card">

              <div className="home-skill-icon">
                <Code2 size={20} />
              </div>

              <div>
                <h3 className="home-skill-title">
                  Development
                </h3>

                <p className="home-skill-text">
                  Build real software
                </p>
              </div>

            </div>


            <div className="home-skill-card">

              <div className="home-skill-icon">
                <BrainCircuit size={20} />
              </div>

              <div>
                <h3 className="home-skill-title">
                  AI & Technology
                </h3>

                <p className="home-skill-text">
                  Explore what's next
                </p>
              </div>

            </div>


            <div className="home-skill-card">

              <div className="home-skill-icon">
                <BookOpen size={20} />
              </div>

              <div>
                <h3 className="home-skill-title">
                  Science
                </h3>

                <p className="home-skill-text">
                  Understand the world
                </p>
              </div>

            </div>


            <div className="home-skill-card">

              <div className="home-skill-icon">
                <Lightbulb size={20} />
              </div>

              <div>
                <h3 className="home-skill-title">
                  Practical Skills
                </h3>

                <p className="home-skill-text">
                  Learn something useful
                </p>
              </div>

            </div>

          </div>

        </section>


        {/* ================= CONTINUE LEARNING ================= */}

        {!loading &&
          !error &&
          filteredVideos.length > 0 && (

            <section className="home-section">

              <div className="home-section-header">

                <div>

                  <span className="home-section-label">
                    CONTINUE LEARNING
                  </span>

                  <h2 className="home-section-title">
                    Pick up where you left off.
                  </h2>

                </div>

              </div>


              <article
                className="home-continue-card"
                onClick={() =>
                  openVideo(filteredVideos[0]._id)
                }
              >

                <img
                  src={filteredVideos[0].thumbnail}
                  alt={filteredVideos[0].title}
                  className="home-continue-image"
                />


                <div style={{ flex: 1 }}>

                  <span className="home-section-label">
                    RECENT LESSON
                  </span>

                  <h3
                    style={{
                      margin: "7px 0",
                      fontSize: "18px",
                    }}
                  >
                    {filteredVideos[0].title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#88827a",
                      fontSize: "10px",
                    }}
                  >
                    {filteredVideos[0].owner?.username ||
                      "EduTube Creator"}
                  </p>


                  <div className="home-progress-track">
                    <div className="home-progress-bar"></div>
                  </div>


                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "7px",
                      color: "#969089",
                      fontSize: "8px",
                    }}
                  >
                    <span>
                      Continue learning
                    </span>

                    <span>
                      38%
                    </span>
                  </div>

                </div>


                <ArrowUpRight
                  size={20}
                  color="#6657e9"
                />

              </article>

            </section>

          )}


        {/* ================= RECOMMENDED ================= */}

        <section className="home-section">

          <div className="home-section-header">

            <div>

              <span className="home-section-label">
                RECOMMENDED FOR YOU
              </span>

              <h2 className="home-section-title">
                Lessons worth exploring.
              </h2>

            </div>

            <span className="home-section-count">
              {recommendedVideos.length} lessons
            </span>

          </div>


          {loading && (
            <div className="home-message">
              Finding lessons...
            </div>
          )}


          {error && (
            <div className="home-message home-error">
              {error}
            </div>
          )}


          {!loading &&
            !error &&
            recommendedVideos.length === 0 && (

              <div className="home-message">
                No lessons found.
              </div>

            )}


          {!loading &&
            !error &&
            recommendedVideos.length > 0 && (

              <div className="home-video-grid">

                {recommendedVideos
                  .slice(0, 3)
                  .map((video) => (

                    <article
                      key={video._id}
                      className="home-video-card"
                      onClick={() =>
                        openVideo(video._id)
                      }
                    >

                      <div className="home-thumbnail">

                        <img
                          src={video.thumbnail}
                          alt={video.title}
                        />

                        <span className="home-play-badge">
                          <Play
                            size={17}
                            fill="currentColor"
                          />
                        </span>

                        <span className="home-duration">
                          <Clock3 size={11} />

                          {Math.round(
                            video.duration || 0
                          )}

                          s
                        </span>

                      </div>


                      <div className="home-video-body">

                        <h3 className="home-video-title">
                          {video.title}
                        </h3>

                        <p className="home-video-description">
                          {video.description ||
                            "Explore this lesson on EduTube."}
                        </p>


                        <div className="home-video-footer">

                          <div className="home-owner">

                            {video.owner?.avatar ? (

                              <img
                                src={video.owner.avatar}
                                alt={video.owner.username}
                                className="home-owner-avatar"
                              />

                            ) : (

                              <span className="home-owner-avatar">
                                {getInitial(
                                  video.owner?.username
                                )}
                              </span>

                            )}


                            <span className="home-owner-name">
                              {video.owner?.username ||
                                "EduTube Creator"}
                            </span>

                          </div>


                          <span className="home-views">

                            <Eye size={11} />

                            {Number(
                              video.views || 0
                            ).toLocaleString()}

                          </span>

                        </div>

                      </div>

                    </article>

                  ))}

              </div>

            )}

        </section>


        {/* ================= TRENDING ================= */}

        <section className="home-section">

          <div className="home-section-header">

            <div>

              <span className="home-section-label">
                TRENDING NOW
              </span>

              <h2 className="home-section-title">
                What learners are watching.
              </h2>

            </div>

            <span className="home-section-count">
              <TrendingUp size={11} />
              {" "}Most viewed
            </span>

          </div>


          <div className="home-video-grid">

            {trendingVideos.map(
              (video, index) => (

                <article
                  key={video._id}
                  className="home-video-card"
                  onClick={() =>
                    openVideo(video._id)
                  }
                >

                  <div className="home-thumbnail">

                    <img
                      src={video.thumbnail}
                      alt={video.title}
                    />


                    <span
                      style={{
                        position: "absolute",
                        top: "11px",
                        left: "11px",
                        padding: "6px 8px",
                        borderRadius: "6px",
                        background: "#6657e9",
                        color: "#fff",
                        fontSize: "8px",
                        fontWeight: 800,
                      }}
                    >
                      #{index + 1}
                    </span>


                    <span className="home-duration">
                      <Clock3 size={11} />

                      {Math.round(
                        video.duration || 0
                      )}

                      s
                    </span>

                  </div>


                  <div className="home-video-body">

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >

                      <h3 className="home-video-title">
                        {video.title}
                      </h3>

                      <ArrowUpRight
                        size={17}
                        color="#6657e9"
                      />

                    </div>


                    <p
                      className="home-video-description"
                      style={{
                        marginBottom: 0,
                      }}
                    >
                      {video.description ||
                        "A popular lesson on EduTube."}
                    </p>

                  </div>

                </article>

              )
            )}

          </div>

        </section>


        {/* ================= LEARNING IDENTITY ================= */}

        <section className="home-identity">

          <div>

            <span className="home-identity-label">
              YOUR LEARNING IDENTITY
            </span>

            <h2 className="home-identity-title">
              Every lesson adds
              <br />
              another piece.
            </h2>

            <p className="home-identity-description">
              Explore different topics, discover
              creators, and build your own learning
              journey through EduTube.
            </p>

          </div>


          <div className="home-identity-stats">

            <div>

              <strong className="home-identity-number">
                {videos.length}
              </strong>

              <span className="home-identity-stat-label">
                LESSONS
              </span>

            </div>


            <div>

              <strong className="home-identity-number">
                {totalViews.toLocaleString()}
              </strong>

              <span className="home-identity-stat-label">
                VIEWS
              </span>

            </div>


            <div>

              <strong className="home-identity-number">
                ∞
              </strong>

              <span className="home-identity-stat-label">
                POSSIBILITIES
              </span>

            </div>

          </div>

        </section>


        {/* ================= DEVELOPER ================= */}

        <section className="home-developer">

          <div className="home-section-header">

            <div>

              <span className="home-section-label">
                THE PERSON BEHIND EDUTUBE
              </span>

              <h2 className="home-section-title">
                Built with curiosity.
              </h2>

            </div>

          </div>


          <div className="home-developer-card">

            <div className="home-developer-avatar">
              BC
            </div>


            <div>

              <span className="home-section-label">
                CREATOR & DEVELOPER
              </span>

              <h3
                style={{
                  margin: 0,
                  fontSize: "17px",
                }}
              >
                Basavaraj Chougala
              </h3>

              <p
                style={{
                  margin: "5px 0 0",
                  color: "#969089",
                  fontSize: "10px",
                }}
              >
                MERN Stack Developer
              </p>

            </div>


            <p
              style={{
                margin: 0,
                color: "#7d7871",
                fontSize: "10px",
                lineHeight: 1.8,
              }}
            >
              EduTube is a full-stack learning
              platform designed to make educational
              content easier to discover, watch,
              and learn from.
            </p>


            <div className="home-socials">

              <a
                href="https://github.com/BasuC-21"
                target="_blank"
                rel="noopener noreferrer"
                className="home-social"
              >
                GitHub
              </a>

              <a
                href="https://www.linkedin.com/in/basavaraj-chougala-1739b3296"
                target="_blank"
                rel="noopener noreferrer"
                className="home-social"
              >
                LinkedIn
              </a>

            </div>

          </div>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="home-footer">

        <div>

          <strong style={{ fontSize: "16px" }}>
            Edu
            <span className="home-accent">
              Tube
            </span>
          </strong>

          <p
            style={{
              margin: "5px 0 0",
              color: "#99938b",
              fontSize: "8px",
            }}
          >
            Learn without limits.
          </p>

        </div>


        <div className="home-footer-links">
          <span>Explore</span>
          <span>Learn</span>
          <span>Build</span>
        </div>


        <span
          style={{
            color: "#99938b",
            fontSize: "8px",
          }}
        >
          Built for curiosity.
        </span>

      </footer>

    </div>
  );
}

export default Home;