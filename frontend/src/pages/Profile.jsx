import { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/current-user",
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

      if (!response.ok) {
        throw new Error(
          result?.message || "Could not load profile"
        );
      }

      setUser(result.data);

      setFormData({
        fullName: result.data.fullName || "",
        email: result.data.email || "",
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/update-account",
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "accessToken"
            )}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Could not update profile"
        );
      }

      setUser(result.data);
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "40px" }}>
        {message || "Profile could not be loaded."}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#f7f6f3",
      }}
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          background: "#fff",
          borderRadius: "20px",
          padding: "35px",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={user.avatar}
            alt={user.username}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #eee",
            }}
          />

          {!editing ? (
            <>
              <h1 style={{ margin: "18px 0 5px" }}>
                {user.fullName}
              </h1>

              <p style={{ color: "#666" }}>
                @{user.username}
              </p>

              <p style={{ color: "#777" }}>
                {user.email}
              </p>

              <button
                type="button"
                onClick={() => {
                  setMessage("");
                  setEditing(true);
                }}
                style={{
                  marginTop: "15px",
                  padding: "11px 24px",
                  border: "none",
                  borderRadius: "9px",
                  background: "#6657e9",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <div
              style={{
                marginTop: "25px",
                textAlign: "left",
              }}
            >
              <label>Full Name</label>

              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  margin: "7px 0 18px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />

              <label>Email</label>

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  margin: "7px 0 20px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      fullName: user.fullName || "",
                      email: user.email || "",
                    });
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    borderRadius: "8px",
                    background: "#6657e9",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {message && (
            <p
              style={{
                marginTop: "20px",
                color: message
                  .toLowerCase()
                  .includes("success")
                  ? "green"
                  : "crimson",
                fontWeight: "600",
              }}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;