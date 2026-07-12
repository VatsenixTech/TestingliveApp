import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaClock,
  FaMicrophone,
  FaMicrophoneSlash,
  FaPhoneSlash,
  FaRobot,
  FaVolumeUp,
} from "react-icons/fa";

import "./AIInterviewSessionPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const TOTAL_SECONDS = 30 * 60;
const SILENCE_SECONDS = 5;

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("accessToken") ||
  sessionStorage.getItem("token") ||
  "";

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

const getSpeechRecognition = () =>
  window.SpeechRecognition ||
  window.webkitSpeechRecognition ||
  null;

export default function AIInterviewSessionPage({
  sessionId: sessionIdProp,
}) {
  const params = useParams();

  const sessionId =
    sessionIdProp ||
    params.sessionId ||
    decodeURIComponent(
      window.location.pathname
        .split("/")
        .filter(Boolean)[1] || ""
    );

  const [session, setSession] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [silenceLeft, setSilenceLeft] = useState(null);

  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const silenceCountdownRef = useRef(null);
  const sessionStartedRef = useRef(false);
  const messagesEndRef = useRef(null);
  const messagesRef = useRef([]);
  const answerRef = useRef("");
  const submittingRef = useRef(false);
  const shouldRestartRecognitionRef = useRef(false);
  const welcomeTimerRef = useRef(null);
  const speakTextRef = useRef(null);
  const startRecognitionRef = useRef(null);

  const token = useMemo(() => getToken(), []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  const clearSilenceTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (silenceCountdownRef.current) {
      window.clearInterval(silenceCountdownRef.current);
      silenceCountdownRef.current = null;
    }

    setSilenceLeft(null);
  }, []);

  const stopRecognition = useCallback(
    (restartAfterEnd = false) => {
      shouldRestartRecognitionRef.current = restartAfterEnd;
      clearSilenceTimers();

      try {
        recognitionRef.current?.stop();
      } catch {
        // Browser may already have stopped recognition.
      }

      setListening(false);
    },
    [clearSilenceTimers]
  );

  const speakText = useCallback((text, onFinished) => {
    if (!text || !("speechSynthesis" in window)) {
      onFinished?.();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    const preferredVoice =
      voices.find((voice) =>
        /female|zira|samantha|aria|jenny|google uk english female/i.test(
          `${voice.name} ${voice.voiceURI}`
        )
      ) ||
      voices.find((voice) => /^en(-|_)/i.test(voice.lang)) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.lang = preferredVoice?.lang || "en-IN";
    utterance.rate = 0.94;
    utterance.pitch = 1.06;
    utterance.volume = 1;

    utterance.onstart = () => {
      setSpeaking(true);
      stopRecognition(false);
    };

    utterance.onend = () => {
      setSpeaking(false);
      onFinished?.();
    };

    utterance.onerror = () => {
      setSpeaking(false);
      onFinished?.();
    };

    window.speechSynthesis.speak(utterance);
  }, [stopRecognition]);

  const submitCurrentAnswer = useCallback(async () => {
    if (submittingRef.current || ending) {
      return;
    }

    const cleanedAnswer = String(answerRef.current || "")
      .replace(/\s*\[Listening:.*\]$/, "")
      .trim();

    if (!cleanedAnswer) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    clearSilenceTimers();
    stopRecognition(false);

    const candidateMessage = {
      sender: "candidate",
      text: cleanedAnswer,
      recordedAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, candidateMessage]);
    setAnswer("");
    answerRef.current = "";

    try {
      const transcript = [
        ...messagesRef.current,
        candidateMessage,
      ];

      const response = await fetch(
        `${API_BASE_URL}/api/interview-prep/sessions/${sessionId}/answers`,
        {
          method: "POST",
          headers: {
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            answer: cleanedAnswer,
            remainingSeconds: secondsLeft,
            transcript,
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to generate the next interview question."
        );
      }

      const nextQuestion =
        result.nextQuestion ||
        result.data?.nextQuestion ||
        result.question ||
        "Thank you. Please explain your exact responsibility, the actions you took, and the measurable result.";

      const aiMessage = {
        sender: "ai",
        text: nextQuestion,
        recordedAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, aiMessage]);

      window.setTimeout(() => {
        speakText(nextQuestion, () => {
          window.setTimeout(() => {
            startRecognition();
          }, 350);
        });
      }, 250);
    } catch (requestError) {
      console.error("Submit answer error:", requestError);

      const fallbackQuestion =
        "Thank you. Please give a specific project example, explain your personal contribution, and describe the final outcome.";

      setMessages((current) => [
        ...current,
        {
          sender: "ai",
          text: fallbackQuestion,
          recordedAt: new Date().toISOString(),
        },
      ]);

      speakText(fallbackQuestion, () => {
        window.setTimeout(() => {
          startRecognition();
        }, 350);
      });
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    clearSilenceTimers,
    ending,
    secondsLeft,
    sessionId,
    speakText,
    stopRecognition,
    token,
  ]);

  const scheduleSilenceSubmission = useCallback(() => {
    clearSilenceTimers();

    if (!answerRef.current.trim() || submittingRef.current) {
      return;
    }

    setSilenceLeft(SILENCE_SECONDS);

    silenceCountdownRef.current = window.setInterval(() => {
      setSilenceLeft((current) => {
        if (current === null || current <= 1) {
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    silenceTimerRef.current = window.setTimeout(() => {
      clearSilenceTimers();
      submitCurrentAnswer();
    }, SILENCE_SECONDS * 1000);
  }, [clearSilenceTimers, submitCurrentAnswer]);

  const startRecognition = useCallback(() => {
    if (
      speaking ||
      submittingRef.current ||
      ending ||
      recognitionRef.current
    ) {
      return;
    }

    /*
     * Cancel any pending speech before opening the microphone,
     * so the recognizer does not capture Takshvi's own voice.
     */
    window.speechSynthesis?.cancel();

    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      setError(
        "Automatic voice capture is not supported in this browser. Use the latest Chrome or Microsoft Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError("");
    };

    recognition.onspeechstart = () => {
      clearSilenceTimers();
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const transcript =
          event.results[index][0]?.transcript || "";

        if (event.results[index].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setAnswer((current) => {
        const stableText = current
          .replace(/\s*\[Listening:.*\]$/, "")
          .trim();

        const combined = [
          stableText,
          finalTranscript.trim(),
        ]
          .filter(Boolean)
          .join(" ");

        const nextValue = interimTranscript
          ? `${combined}${combined ? " " : ""}[Listening: ${interimTranscript.trim()}]`
          : combined;

        answerRef.current = nextValue;
        return nextValue;
      });

      scheduleSilenceSubmission();
    };

    recognition.onspeechend = () => {
      scheduleSilenceSubmission();
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        setError(
          "Microphone permission was denied. Allow microphone access from the browser address bar and reload the interview."
        );
      } else if (
        !["no-speech", "aborted"].includes(event.error)
      ) {
        setError(`Microphone error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);

      setAnswer((current) => {
        const cleaned = current
          .replace(/\s*\[Listening:.*\]$/, "")
          .trim();

        answerRef.current = cleaned;
        return cleaned;
      });

      if (
        shouldRestartRecognitionRef.current &&
        !speaking &&
        !submittingRef.current &&
        !ending
      ) {
        shouldRestartRecognitionRef.current = false;

        window.setTimeout(() => {
          startRecognition();
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (recognitionError) {
      recognitionRef.current = null;
      console.error(
        "Unable to start microphone:",
        recognitionError
      );
    }
  }, [
    clearSilenceTimers,
    ending,
    scheduleSilenceSubmission,
    speaking,
  ]);

  /*
   * Keep the latest callback implementations in refs.
   *
   * The session-loading effect must not depend on speakText or
   * startRecognition because those callbacks change while the
   * interview is speaking/listening. Depending on them caused the
   * welcome message to run repeatedly.
   */
  useEffect(() => {
    speakTextRef.current = speakText;
  }, [speakText]);

  useEffect(() => {
    startRecognitionRef.current =
      startRecognition;
  }, [startRecognition]);

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis?.getVoices();
    };

    loadVoices();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [messages]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        setError("");

        if (!sessionId) {
          throw new Error("Interview session ID is missing.");
        }

        const cached = JSON.parse(
          sessionStorage.getItem(
            "activeInterviewSession"
          ) || "null"
        );

        if (cached?.sessionId === sessionId) {
          setSession(cached);
        }

        const response = await fetch(
          `${API_BASE_URL}/api/interview-prep/sessions/${sessionId}`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

        const result = await response
          .json()
          .catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Unable to load interview session."
          );
        }

        const loadedSession =
          result.session ||
          result.data?.session ||
          result.data ||
          result;

        setSession(loadedSession);

        const welcomeMessage =
          `Welcome. I am Takshvi, your AI interviewer. ` +
          `We will have a continuous 30-minute ` +
          `${loadedSession.interviewType || ""} interview for the ` +
          `${loadedSession.role || "selected"} role. ` +
          `Please introduce yourself. When you stop speaking for five seconds, ` +
          `your answer will be submitted automatically.`;

        setMessages([
          {
            sender: "ai",
            text: welcomeMessage,
            recordedAt: new Date().toISOString(),
          },
        ]);

        if (!sessionStartedRef.current) {
          sessionStartedRef.current = true;

          const startResponse = await fetch(
            `${API_BASE_URL}/api/interview-prep/sessions/${sessionId}/start`,
            {
              method: "PATCH",
              headers: {
                ...(token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {}),
                "Content-Type": "application/json",
              },
            }
          );

          const startResult = await startResponse
            .json()
            .catch(() => ({}));

          if (!startResponse.ok) {
            console.warn(
              "Unable to mark interview as started:",
              startResult.message
            );
          }
        }

        /*
         * Run the welcome message only once for this page load.
         *
         * The timer is cleared when React development Strict Mode
         * temporarily unmounts the component, so only the final mount
         * speaks the welcome message.
         */
        if (welcomeTimerRef.current) {
          window.clearTimeout(
            welcomeTimerRef.current
          );
        }

        welcomeTimerRef.current =
          window.setTimeout(() => {
            speakTextRef.current?.(
              welcomeMessage,
              () => {
                window.setTimeout(() => {
                  startRecognitionRef.current?.();
                }, 450);
              }
            );
          }, 800);
      } catch (requestError) {
        console.error(
          "Load interview session error:",
          requestError
        );

        setError(
          requestError.message ||
            "Unable to open interview session."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  // Do not add speakText or startRecognition here.
  // Their changing state previously caused repeated welcome speech.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, token]);

  useEffect(() => {
    if (loading || error) {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timerRef.current);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timerRef.current);
    };
  }, [loading, error]);

  const endInterview = async () => {
    if (ending) {
      return;
    }

    try {
      setEnding(true);
      setError("");
      clearSilenceTimers();
      stopRecognition(false);
      window.speechSynthesis?.cancel();

      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }

      const completedAt = new Date().toISOString();
      const transcript = messagesRef.current;

      let completionResult = {};

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/interview-prep/sessions/${sessionId}/complete`,
          {
            method: "PATCH",
            headers: {
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              remainingSeconds: secondsLeft,
              elapsedSeconds:
                TOTAL_SECONDS - secondsLeft,
              transcript,
              completedAt,
            }),
          }
        );

        completionResult = await response
          .json()
          .catch(() => ({}));
      } catch (completeError) {
        console.warn(
          "Complete interview warning:",
          completeError
        );
      }

      const report =
        completionResult?.report ||
        completionResult?.data?.report ||
        null;

      sessionStorage.setItem(
        "completedInterviewSession",
        JSON.stringify({
          sessionId,
          session,
          transcript,
          remainingSeconds: secondsLeft,
          elapsedSeconds:
            TOTAL_SECONDS - secondsLeft,
          completedAt,
          report,
        })
      );

      sessionStorage.removeItem(
        "activeInterviewSession"
      );

      window.location.replace(
        `/interview-report/${encodeURIComponent(
          sessionId
        )}`
      );
    } catch (requestError) {
      console.error(
        "End interview error:",
        requestError
      );

      setError(
        requestError.message ||
          "Unable to end the interview."
      );

      setEnding(false);
    }
  };

  useEffect(() => {
    if (secondsLeft === 0 && !ending) {
      endInterview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  useEffect(() => {
    return () => {
      if (welcomeTimerRef.current) {
        window.clearTimeout(
          welcomeTimerRef.current
        );
      }

      clearSilenceTimers();
      stopRecognition(false);
      window.speechSynthesis?.cancel();
    };
  }, [clearSilenceTimers, stopRecognition]);

  if (loading) {
    return (
      <main className="live-interview-state">
        <FaRobot />
        <h2>Preparing your interview room...</h2>
      </main>
    );
  }

  if (error && !session) {
    return (
      <main className="live-interview-state">
        <h2>Unable to open interview</h2>
        <p>{error}</p>

        <button
          type="button"
          onClick={() =>
            window.location.assign(
              "/ai-interview-prep"
            )
          }
        >
          <FaArrowLeft />
          Back to Interview Prep
        </button>
      </main>
    );
  }

  return (
    <main className="live-interview-page">
      <header className="live-interview-header">
        <div>
          <span className="live-indicator">
            LIVE
          </span>

          <div>
            <h1>AI Interview with Takshvi</h1>

            <p>
              {session?.role} ·{" "}
              {session?.experienceLevel} ·{" "}
              {session?.interviewType}
            </p>
          </div>
        </div>

        <div className="live-timer">
          <FaClock />
          <span>Time Remaining</span>
          <strong>
            {formatTime(secondsLeft)}
          </strong>
        </div>
      </header>

      {error && (
        <div
          className="live-interview-inline-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <section className="live-interview-layout">
        <article className="interviewer-stage">
          <div
            className={`takshvi-avatar ${
              speaking ? "speaking" : ""
            }`}
          >
            <FaRobot />
          </div>

          <span className="interviewer-name">
            Takshvi
          </span>

          <small>
            Senior AI Technical Recruiter
          </small>

          <div
            className={`speaking-wave ${
              speaking ? "active" : ""
            }`}
          >
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <p className="interview-guidance">
            Speak naturally. Your answer is
            submitted automatically after five
            seconds of silence.
          </p>

          <button
            type="button"
            className="repeat-question-button"
            onClick={() => {
              const lastAiMessage = [
                ...messages,
              ]
                .reverse()
                .find(
                  (message) =>
                    message.sender === "ai"
                );

              if (lastAiMessage) {
                speakText(
                  lastAiMessage.text,
                  () => {
                    window.setTimeout(() => {
                      startRecognition();
                    }, 350);
                  }
                );
              }
            }}
          >
            <FaVolumeUp />
            Repeat Question
          </button>
        </article>

        <article className="interview-conversation">
          <div className="conversation-heading">
            <div>
              <h2>
                Live Interview Conversation
              </h2>

              <p>
                Continuous adaptive interview ·
                automatic voice-answer submission
              </p>
            </div>

            <button
              type="button"
              className={
                listening
                  ? "mic active"
                  : "mic"
              }
              onClick={() => {
                if (listening) {
                  stopRecognition(false);
                } else {
                  startRecognition();
                }
              }}
            >
              {listening ? (
                <FaMicrophone />
              ) : (
                <FaMicrophoneSlash />
              )}

              {listening
                ? "Listening..."
                : "Resume Microphone"}
            </button>
          </div>

          <div className="conversation-messages">
            {messages.map(
              (message, index) => (
                <div
                  key={`${message.sender}-${index}`}
                  className={`conversation-message ${message.sender}`}
                >
                  <strong>
                    {message.sender === "ai"
                      ? "Takshvi"
                      : "You"}
                  </strong>

                  <p>{message.text}</p>
                </div>
              )
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="automatic-answer-panel">
            <div className="automatic-answer-status">
              <span
                className={
                  listening
                    ? "status-dot active"
                    : "status-dot"
                }
              />

              <div>
                <strong>
                  {submitting
                    ? "Submitting your answer..."
                    : listening
                      ? "Listening to your answer"
                      : speaking
                        ? "Takshvi is speaking"
                        : "Microphone paused"}
                </strong>

                <small>
                  {silenceLeft !== null &&
                  silenceLeft > 0
                    ? `Answer submits automatically in ${silenceLeft} second${
                        silenceLeft === 1
                          ? ""
                          : "s"
                      }`
                    : "Stop speaking for five seconds to finish your answer."}
                </small>
              </div>
            </div>

            <div className="automatic-answer-text">
              {answer
                .replace(
                  /\s*\[Listening:.*\]$/,
                  ""
                )
                .trim() ||
                "Your spoken answer will appear here automatically."}
            </div>

            <button
              type="button"
              className="finish-answer-button"
              onClick={submitCurrentAnswer}
              disabled={
                submitting ||
                !answer
                  .replace(
                    /\s*\[Listening:.*\]$/,
                    ""
                  )
                  .trim()
              }
            >
              Finish Answer Now
            </button>
          </div>
        </article>
      </section>

      <footer className="live-interview-footer">
        <p>
          The interview ends automatically when
          the 30-minute timer reaches zero.
        </p>

        <button
          type="button"
          className="end-interview-button"
          onClick={endInterview}
          disabled={ending}
        >
          <FaPhoneSlash />

          {ending
            ? "Analysing Interview..."
            : "End Interview"}
        </button>
      </footer>
    </main>
  );
}