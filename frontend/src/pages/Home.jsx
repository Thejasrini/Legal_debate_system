import { useState } from "react";

import QuestionBox from "../components/QuestionBox";
import SupportCard from "../components/SupportCard";
import OpposeCard from "../components/OpposeCard";
import JudgeCard from "../components/JudgeCard";

export default function Home() {
  const [result, setResult] = useState(null);

  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", textAlign: "left" }}>
      <h1 style={{ textAlign: "center" }}>⚖️ LexAgent Courtroom</h1>
      <p style={{ textAlign: "center", color: "#888", marginBottom: "30px" }}>
        Legal Multi-Agent Debate Room
      </p>

      <QuestionBox setResult={setResult} />

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "30px", marginTop: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <SupportCard data={result.support} />
            <OpposeCard data={result.oppose} />
          </div>

          <JudgeCard data={result.judge} />
        </div>
      )}
    </div>
  );
}