export default function JudgeCard({ data }) {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <div className="docket-card bench-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 className="font-serif text-brass">THE BENCH — JUDGE VERDICT</h2>
        </div>
        <p style={{ marginTop: "12px", color: "var(--text-parchment)" }}>{data}</p>
      </div>
    );
  }

  const winningColor =
    data.winningSide === "Support"
      ? "#52B788"
      : data.winningSide === "Oppose"
      ? "#E63946"
      : "#C9A961";

  return (
    <div className="docket-card bench-panel" style={{ marginTop: "10px" }}>
      
      {/* Top Header Row with Gavel Strike Icon & Stamped VERDICT Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--border-hairline-bright)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span className="gavel-icon-animated" style={{ fontSize: "2rem" }}>🔨</span>
          <div>
            <h2 className="font-serif text-brass" style={{ margin: 0, fontSize: "1.4rem", letterSpacing: "0.5px" }}>
              THE BENCH VERDICT & OPINION
            </h2>
            <div className="font-mono text-muted" style={{ fontSize: "0.8rem", marginTop: "2px" }}>
              District Consumer Disputes Redressal Commission | CPA, 2019
            </div>
          </div>
        </div>

        {/* Stamped VERDICT Badge */}
        <div className="verdict-stamp-badge">
          {data.winningSide ? `${data.winningSide.toUpperCase()} FAVORED` : "VERDICT DELIVERED"}
        </div>
      </div>

      {/* Decision Summary */}
      {data.decision && (
        <div style={{ margin: "20px 0", padding: "16px", backgroundColor: "rgba(201, 169, 97, 0.08)", borderLeft: "4px solid var(--accent-brass)", borderRadius: "0 6px 6px 0" }}>
          <div className="font-mono text-brass" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
            Official Finding & Decision
          </div>
          <p className="font-serif" style={{ fontSize: "1.1rem", color: "var(--text-parchment)", lineHeight: "1.6", margin: 0 }}>
            "{data.decision}"
          </p>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "12px", backgroundColor: "var(--surface-navy)", borderRadius: "6px", border: "1px solid var(--border-hairline)" }}>
          <div className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>Preponderance Side</div>
          <div className="font-serif" style={{ fontSize: "1.25rem", color: winningColor, fontWeight: "700", marginTop: "4px" }}>
            {data.winningSide || "Inconclusive"}
          </div>
        </div>

        <div style={{ padding: "12px", backgroundColor: "var(--surface-navy)", borderRadius: "6px", border: "1px solid var(--border-hairline)" }}>
          <div className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase" }}>Statutory Confidence</div>
          <div className="font-mono text-brass" style={{ fontSize: "1.25rem", fontWeight: "700", marginTop: "4px" }}>
            {data.confidence !== undefined ? `${data.confidence}%` : "N/A"}
          </div>
        </div>
      </div>

      {/* Grid of Legal Reasoning: Legal Rule & Application */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {data.legalRule && (
          <div style={{ padding: "16px", backgroundColor: "var(--surface-navy)", borderRadius: "6px", border: "1px solid var(--border-hairline)" }}>
            <div className="font-mono text-brass" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              📜 Applicable Statutory Rule
            </div>
            <p style={{ fontSize: "0.92rem", color: "var(--text-parchment)", margin: 0 }}>
              {data.legalRule}
            </p>
          </div>
        )}

        {data.application && (
          <div style={{ padding: "16px", backgroundColor: "var(--surface-navy)", borderRadius: "6px", border: "1px solid var(--border-hairline)" }}>
            <div className="font-mono text-brass" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              🏛️ Judicial Application to Case Facts
            </div>
            <p style={{ fontSize: "0.92rem", color: "var(--text-parchment)", margin: 0 }}>
              {data.application}
            </p>
          </div>
        )}
      </div>

      {/* Assessments of Counsel */}
      {(data.supportAssessment || data.opposeAssessment) && (
        <div style={{ marginBottom: "20px", padding: "16px", backgroundColor: "var(--surface-navy)", borderRadius: "6px", border: "1px solid var(--border-hairline)" }}>
          <div className="font-mono text-muted" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>
            Judicial Assessment of Arguments
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
            {data.supportAssessment && (
              <div>
                <strong style={{ color: "#52B788" }}>Petitioner Assessment: </strong>
                <span style={{ color: "var(--text-parchment)" }}>{data.supportAssessment}</span>
              </div>
            )}
            {data.opposeAssessment && (
              <div>
                <strong style={{ color: "#F87171" }}>Respondent Assessment: </strong>
                <span style={{ color: "var(--text-parchment)" }}>{data.opposeAssessment}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Evidence Required */}
      {data.evidenceRequired && data.evidenceRequired.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <div className="font-mono text-muted" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
            🔍 Evidentiary Proof Required For Final Adjudication
          </div>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.9rem", color: "var(--text-parchment)", display: "flex", flexDirection: "column", gap: "4px" }}>
            {data.evidenceRequired.map((item, i) => (
              <li key={i}>{typeof item === "string" ? item : JSON.stringify(item)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      {data.recommendation && (
        <div style={{ padding: "14px 18px", backgroundColor: "rgba(201, 169, 97, 0.12)", borderRadius: "6px", border: "1px solid var(--accent-brass)" }}>
          <div className="font-mono text-brass" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
            📋 Bench Advisory & Next Statutory Steps
          </div>
          <p style={{ fontSize: "0.95rem", color: "var(--text-parchment)", margin: 0, fontWeight: "500" }}>
            {data.recommendation}
          </p>
        </div>
      )}
    </div>
  );
}