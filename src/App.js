import { useState, useEffect, useRef } from "react";

const USERS_DB = {
  "admin@secure.io": {
    password: "Admin@1234",
    name: "Admin User",
    role: "Administrator",
    avatar: "AU",
    secret: "JBSWY3DPEHPK3PXP",
    files: [
      { id: 1, name: "Q4_Financial_Report.pdf", size: "2.4 MB", encrypted: false, sensitive: true },
      { id: 2, name: "Employee_Salaries.xlsx", size: "856 KB", encrypted: true, sensitive: true },
      { id: 3, name: "Product_Roadmap.docx", size: "1.2 MB", encrypted: false, sensitive: false },
      { id: 4, name: "Security_Audit_2024.pdf", size: "3.1 MB", encrypted: true, sensitive: true },
    ]
  },
  "user@secure.io": {
    password: "User@5678",
    name: "Jane Smith",
    role: "Analyst",
    avatar: "JS",
    secret: "MFRA2YTBMJQXG5A=",
    files: [
      { id: 5, name: "Market_Analysis.pptx", size: "4.7 MB", encrypted: false, sensitive: false },
      { id: 6, name: "Client_Contracts.zip", size: "12.3 MB", encrypted: true, sensitive: true },
    ]
  }
};

function generateTOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

function encryptData(text) {
  return btoa(text).split('').reverse().join('').replace(/=/g, '');
}

const COLORS = {
  bg: "var(--color-background-primary)",
  bgSecondary: "var(--color-background-secondary)",
  bgTertiary: "var(--color-background-tertiary)",
  text: "var(--color-text-primary)",
  muted: "var(--color-text-secondary)",
  hint: "var(--color-text-tertiary)",
  border: "var(--color-border-tertiary)",
  borderHover: "var(--color-border-secondary)",
  success: "var(--color-background-success)",
  successText: "var(--color-text-success)",
  danger: "var(--color-background-danger)",
  dangerText: "var(--color-text-danger)",
  info: "var(--color-background-info)",
  infoText: "var(--color-text-info)",
  warning: "var(--color-background-warning)",
  warningText: "var(--color-text-warning)",
};

const LockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const ShieldIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const FileIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
    <polyline points="13 2 13 9 20 9"/>
  </svg>
);

const EyeIcon = ({ open = true, size = 16 }) => (
  open
    ? <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
    : <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const KeyIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const LogOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function PasswordStrength({ password, theme }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const passed = checks.filter(c => c.pass).length;
  const strength = passed <= 1 ? "Weak" : passed <= 3 ? "Fair" : passed <= 4 ? "Good" : "Strong";
  const strengthColor = passed <= 1 ? "#E24B4A" : passed <= 3 ? "#BA7517" : passed <= 4 ? "#639922" : "#1D9E75";

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= passed ? strengthColor : COLORS.border,
            transition: "background 0.3s"
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: theme.subText
          
        }}>Password strength</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: strengthColor }}>{password ? strength : ""}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
        {checks.map(c => (
          <span key={c.label} style={{
            fontSize: 11, display: "flex", alignItems: "center", gap: 4,
            color: c.pass ? COLORS.successText : COLORS.hint
          }}>
            <span style={{ color: c.pass ? COLORS.successText : COLORS.hint }}>
              {c.pass ? <CheckIcon /> : <XIcon />}
            </span>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function TOTPDisplay({ code, timeLeft, theme }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / 30) * circumference;

  return (
    <div style={{
      background: COLORS.bgSecondary,
      border: `0.5px solid ${COLORS.border}`,
      borderRadius: "var(--border-radius-lg)",
      padding: "1.25rem",
      textAlign: "center",
      position: "relative"
    }}>
      <div style={{ fontSize: 12, color: theme.subText, marginBottom: 8 }}>
        Authenticator code
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: 8, fontFamily: "var(--font-mono)", color: COLORS.text }}>
          {code.slice(0, 3)} {code.slice(3)}
        </div>
        <svg width="44" height="44">
          <circle cx="22" cy="22" r={radius} fill="none" stroke={COLORS.border} strokeWidth="3"/>
          <circle
            cx="22" cy="22" r={radius}
            fill="none"
            stroke={timeLeft <= 5 ? "#E24B4A" : timeLeft <= 10 ? "#BA7517" : "#1D9E75"}
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            transform="rotate(-90 22 22)"
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
          />
          <text x="22" y="27" textAnchor="middle" fontSize="12" fontWeight="500"
            fill={timeLeft <= 5 ? "#E24B4A" : timeLeft <= 10 ? "#BA7517" : "#1D9E75"}>
            {timeLeft}
          </text>
        </svg>
      </div>
      <div style={{ fontSize: 11, color: COLORS.hint, marginTop: 8 }}>
        Code refreshes every 30 seconds
      </div>
    </div>
  );
}

