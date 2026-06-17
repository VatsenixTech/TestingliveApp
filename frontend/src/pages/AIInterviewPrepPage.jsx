import { useEffect, useRef, useState } from "react";
import "./AIInterviewPrepPage.css";

function AIInterviewPrepPage() {
  const [role, setRole] = useState("Data Engineer");
  const [candidateName, setCandidateName] = useState("Candidate");
  const [started, setStarted] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [report, setReport] = useState(null);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const answerRef = useRef("");

  const questions = [
    `Tell me about yourself and your experience related to ${role}.`,
    `Explain one project from your resume in detail.`,
    `What tools and technologies have you used recently?`,
    `How do you handle production issues or urgent deadlines?`,
    `Why should we hire you for the ${role} role?`,
    `What are your salary expectations and notice period?`,
  ];

  const speak = (text, autoListen = true) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setSpeaking(true);

    utterance.onend = () => {
      setSpeaking(false);

      if (autoListen && !report) {
        setTimeout(() => {
          startListening();
        }, 600);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const addMessage = (sender, text) => {
    setMessages((prev) => [
      ...prev,
      {
        sender,
        text,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const startInterview = () => {
    setStarted(true);
    setReport(null);
    setQuestionIndex(0);
    setMessages([]);
    setAnswer("");
    answerRef.current = "";

    const intro = `Hello ${candidateName}. Welcome to your AI interview for the ${role} role. Please answer naturally. I will listen and move to the next question automatically when you stop speaking. First question. ${questions[0]}`;

    setTimeout(() => {
      addMessage("ai", intro);
      speak(intro);
    }, 500);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice interview works best in Google Chrome.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    answerRef.current = "";
    setAnswer("");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }

      answerRef.current = transcript.trim();
      setAnswer(transcript.trim());

      clearTimeout(silenceTimerRef.current);

      silenceTimerRef.current = setTimeout(() => {
        stopListeningAndMoveNext();
      }, 5000);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();

    silenceTimerRef.current = setTimeout(() => {
      stopListeningAndMoveNext();
    }, 8000);
  };

  const stopListeningAndMoveNext = () => {
    clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setListening(false);

    const finalAnswer = answerRef.current.trim();

    if (!finalAnswer) {
      const repeatText =
        "I could not hear your answer clearly. Please try again. " +
        questions[questionIndex];

      addMessage("ai", repeatText);
      speak(repeatText);
      return;
    }

    addMessage("candidate", finalAnswer);
    setAnswer("");

    setTimeout(() => {
      askNextQuestion(finalAnswer);
    }, 800);
  };

  const generateFollowUp = (candidateAnswer) => {
    const text = candidateAnswer.toLowerCase();

    if (text.length < 50) {
      return "Can you explain that in more detail with a real example?";
    }

    if (role === "Data Engineer" && text.includes("spark")) {
      return "Good. How would you optimize Spark performance if data partitions are skewed?";
    }

    if (role === "Full Stack Developer" && text.includes("api")) {
      return "Good. How would you secure that API in production?";
    }

    if (role === "Business Development Executive" && text.includes("client")) {
      return "Good. How would you convert that client into a paid customer?";
    }

    if (role === "HR Executive" && text.includes("candidate")) {
      return "Good. How would you reduce candidate dropouts?";
    }

    return "Good answer. Can you explain one challenge you faced and how you solved it?";
  };

  const askNextQuestion = (candidateAnswer) => {
    const candidateAnswerCount =
      messages.filter((m) => m.sender === "candidate").length + 1;

    const shouldAskFollowUp = candidateAnswerCount % 2 === 1;

    let nextQuestion = "";

    if (shouldAskFollowUp) {
      nextQuestion = generateFollowUp(candidateAnswer);
    } else if (questionIndex < questions.length - 1) {
      const next = questionIndex + 1;
      setQuestionIndex(next);
      nextQuestion = questions[next];
    } else {
      finishInterview();
      return;
    }

    addMessage("ai", nextQuestion);
    speak(nextQuestion);
  };

  const finishInterview = () => {
    if (recognitionRef.current) recognitionRef.current.stop();

    const candidateAnswers = messages.filter((m) => m.sender === "candidate");

    const communication = Math.min(94, 68 + candidateAnswers.length * 4);
    const confidence = Math.min(92, 65 + candidateAnswers.length * 4);
    const technical = Math.min(95, 66 + candidateAnswers.length * 5);
    const overall = Math.round((communication + confidence + technical) / 3);

    setReport({
      overall,
      communication,
      confidence,
      technical,
    });

    const closing =
      "Thank you. Your AI interview is completed. I have prepared your interview feedback report.";

    addMessage("ai", closing);
    speak(closing, false);
  };

  return (
    <main className="copilot-page">
      <section className="copilot-topbar">
        <div>
          <h2>NoPromptJobs AI Interview Copilot</h2>
          <p>Human-like AI voice interview with automatic listening.</p>
        </div>

        {started && !report && (
          <button className="finish-btn" onClick={finishInterview}>
            Finish Interview
          </button>
        )}
      </section>

      {!started && (
        <section className="copilot-setup">
          <div className="setup-left">
            <p className="copilot-label">AI INTERVIEW SETUP</p>
            <h1>Practice like you are talking to a real recruiter.</h1>
            <p>
              AI will ask questions, listen to your answer, detect silence, and
              continue automatically.
            </p>
          </div>

          <div className="setup-card">
            <label>Candidate Name</label>
            <input
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />

            <label>Select Interview Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option>Data Engineer</option>
              <option>Full Stack Developer</option>
              <option>Business Development Executive</option>
              <option>HR Executive</option>
            </select>

            <label>Upload Resume</label>
            <input type="file" accept=".pdf,.doc,.docx" />

            <button onClick={startInterview}>Start AI Interview →</button>
          </div>
        </section>
      )}

      {started && (
        <section className="copilot-room">
          <aside className="interviewer-panel">
            <div className={`human-ai-avatar ${speaking ? "speaking" : ""}`}>
              <div className="avatar-head">
                <div className="avatar-eyes">
                  <span></span>
                  <span></span>
                </div>
                <div className="avatar-mouth"></div>
              </div>
            </div>

            <h3>AI Recruiter</h3>
            <p>{role} Interview</p>

            <div className="interviewer-status">
              {speaking
                ? "AI Speaking..."
                : listening
                ? "Listening to Candidate..."
                : "Ready"}
            </div>

            <button
              onClick={() =>
                speak(messages[messages.length - 1]?.text || questions[0])
              }
            >
              🔊 Repeat Question
            </button>
          </aside>

          <section className="conversation-panel">
            <div className="conversation-header">
              <div>
                <h2>Live Interview Conversation</h2>
                <p>
                  Speak naturally. AI will continue after 5 seconds of silence.
                </p>
              </div>

              <span>Question {questionIndex + 1}</span>
            </div>

            <div className="chat-window">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-bubble ${
                    msg.sender === "ai" ? "ai-msg" : "candidate-msg"
                  }`}
                >
                  <small>
                    {msg.sender === "ai" ? "AI Recruiter" : candidateName}
                  </small>
                  <p>{msg.text}</p>
                  <em>{msg.time}</em>
                </div>
              ))}
            </div>

            {!report && (
              <div className="answer-box">
                <textarea
                  value={answer}
                  readOnly
                  placeholder={
                    listening
                      ? "Listening... speak your answer now"
                      : "AI will start listening after the question"
                  }
                />

                <div className="answer-controls">
                  <button onClick={startListening}>
                    🎙 Start Listening Again
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="insight-panel">
            <h3>Live Interview Insights</h3>

            <div className="insight-card">
              <span>Communication</span>
              <strong>Good</strong>
            </div>

            <div className="insight-card">
              <span>Confidence</span>
              <strong>Improving</strong>
            </div>

            <div className="insight-card">
              <span>Technical Depth</span>
              <strong>Moderate</strong>
            </div>

            <div className="tips-box">
              <h4>AI Tips</h4>
              <p>Use real project examples.</p>
              <p>Add numbers like users, records, time, cost or revenue.</p>
              <p>Explain your individual contribution clearly.</p>
            </div>
          </aside>
        </section>
      )}

      {report && (
        <section className="final-report">
          <h2>AI Interview Report</h2>

          <div className="report-grid">
            <div className="report-score">
              <span>{report.overall}%</span>
              <p>Overall Score</p>
            </div>

            <div className="report-metrics">
              <p>Communication: {report.communication}%</p>
              <p>Confidence: {report.confidence}%</p>
              <p>Technical: {report.technical}%</p>
            </div>
          </div>

          <div className="report-columns">
            <div>
              <h3>Strengths</h3>
              <p>✅ Good communication flow</p>
              <p>✅ Able to explain experience</p>
              <p>✅ Shows role understanding</p>
            </div>

            <div>
              <h3>Improvements</h3>
              <p>⚠ Add measurable project results</p>
              <p>⚠ Explain architecture more clearly</p>
              <p>⚠ Use STAR format for behavioral answers</p>
            </div>
          </div>

          <button onClick={startInterview}>Restart Interview</button>
        </section>
      )}
    </main>
  );
}

export default AIInterviewPrepPage;