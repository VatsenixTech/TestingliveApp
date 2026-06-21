import { useEffect } from "react";
import "./SecurePDFViewer.css";

function SecurePDFViewer() {
  const params = new URLSearchParams(window.location.search);
  const fileUrl = params.get("file");

  const user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    const blockRightClick = (e) => e.preventDefault();

    const blockKeys = (e) => {
      if (
        (e.ctrlKey && ["s", "p", "u", "c"].includes(e.key.toLowerCase())) ||
        e.key === "PrintScreen"
      ) {
        e.preventDefault();
        alert("This content is protected.");
      }
    };

    document.addEventListener("contextmenu", blockRightClick);
    document.addEventListener("keydown", blockKeys);

    return () => {
      document.removeEventListener("contextmenu", blockRightClick);
      document.removeEventListener("keydown", blockKeys);
    };
  }, []);

  if (!fileUrl) {
    return <h2>PDF not found</h2>;
  }

  return (
    <main className="secure-pdf-page">
      <div className="watermark">
        {user?.name || "Candidate"} • {user?.email || "Protected Access"}
      </div>

      <header className="secure-pdf-header">
        <h2>NoPromptJobs Protected PDF</h2>
        <p>Device locked • Download disabled • Watermarked</p>
      </header>

      <iframe
        title="Protected PDF"
        src={fileUrl}
        className="secure-pdf-frame"
      />
    </main>
  );
}

export default SecurePDFViewer;