function FileVault({ files, onBack, theme }) {
  const [fileList, setFileList] = useState(files);
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [notification, setNotification] = useState(null);
  const [encKey, setEncKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keyModal, setKeyModal] = useState(null);

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleEncrypt = (file) => {
    if (!encKey.trim()) {
      setKeyModal({ file, action: "encrypt" });
      return;
    }
    setProcessing(file.id);
    setTimeout(() => {
      setFileList(prev => prev.map(f =>
        f.id === file.id ? { ...f, encrypted: true, encKey: hashPassword(encKey) } : f
      ));
      setProcessing(null);
      showNotif(`${file.name} encrypted successfully`);
    }, 1500);
  };

  const handleDecrypt = (file) => {
    if (!encKey.trim()) {
      setKeyModal({ file, action: "decrypt" });
      return;
    }
    setProcessing(file.id);
    setTimeout(() => {
      if (file.encKey && file.encKey !== hashPassword(encKey)) {
        setProcessing(null);
        showNotif("Incorrect encryption key", "danger");
        return;
      }
      setFileList(prev => prev.map(f =>
        f.id === file.id ? { ...f, encrypted: false, encKey: null } : f
      ));
      setProcessing(null);
      showNotif(`${file.name} decrypted successfully`);
    }, 1500);
  };

  const handleModalConfirm = (key) => {
    setEncKey(key);
    const { file, action } = keyModal;
    setKeyModal(null);
    if (action === "encrypt") handleEncrypt({ ...file, _pendingKey: key });
    else handleDecrypt({ ...file, _pendingKey: key });
  };

  return (
    <div>
      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 999,
          background: notification.type === "success" ? COLORS.success : COLORS.danger,
          color: notification.type === "success" ? COLORS.successText : COLORS.dangerText,
          padding: "10px 16px", borderRadius: "var(--border-radius-md)",
          fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8,
          border: `0.5px solid ${notification.type === "success" ? COLORS.successText : COLORS.dangerText}`,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
        }}>
          {notification.type === "success" ? <CheckIcon /> : <XIcon />}
          {notification.msg}
        </div>
      )}

      {keyModal && (
        <KeyEntryModal
  action={keyModal.action}
  fileName={keyModal.file.name}
  onConfirm={handleModalConfirm}
  onCancel={() => setKeyModal(null)}
  theme={theme}
/>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ marginBottom: "1rem" }}>
  <label style={{ fontSize: 13, color: theme.subText }}>
    Upload File
  </label>

  <input
    type="file"
    onChange={(e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();

      reader.onload = () => {
        const newFile = {
          id: Date.now(),
          name: file.name,
          size: (file.size / 1024).toFixed(1) + " KB",
          encrypted: false,
          sensitive: false,
          content: reader.result
        };

        setFileList(prev => [...prev, newFile]);
      };

      reader.readAsText(file);
    }}
    style={{
      marginTop: 6,
      display: "block"
    }}
  />
