"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";
import Image from "next/image";
import EyeIcon from "@mui/icons-material/VisibilityOutlined";
import EyeOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import RegisterModal from "../components/RegisterModal/RegisterModal";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Registration form state
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRepeatPassword, setRegRepeatPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [regCaptcha, setRegCaptcha] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  // Pregunta anti-bot aleatoria
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  // Validation state
  const [regUsernameError, setRegUsernameError] = useState("");
  const [regEmailError, setRegEmailError] = useState("");
  const [regPasswordError, setRegPasswordError] = useState("");
  const [regRepeatPasswordError, setRegRepeatPasswordError] = useState("");
  const [regCaptchaError, setRegCaptchaError] = useState("");

  // Password strength checks
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    symbol: false
  });

  // Regex for validation
  const usernameRegex = /^[a-zA-Z0-9_\- ]{3,20}$/;
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\?]{6,32}$/;

  const router = useRouter();

  // Generar pregunta anti-bot aleatoria
  const generateCaptcha = () => {
    const ops = [
      { op: "+", fn: (a, b) => a + b },
      { op: "-", fn: (a, b) => a - b }
    ];
    const a = Math.floor(Math.random() * 8) + 2; // 2-9
    const b = Math.floor(Math.random() * 8) + 1; // 1-8
    const op = ops[Math.floor(Math.random() * ops.length)];
    let q = `What is ${a} ${op.op} ${b}? (anti-bot)`;
    let ans = op.fn(a, b).toString();
    setCaptchaQuestion(q);
    setCaptchaAnswer(ans);
    setRegCaptcha("");
    setRegCaptchaError("");
  };

  // Mostrar nueva pregunta cada vez que se abre el modal
  React.useEffect(() => {
    if (showRegister) generateCaptcha();
    // eslint-disable-next-line
  }, [showRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        // Emitir evento para que la NavBar se actualice al hacer login
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('authChanged'));
        }
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    if (!usernameRegex.test(regUsername)) {
      setRegError("Username must be 3-20 characters, only letters, numbers, spaces, - and _");
      return;
    }
    if (!emailRegex.test(regEmail)) {
      setRegError("Invalid email format");
      return;
    }
    if (!passwordRegex.test(regPassword)) {
      setRegError("Password must be 6-32 characters, only allowed symbols: !@#$%^&*()_+-=");
      return;
    }
    if (regPassword !== regRepeatPassword) {
      setRegError("Passwords do not match");
      return;
    }
    if (regCaptcha.trim() !== captchaAnswer) {
      setRegError("Captcha answer is incorrect");
      return;
    }
    setRegLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: regUsername, email: regEmail, password: regPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setRegSuccess("Registration successful! You can now log in.");
        setRegUsername(""); setRegEmail(""); setRegPassword(""); setRegRepeatPassword(""); setRegCaptcha("");
        generateCaptcha();
        // Emitir evento para que la NavBar se actualice si el registro también inicia sesión automáticamente
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('authChanged'));
        }
      } else {
        setRegError(data.error || "Registration failed");
      }
    } catch (err) {
      setRegError("Network error");
    }
    setRegLoading(false);
  };

  // Validation handlers
  const handleUsernameChange = (e) => {
    setRegUsername(e.target.value);
    if (!usernameRegex.test(e.target.value)) {
      setRegUsernameError("Username must be 3-20 characters, only letters, numbers, spaces, - and _");
    } else {
      setRegUsernameError("");
    }
  };
  const handleEmailChange = (e) => {
    setRegEmail(e.target.value);
    if (!emailRegex.test(e.target.value)) {
      setRegEmailError("Invalid email format");
    } else {
      setRegEmailError("");
    }
  };
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setRegPassword(value);
    setRegPasswordError(""); // No mostrar mensaje de error aquí
    // Password strength checks
    setPasswordChecks({
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      symbol: /[!@#$%^&*()_+\-=\?]/.test(value)
    });
    // También comprobar repeat password
    if (regRepeatPassword && value !== regRepeatPassword) {
      setRegRepeatPasswordError("Passwords do not match");
    } else {
      setRegRepeatPasswordError("");
    }
  };
  const handleRepeatPasswordChange = (e) => {
    setRegRepeatPassword(e.target.value);
    if (regPassword !== e.target.value) {
      setRegRepeatPasswordError("Passwords do not match");
    } else {
      setRegRepeatPasswordError("");
    }
  };
  const handleCaptchaChange = (e) => {
    setRegCaptcha(e.target.value);
    if (e.target.value.trim() !== captchaAnswer) {
      setRegCaptchaError("Captcha answer is incorrect");
    } else {
      setRegCaptchaError("");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formCard}>
        <Image src="/file.svg" alt="Logo" width={112} height={80} className={styles.logo} priority />
        <div className={styles.welcome}>Bienvenido</div>
        <div className={styles.loginTitle}>Login</div>
        <div className={styles.loginDesc}>Accede a tu cuenta para gestionar tu videoclub.</div>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <div className={styles.formGroup}>
            <label>Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.formGroup}>
            <label>Contraseña:</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ flex: 1, paddingRight: 36 }}
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#888"
                }}
                tabIndex={0}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOffIcon fontSize="small" /> : <EyeIcon fontSize="small" />}
              </span>
            </div>
          </div>
          {error && <div className={styles.error}>{error}</div>}
          <button type="submit" className={styles.loginButton}>Iniciar sesión</button>
        </form>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          Don&apos;t have an account?{' '}
          <Link href="#" onClick={e => { e.preventDefault(); setShowRegister(true); }} style={{ color: '#351eff', textDecoration: 'underline', cursor: 'pointer' }}>
            Register
          </Link>
        </div>
      </div>
      <RegisterModal open={showRegister} onClose={() => { setShowRegister(false); setRegError(""); setRegSuccess(""); }}>
        <h2 style={{ color: '#e0e6ff', fontSize: '2.1rem', fontWeight: 700, marginBottom: '1.2rem', textAlign: 'center', letterSpacing: '0.01em', textShadow: '0 4px 18px #351eff99, 0 1px 0 #1a1a3a99' }}>Register</h2>
        <form onSubmit={handleRegister}>
          <div className={styles.crystalFormGroup}>
            <label>Username</label>
            <input type="text" value={regUsername} onChange={handleUsernameChange} required maxLength={20} />
            <div className={styles.crystalErrorFixed}>{regUsernameError || '\u00A0'}</div>
          </div>
          <div className={styles.crystalFormGroup}>
            <label>Email</label>
            <input type="email" value={regEmail} onChange={handleEmailChange} required />
            <div className={styles.crystalErrorFixed}>{regEmailError || '\u00A0'}</div>
          </div>
          <div className={styles.crystalFormGroup}>
            <label>Password</label>
            <input type="password" value={regPassword} onChange={handlePasswordChange} required maxLength={32} />
            <div className={styles.passwordChecks}>
              <span className={passwordChecks.length ? styles.checkOk : styles.checkNo}>●</span> 8+ chars
              <span className={passwordChecks.upper ? styles.checkOk : styles.checkNo}>●</span> Uppercase
              <span className={passwordChecks.lower ? styles.checkOk : styles.checkNo}>●</span> Lowercase
              <span className={passwordChecks.number ? styles.checkOk : styles.checkNo}>●</span> Number
              <span className={passwordChecks.symbol ? styles.checkOk : styles.checkNo}>●</span> Symbol
            </div>
            <div className={styles.crystalErrorFixed}>{'\u00A0'}</div>
          </div>
          <div className={styles.crystalFormGroup}>
            <label>Repeat Password</label>
            <input type="password" value={regRepeatPassword} onChange={handleRepeatPasswordChange} required maxLength={32} />
            <div className={styles.crystalErrorFixed}>{regRepeatPasswordError || '\u00A0'}</div>
          </div>
          <div className={styles.crystalFormGroup}>
            <label>{captchaQuestion || "What is 2 + 3? (anti-bot)"}</label>
            <input type="text" value={regCaptcha} onChange={handleCaptchaChange} required />
            <div className={styles.crystalErrorFixed}>{regCaptchaError || '\u00A0'}</div>
          </div>
          {regError && <div className={styles.crystalError}>{regError}</div>}
          {regSuccess && <div className={styles.crystalSuccess}>{regSuccess}</div>}
          <button type="submit" className={styles.crystalButton} disabled={regLoading} style={{ marginTop: 18 }}>
            {regLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </RegisterModal>
    </div>
  );
}
