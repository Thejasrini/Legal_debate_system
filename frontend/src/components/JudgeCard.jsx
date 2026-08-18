export default function JudgeCard({ data }) {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <div className="card judge-card">
        <h2>⚖ JUDGE RULING</h2>
        <p>{data}</p>
      </div>
    );
  }

  const renderReasoningItem = (item) => {
    if (!item) return null;
    if (typeof item === "string") return item;
    if (typeof item === "object") {
      const textContent = item.point || item.reason || item.text || JSON.stringify(item);
      const basisList = Array.isArray(item.legalBasis) ? item.legalBasis : [];

      return (
        <div>
          <div>{textContent}</div>
          {basisList.length > 0 && (
            <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {basisList.map((basis, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "#e8f5e9",
                    color: "#1b5e20",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "1px solid #c8e6c9",
                    fontSize: "0.82rem",
                    fontWeight: "600"
                  }}
                >
                  📜 {basis.section || "Section"} ({basis.title || "CPA 2019"}{basis.page ? `, Page ${basis.page}` : ""})
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }
    return String(item);
  };

  const unsupportedList = data.unsupportedIssues || data.unsupportedClaims || [];

  return (
    <div className="card judge-card">
      <h2>⚖ JUDGE RULING</h2>

      {data.winningSide && (
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "10px" }}>
          Winning Side:{" "}
          <span style={{ color: data.winningSide === "Support" ? "#2e7d32" : data.winningSide === "Oppose" ? "#c62828" : "#f57c00" }}>
            {data.winningSide}
          </span>
        </div>
      )}

      {data.decision && (
        <div style={{ marginBottom: "12px" }}>
          <h3>Decision</h3>
          <p>{data.decision}</p>
        </div>
      )}

      {data.legalRule && (
        <div style={{ marginBottom: "12px" }}>
          <h3>📜 Legal Rule (Retrieved Act)</h3>
          <p>{data.legalRule}</p>
        </div>
      )}

      {data.application && (
        <div style={{ marginBottom: "12px" }}>
          <h3>📌 Application to Facts</h3>
          <p>{data.application}</p>
        </div>
      )}

      {data.supportAssessment && (
        <div style={{ marginBottom: "10px", backgroundColor: "#e8f5e9", padding: "8px 12px", borderRadius: "6px", border: "1px solid #c8e6c9" }}>
          <strong style={{ color: "#2e7d32" }}>🟢 Support Argument Assessment:</strong>
          <p style={{ margin: "4px 0 0 0", color: "#1b5e20" }}>{data.supportAssessment}</p>
        </div>
      )}

      {data.opposeAssessment && (
        <div style={{ marginBottom: "12px", backgroundColor: "#ffebee", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ffcdd2" }}>
          <strong style={{ color: "#c62828" }}>🔴 Oppose Argument Assessment:</strong>
          <p style={{ margin: "4px 0 0 0", color: "#b71c1c" }}>{data.opposeAssessment}</p>
        </div>
      )}

      {data.verifiedClaims && data.verifiedClaims.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <h3>🔍 Claim Verification Protocol</h3>
          <ul style={{ paddingLeft: "18px" }}>
            {data.verifiedClaims.map((vc, i) => (
              <li key={i} style={{ marginBottom: "8px" }}>
                <div style={{ fontWeight: "600" }}>
                  [{vc.side}] {vc.claim}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      backgroundColor: vc.status === "SUPPORTED" || vc.status === "EXPLICITLY SUPPORTED" ? "#e8f5e9" : vc.status === "CONTRADICTED" ? "#ffebee" : "#fffde7",
                      color: vc.status === "SUPPORTED" || vc.status === "EXPLICITLY SUPPORTED" ? "#1b5e20" : vc.status === "CONTRADICTED" ? "#c62828" : "#f57f17",
                      border: `1px solid ${vc.status === "SUPPORTED" || vc.status === "EXPLICITLY SUPPORTED" ? "#c8e6c9" : vc.status === "CONTRADICTED" ? "#ffcdd2" : "#fff59d"}`
                    }}
                  >
                    {vc.status}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#555" }}>{vc.reason}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.reasoning && data.reasoning.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <h3>Reasoning</h3>
          <ul>
            {data.reasoning.map((r, i) => (
              <li key={i}>{renderReasoningItem(r)}</li>
            ))}
          </ul>
        </div>
      )}

      {unsupportedList.length > 0 && (
        <div style={{ marginTop: "14px", padding: "10px", backgroundColor: "#ffebee", borderRadius: "6px", border: "1px solid #ffcdd2" }}>
          <h3 style={{ color: "#c62828", margin: "0 0 6px 0", fontSize: "0.95rem" }}>🛑 Unsupported / Unresolved Issues</h3>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {unsupportedList.map((rej, i) => (
              <li key={i} style={{ color: "#b71c1c", fontSize: "0.9rem" }}>
                {typeof rej === "string" ? rej : JSON.stringify(rej)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.evidenceRequired && data.evidenceRequired.length > 0 && (
        <div style={{ marginTop: "14px" }}>
          <h3>📋 Evidence Required</h3>
          <ul>
            {data.evidenceRequired.map((ev, i) => (
              <li key={i}>{typeof ev === "string" ? ev : JSON.stringify(ev)}</li>
            ))}
          </ul>
        </div>
      )}

      {(data.recommendation || data.recommendedAction) && (
        <div style={{ marginTop: "12px" }}>
          <h3>Recommendation</h3>
          <p>{data.recommendation || data.recommendedAction}</p>
        </div>
      )}

      {data.confidence !== undefined && (
        <div style={{ marginTop: "15px", fontWeight: "bold" }}>
          Confidence: {data.confidence}%
        </div>
      )}
    </div>
  );
}