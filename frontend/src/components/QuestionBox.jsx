import { useState } from "react";
import API from "../services/api";

export default function QuestionBox({ setResult }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);

      const response = await API.post("/debate", {
        question,
      });

      setResult(response.data);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "30px" }}>
      <textarea
        rows="5"
        cols="80"
        placeholder="Ask your legal question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleSubmit}>
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </div>
  );
}