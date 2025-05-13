"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./reset.module.css";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\?]{8,32}$/;

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [repeatPasswordError, setRepeatPasswordError] = useState("");
    const [passwordChecks, setPasswordChecks] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        symbol: false,
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    useEffect(() => {
        setPasswordChecks({
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            symbol: /[!@#$%^&*()_+\-=\?]/.test(password),
        });
        if (password && !passwordRegex.test(password)) {
            setPasswordError(
                "Password must be 8-32 chars, allowed: !@#$%^&*()_+-=?"
            );
        } else {
            setPasswordError("");
        }
        if (repeatPassword && password !== repeatPassword) {
            setRepeatPasswordError("Passwords do not match");
        } else {
            setRepeatPasswordError("");
        }
    }, [password, repeatPassword]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!token) {
            setError("Invalid or missing token");
            return;
        }
        if (!passwordRegex.test(password)) {
            setPasswordError(
                "Password must be 8-32 chars, allowed: !@#$%^&*()_+-=?"
            );
            return;
        }
        if (password !== repeatPassword) {
            setRepeatPasswordError("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess("Password updated! You can now log in.");
                setPassword("");
                setRepeatPassword("");
                setTimeout(() => router.push("/login"), 2000);
            } else {
                setError(data.error || "Could not reset password");
            }
        } catch (err) {
            setError("Network error");
        }
        setLoading(false);
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.formCard}>
                <h2 className={styles.crystalFormTitle}>
                    Reset Password
                </h2>
                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <div className={styles.crystalFormGroup}>
                        <label>New Password</label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                maxLength={32}
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
                                    color: showPassword ? "#fff" : "#fff",
                                    opacity: 0.85
                                }}
                                tabIndex={0}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <VisibilityOff />
                                ) : (
                                    <Visibility />
                                )}
                            </span>
                        </div>
                        <div className={styles.passwordChecks}>
                            <span className={passwordChecks.length ? styles.checkOk : styles.checkNo}>●</span> 8+ chars
                            <span className={passwordChecks.upper ? styles.checkOk : styles.checkNo}>●</span> Uppercase
                            <span className={passwordChecks.lower ? styles.checkOk : styles.checkNo}>●</span> Lowercase
                            <span className={passwordChecks.number ? styles.checkOk : styles.checkNo}>●</span> Number
                            <span className={passwordChecks.symbol ? styles.checkOk : styles.checkNo}>●</span> Symbol
                        </div>
                        <div className={styles.crystalErrorFixed}>{passwordError || '\u00A0'}</div>
                    </div>
                    <div className={styles.crystalFormGroup}>
                        <label>Repeat Password</label>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <input
                                type={showRepeatPassword ? "text" : "password"}
                                value={repeatPassword}
                                onChange={e => setRepeatPassword(e.target.value)}
                                required
                                maxLength={32}
                                style={{ flex: 1, paddingRight: 36 }}
                            />
                            <span
                                onClick={() => setShowRepeatPassword((prev) => !prev)}
                                style={{
                                    position: "absolute",
                                    right: 10,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    color: showRepeatPassword ? "#fff" : "#fff",
                                    opacity: 0.85
                                }}
                                tabIndex={0}
                                aria-label={showRepeatPassword ? "Hide password" : "Show password"}
                            >
                                {showRepeatPassword ? (
                                    <VisibilityOff />
                                ) : (
                                    <Visibility />
                                )}
                            </span>
                        </div>
                        <div className={styles.crystalErrorFixed}>{repeatPasswordError || '\u00A0'}</div>
                    </div>
                    {error && <div className={styles.crystalError}>{error}</div>}
                    {success && <div className={styles.crystalSuccess}>{success}</div>}
                    <button type="submit" className={styles.loginButton} disabled={loading}>
                        {loading ? "Saving..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
