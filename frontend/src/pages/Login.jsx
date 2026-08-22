import { useEffect, useState } from "react";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  BrainCircuit,
  Play,
  Zap,
} from "lucide-react";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const showLoginMessage = (
    text,
    type = "error"
  ) => {
    setMessage(text);
    setMessageType(type);
  };


  useEffect(() => {
    setFormData({
      email: "",
      password: ""
    });
  }, []);


  const handleChange = (e) => {
    setFormData((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));

    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email =
      formData.email.trim().toLowerCase();

    const password =
      formData.password;

    setMessage("");

    if (!email) {
      showLoginMessage(
        "Please enter your email address."
      );
      return;
    }

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    if (!emailRegex.test(email)) {
      showLoginMessage(
        "Email address is not valid."
      );
      return;
    }

    if (!password) {
      showLoginMessage(
        "Please enter your password."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const responseText =
        await response.text();

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        throw new Error(
          "The server returned an unexpected response."
        );
      }

      if (!response.ok) {
        const serverMessage =
          data?.message ||
          data?.error?.message ||
          "Login failed.";

        if (
          response.status === 404 ||
          /account not found|user does not exist/i.test(
            serverMessage
          )
        ) {
          throw new Error(
            "Account not found. Please register first."
          );
        }

        if (
          response.status === 401 ||
          /invalid.*credential|invalid.*password/i.test(
            serverMessage
          )
        ) {
          throw new Error(
            "Invalid email or password."
          );
        }

        throw new Error(
          serverMessage
        );
      }

      const accessToken =
        data?.data?.accessToken;

      if (!accessToken) {
        throw new Error(
          "Login succeeded, but no access token was received."
        );
      }

      localStorage.setItem(
        "accessToken",
        accessToken
      );

      showLoginMessage(
        "You're back in. Let's learn.",
        "success"
      );

      window.setTimeout(() => {
        window.location.href =
          "/home";
      }, 400);

    } catch (error) {
      showLoginMessage(
        error?.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };


  const startForgotPassword = () => {
    setForgotMode(true);
    setForgotStep("email");
    setForgotEmail(
      formData.email.trim().toLowerCase()
    );
    setForgotOtp("");
    setNewPassword("");
    setMessage("");
  };


  const cancelForgotPassword = () => {
    setForgotMode(false);
    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setNewPassword("");
    setMessage("");
  };


  const sendForgotPasswordOtp = async () => {
    const email =
      forgotEmail.trim().toLowerCase();

    if (!email) {
      showLoginMessage(
        "Please enter your email address."
      );
      return;
    }

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

    if (!emailRegex.test(email)) {
      showLoginMessage(
        "Email address is not valid."
      );
      return;
    }

    setForgotLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/send-password-reset-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email
          })
        }
      );

      const responseText =
        await response.text();

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        throw new Error(
          "The server returned an unexpected response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error?.message ||
            "Could not send password reset code."
        );
      }

      setForgotEmail(email);
      setForgotStep("otp");

      showLoginMessage(
        "Password reset OTP sent to your email.",
        "success"
      );

    } catch (error) {
      showLoginMessage(
        error?.message ||
          "Could not send password reset code."
      );
    } finally {
      setForgotLoading(false);
    }
  };


  const verifyForgotPasswordOtp =
    async () => {

      if (!forgotOtp.trim()) {
        showLoginMessage(
          "Please enter the OTP."
        );
        return;
      }

      setForgotLoading(true);
      setMessage("");

      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/users/verify-password-reset-otp",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email:
                forgotEmail.trim().toLowerCase(),
              otp:
                forgotOtp.trim()
            })
          }
        );

        const responseText =
          await response.text();

        let data = {};

        try {
          data = responseText
            ? JSON.parse(responseText)
            : {};
        } catch {
          throw new Error(
            "The server returned an unexpected response."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error?.message ||
              "OTP verification failed."
          );
        }

        setForgotStep("password");

        showLoginMessage(
          "OTP verified. Enter your new password.",
          "success"
        );

      } catch (error) {
        showLoginMessage(
          error?.message ||
            "OTP verification failed."
        );
      } finally {
        setForgotLoading(false);
      }
    };


  const resetForgottenPassword =
    async () => {

      if (!newPassword) {
        showLoginMessage(
          "Please enter your new password."
        );
        return;
      }

      if (newPassword.length < 6) {
        showLoginMessage(
          "Password must be at least 6 characters."
        );
        return;
      }

      setForgotLoading(true);
      setMessage("");

      try {
        const response = await fetch(
          "http://localhost:8000/api/v1/users/reset-password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              email:
                forgotEmail.trim().toLowerCase(),
              newPassword
            })
          }
        );

        const responseText =
          await response.text();

        let data = {};

        try {
          data = responseText
            ? JSON.parse(responseText)
            : {};
        } catch {
          throw new Error(
            "The server returned an unexpected response."
          );
        }

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error?.message ||
              "Could not reset password."
          );
        }

        setFormData({
          email:
            forgotEmail.trim().toLowerCase(),
          password: ""
        });

        setForgotMode(false);
        setForgotStep("email");
        setForgotEmail("");
        setForgotOtp("");
        setNewPassword("");

        showLoginMessage(
          "Password reset successfully. You can now login.",
          "success"
        );

      } catch (error) {
        showLoginMessage(
          error?.message ||
            "Could not reset password."
        );
      } finally {
        setForgotLoading(false);
      }
    };


  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-one"></div>
      <div className="auth-orb auth-orb-two"></div>
      <div className="auth-grid"></div>

      {message && (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            position: "fixed",
            top: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2147483647,
            width: "min(92vw, 560px)",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 16px",
            borderRadius: "14px",
            background:
              messageType === "success"
                ? "#ecfdf5"
                : "#fff1f2",
            color:
              messageType === "success"
                ? "#047857"
                : "#be123c",
            border:
              messageType === "success"
                ? "1px solid #a7f3d0"
                : "1px solid #fecdd3",
            boxShadow:
              "0 18px 50px rgba(15, 23, 42, 0.22)",
            fontSize: "14px",
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: "28px",
              height: "28px",
              minWidth: "28px",
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              background:
                messageType === "success"
                  ? "#10b981"
                  : "#e11d48",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            {messageType === "success" ? "✓" : "!"}
          </span>

          <span style={{ flex: 1 }}>
            {message}
          </span>

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Close notification"
            style={{
              border: "none",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              fontSize: "22px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      <div className="auth-layout">
        <section className="auth-showcase">
          <a href="/" className="auth-brand">
            <span className="auth-brand-mark">
              E
            </span>

            <span className="auth-brand-name">
              Edu<span>Tube</span>
            </span>
          </a>

          <div className="auth-showcase-content">
            <span className="auth-eyebrow">
              <Sparkles size={14} />
              YOUR KNOWLEDGE JOURNEY
            </span>

            <h1>
              Pick up where
              <span>curiosity left off.</span>
            </h1>

            <p>
              Your next discovery is waiting.
              Continue learning, explore new ideas,
              and turn knowledge into something real.
            </p>

            <div className="learning-orbit">
              <div className="orbit-ring orbit-ring-one"></div>
              <div className="orbit-ring orbit-ring-two"></div>

              <div className="orbit-center">
                <BrainCircuit size={31} />
              </div>

              <div className="orbit-node orbit-node-one">
                <Play size={15} fill="currentColor" />
              </div>

              <div className="orbit-node orbit-node-two">
                <Zap size={15} fill="currentColor" />
              </div>
            </div>

            <div className="journey-card">
              <div className="journey-card-top">
                <div>
                  <span>LEARNING MODE</span>
                  <strong>Ready to continue</strong>
                </div>

                <div className="journey-status">
                  <span></span>
                  Active
                </div>
              </div>

              <div className="journey-line">
                <span></span>
              </div>

              <div className="journey-steps">
                <span>Discover</span>
                <span>Learn</span>
                <span>Build</span>
              </div>
            </div>
          </div>

          <div className="auth-showcase-footer">
            Learn.
            <span> Grow.</span>
            <strong> Succeed.</strong>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-mobile-brand">
            <span className="auth-brand-mark">
              E
            </span>

            <span className="auth-brand-name">
              Edu<span>Tube</span>
            </span>
          </div>

          <div className="auth-card-header">
            <span className="auth-card-kicker">
              CONTINUE LEARNING
            </span>

            <h2>
              Your journey
              <span>continues here.</span>
            </h2>

            <p>
              Sign in and get back to discovering
              something worth knowing.
            </p>
          </div>

          {!forgotMode ? (
            <>
              <form
                onSubmit={handleSubmit}
                className="auth-form"
                autoComplete="off"
              >
                <div className="form-group">
                  <label htmlFor="email">
                    Email
                  </label>

                  <div className="auth-input-wrapper">
                    <Mail size={18} />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    Password
                  </label>

                  <div className="auth-input-wrapper">
                    <LockKeyhole size={18} />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      className="password-toggle"
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

                  <button
                    type="button"
                    onClick={startForgotPassword}
                    style={{
                      marginTop: "9px",
                      border: "none",
                      background: "transparent",
                      padding: 0,
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#2563eb"
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="auth-button"
                  disabled={loading}
                >
                  <span>
                    {loading
                      ? "Connecting..."
                      : "Continue Learning"}
                  </span>

                  {!loading && (
                    <ArrowRight size={18} />
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="auth-form">
              {forgotStep === "email" && (
                <>
                  <div className="form-group">
                    <label htmlFor="forgotEmail">
                      Registered Email
                    </label>

                    <div className="auth-input-wrapper">
                      <Mail size={18} />

                      <input
                        id="forgotEmail"
                        type="email"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) =>
                          setForgotEmail(
                            e.target.value
                          )
                        }
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="auth-button"
                    disabled={forgotLoading}
                    onClick={
                      sendForgotPasswordOtp
                    }
                  >
                    <span>
                      {forgotLoading
                        ? "Sending..."
                        : "Send OTP"}
                    </span>

                    {!forgotLoading && (
                      <ArrowRight size={18} />
                    )}
                  </button>
                </>
              )}

              {forgotStep === "otp" && (
                <>
                  <div className="form-group">
                    <label htmlFor="forgotOtp">
                      Verification OTP
                    </label>

                    <div className="auth-input-wrapper">
                      <LockKeyhole size={18} />

                      <input
                        id="forgotOtp"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={forgotOtp}
                        onChange={(e) =>
                          setForgotOtp(
                            e.target.value
                              .replace(
                                /\D/g,
                                ""
                              )
                              .slice(0, 6)
                          )
                        }
                        autoComplete="one-time-code"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="auth-button"
                    disabled={forgotLoading}
                    onClick={
                      verifyForgotPasswordOtp
                    }
                  >
                    <span>
                      {forgotLoading
                        ? "Verifying..."
                        : "Verify OTP"}
                    </span>

                    {!forgotLoading && (
                      <ArrowRight size={18} />
                    )}
                  </button>
                </>
              )}

              {forgotStep === "password" && (
                <>
                  <div className="form-group">
                    <label htmlFor="newPassword">
                      New Password
                    </label>

                    <div className="auth-input-wrapper">
                      <LockKeyhole size={18} />

                      <input
                        id="newPassword"
                        type="password"
                        placeholder="Create a new password"
                        value={newPassword}
                        onChange={(e) =>
                          setNewPassword(
                            e.target.value
                          )
                        }
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="auth-button"
                    disabled={forgotLoading}
                    onClick={
                      resetForgottenPassword
                    }
                  >
                    <span>
                      {forgotLoading
                        ? "Resetting..."
                        : "Reset Password"}
                    </span>

                    {!forgotLoading && (
                      <ArrowRight size={18} />
                    )}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={cancelForgotPassword}
                style={{
                  marginTop: "14px",
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 700
                }}
              >
                ← Back to Login
              </button>
            </div>
          )}

          {message && (
            <div
              role="alert"
              aria-live="assertive"
              style={{
                position: "fixed",
                top: "24px",
                left: "50%",
                transform:
                  "translateX(-50%)",
                zIndex: 2147483647,
                width:
                  "min(92vw, 560px)",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                borderRadius: "14px",
                background:
                  messageType === "success"
                    ? "#ecfdf5"
                    : "#fff1f2",
                color:
                  messageType === "success"
                    ? "#047857"
                    : "#be123c",
                border:
                  messageType === "success"
                    ? "1px solid #a7f3d0"
                    : "1px solid #fecdd3",
                boxShadow:
                  "0 18px 50px rgba(15, 23, 42, 0.22)",
                fontSize: "14px",
                fontWeight: 700
              }}
            >
              <span
                style={{
                  width: "28px",
                  height: "28px",
                  minWidth: "28px",
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  background:
                    messageType === "success"
                      ? "#10b981"
                      : "#e11d48",
                  color: "#fff",
                  fontWeight: 900
                }}
              >
                {messageType === "success"
                  ? "✓"
                  : "!"}
              </span>

              <span
                style={{
                  flex: 1
                }}
              >
                {message}
              </span>

              <button
                type="button"
                onClick={() =>
                  setMessage("")
                }
                aria-label="Close notification"
                style={{
                  border: "none",
                  background:
                    "transparent",
                  color: "inherit",
                  cursor: "pointer",
                  fontSize: "22px",
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
          )}


          <div className="auth-register-box">
            <span>New to EduTube?</span>

            <a href="/register">
              Create your account
              <ArrowRight size={15} />
            </a>
          </div>

          <p className="auth-footer">
            By continuing, you agree to use EduTube
            responsibly for learning and education.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Login;