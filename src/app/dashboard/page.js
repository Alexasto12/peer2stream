"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./Dashboard.module.css";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState({ notifications: true });
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [userMsg, setUserMsg] = useState("");
  const [settingsMsg, setSettingsMsg] = useState("");
  const [securityMsg, setSecurityMsg] = useState("");
  const [userMsgType, setUserMsgType] = useState(null); // 'success' | 'error'
  const [settingsMsgType, setSettingsMsgType] = useState(null);
  const [securityMsgType, setSecurityMsgType] = useState(null);
  const [editUsername, setEditUsername] = useState(false);
  const usernameInputRef = useRef(null);
  const [activeSection, setActiveSection] = useState("perfil");
  const router = useRouter();

  // Validation state for dashboard
  const [usernameError, setUsernameError] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");

  // Password strength checks (igual que registro)
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    symbol: false
  });

  // Regex for validation
  const usernameRegex = /^[a-zA-Z0-9_\- ]{3,20}$/;
  const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=]{6,32}$/;

  // Username validation on keyup
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (!usernameRegex.test(value)) {
      setUsernameError("Use 3-20 characters, use letters, numbers, spaces, - or _");
    } else {
      setUsernameError("");
    }
  };

  // Password validation on keyup
  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordChecks({
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      symbol: /[!@#$%^&*()_+\-=]/.test(value)
    });
    if (value && !passwordRegex.test(value)) {
      setNewPasswordError("Password does not meet requirements");
    } else {
      setNewPasswordError("");
    }
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setError("Failed to load user");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
    }
  }, [user]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/user/settings/getSettings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings || { notifications: true });
        }
      } catch { }
    }
    fetchSettings();
  }, []);

  const handleToggleNotifications = async () => {
    const newValue = !settings.notifications;
    setSettings((prev) => ({ ...prev, notifications: newValue }));
    setSaving(true);
    setSettingsMsg("");
    try {
      const res = await fetch("/api/user/settings/updateSettings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: newValue }),
      });
      if (res.ok) {
        setSettingsMsg("Setting saved");
        setSettingsMsgType("success");
      } else {
        const data = await res.json();
        setSettingsMsg(data.error || data.message || "Failed to save");
        setSettingsMsgType("error");
      }
    } catch (err) {
      setSettingsMsg(err.message || "Network/server error");
      setSettingsMsgType("error");
    }
    setSaving(false);
    setTimeout(() => setSettingsMsg(""), 4000);
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUserMsg("");
    setUserMsgType(null);
    const body = {};
    if (username && username !== user.username) body.username = username;
    if (Object.keys(body).length === 0) {
      setUserMsg("No changes to save");
      setUserMsgType("error");
      setSaving(false);
      setTimeout(() => setUserMsg(""), 4000);
      return;
    }
    try {
      const res = await fetch("/api/auth/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setUserMsg("Data updated");
        setUserMsgType("success");
      } else {
        setUserMsg(data.error || data.message || "Failed to update");
        setUserMsgType("error");
      }
    } catch (err) {
      setUserMsg(err.message || "Network/server error");
      setUserMsgType("error");
    }
    setSaving(false);
    setTimeout(() => setUserMsg(""), 4000);
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSettingsMsg("");
    setSettingsMsgType(null);
    try {
      const res = await fetch("/api/user/settings/updateSettings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefered_lang: settings.prefered_lang,
          prefered_quality: settings.prefered_quality,
          notifications: settings.notifications,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsMsg("Preferences saved");
        setSettingsMsgType("success");
      } else {
        setSettingsMsg(data.error || data.message || "Failed to save preferences");
        setSettingsMsgType("error");
      }
    } catch (err) {
      setSettingsMsg(err.message || "Network/server error");
      setSettingsMsgType("error");
    }
    setSaving(false);
    setTimeout(() => setSettingsMsg(""), 4000);
  };

  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSecurityMsg("");
    setSecurityMsgType(null);
    const body = {};
    if (oldPassword && newPassword) {
      body.oldPassword = oldPassword;
      body.password = newPassword;
    }
    if (Object.keys(body).length === 0) {
      setSecurityMsg("No changes to save");
      setSecurityMsgType("error");
      setSaving(false);
      setTimeout(() => setSecurityMsg(""), 4000);
      return;
    }
    try {
      const res = await fetch("/api/auth/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setSecurityMsg("Password updated");
        setSecurityMsgType("success");
        setOldPassword("");
        setNewPassword("");
      } else {
        setSecurityMsg(data.error || data.message || "Failed to update");
        setSecurityMsgType("error");
      }
    } catch (err) {
      setSecurityMsg(err.message || "Network/server error");
      setSecurityMsgType("error");
    }
    setSaving(false);
    setTimeout(() => setSecurityMsg(""), 4000);
  };

  if (loading) return <main className={styles.dashboardMain}><p>Loading...</p></main>;
  if (error) return <main className={styles.dashboardMain}><p className={styles.errorMsg}>{error}</p></main>;
  if (!user) return null;

  return (
    <main className={styles.dashboardMainClassic}>
      <div className={styles.dashboardContainer}>
        <h1 className={styles.dashboardTitle}>Settings</h1>
        <nav className={styles.settingsMenu}>
          <ul>
            <li className={activeSection === "perfil" ? styles.active : ""}>
              <button type="button" onClick={() => setActiveSection("perfil")}>Profile</button>
            </li>
            <li className={activeSection === "seguridad" ? styles.active : ""}>
              <button type="button" onClick={() => setActiveSection("seguridad")}>Security</button>
            </li>
            <li className={activeSection === "preferencias" ? styles.active : ""}>
              <button type="button" onClick={() => setActiveSection("preferencias")}>Preferences</button>
            </li>
          </ul>
        </nav>
        <section className={styles.settingsContent}>
          {activeSection === "perfil" && (
            <form className={styles.settingsForm} onSubmit={handleUserUpdate} autoComplete="off">
              <h2 className={styles.sectionTitle}>Profile</h2>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className={styles.input}
                    value={username}
                    onChange={handleUsernameChange}
                    autoComplete="username"
                    disabled={!editUsername}
                    ref={usernameInputRef}
                  />
                  <button
                    type="button"
                    className={styles.editIconBtn}
                    onClick={() => {
                      setEditUsername(e => {
                        const next = !e;
                        setTimeout(() => {
                          if (!e && usernameInputRef.current) {
                            usernameInputRef.current.focus();
                            usernameInputRef.current.select();
                          }
                        }, 0);
                        return next;
                      });
                    }}
                    aria-label={editUsername ? "Cancel edit" : "Edit username"}
                    style={{ background: editUsername ? '#351effb9' : 'transparent' }}
                  >
                    <svg width="30" height="30" fill="none" viewBox="0 0 24 24"><path fill="#ffff" d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25Zm17.71-10.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" /></svg>
                  </button>
                </div>
                {usernameError && <div className={styles.inputError}>{usernameError}</div>}
              </div>
              <button className={styles.dashboardBtn} type="submit" disabled={saving || !!usernameError}>
                {saving ? "Saving..." : "Save username"}
              </button>
              {userMsg && (
                <div className={
                  `${styles.userMsg} ${userMsgType === 'success' ? styles['userMsg--success'] : ''} ${userMsgType === 'error' ? styles['userMsg--error'] : ''}`
                }>
                  {userMsg}
                </div>
              )}
            </form>
          )}
          {activeSection === "seguridad" && (
            <form className={styles.settingsForm} onSubmit={handleSecurityUpdate} autoComplete="off">
              <h2 className={styles.sectionTitle}>Security</h2>
              <div className={styles.formGroup}>
                <label htmlFor="oldPassword">Current password</label>
                <input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  className={styles.input}
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  autoComplete="current-password"
                />
                {oldPasswordError && <div className={styles.inputError}>{oldPasswordError}</div>}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  className={styles.input}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  autoComplete="new-password"
                />
                {/* Lista de requisitos de contraseña */}
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0.3em 0 0.2em 0',
                  fontSize: '0.98em',
                  color: '#444',
                  lineHeight: 1.5
                }}>
                  <li style={{ color: passwordChecks.length ? '#1fa463' : '#c62828', textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                    {passwordChecks.length ? '✔' : '✖'} At least 8 characters
                  </li>
                  <li style={{ color: passwordChecks.upper ? '#1fa463' : '#c62828', textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                    {passwordChecks.upper ? '✔' : '✖'} One uppercase letter
                  </li>
                  <li style={{ color: passwordChecks.lower ? '#1fa463' : '#c62828', textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                    {passwordChecks.lower ? '✔' : '✖'} One lowercase letter
                  </li>
                  <li style={{ color: passwordChecks.number ? '#1fa463' : '#c62828', textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                    {passwordChecks.number ? '✔' : '✖'} One number
                  </li>
                  <li style={{ color: passwordChecks.symbol ? '#1fa463' : '#c62828', textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
                    {passwordChecks.symbol ? '✔' : '✖'} One symbol (!@#$%^&*()_+-=)
                  </li>
                </ul>
                {newPasswordError && <div className={styles.inputError}>{newPasswordError}</div>}
              </div>
              <button className={styles.dashboardBtn} type="submit" disabled={saving || !!newPasswordError}>
                {saving ? "Saving..." : "Save changes"}
              </button>
              {securityMsg && (
                <div className={
                  `${styles.userMsg} ${securityMsgType === 'success' ? styles['userMsg--success'] : ''} ${securityMsgType === 'error' ? styles['userMsg--error'] : ''}`
                }>
                  {securityMsg}
                </div>
              )}
            </form>
          )}
          {activeSection === "preferencias" && (
            <form className={styles.settingsForm} onSubmit={handleSettingsUpdate} autoComplete="off">
              <h2 className={styles.sectionTitle}>Preferences</h2>
              <div className={styles.formGroup}>
                <label htmlFor="prefered_lang">Preferred language</label>
                <select
                  id="prefered_lang"
                  name="prefered_lang"
                  className={styles.input}
                  value={settings.prefered_lang || "en"}
                  onChange={e => setSettings(s => ({ ...s, prefered_lang: e.target.value }))}
                >
                  <option value="es">Spanish</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="prefered_quality">Preferred quality</label>
                <select
                  id="prefered_quality"
                  name="prefered_quality"
                  className={styles.input}
                  value={settings.prefered_quality || "1080p"}
                  onChange={e => setSettings(s => ({ ...s, prefered_quality: e.target.value }))}
                >
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="notifications">Notifications</label>
                <div className={styles.toggleWrapper}>
                  <input
                    id="notifications"
                    name="notifications"
                    type="checkbox"
                    checked={!!settings.notifications}
                    onChange={handleToggleNotifications}
                    className={styles.toggle}
                  />
                  <span className={styles.toggleLabel}>{settings.notifications ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
              <button className={styles.dashboardBtn} type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </form>
          )}
        </section>
        <button className={styles.logoutBtn} onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          router.push("/login");
        }}>
          Log out
        </button>
        <footer className={styles.dashboardFooter}>
          <div className={styles.footerRowCentered}>
            <ul className={styles.footerLinks}>
              <li><Link href="#" target="_blank" rel="noopener noreferrer">Terms & Conditions</Link></li>
              <li><Link href="#" target="_blank" rel="noopener noreferrer">Privacy Policy</Link></li>
              <li><Link href="#" target="_blank" rel="noopener noreferrer">Cookie Policy</Link></li>
              <li><Link href="#" target="_blank" rel="noopener noreferrer">Contact</Link></li>
            </ul>
          </div>
        </footer>
      </div>
    </main>
  );
}
