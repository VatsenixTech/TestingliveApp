import { useEffect, useRef, useState } from "react";
import "./AIInterviewPrepPage.css";

function AIInterviewPrepPage() {
  const [activeMenu, setActiveMenu] = useState(() => {
  const params = new URLSearchParams(window.location.search);
  return params.get("tab") || "Live Interview";
});
  const [role, setRole] = useState("Data Engineer");
  const [candidateName, setCandidateName] = useState("Candidate");
  const [started, setStarted] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [report, setReport] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [voices, setVoices] = useState([]);
  const [savedReports, setSavedReports] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("interviewReports")) || [];
    } catch {
      return [];
    }
  });

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const noSpeechTimerRef = useRef(null);
  const answerRef = useRef("");
  const timerRef = useRef(null);
  const femaleVoiceRef = useRef(null);

  const questionBank = {
    "Data Engineer": [
      "Tell me about yourself and your experience related to Data Engineering.",
      "Explain one data engineering project from your resume.",
      "How do you design an ETL pipeline?",
      "How would you optimize a slow Spark job?",
      "Explain partitioning, bucketing and Parquet file format.",
      "How do you handle data quality issues in production?",
      "Explain incremental loading and CDC.",
      "Why should we hire you as a Data Engineer?",
    ],
    SAP: [
      "Tell me about your SAP experience.",
      "Which SAP modules have you worked on?",
      "Explain one SAP implementation or support project.",
      "How do you handle SAP production tickets?",
      "Explain configuration versus customization.",
      "How do you work with functional and technical teams?",
      "What challenges have you faced in SAP support?",
      "Why should we hire you for the SAP role?",
    ],
    HR: [
      "Tell me about yourself and your HR experience.",
      "How do you source and screen candidates?",
      "How do you handle candidate dropouts?",
      "Explain your onboarding experience.",
      "How do you manage employee grievances?",
      "What HR tools or ATS platforms have you used?",
      "How do you handle urgent hiring requirements?",
      "Why should we hire you for the HR role?",
    ],
    Cybersecurity: [
      "Tell me about your cybersecurity experience.",
      "Explain CIA triad with examples.",
      "How do you respond to a security incident?",
      "What is vulnerability assessment and penetration testing?",
      "Explain phishing, malware and ransomware prevention.",
      "How do you secure cloud infrastructure?",
      "What security tools have you used?",
      "Why should we hire you for the Cybersecurity role?",
    ],
    "Data Science": [
      "Tell me about yourself and your Data Science experience.",
      "Explain one machine learning project from your resume.",
      "How do you handle missing values and outliers?",
      "Explain overfitting and underfitting.",
      "How do you evaluate classification models?",
      "What is feature engineering?",
      "Explain a real business problem you solved using data.",
      "Why should we hire you for the Data Science role?",
    ],
    DevOps: [
      "Tell me about your DevOps experience.",
      "Explain one CI/CD pipeline you worked on.",
      "How do you deploy applications using Docker and Kubernetes?",
      "How do you monitor production systems?",
      "How do you handle deployment failures?",
      "Explain blue-green deployment and rollback strategy.",
      "How do you secure cloud infrastructure in DevOps?",
      "Why should we hire you for the DevOps role?",
    ],
  };

  const questions = questionBank[role] || questionBank["Data Engineer"];

  const pdfFolders = [
    {
      title: "Data Engineering",
      icon: "🗄️",
      desc: "Real-time ETL, Spark, SQL, cloud pipeline and project scenario PDFs.",
      fileKey: "data-engineering",
      count: "12 PDFs",
    },
    {
      title: "Cybersecurity",
      icon: "🛡️",
      desc: "SOC, SIEM, VAPT, incident response, cloud security and threat scenario PDFs.",
      fileKey: "cybersecurity",
      count: "9 PDFs",
    },
    {
      title: "SAP",
      icon: "🏢",
      desc: "SAP support, implementation, ticket handling, FICO, ABAP and module scenario PDFs.",
      fileKey: "sap",
      count: "8 PDFs",
    },
    {
      title: "DevOps",
      icon: "⚙️",
      desc: "CI/CD, Docker, Kubernetes, Linux, AWS deployment and monitoring scenario PDFs.",
      fileKey: "devops",
      count: "10 PDFs",
    },
    {
      title: "Data Science",
      icon: "🤖",
      desc: "Machine learning, Python, model evaluation, feature engineering and business case PDFs.",
      fileKey: "data-science",
      count: "11 PDFs",
    },
    {
      title: "HR Interview",
      icon: "👥",
      desc: "Behavioral, HR round, communication, STAR format and managerial scenario PDFs.",
      fileKey: "hr",
      count: "7 PDFs",
    },
  ];

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      femaleVoiceRef.current =
        availableVoices.find((v) => v.name.toLowerCase().includes("female")) ||
        availableVoices.find((v) => v.name.toLowerCase().includes("zira")) ||
        availableVoices.find((v) => v.name.toLowerCase().includes("samantha")) ||
        availableVoices.find((v) =>
          v.name.toLowerCase().includes("google uk english female")
        ) ||
        availableVoices.find((v) => v.lang?.toLowerCase().includes("en"));
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  useEffect(() => {
  if (started && !report) {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= 1800) {
          clearInterval(timerRef.current);
          finishInterview();
          return 1800;
        }

        return prev + 1;
      });
    }, 1000);
  }

  return () => clearInterval(timerRef.current);
}, [started, report]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      clearTimeout(silenceTimerRef.current);
      clearTimeout(noSpeechTimerRef.current);
      clearInterval(timerRef.current);

      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };
