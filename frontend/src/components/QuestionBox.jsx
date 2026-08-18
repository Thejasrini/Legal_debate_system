import { useState } from "react";

export default function QuestionBox({ onSubmit, loading }) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!question.trim() || loading) return;
    onSubmit(question);
  };

  // Extract petitioner & respondent preview framing from input text dynamically
  const getPetitionerPreview = () => {
    if (!question.trim()) return "Consumer seeking remedies for defective product, service deficiency, or unfair trade practice.";
    return question.length > 90 ? question.slice(0, 90) + "..." : question;
  };

  const getRespondentPreview = () => {
    if (!question.trim()) return "Product Manufacturer / Seller maintaining statutory compliance and evidentiary proof challenges.";
    if (question.toLowerCase().includes("laptop") || question.toLowerCase().includes("phone") || question.toLowerCase().includes("appliance")) {
      return "Product Manufacturer / Seller asserting statutory exceptions under Section 87 and proof requirements under Section 39.";
    }
    if (question.toLowerCase().includes("ad") || question.toLowerCase().includes("coaching") || question.toLowerCase().includes("advertisement")) {
      return "Service Provider asserting Central Authority inquiry requirements under Section 18.";
    }
    return "Respondent Entity challenging factual proof satisfaction before District Commission.";
  };

  return (
    <div style={{ marginBottom: "35px" }}>
      
      {/* Split Intake Panel Hero Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "24px", alignItems: "stretch" }}>
        
        {/* Left Side: Legal Filing Form */}
        <div className="docket-card" style={{ borderTop: "3px solid var(--accent-brass)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 className="font-serif text-brass" style={{ margin: 0, fontSize: "1.15rem", letterSpacing: "0.5px" }}>
              📋 CASE INTAKE & PLEADINGS FORM
            </h3>
            <span className="font-mono text-muted" style={{ fontSize: "0.75rem", backgroundColor: "var(--accent-brass-light)", padding: "2px 8px", borderRadius: "4px" }}>
              FORM CPA-1
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="font-mono text-muted" style={{ display: "block", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>
              Statutory Claim / Facts Statement
            </label>

            <textarea
              rows="5"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px",
                fontSize: "0.98rem",
                color: "var(--text-parchment)",
                backgroundColor: "var(--bg-navy)",
                border: "1px solid var(--border-hairline-bright)",
                borderRadius: "4px",
                fontFamily: "var(--font-sans)",
                resize: "vertical",
                lineHeight: "1.5"
              }}
              placeholder="State the consumer dispute facts (e.g., 'I bought a defective laptop that stopped working within 3 days. The seller refused to replace it or refund my money...')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <div style={{ marginTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div className="font-mono text-muted" style={{ fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ color: "var(--accent-brass)" }}>🛡️ Scope Authority:</span> Consumer Protection Act, 2019
              </div>

              <button
                type="submit"
                className="btn-brass"
                disabled={loading || !question.trim()}
              >
                {loading ? (
                  <>
                    <span className="gavel-icon-animated">🔨</span> Session In Progress...
                  </>
                ) : (
                  <>
                    ⚖️ File & Begin Session
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Live "Petitioner vs Respondent" Framing Preview */}
        <div className="docket-card" style={{ borderTop: "3px solid var(--border-hairline-bright)", backgroundColor: "var(--surface-card)" }}>
          <div className="font-mono text-brass" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>
            ⚖️ Live Case Framing Preview
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            
            {/* Petitioner Framing */}
            <div style={{ padding: "10px 12px", backgroundColor: "var(--surface-navy)", borderRadius: "4px", borderLeft: "3px solid var(--courtroom-green)" }}>
              <div className="font-mono" style={{ color: "#52B788", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "4px" }}>
                Petitioner (Consumer)
              </div>
              <div style={{ fontSize: "0.88rem", color: "var(--text-parchment)", fontStyle: "italic" }}>
                "{getPetitionerPreview()}"
              </div>
            </div>

            {/* VS Divider */}
            <div className="font-mono text-brass" style={{ textAlign: "center", fontSize: "0.85rem", fontWeight: "700" }}>
              — VERSUS —
            </div>

            {/* Respondent Framing */}
            <div style={{ padding: "10px 12px", backgroundColor: "var(--surface-navy)", borderRadius: "4px", borderLeft: "3px solid var(--courtroom-red)" }}>
              <div className="font-mono" style={{ color: "#F87171", fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "4px" }}>
                Respondent (Seller / Entity)
              </div>
              <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                "{getRespondentPreview()}"
              </div>
            </div>

            <div className="font-mono text-muted" style={{ fontSize: "0.75rem", marginTop: "4px", textAlign: "right" }}>
              Forum: District Commission
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}