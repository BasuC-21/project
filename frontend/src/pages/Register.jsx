import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  UserRound,
  Mail,
  AtSign,
  LockKeyhole,
  Eye,
  EyeOff,
  ImagePlus,
  Image,
  ArrowRight,
  Sparkles,
  Compass,
  BrainCircuit,
  Rocket,
  Check,
} from "lucide-react";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    avatar: null,
    coverImage: null,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [popup, setPopup] = useState({
    visible: false,
    type: "error",
    text: "",
  });

  useEffect(() => {
    const clearBrowserRestoredValues = () => {
      setFormData({
        fullName: "",
        email: "",
        username: "",
        password: "",
        avatar: null,
        coverImage: null,
      });

      const form = document.querySelector(
        ".edu-register-form"
      );

      if (form) {
        form
          .querySelectorAll("input")
          .forEach((input) => {
            if (
              input.type !== "file" &&
              input.type !== "button" &&
              input.type !== "submit"
            ) {
              input.value = "";
            }
          });
      }
    };

    clearBrowserRestoredValues();

    const timer = window.setTimeout(
      clearBrowserRestoredValues,
      100
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const showPopup = (text, type = "error") => {
    setPopup({
      visible: true,
      type,
      text,
    });

    window.clearTimeout(showPopup.timeoutId);

    showPopup.timeoutId = window.setTimeout(() => {
      setPopup((current) => ({
        ...current,
        visible: false,
      }));
    }, 4000);
  };

  const closePopup = () => {
    window.clearTimeout(showPopup.timeoutId);

    setPopup((current) => ({
      ...current,
      visible: false,
    }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const getPasswordStrength = () => {
    const password = formData.password;

    if (!password) {
      return {
        level: 0,
        text: "Create a password",
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) {
      return {
        level: 1,
        text: "Needs improvement",
      };
    }

    if (score === 2) {
      return {
        level: 2,
        text: "Good",
      };
    }

    if (score === 3) {
      return {
        level: 3,
        text: "Strong",
      };
    }

    return {
      level: 4,
      text: "Excellent",
    };
  };

  const passwordStrength =
    getPasswordStrength();

  const sendOtp = async () => {
    const email = formData.email.trim().toLowerCase();

    if (!email) {
      showPopup("Please enter your email address first.");
      setMessage("Please enter your email address first.");
      return;
    }

    /*
     * Email validation
     * Checks the complete email structure before contacting the backend.
     */
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    if (!emailRegex.test(email)) {
      showPopup("Email address is not valid.");
      setMessage("Email address is not valid.");
      return;
    }

    /*
     * Basic domain sanity check.
     * This prevents obvious invalid domains such as:
     * example@localhost
     * example@gmail
     */
    const emailParts = email.split("@");
    const domain = emailParts[1] || "";

    if (
      emailParts.length !== 2 ||
      !domain.includes(".") ||
      domain.startsWith(".") ||
      domain.endsWith(".") ||
      domain.includes("..")
    ) {
      showPopup("Email address is not valid.");
      setMessage("Email address is not valid.");
      return;
    }

    setOtpLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/send-registration-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const responseText = await response.text();
      let result = {};

      try {
        result = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        throw new Error(
          "The server returned an unexpected response. Please try again."
        );
      }

      if (!response.ok) {
        const serverMessage =
          result?.message ||
          result?.error?.message ||
          "Could not send verification code";

        if (
          response.status === 409 ||
          /already exists|already registered|user.*exist|email.*exist/i.test(
            serverMessage
          )
        ) {
          showPopup(
            "This email is already registered. Please use another email."
          );
          setMessage(
            "This email is already registered. Please use another email."
          );
          return;
        }

        showPopup(serverMessage);
        setMessage(serverMessage);
        return;
      }

      setFormData((current) => ({
        ...current,
        email,
      }));

      setOtpSent(true);
      setEmailVerified(false);
      setOtp("");
      showPopup("Verification code sent to your email.", "success");
      setMessage("Verification code sent to your email.");
    } catch (error) {
      showPopup(error.message || "Something went wrong.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      showPopup("Please enter the verification code.");
      return;
    }

    setOtpLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/verify-registration-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            otp,
          }),
        }
      );

      const responseText = await response.text();
      let result = {};

      try {
        result = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        throw new Error(
          "The server returned an unexpected response. Please try again."
        );
      }

     if (!response.ok) {
  const serverMessage =
    result?.message ||
    result?.error?.message ||
    "Invalid verification code";

  if (
    response.status === 400 &&
    /invalid otp/i.test(serverMessage)
  ) {
    showPopup(
      "Incorrect OTP. Please enter the verification code sent to your email."
    );

    setMessage(
      "Incorrect OTP. Please enter the verification code sent to your email."
    );

    return;
  }

  showPopup(serverMessage);
  setMessage(serverMessage);

  return;
}

      setEmailVerified(true);
      showPopup("Email verified successfully.", "success");
    } catch (error) {
      setEmailVerified(false);
      showPopup(error.message || "Something went wrong.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      showPopup("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      showPopup("Please enter your email address.");
      return;
    }

    if (!formData.username.trim()) {
      showPopup("Please enter a username.");
      return;
    }

    if (!formData.password) {
      showPopup("Please enter a password.");
      return;
    }

    if (!formData.avatar) {
      showPopup("Please select a profile photo.");
      return;
    }

    if (!emailVerified) {
      showPopup("Please verify your email with OTP first.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();

      data.append("fullName", formData.fullName);
      data.append("email", formData.email);
      data.append("username", formData.username);
      data.append("password", formData.password);

      if (formData.avatar) {
        data.append("avatar", formData.avatar);
      }

      if (formData.coverImage) {
        data.append("coverImage", formData.coverImage);
      }

      const response = await fetch(
        "https://edutube-backend-3we7.onrender.com/api/v1/users/register",
        {
          method: "POST",
          body: data,
        }
      );

      const responseText = await response.text();
      let result = {};

      try {
        result = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        throw new Error(
          "The server returned an unexpected response. Please try again."
        );
      }

      if (!response.ok) {
        const serverMessage =
          result?.message ||
          result?.error?.message ||
          "Registration failed";

        if (
          response.status === 409 ||
          /already exists|already registered|user.*exist|email.*exist/i.test(
            serverMessage
          )
        ) {
          throw new Error(
            "This email or username is already registered. Please use another one."
          );
        }

        throw new Error(serverMessage);
      }

      showPopup(
  "Profile created successfully! Redirecting to login...",
  "success"
);

setMessage(
  "Profile created successfully! Redirecting to login..."
);

setTimeout(() => {
  window.location.replace("/login");
}, 1500);

      setFormData({
        fullName: "",
        email: "",
        username: "",
        password: "",
        avatar: null,
        coverImage: null,
      });

      setOtp("");
      setOtpSent(false);
      setEmailVerified(false);
    } catch (error) {
      showPopup(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {popup.visible &&
        createPortal(
          <div
            role="alert"
            aria-live="assertive"
            className={`edu-toast edu-toast-${popup.type}`}
          >
            <span className="edu-toast-icon" aria-hidden="true">
              {popup.type === "success" ? "✓" : "!"}
            </span>

            <span className="edu-toast-text">
              {popup.text}
            </span>

            <button
              type="button"
              className="edu-toast-close"
              onClick={closePopup}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>,
          document.body
        )}

      <div className="edu-register-page">
      <div className="edu-register-grid"></div>

      <div className="edu-register-glow edu-register-glow-one"></div>

      <div className="edu-register-glow edu-register-glow-two"></div>

      <main className="edu-register-shell">
        <section className="edu-register-visual">
          <a
            href="/"
            className="edu-register-brand"
          >
            <span className="edu-register-logo">
              E
            </span>

            <span>
              Edu<span>Tube</span>
            </span>
          </a>

          <div className="edu-register-visual-content">
            <span className="edu-register-kicker">
              <Sparkles size={14} />
              START YOUR JOURNEY
            </span>

            <h1>
              Create your
              <span>
                space to learn.
              </span>
            </h1>

            <p>
              Build your profile once and make
              every lesson, idea, and skill part
              of your learning journey.
            </p>

            <div className="edu-register-journey">
              <div className="edu-register-journey-line"></div>

              <div className="edu-register-step active">
                <div className="edu-register-step-icon">
                  <Compass size={17} />
                </div>

                <div>
                  <strong>
                    Discover
                  </strong>

                  <span>
                    Find something worth knowing
                  </span>
                </div>
              </div>

              <div className="edu-register-step">
                <div className="edu-register-step-icon">
                  <BrainCircuit size={17} />
                </div>

                <div>
                  <strong>
                    Learn
                  </strong>

                  <span>
                    Turn lessons into knowledge
                  </span>
                </div>
              </div>

              <div className="edu-register-step">
                <div className="edu-register-step-icon">
                  <Rocket size={17} />
                </div>

                <div>
                  <strong>
                    Build
                  </strong>

                  <span>
                    Turn knowledge into skills
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="edu-register-visual-footer">
            <span>
              Learn without limits.
            </span>

            <span>
              EduTube
            </span>
          </div>
        </section>

        <section className="edu-register-form-panel">
          <div className="edu-register-form-header">
            <span>
              CREATE YOUR PROFILE
            </span>

           <h2>
  Build your
  <strong>
    learning identity.
  </strong>
</h2>

           <p>
  Create your profile. Start learning.
</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="edu-register-form"
            autoComplete="off"
          >
            <div className="edu-register-fields-two">
              <div className="edu-field">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <div className="edu-input">
                  <UserRound size={17} />

                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="Your name"
                    value={formData.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="edu-field">
                <label htmlFor="username">
                  Username
                </label>

                <div className="edu-input">
                  <AtSign size={17} />

                  <input
                    id="username"
                    type="text"
                    name="username"
                    placeholder="Choose a username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="new-username"
                  />
                </div>
              </div>
            </div>

            <div className="edu-field">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="edu-input">
                <Mail size={17} />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  autoComplete="email"
                  onChange={(e) => {
                    handleChange(e);
                    setEmailVerified(false);
                    setOtpSent(false);
                    setOtp("");
                  }}
                />
              </div>

              <button
                type="button"
                className="edu-register-button"
                onClick={sendOtp}
                disabled={otpLoading || emailVerified}
                style={{ marginTop: "10px" }}
              >
                {emailVerified
                  ? "✓ Email Verified"
                  : otpLoading
                    ? "Sending Code..."
                    : "Verify Email"}
              </button>

              {message && (
                <div
                  role="alert"
                  style={{
                    marginTop: "10px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    lineHeight: 1.4,
                    background:
                      message.toLowerCase().includes("success") ||
                      message.toLowerCase().includes("sent")
                        ? "#ecfdf5"
                        : "#fff1f2",
                    color:
                      message.toLowerCase().includes("success") ||
                      message.toLowerCase().includes("sent")
                        ? "#047857"
                        : "#be123c",
                    border:
                      message.toLowerCase().includes("success") ||
                      message.toLowerCase().includes("sent")
                        ? "1px solid #a7f3d0"
                        : "1px solid #fecdd3",
                  }}
                >
                  {message}
                </div>
              )}
            </div>

            {otpSent && !emailVerified && (
              <div className="edu-field">
                <label htmlFor="otp">
                  Verification Code
                </label>

                <div className="edu-input">
                  <Mail size={17} />

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                  />
                </div>

                <button
                  type="button"
                  className="edu-register-button"
                  onClick={verifyOtp}
                  disabled={
                    otpLoading ||
                    otp.length !== 6
                  }
                  style={{ marginTop: "10px" }}
                >
                  {otpLoading
                    ? "Verifying..."
                    : "Verify OTP"}
                </button>
              </div>
            )}

            <div className="edu-field">
              <div className="edu-label-row">
                <label htmlFor="password">
                  Password
                </label>

                <span>
                  8+ characters recommended
                </span>
              </div>

              <div className="edu-input">
                <LockKeyhole size={17} />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="edu-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>

              <div className="edu-password-strength">
                <div className="edu-strength-bars">
                  {[1, 2, 3, 4].map(
                    (item) => (
                      <span
                        key={item}
                        className={
                          item <=
                          passwordStrength.level
                            ? "filled"
                            : ""
                        }
                      ></span>
                    )
                  )}
                </div>

                <small>
                  {passwordStrength.text}
                </small>
              </div>
            </div>

            <div className="edu-upload-section">
              <div className="edu-upload-heading">
                <div>
                  <strong>
                    Personalize your profile
                  </strong>

                  <span>
                    Add images to your learning
                    space.
                  </span>
                </div>
              </div>

              <div className="edu-upload-grid">
                <label className="edu-upload-card">
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleChange}
                  />

                  <div className="edu-upload-icon">
                    <ImagePlus size={19} />
                  </div>

                  <div className="edu-upload-text">
                    <strong>
                      Profile photo
                    </strong>

                    <span>
                      Required
                    </span>
                  </div>

                  {formData.avatar ? (
                    <div className="edu-upload-selected">
                      <Check size={12} />
                      Added
                    </div>
                  ) : (
                    <ArrowRight
                      size={15}
                      className="edu-upload-arrow"
                    />
                  )}
                </label>

                <label className="edu-upload-card">
                  <input
                    type="file"
                    name="coverImage"
                    accept="image/*"
                    onChange={handleChange}
                  />

                  <div className="edu-upload-icon">
                    <Image size={19} />
                  </div>

                  <div className="edu-upload-text">
                    <strong>
                      Cover image
                    </strong>

                    <span>
                      Optional
                    </span>
                  </div>

                  {formData.coverImage ? (
                    <div className="edu-upload-selected">
                      <Check size={12} />
                      Added
                    </div>
                  ) : (
                    <ArrowRight
                      size={15}
                      className="edu-upload-arrow"
                    />
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="edu-register-button"
              disabled={loading || !emailVerified}
            >
              <span>
                {loading
                  ? "Creating your profile..."
                  : !emailVerified
                    ? "Verify Email First"
                    : "Create My Profile"}
              </span>

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>

          <div className="edu-register-login">
            <span>
              Already have an EduTube account?
            </span>

            <a href="/">
              Sign in
              <ArrowRight size={14} />
            </a>
          </div>

          <p className="edu-register-note">
            Your profile is the beginning of
            your learning journey.
          </p>
        </section>
      </main>
    </div>
    </>
  );
}

export default Register;