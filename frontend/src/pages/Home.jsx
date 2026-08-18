import { useState, useEffect } from "react";
import QuestionBox from "../components/QuestionBox";
import SupportCard from "../components/SupportCard";
import OpposeCard from "../components/OpposeCard";
import JudgeCard from "../components/JudgeCard";
import { streamDebate } from "../services/api";

export default function Home() {
  // Theme Preference State (dark | light)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("lexagent-theme");
    if (saved) return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  const [threadId, setThreadId] = useState(null);
  const [caseNumber, setCaseNumber] = useState("CPA/2019/0847");
  const [currentTime, setCurrentTime] = useState("");

  const [pastTurns, setPastTurns] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [category, setCategory] = useState(null);
  const [outOfScope, setOutOfScope] = useState(false);
  const [outOfScopeMessage, setOutOfScopeMessage] = useState("");
  
  const [support, setSupport] = useState(null);
  const [oppose, setOppose] = useState(null);
  const [judge, setJudge] = useState(null);
  
  const [supportLoading, setSupportLoading] = useState(false);
  const [opposeLoading, setOpposeLoading] = useState(false);
  const [judgeLoading, setJudgeLoading] = useState(false);

  const [error, setError] = useState(null);

  // Apply Theme Preference to DOM root attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("lexagent-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Live Monospace Clock Effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).toUpperCase() + " " + now.toLocaleTimeString("en-US", { hour12: false });
      setCurrentTime(timeStr + " IST");
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update Case Number when threadId is assigned
  useEffect(() => {
    if (threadId) {
      const shortId = threadId.slice(0, 4).toUpperCase();
      setCaseNumber(`CPA/2019/${shortId}`);
    }
  }, [threadId]);

  const handleStartNewCase = () => {
    setThreadId(null);
    setCaseNumber(`CPA/2019/${Math.floor(1000 + Math.random() * 9000)}`);
    setPastTurns([]);
    setCurrentQuestion("");
    setCategory(null);
    setOutOfScope(false);
    setOutOfScopeMessage("");
    setSupport(null);
    setOppose(null);
    setJudge(null);
    setError(null);
    setSupportLoading(false);
    setOpposeLoading(false);
    setJudgeLoading(false);
    setIsAnalyzing(false);
  };

  const handleStartStream = (question) => {
    // Archive previous turn if completed
    if (judge && currentQuestion) {
      setPastTurns((prev) => [
        ...prev,
        {
          question: currentQuestion,
          category,
          support,
          oppose,
          judge
        }
      ]);
    }

    setCurrentQuestion(question);
    setIsAnalyzing(true);
    setCategory(null);
    setOutOfScope(false);
    setOutOfScopeMessage("");
    setSupport(null);
    setOppose(null);
    setJudge(null);
    setError(null);

    setSupportLoading(true);
    setOpposeLoading(true);
    setJudgeLoading(true);

    streamDebate(
      question,
      threadId,
      (eventType, data) => {
        if (eventType === "thread") {
          setThreadId(data.threadId);
        } else if (eventType === "intent") {
          setCategory(data.category);
        } else if (eventType === "outOfScope") {
          setOutOfScope(true);
          setOutOfScopeMessage(data.message);
          setCategory(data.category);
          setSupportLoading(false);
          setOpposeLoading(false);
          setJudgeLoading(false);
          setIsAnalyzing(false);
        } else if (eventType === "support") {
          setSupport(data);
          setSupportLoading(false);
        } else if (eventType === "oppose") {
          setOppose(data);
          setOpposeLoading(false);
        } else if (eventType === "judge") {
          setJudge(data);
          setJudgeLoading(false);
        }
      },
      (errMessage) => {
        console.error("Stream Error:", errMessage);
        setError(errMessage);
        setSupportLoading(false);
        setOpposeLoading(false);
        setJudgeLoading(false);
        setIsAnalyzing(false);
      },
      () => {
        setIsAnalyzing(false);
      }
    );
  };

  // Determine current live status pill
  const getStatusPill = () => {
    if (outOfScope) {
      return (
        <span className="docket-status-pill out-of-scope">
          <span className="status-dot"></span> OUT OF SCOPE
        </span>
      );
    }
    if (isAnalyzing) {
      return (
        <span className="docket-status-pill in-session">
          <span className="status-dot"></span> IN SESSION
        </span>
      );
    }
    if (judge) {
      return (
        <span className="docket-status-pill verdict">
          <span className="status-dot"></span> VERDICT DELIVERED
        </span>
      );
    }
    return (
      <span className="docket-status-pill draft">
        <span className="status-dot"></span> CASE DRAFT
      </span>
    );
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-navy)" }}>
      
      {/* 1. Top Header Bar */}
      <header className="docket-topbar">
        <div className="docket-title-group">
          <h1 className="font-serif text-brass" style={{ fontSize: "1.25rem", margin: 0, letterSpacing: "0.5px" }}>
            ⚖️ LEXAGENT COURTROOM
          </h1>
          <span className="docket-number">{caseNumber}</span>
          {getStatusPill()}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span className="font-mono text-muted" style={{ fontSize: "0.78rem" }}>
            {currentTime}
          </span>

          {/* Theme Preference Toggle */}
          <button className="btn-theme-toggle" onClick={toggleTheme} title="Switch UI Theme Preference">
            {theme === "dark" ? "☀️ Light Theme" : "🌙 Dark Theme"}
          </button>

          {threadId && (
            <button className="btn-outline-brass" onClick={handleStartNewCase}>
              ➕ Start New Case
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "28px 24px 160px 24px" }}>
        
        {/* Subtitle / Context Header */}
        <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2 className="font-serif text-parchment" style={{ fontSize: "1.5rem", fontWeight: "600" }}>
              District Consumer Disputes Courtroom Terminal
            </h2>
            <p className="text-muted font-sans" style={{ fontSize: "0.9rem", marginTop: "4px" }}>
              Adversarial AI Courtroom Simulator strictly grounded in the <strong className="text-brass">Consumer Protection Act, 2019</strong>.
            </p>
          </div>

          <div className="font-mono text-muted" style={{ fontSize: "0.8rem", textAlign: "right" }}>
            Corpus: <span className="text-brass">Consumer_Protection_Act_2019.pdf</span>
          </div>
        </div>

        {/* 2. Split Case Intake Hero Panel */}
        <QuestionBox onSubmit={handleStartStream} loading={isAnalyzing} />

        {/* Hairline Divider */}
        <hr className="hairline-divider" />

        {/* Error Notification */}
        {error && (
          <div style={{ padding: "16px", backgroundColor: "var(--courtroom-red-bg)", border: "1px solid var(--courtroom-red)", color: "var(--courtroom-red-bright)", borderRadius: "6px", marginBottom: "24px" }}>
            ⚠️ <strong>Filing Error:</strong> {error}
          </div>
        )}

        {/* Out of Scope Banner */}
        {outOfScope && (
          <div className="docket-card" style={{ borderLeft: "4px solid var(--courtroom-red)", marginBottom: "30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span style={{ fontSize: "1.5rem" }}>🛑</span>
              <h3 className="font-serif" style={{ color: "var(--courtroom-red-bright)", margin: 0 }}>
                Jurisdictional Exception: Domain Out of Scope
              </h3>
            </div>
            <p style={{ fontSize: "1rem", color: "var(--text-parchment)", margin: 0 }}>
              {outOfScopeMessage}
            </p>
            {category && (
              <div className="font-mono text-muted" style={{ marginTop: "12px", fontSize: "0.85rem" }}>
                Classified Non-Consumer Category: <strong className="text-brass">{category}</strong>
              </div>
            )}
          </div>
        )}

        {/* 3. Past Turns Accordion (Case History Drawer) */}
        {pastTurns.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <div className="font-mono text-brass" style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
              📜 Case History Log ({pastTurns.length} Previous {pastTurns.length === 1 ? "Pleading" : "Pleadings"})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pastTurns.map((turn, idx) => (
                <details
                  key={idx}
                  className="docket-card"
                  style={{ cursor: "pointer" }}
                >
                  <summary className="font-serif text-brass" style={{ fontSize: "1.05rem", fontWeight: "600" }}>
                    Turn #{idx + 1}: "{turn.question}"
                  </summary>
                  <div style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-hairline)", fontSize: "0.9rem" }}>
                    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "10px" }}>
                      <span className="font-mono text-muted">Category: <strong className="text-parchment">{turn.category || "Defective Product"}</strong></span>
                      <span className="font-mono text-muted">Verdict: <strong style={{ color: turn.judge?.winningSide === "Support" ? "var(--courtroom-green-bright)" : "var(--courtroom-red-bright)" }}>{turn.judge?.winningSide} Favored</strong></span>
                      <span className="font-mono text-muted">Confidence: <strong className="text-brass">{turn.judge?.confidence}%</strong></span>
                    </div>
                    <p style={{ color: "var(--text-parchment)", fontStyle: "italic", margin: 0 }}>
                      "{turn.judge?.decision}"
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* 4. Active Debate Courtroom View */}
        {!outOfScope && (isAnalyzing || support || oppose || judge) && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            {/* Category Tag */}
            {category && (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="font-mono text-brass" style={{ backgroundColor: "var(--accent-brass-light)", padding: "4px 12px", borderRadius: "4px", border: "1px solid var(--border-hairline-bright)", fontSize: "0.85rem" }}>
                  🏷️ STATUTORY CATEGORY: {category.toUpperCase()}
                </span>
              </div>
            )}

            {/* Facing Agent Panels (Petitioner vs Respondent) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              
              {/* Petitioner Column (Support) */}
              <div>
                {supportLoading ? (
                  <div className="docket-card petitioner-panel">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="gavel-icon-animated">🟢</span>
                      <h3 className="font-serif" style={{ color: "var(--courtroom-green-bright)", margin: 0 }}>
                        Petitioner Counsel Filing Arguments...
                      </h3>
                    </div>
                    <p className="font-mono text-muted" style={{ fontSize: "0.85rem", marginTop: "10px" }}>
                      Searching ChromaDB legal context & evaluating consumer rights under CPA 2019...
                    </p>
                  </div>
                ) : (
                  <SupportCard data={support} />
                )}
              </div>

              {/* Respondent Column (Oppose) */}
              <div>
                {opposeLoading ? (
                  <div className="docket-card respondent-panel">
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="gavel-icon-animated">🔴</span>
                      <h3 className="font-serif" style={{ color: "var(--courtroom-red-bright)", margin: 0 }}>
                        Respondent Counsel Preparing Defenses...
                      </h3>
                    </div>
                    <p className="font-mono text-muted" style={{ fontSize: "0.85rem", marginTop: "10px" }}>
                      Formulating statutory objections & checking proof requirements under Section 39...
                    </p>
                  </div>
                ) : (
                  <OpposeCard data={oppose} />
                )}
              </div>

            </div>

            {/* Bench Column (Judge AI Verdict) */}
            <div>
              {judgeLoading ? (
                <div className="docket-card bench-panel">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="gavel-icon-animated">🔨</span>
                    <h3 className="font-serif text-brass" style={{ margin: 0 }}>
                      The Bench Presiding & Evaluating Pleadings...
                    </h3>
                  </div>
                  <p className="font-mono text-muted" style={{ fontSize: "0.85rem", marginTop: "10px" }}>
                    Weighing Petitioner arguments against Respondent defenses for final statutory verdict...
                  </p>
                </div>
              ) : (
                <JudgeCard data={judge} />
              )}
            </div>

          </div>
        )}

      </main>

    </div>
  );
}