const getTimeRemaining = () => {
  const remaining = Math.max(1800 - elapsed, 0);
  return formatTime(remaining);
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

  const speak = (text, autoListen = true) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (femaleVoiceRef.current) {
      utterance.voice = femaleVoiceRef.current;
    }

    utterance.rate = 0.88;
    utterance.pitch = 1.18;
    utterance.volume = 1;

    utterance.onstart = () => {
      setSpeaking(true);
      setListening(false);
    };

    utterance.onend = () => {
      setSpeaking(false);

      if (autoListen && !report) {
        setTimeout(() => {
          startListening();
        }, 1500);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const startInterview = () => {
    setActiveMenu("Live Interview");
    setStarted(true);
    setReport(null);
    setQuestionIndex(0);
    setMessages([]);
    setAnswer("");
    setElapsed(0);
    answerRef.current = "";

    const intro = `Hello ${candidateName}. I am Takshvi, your female AI interviewer. Welcome to your ${role} interview. Please answer naturally. I will listen to your answer and continue automatically after you stop speaking for five seconds. First question. ${questions[0]}`;

    setTimeout(() => {
      addMessage("ai", intro);
      speak(intro);
    }, 600);
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
      clearTimeout(noSpeechTimerRef.current);

      noSpeechTimerRef.current = setTimeout(() => {
        if (!answerRef.current.trim()) {
          const waitText =
            "Take your time. I am still listening. You can start your answer now.";
          addMessage("ai", waitText);
          speak(waitText);
        }
      }, 15000);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }

      answerRef.current = transcript.trim();
      setAnswer(transcript.trim());

      clearTimeout(noSpeechTimerRef.current);
      clearTimeout(silenceTimerRef.current);

      silenceTimerRef.current = setTimeout(() => {
        stopListeningAndMoveNext();
      }, 5000);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListeningAndMoveNext = () => {
    clearTimeout(silenceTimerRef.current);
    clearTimeout(noSpeechTimerRef.current);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setListening(false);

    const finalAnswer = answerRef.current.trim();

    if (!finalAnswer) {
      return;
    }

    addMessage("candidate", finalAnswer);
    setAnswer("");

    setTimeout(() => {
      askNextQuestion(finalAnswer);
    }, 900);
  };

  const generateFollowUp = (candidateAnswer) => {
    const text = candidateAnswer.toLowerCase();

    if (text.length < 55) {
      return "Can you explain that with one real example from your work or project?";
    }

    if (role === "Data Engineer") {
      if (text.includes("spark")) {
        return "Good. How would you optimize Spark performance when data partitions are skewed?";
      }
      if (text.includes("pipeline") || text.includes("etl")) {
        return "Good. How do you monitor and recover a failed data pipeline?";
      }
      return "Good. How do you ensure data quality and reliability in production?";
    }

    if (role === "SAP") {
      return "Good. Can you explain one SAP issue you solved end to end?";
    }

    if (role === "HR") {
      return "Good. How would you reduce candidate dropouts after offer release?";
    }

    if (role === "Cybersecurity") {
      return "Good. What steps would you take in the first 30 minutes of a security incident?";
    }

    if (role === "Data Science") {
      return "Good. How do you check whether your model is overfitting?";
    }

    if (role === "DevOps") {
      return "Good. How would you handle a failed production deployment and rollback safely?";
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

  const calculateAnswerQuality = (answers) => {
    if (!answers || answers.length === 0) return 0;

    const fullText = answers.map((a) => a.text).join(" ").toLowerCase();
    const words = fullText.split(/\s+/).filter(Boolean);

    if (words.length < 10) return 15;
    if (words.length < 25) return 30;

    let score = 35;

    if (words.length > 50) score += 10;
    if (words.length > 100) score += 10;
    if (/\d+/.test(fullText)) score += 10;

    const roleKeywords = {
      "Data Engineer": [
        "spark",
        "sql",
        "etl",
        "pipeline",
        "data",
        "aws",
        "python",
        "pyspark",
        "parquet",
        "airflow",
        "incremental",
        "cdc",
      ],
      SAP: [
        "sap",
        "module",
        "ticket",
        "configuration",
        "support",
        "implementation",
        "functional",
      ],
      HR: [
        "candidate",
        "screening",
        "recruitment",
        "onboarding",
        "hiring",
        "sourcing",
      ],
      Cybersecurity: [
        "security",
        "incident",
        "vulnerability",
        "threat",
        "malware",
        "risk",
        "cloud",
      ],
      "Data Science": [
        "model",
        "machine learning",
        "feature",
        "classification",
        "data",
        "accuracy",
        "training",
      ],
      DevOps: [
        "docker",
        "kubernetes",
        "ci/cd",
        "pipeline",
        "linux",
        "aws",
        "deployment",
        "monitoring",
        "terraform",
      ],
    };

    const keywords = roleKeywords[role] || [];
    const matchedKeywords = keywords.filter((k) => fullText.includes(k)).length;

    score += matchedKeywords * 5;

    if (fullText.includes("project")) score += 8;
    if (fullText.includes("challenge")) score += 6;
    if (fullText.includes("solution")) score += 6;
    if (fullText.includes("result") || fullText.includes("impact")) score += 6;

    return Math.min(score, 96);
  };

  const generateImprovementTips = (answers) => {
    if (!answers || answers.length === 0) {
      return [
        "No answer was captured. Complete the interview and answer at least one question to receive personalized improvement tips.",
      ];
    }

    const fullText = answers.map((a) => a.text).join(" ").toLowerCase();
    const words = fullText.split(/\s+/).filter(Boolean);
    const tips = [];

    if (words.length < 60) {
      tips.push("Give longer answers with more explanation, examples and outcomes.");
    }

    if (!/\d+/.test(fullText)) {
      tips.push("Add measurable numbers like data volume, records processed, time saved, cost saved or revenue impact.");
    }

    if (!fullText.includes("project")) {
      tips.push("Mention at least one real project and clearly explain your individual contribution.");
    }

    if (!fullText.includes("result") && !fullText.includes("impact")) {
      tips.push("End your answer with the result, business impact or improvement achieved.");
    }

    const roleMissingTip = {
      "Data Engineer": {
        keywords: ["pipeline", "etl", "spark", "sql", "airflow", "aws", "parquet", "cdc"],
        tip: "Explain data engineering architecture clearly: source, ingestion, transformation, storage, orchestration, monitoring and failure recovery.",
      },
      SAP: {
        keywords: ["sap", "module", "ticket", "configuration", "support", "implementation"],
        tip: "Explain the SAP module, business process, issue, configuration/customization and resolution steps.",
      },
      HR: {
        keywords: ["situation", "task", "action", "result", "candidate", "hiring"],
        tip: "Use STAR format for HR and behavioral answers: Situation, Task, Action and Result.",
      },
      Cybersecurity: {
        keywords: ["incident", "risk", "vulnerability", "mitigation", "monitoring", "threat"],
        tip: "Explain security answers with incident context, risk level, investigation, mitigation and prevention steps.",
      },
      "Data Science": {
        keywords: ["model", "feature", "accuracy", "training", "evaluation", "prediction"],
        tip: "Explain data science projects with problem statement, data, features, model, evaluation metric and business result.",
      },
      DevOps: {
        keywords: ["docker", "kubernetes", "ci/cd", "deployment", "monitoring", "rollback"],
        tip: "Explain DevOps scenarios with source control, build, deployment, monitoring, rollback and production incident handling.",
      },
    };

    const roleRule = roleMissingTip[role];
    if (roleRule && !roleRule.keywords.some((k) => fullText.includes(k))) {
      tips.push(roleRule.tip);
    }

    return tips.length
      ? tips.slice(0, 4)
      : ["Good answer quality. Continue improving with more project depth, numbers and business impact."];
  };

  const generateStrengths = (answers) => {
    if (!answers || answers.length === 0) {
      return ["Interview flow was started, but no answer was captured for scoring."];
    }

    const fullText = answers.map((a) => a.text).join(" ").toLowerCase();
    const words = fullText.split(/\s+/).filter(Boolean);
    const strengths = [];

    if (words.length >= 60) strengths.push("You gave detailed answers with reasonable explanation.");
    if (/\d+/.test(fullText)) strengths.push("You used measurable numbers in your answer.");
    if (fullText.includes("project")) strengths.push("You connected your answer to project experience.");
    if (fullText.includes("result") || fullText.includes("impact")) {
      strengths.push("You explained result or business impact.");
    }

    return strengths.length
      ? strengths.slice(0, 4)
      : ["You completed a real voice interview flow and your answers were captured for analysis."];
  };

  const openProtectedPDF = async (folderKey) => {
    try {
      let deviceId = localStorage.getItem("deviceId");

      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("deviceId", deviceId);
      }

      const deviceType = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
        ? "mobile"
        : "laptop";

      const savedUser = JSON.parse(localStorage.getItem("user")) || {};
const token =
  localStorage.getItem("token") ||
  savedUser.token ||
  savedUser.accessToken ||
  savedUser.jwt;
  if (!token) {
  alert("Please login again to access protected PDFs.");
  window.location.href = "/candidate-login";
  return;
}

      const res = await fetch("http://localhost:5000/api/protected-pdf/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          folderKey,
          deviceId,
          deviceType,
        }),
      });

      const data = await res.json();

      if (!data.allowed) {
        alert(data.message || "This PDF folder is protected.");
        return;
      }

      window.open(
        `/secure-pdf-viewer?file=${encodeURIComponent(
          "http://localhost:5000" + data.fileUrl
        )}`,
        "_blank"
      );
    } catch (error) {
      alert("Unable to open protected PDF folder. Please check backend API.");
    }
  };

  const finishInterview = () => {
    window.speechSynthesis.cancel();

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    clearTimeout(silenceTimerRef.current);
    clearTimeout(noSpeechTimerRef.current);
    clearInterval(timerRef.current);

    setListening(false);
    setSpeaking(false);

    const candidateAnswers = messages.filter((m) => m.sender === "candidate");
    const answerCount = candidateAnswers.length;

    if (answerCount === 0) {
      const emptyReport = {
        id: Date.now(),
        role,
        candidateName,
        date: new Date().toLocaleString(),
        duration: formatTime(elapsed),
        answered: 0,
        totalQuestions: questions.length,
        overall: 0,
        communication: 0,
        confidence: 0,
        technical: 0,
        english: 0,
        clarity: 0,
        transcript: [],
        strengths: generateStrengths([]),
        improvementTips: generateImprovementTips([]),
        summary:
          "No answer was captured. Score is 0 because the interview cannot be evaluated without spoken answers.",
      };

      const oldReports = JSON.parse(localStorage.getItem("interviewReports")) || [];
      const updatedReports = [emptyReport, ...oldReports];

      localStorage.setItem("interviewReports", JSON.stringify(updatedReports));
      setSavedReports(updatedReports);
      setReport(emptyReport);
      setStarted(false);
      setActiveMenu("My Reports");
      return;
    }

    const fullText = candidateAnswers.map((a) => a.text).join(" ");
    const words = fullText.split(/\s+/).filter(Boolean).length;
    const answerQuality = calculateAnswerQuality(candidateAnswers);

    const communication = Math.min(
      96,
      Math.round((words / 120) * 40 + answerCount * 8)
    );
    const confidence = Math.min(95, Math.round(answerCount * 10 + words / 8));
    const technical = Math.min(97, answerQuality);
    const english = Math.min(
      95,
      Math.round((words / 100) * 35 + answerCount * 7)
    );
    const clarity = Math.min(
      96,
      Math.round((communication + english + technical) / 3)
    );

    const overall = Math.round(
      (communication + confidence + technical + english + clarity) / 5
    );

    const strengths = generateStrengths(candidateAnswers);
    const improvementTips = generateImprovementTips(candidateAnswers);

    const newReport = {
      id: Date.now(),
      role,
      candidateName,
      date: new Date().toLocaleString(),
      duration: formatTime(elapsed),
      answered: answerCount,
      totalQuestions: questions.length,
      overall,
      communication,
      confidence,
      technical,
      english,
      clarity,
      transcript: candidateAnswers,
      strengths,
      improvementTips,
      summary:
        overall >= 80
          ? "Strong interview performance based on your captured voice answers."
          : overall >= 60
          ? "Average performance. Add more examples, metrics and role-specific depth."
          : "Needs improvement. Give longer, clearer answers with real project examples.",
    };

    const oldReports = JSON.parse(localStorage.getItem("interviewReports")) || [];
    const updatedReports = [newReport, ...oldReports];

    localStorage.setItem("interviewReports", JSON.stringify(updatedReports));
    setSavedReports(updatedReports);
    setReport(newReport);

    setStarted(false);
    setActiveMenu("My Reports");
  };

  const repeatLastQuestion = () => {
    const lastAiMessage = [...messages].reverse().find((m) => m.sender === "ai");
    speak(lastAiMessage?.text || questions[questionIndex]);
  };

  const openMenu = (menu) => {
    if (started && !report) {
      finishInterview();
      setActiveMenu(menu === "Live Interview" ? "My Reports" : menu);
      return;
    }

    setActiveMenu(menu);
    setStarted(false);
    setAnswer("");
    setQuestionIndex(0);
    setElapsed(0);

    window.speechSynthesis.cancel();

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setListening(false);
    setSpeaking(false);
  };

  const menuItems = [
    "Live Interview",
    "Interview History",
    "Practice Modes",
    "My Reports",
    "Question Bank",
    "Resume Insights",
    "Settings",
  ];

  return (
    <main className="ai-live-page">
      <aside className="ai-live-sidebar">
        <div className="ai-live-brand">
          <img src="/logo.png" alt="NoPromptJobs" />
          <div>
            <h2>NoPromptJobs</h2>
            <p>AI INTERVIEW COPILOT</p>
          </div>
        </div>

        <nav>
          {menuItems.map((item) => (
            <a
              key={item}
              className={activeMenu === item ? "active" : ""}
              onClick={() => openMenu(item)}
            >
              {item === "Live Interview" && "🎙 "}
              {item === "Interview History" && "🕘 "}
              {item === "Practice Modes" && "🧩 "}
              {item === "My Reports" && "📊 "}
              {item === "Question Bank" && "📚 "}
              {item === "Resume Insights" && "📄 "}
              {item === "Settings" && "⚙ "}
              {item}
            </a>
          ))}
        </nav>

        <div className="upgrade-box">
          <h3>Takshvi AI Recruiter</h3>
          <p>
            Female AI recruiter with voice, listening, confidence and English
            analysis.
          </p>
          <button onClick={() => openMenu("Live Interview")}>New Interview</button>
        </div>
      </aside>

      <section className="ai-live-main">
      <header className="ai-live-header premium-live-header">
  <div className="live-session-title">
    <span>🎙 LIVE INTERVIEW SESSION</span>
    {started && !report && <b>LIVE</b>}
  </div>

  <div className="live-wave">
    <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
  </div>

  <div className="live-time-box">
    <strong>⏱ {getTimeRemaining()} / 30:00</strong>
    <small>Time Remaining</small>
  </div>

  {started && !report && (
    <button className="end-interview-btn" onClick={finishInterview}>
      End Interview
    </button>
  )}

  <div className="user-pill">{candidateName}</div>
</header>

{!started && activeMenu === "Live Interview" && (
  <section className="interview-setup-premium">
    <div className="setup-copy">
      <span>AI INTERVIEW SETUP</span>

      <h1>
        Practice with <b>Takshvi</b>, your female AI interviewer.
      </h1>

      <p>
        Takshvi asks role-based questions, listens to your answer, waits during
        silence and prepares a communication, English, confidence and technical
        report.
      </p>
    </div>

    <div className="setup-card-premium">
      <h2>Let’s get you ready</h2>

      <label>Candidate Name</label>
      <input
        value={candidateName}
        onChange={(e) => setCandidateName(e.target.value)}
        placeholder="Enter candidate name"
      />

      <label>Select Interview Role</label>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option>Data Engineer</option>
        <option>SAP</option>
        <option>HR</option>
        <option>Cybersecurity</option>
        <option>Data Science</option>
        <option>DevOps</option>
      </select>

      <label>Upload Resume</label>
      <input type="file" accept=".pdf,.doc,.docx,.txt" />

      <button onClick={startInterview}>
        Start Interview with Takshvi →
      </button>
    </div>
  </section>
)}

{!started && activeMenu !== "Live Interview" && (
  <section className="premium-menu-page">
    <div className="premium-menu-hero">
      <span>AI WORKSPACE</span>
      <h1>{activeMenu}</h1>
      <p>
        Premium interview intelligence dashboard for real practice, saved
        reports, protected PDF folders and career readiness.
      </p>
    </div>

    <div className="premium-menu-grid">
      {activeMenu === "Interview History" && (
        <>
          {savedReports.length === 0 ? (
            <div className="premium-empty-state">
              <h2>No interviews completed yet</h2>
              <p>
                Complete your first Takshvi AI interview to see real saved
                history here.
              </p>
              <button onClick={() => openMenu("Live Interview")}>
                Start Interview →
              </button>
            </div>
          ) : (
            savedReports.map((item) => (
              <div className="premium-menu-card history-card" key={item.id}>
                <div className="card-topline">
                  <span>{item.role}</span>
                  <em>{item.duration}</em>
                </div>

                <h3>{item.role} Interview</h3>
                <b>{item.overall}%</b>
                <p>{item.date}</p>

                <p>
                  Answered: {item.answered}/{item.totalQuestions}
                </p>

                <button
                  onClick={() => {
                    setReport(item);
                    setActiveMenu("My Reports");
                  }}
                >
                  View Report →
                </button>
              </div>
            ))
          )}
        </>
      )}
              {activeMenu === "Practice Modes" &&
                [
                  ["🎯 Technical Round", "Role-based deep technical questions"],
                  ["💬 HR Round", "Behavioral and communication practice"],
                  ["⚡ Rapid Fire", "Quick answer practice mode"],
                  ["🧠 Scenario Mode", "Real workplace problem solving"],
                ].map((item) => (
                  <div className="premium-menu-card" key={item[0]}>
                    <h3>{item[0]}</h3>
                    <p>{item[1]}</p>
                    <button onClick={() => openMenu("Live Interview")}>
                      Start Practice →
                    </button>
                  </div>
                ))}

              {activeMenu === "My Reports" && (
                <>
                  {!report ? (
                    <div className="premium-empty-state">
                      <h2>No report available</h2>
                      <p>
                        Complete an interview to generate your real AI
                        performance report.
                      </p>
                      <button onClick={() => openMenu("Live Interview")}>
                        Start Interview →
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="premium-report-main">
                        <div
                          className="report-score-ring"
                          style={{
                            background: `radial-gradient(circle, #111827 55%, transparent 57%), conic-gradient(#a855f7 ${report.overall}%, rgba(255,255,255,.12) 0)`,
                          }}
                        >
                          <span>{report.overall}%</span>
                          <p>Overall</p>
                        </div>

                        <div className="report-summary">
                          <span>REAL INTERVIEW REPORT</span>
                          <h2>{report.role} Interview Report</h2>
                          <p>{report.date}</p>
                          <p>Duration: {report.duration}</p>
                          <p>
                            Questions Answered: {report.answered}/
                            {report.totalQuestions}
                          </p>
                          <p>{report.summary}</p>
                        </div>
                      </div>

                      {[
                        ["Communication", report.communication],
                        ["English Communication", report.english],
                        ["Confidence", report.confidence],
                        ["Technical Depth", report.technical],
                        ["Clarity", report.clarity],
                      ].map((item) => (
                        <div className="premium-menu-card score-card" key={item[0]}>
                          <h3>{item[0]}</h3>
                          <b>{item[1]}%</b>
                          <div className="bar">
                            <span style={{ width: `${item[1]}%` }}></span>
                          </div>
                        </div>
                      ))}

                      <div className="premium-menu-card report-advice">
                        <h3>Strengths</h3>
                        {(report.strengths || []).map((strength, index) => (
                          <p key={index}>✅ {strength}</p>
                        ))}
                      </div>

                      <div className="premium-menu-card report-advice">
                        <h3>Improve Next</h3>
                        {(report.improvementTips || []).map((tip, index) => (
                          <p key={index}>⚠ {tip}</p>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {activeMenu === "Question Bank" && (
                <div className="question-bank-folders">
                  {pdfFolders.map((folder) => (
                    <div className="pdf-folder-card" key={folder.fileKey}>
                      <div className="folder-card-top">
                        <div className="folder-icon">{folder.icon}</div>
                        <span>{folder.count}</span>
                      </div>

                      <h3>{folder.title}</h3>
                      <p>{folder.desc}</p>

                      <button onClick={() => openProtectedPDF(folder.fileKey)}>
                        Open Folder →
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeMenu === "Resume Insights" &&
                [
                  ["ATS Score", "92%", "Resume is strong for AI screening"],
                  ["Missing Skills", "3", "Add cloud, orchestration and testing"],
                  ["Project Proof", "Good", "Use more numbers and outcomes"],
                ].map((item) => (
                  <div className="premium-menu-card" key={item[0]}>
                    <h3>{item[0]}</h3>
                    <b>{item[1]}</b>
                    <p>{item[2]}</p>
                  </div>
                ))}

              {activeMenu === "Settings" &&
                [
                  ["Auto Listening", "Enabled"],
                  ["Silence Detection", "5 Seconds"],
                  ["No Speech Wait Time", "15 Seconds"],
                  ["Preferred Voice", femaleVoiceRef.current?.name || "Female voice auto"],
                  ["Available Voices", voices.length || "Loading"],
                  ["Language", "English India"],
                ].map((item) => (
                  <div className="premium-menu-card" key={item[0]}>
                    <h3>{item[0]}</h3>
                    <b>{item[1]}</b>
                  </div>
                ))}
            </div>
          </section>
        )}

        {started && (
  <section className="ai-interview-premium-layout">
    <section className="interview-left-area">
      <div className="interviewer-card">
        <div className="live-badge">● LIVE</div>

        <div className={`premium-avatar-wrap ${speaking ? "talking" : ""}`}>
          <div className="takshvi-avatar">
            <div className="avatar-face">👩‍💼</div>
          </div>

          <div className="avatar-caption">
            <p>
              {speaking
                ? "Takshvi is asking the question..."
                : listening
                ? "Listening to your answer..."
                : `Hello ${candidateName}, let's continue your interview.`}
            </p>
          </div>
        </div>

        <div className="call-controls">
          <button onClick={startListening}>🎙<span>Mic</span></button>
          <button onClick={repeatLastQuestion}>🔊<span>Repeat</span></button>
          <button className="end-call-btn" onClick={finishInterview}>
            📞<span>End</span>
          </button>
        </div>
      </div>

      <div className="interview-flow-card">
        <h3>Interview Flow</h3>

        <div className="interview-flow-line">
          {[
            ["Introduction", "1 Question"],
            ["Technical", "3 Questions"],
            ["Problem Solving", "2 Questions"],
            ["Behavioral", "1 Question"],
            ["Experience", "1 Question"],
          ].map((step, index) => (
            <div
              key={step[0]}
              className={questionIndex >= index ? "active" : ""}
            >
              <span>{index + 1}</span>
              <b>{step[0]}</b>
              <small>{step[1]}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="transcript-card">
        <h3>Live Transcript</h3>

        {messages.length === 0 ? (
          <p>No conversation yet.</p>
        ) : (
          messages.slice(-5).map((msg, index) => (
            <div
              key={index}
              className={`transcript-row ${
                msg.sender === "ai" ? "ai-row" : "you-row"
              }`}
            >
              <b>{msg.sender === "ai" ? "AI" : "You"}</b>
              <p>{msg.text}</p>
              <small>{msg.time}</small>
            </div>
          ))
        )}

        {answer && (
          <div className="transcript-row you-row">
            <b>You</b>
            <p>{answer}</p>
            <small>Speaking...</small>
          </div>
        )}
      </div>
    </section>

    <section className="interview-center-area">
      <div className="question-card-premium">
        <span>Current Question</span>

        <h4>
          {Math.min(questionIndex + 1, questions.length)} / {questions.length}
        </h4>

        <h2>
          {messages.filter((m) => m.sender === "ai").slice(-1)[0]?.text ||
            questions[questionIndex]}
        </h2>

        <div className="hint-box">
          💡 <b>Hint</b>
          <p>
            Use real examples, project details, measurable numbers and final
            impact.
          </p>
        </div>

        <button className="answer-now-btn" onClick={startListening}>
          🎙 Answer Now
        </button>

        <p className="listening-status">
          {speaking
            ? "Takshvi is speaking..."
            : listening
            ? "Listening... stop speaking for 5 seconds to continue"
            : "Click Answer Now"}
        </p>
      </div>
    </section>

    <aside className="interview-right-area">
      <div className="live-analysis-card">
        <h3>AI Analysis Live</h3>

        <div className="score-ring-small">
          <strong>
            {messages.filter((m) => m.sender === "candidate").length === 0
              ? 0
              : Math.min(95, 60 + questionIndex * 5)}
          </strong>
          <span>/100</span>
        </div>

        {[
          ["Communication", 82],
          ["Technical Knowledge", 75],
          ["Confidence", 70],
          ["Clarity", 85],
        ].map((item) => (
          <div className="analysis-line" key={item[0]}>
            <p>
              {item[0]} <b>{item[1]}/100</b>
            </p>
            <div>
              <span style={{ width: `${item[1]}%` }}></span>
            </div>
          </div>
        ))}
      </div>

      <div className="progress-card">
        <h3>Interview Progress</h3>

        <div className="progress-ring">
          {Math.round(((questionIndex + 1) / questions.length) * 100)}%
        </div>

        <p>
          Questions Answered{" "}
          <b>
            {messages.filter((m) => m.sender === "candidate").length}/
            {questions.length}
          </b>
        </p>

        <p>
          Time Elapsed <b>{formatTime(elapsed)}</b>
        </p>
      </div>

      <div className="pro-tips-card">
        <h3>Pro Tips</h3>
        <p>✅ Speak clearly and at moderate speed</p>
        <p>✅ Use STAR format</p>
        <p>✅ Add numbers and business impact</p>
        <p>✅ Explain your project contribution</p>
      </div>

      <div className="quick-actions-card">
        <h3>Quick Actions</h3>
        <button onClick={() => openMenu("Question Bank")}>📚 Question Bank</button>
        <button onClick={() => openMenu("My Reports")}>📊 View Reports</button>
        <button onClick={finishInterview}>⬇ Generate Report</button>
      </div>
    </aside>
  </section>
)}
</section>
    </main>
  );
}

export default AIInterviewPrepPage;