</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ color: theme.subText }}>
            <ShieldIcon size={16} />
          </div>
          <span style={{ fontSize: 13, color: theme.subText }}>Encryption key (used for all operations)</span>
        </div>
        <div style={{
  display: "flex",
  gap: 8,
  alignItems: "center"
}}>
          <div style={{
  flex: 1,
  position: "relative",
  minWidth: 0
}}>
            <input
              type={showKey ? "text" : "password"}
              placeholder="Enter your encryption passphrase..."
              value={encKey}
              onChange={e => setEncKey(e.target.value)}
             style={{
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "13px"
}}
            />
            <button
              onClick={() => setShowKey(v => !v)}
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 4,
                color: theme.subText, display: "flex"
              }}
            >
              <EyeIcon open={showKey} />
            </button>
          </div>
          <button
            onClick={() => {
              const key = Math.random().toString(36).slice(2, 14).toUpperCase();
              setEncKey(key);
              setShowKey(true);
            }}
            style={{
  whiteSpace: "nowrap",
  padding: "8px 12px",
  fontSize: "12px",
  borderRadius: "6px",
  cursor: "pointer"
}}
          >
            Generate key
          </button>
        </div>
        {encKey && (
          <div style={{ marginTop: 6, fontSize: 11, color: theme.subText, display: "flex", gap: 8, alignItems: "center" }}>
            <span>Key hash:</span>
            <code style={{ fontFamily: "var(--font-mono)", color: COLORS.infoText, fontSize: 11 }}>
              SHA-{hashPassword(encKey)}
            </code>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {fileList.map(file => (
          <div
            key={file.id}
            onClick={() => setSelected(selected === file.id ? null : file.id)}
            style={{
              background: COLORS.bg,
              border: `0.5px solid ${selected === file.id ? COLORS.borderHover : COLORS.border}`,
              borderRadius: "var(--border-radius-md)",
              padding: "12px 14px",
              cursor: "pointer",
              transition: "border-color 0.2s"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ color: file.encrypted ? COLORS.successText : COLORS.muted }}>
                {file.encrypted ? <LockIcon /> : <FileIcon />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.text, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file.name}
                  </span>
                  {file.sensitive && (
                    <span style={{
                      fontSize: 10, padding: "1px 6px", borderRadius: 3,
                      background: COLORS.warning, color: COLORS.warningText,
                      flexShrink: 0
                    }}>
                      sensitive
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: COLORS.hint }}>{file.size}</div>
              </div>
              <span style={{
                fontSize: 11, padding: "3px 8px", borderRadius: 4,
                background: file.encrypted ? COLORS.success : COLORS.bgSecondary,
                color: file.encrypted ? COLORS.successText : COLORS.hint,
                border: `0.5px solid ${file.encrypted ? COLORS.successText : COLORS.border}`,
                flexShrink: 0
              }}>
                {file.encrypted ? "Encrypted" : "Plaintext"}
              </span>
            </div>

            {selected === file.id && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `0.5px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {!file.encrypted ? (
                    <button
                      onClick={e => { e.stopPropagation(); handleEncrypt(file); }}
                      disabled={processing === file.id}
                     style={{
  background: "#2e7d32",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  gap: 6
}}
                    >
                      {processing === file.id ? (
                        <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
                      ) : <LockIcon />}
                      {processing === file.id ? "Encrypting..." : "Encrypt file"}
                    </button>
                  ) : (
                    <button
                      onClick={e => { e.stopPropagation(); handleDecrypt(file); }}
                      disabled={processing === file.id}
                      style={{
  background: "#c62828",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: 12,
  display: "flex",
  alignItems: "center",
  gap: 6
}}
                    >
                      {processing === file.id ? (
                        <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
                      ) : <KeyIcon />}
                      {processing === file.id ? "Decrypting..." : "Decrypt file"}
                    </button>
                  )}
                 <button
  onClick={(e) => {
    e.stopPropagation();

    const content = file.encrypted
      ? "Encrypted content"
      : "Decrypted file content";

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();

    URL.revokeObjectURL(url);
  }}
>
  <DownloadIcon />
  Download
</button>
                </div>
                {file.encrypted && file.encKey && (
                  <div style={{ marginTop: 8, fontSize: 11, color: theme.subText }}>
                    Encrypted with key hash: <code style={{ fontFamily: "var(--font-mono)", color: COLORS.infoText }}>{file.encKey}</code>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function KeyEntryModal({ action, fileName, onConfirm, onCancel, theme }) {
  const [key, setKey] = useState("");
  return (
    <div style={{
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",   // dark overlay
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999
}}>
      <div style={{
  background: theme.card,
  color: theme.text,
  padding: "25px",
  borderRadius: "12px",
  width: "350px",
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
}}>
        <h3 style={{ marginBottom: "10px" }}>
  {action === "encrypt" ? "Enter Encryption Key" : "Enter Decryption Key"}
</h3>
        <div style={{ fontSize: 12, color: theme.subText, marginBottom: 16 }}>
          {fileName}
        </div>
        <input
  type="password"
  placeholder="Enter key..."
  value={key}
  onChange={e => setKey(e.target.value)}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  }}
/>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
  <button onClick={onCancel}>
    Cancel
  </button>

  <button onClick={() => key && onConfirm(key)}>
    {action === "encrypt" ? "Encrypt" : "Decrypt"}
  </button>
</div>
      </div>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState("login");
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [totp, setTotp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("files");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const timerRef = useRef(null);
  const sessionRef = useRef(null);
  const theme = {
  bg: darkMode ? "#0f172a" : "#f5f5f5",
  card: darkMode ? "#1e293b" : "#ffffff",
  text: darkMode ? "#ffffff" : "#000000",
  subText: darkMode ? "#cbd5e1" : "#555",
  border: darkMode ? "#334155" : "#ddd"
};

  useEffect(() => {
    if (stage === "2fa") {
      const newCode = generateTOTP();
      setGeneratedOtp(newCode);
      setTimeLeft(30);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            const fresh = generateTOTP();
            setGeneratedOtp(fresh);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [stage]);

  useEffect(() => {
    if (stage === "dashboard") {
      sessionRef.current = setInterval(() => setSessionTime(s => s + 1), 1000);
    }
    return () => clearInterval(sessionRef.current);
  }, [stage]);

  useEffect(() => {
    if (locked && lockTimer > 0) {
      const t = setTimeout(() => setLockTimer(v => v - 1), 1000);
      return () => clearTimeout(t);
    }
    if (locked && lockTimer === 0) {
      setLocked(false);
      setLoginAttempts(0);
    }
  }, [locked, lockTimer]);

  const handleLogin = () => {
    if (locked) return;
    const u = USERS_DB[email.toLowerCase()];
    if (!u || u.password !== password) {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      if (attempts >= 3) {
        setLocked(true);
        setLockTimer(30);
        setError("Account locked after 3 failed attempts. Try again in 30 seconds.");
      } else {
        setError(`Invalid credentials. ${3 - attempts} attempt${3 - attempts !== 1 ? "s" : ""} remaining.`);
      }
      return;
    }
    setUser(u);
    setError("");
    setLoginAttempts(0);
    setStage("2fa");
  };

  const handleVerify2FA = () => {
    if (totp === generatedOtp) {
      setStage("dashboard");
      setError("");
    } else {
      setError("Invalid code. Check the authenticator and try again.");
    }
  };

  const formatSession = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  if (stage === "login") {
    return (
      <div style={{ maxWidth: 420, margin: "0 auto", padding: "2rem 0" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "var(--border-radius-lg)",
            background: theme.bg,
            border: `0.5px solid ${COLORS.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem", color: COLORS.text
          }}>
            <ShieldIcon size={24} />
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22 }}>SecureVault System</h2>
          <p style={{ margin: 0, color: theme.subText, fontSize: 14 }}>
  Advanced Authentication with 2FA & Encryption
</p>

<p style={{ marginTop: 6, fontSize: 12, color: COLORS.hint }}>
  Protecting Your Digital Identity 🔐
</p>
          <p style={{ margin: 0, color: theme.subText, fontSize: 14 }}>Sign in to your secure workspace</p>
        </div>

        <div style={{
          background: COLORS.bg,
          border: `0.5px solid ${COLORS.border}`,
          borderRadius: "var(--border-radius-lg)",
          padding: "1.5rem"
        }}>
          {locked && (
            <div style={{
              background: COLORS.danger, color: COLORS.dangerText,
              borderRadius: "var(--border-radius-md)", padding: "10px 12px",
              fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8
            }}>
              <LockIcon />
              Account locked. Retry in {lockTimer}s
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: theme.subText, display: "block", marginBottom: 6 }}>Email address</label>
            <input
              type="email"
              placeholder="you@secure.io"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              disabled={locked}
              style={{ width: "100%", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: theme.subText, display: "block", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                disabled={locked}
                style={{ width: "100%", paddingRight: 40, boxSizing: "border-box" }}
              />
              <button
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: theme.subText, padding: 4,
                  display: "flex"
                }}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
            {password && <PasswordStrength password={password} theme={theme} />}
          </div>

          {error && !locked && (
            <div style={{
              fontSize: 12, color: COLORS.dangerText,
              background: COLORS.danger, borderRadius: "var(--border-radius-md)",
              padding: "8px 12px", marginBottom: 14
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={locked || !email || !password}
            style={{ width: "100%", fontSize: 14, padding: "10px" }}
          >
            Login Securely
          </button>

          <div style={{
            marginTop: 20, padding: "12px", borderRadius: "var(--border-radius-md)",
            background: COLORS.bgSecondary, fontSize: 12, color: theme.subText
          }}>
            <div style={{ fontWeight: 500, marginBottom: 6, color: COLORS.text }}>Demo accounts</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div><code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>admin@secure.io</code> / <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>Admin@1234</code></div>
              <div><code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>user@secure.io</code> / <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>User@5678</code></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === "2fa") {
    return (
      <div style={{ maxWidth: 400, margin: "0 auto", padding: "2rem 0" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{
            width: 52, height: 52, borderRadius: "var(--border-radius-lg)",
            background: COLORS.info, border: `0.5px solid ${COLORS.infoText}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1rem", color: COLORS.infoText
          }}>
            <ShieldIcon size={24} />
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>Two-factor authentication</h2>
          <p style={{ margin: 0, color: theme.subText, fontSize: 13 }}>
            Signed in as <strong>{user?.name}</strong> — verify your identity
          </p>
        </div>

        <div style={{
          background: COLORS.bg,
          border: `0.5px solid ${COLORS.border}`,
          borderRadius: "var(--border-radius-lg)",
          padding: "1.5rem",
          display: "flex", flexDirection: "column", gap: 16
        }}>
          <TOTPDisplay code={generatedOtp} timeLeft={timeLeft} theme={theme} />

          <div>
            <label style={{ fontSize: 12, color: theme.subText, display: "block", marginBottom: 6 }}>
              Enter 6-digit code
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="000 000"
              maxLength={6}
              value={totp}
              onChange={e => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={e => e.key === "Enter" && totp.length === 6 && handleVerify2FA()}
              style={{ width: "100%", textAlign: "center", fontSize: 22, letterSpacing: 8, fontFamily: "var(--font-mono)", boxSizing: "border-box" }}
            />
          </div>

          {error && (
            <div style={{
              fontSize: 12, color: COLORS.dangerText,
              background: COLORS.danger, borderRadius: "var(--border-radius-md)", padding: "8px 12px"
            }}>
              {error}
            </div>
          )}

          

          <button
            onClick={handleVerify2FA}
            disabled={totp.length !== 6}
            style={{ width: "100%", fontSize: 14, padding: "10px" }}
          >
            Verify identity
          </button>

          <button
            onClick={() => { setStage("login"); setTotp(""); setError(""); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: theme.subText, fontSize: 13 }}
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "1.5rem 0" }}>
      <h2 style={{
  textAlign: "center",
  color: "#2e7d32",
  marginBottom: "10px"
}}>
  🔐 Authorized Access Granted
</h2>

<p style={{
  textAlign: "center",
  fontSize: "12px",
  color: "gray"
}}>
  System Status: Secure & Active 🔐
</p>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "1.5rem", paddingBottom: "1rem",
        borderBottom: `0.5px solid ${COLORS.border}`
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
  onClick={() => setDarkMode(!darkMode)}
  style={{
    padding: "6px 10px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer"
  }}
>
  {darkMode ? "🌙 Dark" : "☀️ Light"}
</button>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: COLORS.info, color: COLORS.infoText,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 500
          }}>
            {user.avatar}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: theme.subText }}>{user.role}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 11, color: COLORS.hint, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{
              display: "inline-block", width: 6, height: 6, borderRadius: "50%",
              background: COLORS.successText
            }} />
            Session {formatSession(sessionTime)}
          </div>
          <div style={{
            padding: "3px 10px", borderRadius: "var(--border-radius-md)", fontSize: 11,
            background: COLORS.success, color: COLORS.successText,
            display: "flex", alignItems: "center", gap: 5,
            border: `0.5px solid ${COLORS.successText}`
          }}>
            <ShieldIcon size={12} />
            2FA active
          </div>
          <button
            onClick={() => { setStage("login"); setUser(null); setEmail(""); setPassword(""); setTotp(""); setSessionTime(0); }}
            style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6, padding: "6px 10px" }}
          >
            <LogOutIcon />
            Sign out
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem" }}>
        {["files", "security", "session"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
           style={{
  fontSize: 13,
  padding: "8px 16px",
  borderRadius: "8px",
  background: activeTab === tab ? "#1976d2" : "#e0e0e0",
  color: activeTab === tab ? "white" : "black",
  border: "none",
  cursor: "pointer",
  marginRight: "8px"
}}
          >
           {tab === "files"
  ? "Secure Data Vault"
  : tab === "security"
  ? "Threat Monitoring"
  : "Session Status"}
          </button>
        ))}
      </div>

      {activeTab === "files" && (
  <FileVault files={user.files} theme={theme} />
)}

      {activeTab === "security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { time: "Just now", event: "Two-factor authentication verified", type: "success" },
            { time: "Just now", event: "Successful login from Hyderabad, IN", type: "success" },
            { time: "2 hours ago", event: "File 'Employee_Salaries.xlsx' accessed", type: "info" },
            { time: "1 day ago", event: "Password changed", type: "warning" },
            { time: "3 days ago", event: "Failed login attempt from unknown IP", type: "danger" },
            { time: "1 week ago", event: "2FA device enrolled", type: "success" },
          ].map((log, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "10px 12px", borderRadius: "var(--border-radius-md)",
              background: COLORS.bg, border: `0.5px solid ${COLORS.border}`
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", marginTop: 4, flexShrink: 0,
                background: log.type === "success" ? COLORS.successText
                  : log.type === "danger" ? COLORS.dangerText
                  : log.type === "warning" ? COLORS.warningText
                  : COLORS.infoText
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>{log.event}</div>
                <div style={{ fontSize: 11, color: COLORS.hint }}>{log.time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "session" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {[
              { label: "Session duration", value: formatSession(sessionTime) },
              { label: "Auth method", value: "Password + TOTP" },
              { label: "Encryption", value: "AES-256" },
              { label: "TLS version", value: "TLS 1.3" },
            ].map(stat => (
              <div key={stat.label} style={{
                padding: "12px 14px", borderRadius: "var(--border-radius-md)",
                background: COLORS.bgSecondary
              }}>
                <div style={{ fontSize: 11, color: theme.subText, marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 16, fontWeight: 500, fontFamily: "var(--font-mono)" }}>{stat.value}</div>
              </div>
            ))}
          </div>
          <div style={{
            padding: "14px", borderRadius: "var(--border-radius-md)",
            background: COLORS.bg, border: `0.5px solid ${COLORS.border}`
          }}>
            <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>Active security features</div>
            {[
              "Two-factor authentication (TOTP)",
              "Brute-force protection (lockout after 3 attempts)",
              "Session timeout (30 min inactivity)",
              "File-level AES-256 encryption",
              "Encrypted key storage (PBKDF2)",
              "Audit logging",
            ].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 13 }}>
                <span style={{ color: COLORS.successText, flexShrink: 0 }}><CheckIcon /></span>
                {f}
              </div>
            ))}
          </div>
        </div>
      )}
      <p style={{
  textAlign: "center",
  fontSize: "12px",
  color: "gray",
  marginTop: "20px"
}}>
  © 2026 SecureVault System | All Rights Reserved
</p>
    </div>
  );
}
