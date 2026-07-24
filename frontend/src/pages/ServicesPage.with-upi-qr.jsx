function ServicesPage() {
  const scrollRef = useRef(null);
  const [search, setSearch] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [temporaryAccessEndsAt, setTemporaryAccessEndsAt] = useState(
    localStorage.getItem("temporaryAccessEndsAt") || ""
  );
const [referralData, setReferralData] =
  useState({
    referralCode: "",
    referralLink: "",
    stats: {
      totalReferrals: 0,
      successfulReferrals: 0,
      couponsEarned: 0,
      premiumMinutesEarned: 0,
    },
  });

const [referralLoading, setReferralLoading] =
  useState(false);

const [referralMessage, setReferralMessage] =
  useState("");

const [copyMessage, setCopyMessage] = useState("");

  const [upiCheckout, setUpiCheckout] = useState(null);
  const [upiReference, setUpiReference] = useState("");
  const [upiPayerName, setUpiPayerName] = useState("");
  const [upiPayerId, setUpiPayerId] = useState("");
  const [upiPaymentDate, setUpiPaymentDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [upiSubmitting, setUpiSubmitting] = useState(false);
  const [upiMessage, setUpiMessage] = useState("");
  const [upiError, setUpiError] = useState("");
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [upiCreating, setUpiCreating] = useState(false);


  const goTo = (path) => {
    window.location.href = path;
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const getTokenPayload = () => {
    const token = localStorage.getItem("token");
    if (!token || !token.includes(".")) return {};

    try {
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch (error) {
      console.log("TOKEN DECODE ERROR:", error);
      return {};
    }
  };

  const getCandidateId = () => {
    const tokenPayload = getTokenPayload();

    return (
      user?.candidateId ||
      user?._id ||
      user?.id ||
      user?.candidate?._id ||
      user?.candidate?.id ||
      tokenPayload?.candidateId ||
      tokenPayload?._id ||
      tokenPayload?.id ||
      tokenPayload?.userId ||
      localStorage.getItem("candidateId") ||
      localStorage.getItem("candidate_id") ||
      localStorage.getItem("userId") ||
      ""
    );
  };

  const candidateId = getCandidateId();

  const dashboardPath = candidateId ? `/dashboard/${candidateId}` : "/dashboard";
  const profilePath = candidateId ? `/profile/${candidateId}` : "/profile";


  const plans = {
    basic: {
      name: "Basic",
      actualPrice: 0,
      offerPrice: 0,
      route: "/candidate-email-verify",
    },
    pro: {
      name: "Pro",
      actualPrice: 1399,
      offerPrice: 899,
    },
    ultimate: {
      name: "Ultimate",
      actualPrice: 3499,
      offerPrice: 1999,
    },
  };

  const isPlanActive = (planName) => {
    const savedPlan =
      user?.plan ||
      localStorage.getItem("plan") ||
      localStorage.getItem("activePlan");

    const status =
      user?.subscriptionStatus ||
      localStorage.getItem("subscriptionStatus");

    return (
      savedPlan?.toLowerCase() === planName.toLowerCase() &&
      status === "active"
    );
  };

  const isUltimateUser = () => isPlanActive("Ultimate");

  const hasTemporaryAccess = () => {
    if (!temporaryAccessEndsAt) return false;
    return new Date(temporaryAccessEndsAt).getTime() > Date.now();
  };

  const hasPremiumAccess = () => isUltimateUser() || hasTemporaryAccess();

  const getFinalPrice = (planKey) => {
    const plan = plans[planKey];
    if (!plan || plan.offerPrice === 0) return 0;

    const discount =
      planKey === "ultimate" ? Number(appliedCoupon?.discount || 0) : 0;

    return Math.max(plan.offerPrice - discount, 0);
  };

  const applyCoupon = async () => {
    const cleanCouponCode = couponCode.trim();

    if (!cleanCouponCode) {
      setCouponError("Please enter a coupon code.");
      setCouponMessage("");
      return;
    }

    if (!candidateId) {
      setCouponError("Please sign in before applying a coupon.");
      setCouponMessage("");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");
      setCouponMessage("");

      const response = await axios.post(
        `${API_URL}/api/coupons/redeem`,
        {
          couponCode: cleanCouponCode,
          candidateId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const accessEndsAt =
        response.data?.accessExpires ||
        response.data?.accessEndsAt ||
        "";

      setAppliedCoupon({
        code: cleanCouponCode,
        accessMinutes: Number(response.data?.accessMinutes || 30),
        accessEndsAt,
      });

      setCouponMessage(
        response.data?.message ||
          "Coupon applied successfully. Premium access is active."
      );

      if (accessEndsAt) {
        setTemporaryAccessEndsAt(accessEndsAt);
        localStorage.setItem("temporaryAccessEndsAt", accessEndsAt);
      }
    } catch (error) {
      console.error(
        "COUPON REDEEM ERROR:",
        error.response?.data || error.message
      );

      setAppliedCoupon(null);
      setCouponMessage("");
      setCouponError(
        error.response?.data?.message ||
          "Unable to verify the coupon right now."
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponMessage("");
    setCouponError("");
  };

  const startPayment = async (planKey) => {
    const plan = plans[planKey];
    const resolvedCandidateId = getCandidateId();

    if (!resolvedCandidateId) {
      alert("Please log in before upgrading your plan.");
      goTo("/candidate-login");
      return;
    }

    if (!plan || !["pro", "ultimate"].includes(planKey)) {
      alert("Please select a valid subscription plan.");
      return;
    }

    if (planKey === "ultimate" && hasPremiumAccess()) {
      goTo("/ultimate-dashboard");
      return;
    }

    const finalPrice = getFinalPrice(planKey);

    localStorage.setItem("selectedPlan", plan.name);
    localStorage.setItem("selectedPlanKey", planKey);
    localStorage.setItem("selectedPlanPrice", String(finalPrice));

    // Open the checkout immediately so a backend error never looks like
    // an unresponsive button.
    setUpiCheckout({
      planKey,
      planName: plan.name,
      amount: finalPrice,
      currency: "INR",
      businessName: "Loading payment details...",
      upiId: "",
      intentUrl: "",
    });
    setUpiCreating(true);
    setUpiError("");
    setUpiMessage("");

    try {
      const response = await axios.post(
        `${API_URL}/api/manual-upi/create`,
        {
          candidateId: resolvedCandidateId,
          planKey,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.alreadyActive) {
        setUpiCheckout(null);
        goTo(
          response.data?.redirectUrl ||
            (planKey === "ultimate"
              ? "/ultimate-dashboard"
              : dashboardPath)
        );
        return;
      }

      if (!response.data?.success || !response.data?.order || !response.data?.upi) {
        throw new Error(
          response.data?.message || "Unable to create the UPI payment request."
        );
      }

      setUpiCheckout({
        ...response.data.order,
        ...response.data.upi,
      });
    } catch (error) {
      console.error(
        "CREATE UPI PAYMENT ERROR:",
        error.response?.data || error.message
      );

      setUpiError(
        error.response?.data?.message ||
          error.message ||
          "Unable to start the UPI payment. Confirm that /api/manual-upi/create is running."
      );
    } finally {
      setUpiCreating(false);
    }
  };

  const openUpiApplication = () => {
    if (upiCreating) return;

    if (!upiCheckout?.intentUrl) {
      setUpiError(
        "UPI payment link is unavailable. Check whether the backend manual UPI route is running."
      );
      return;
    }

    window.location.href = upiCheckout.intentUrl;
  };

  const copyBusinessUpiId = async () => {
    if (!upiCheckout?.upiId) return;

    try {
      await navigator.clipboard.writeText(upiCheckout.upiId);
      setUpiMessage("Business UPI ID copied successfully.");
    } catch (error) {
      console.error("COPY UPI ID ERROR:", error);
      setUpiError("Unable to copy the UPI ID.");
    }
  };

  const closeUpiCheckout = () => {
    if (upiSubmitting) return;

    setUpiCheckout(null);
    setUpiReference("");
    setUpiPayerName("");
    setUpiPayerId("");
    setUpiMessage("");
    setUpiError("");
  };

  const waitForUpiActivationAndRedirect = async ({
    candidateId: resolvedCandidateId,
    planName,
    maxAttempts = 40,
  }) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const statusResponse = await axios.get(
          `${API_URL}/api/manual-upi/status/${resolvedCandidateId}`
        );

        const subscription =
          statusResponse.data?.subscription;

        if (
          subscription?.status === "active" &&
          ["Pro", "Ultimate"].includes(subscription?.plan)
        ) {
          const updatedUser = {
            ...user,
            plan: subscription.plan,
            activePlan: subscription.plan,
            subscriptionStatus: "active",
            subscriptionStartedAt:
              subscription.startsAt || null,
            subscriptionExpiresAt:
              subscription.expiresAt || null,
          };

          localStorage.setItem(
            "user",
            JSON.stringify(updatedUser)
          );

          localStorage.setItem(
            "plan",
            subscription.plan
          );

          localStorage.setItem(
            "activePlan",
            subscription.plan
          );

          localStorage.setItem(
            "subscriptionStatus",
            "active"
          );

          setUpiMessage(
            `${subscription.plan} payment verified. Opening your dashboard...`
          );

          window.setTimeout(() => {
            goTo(
              subscription.plan === "Ultimate"
                ? "/ultimate-dashboard"
                : dashboardPath
            );
          }, 700);

          return true;
        }
      } catch (error) {
        console.error(
          "AUTO PAYMENT STATUS CHECK ERROR:",
          error.response?.data || error.message
        );
      }

      await new Promise((resolve) => {
        window.setTimeout(resolve, 3000);
      });
    }

    setUpiMessage(
      `${planName || "Your"} payment was submitted and is waiting for verification. The dashboard will open after approval.`
    );

    return false;
  };

  const submitUpiPayment = async () => {
    const resolvedCandidateId = getCandidateId();

    if (!resolvedCandidateId || !upiCheckout) {
      setUpiError("Please select a subscription plan again.");
      return;
    }

    if (upiReference.trim().length < 8) {
      setUpiError("Enter a valid UPI transaction reference or UTR.");
      return;
    }

    try {
      setUpiSubmitting(true);
      setUpiError("");
      setUpiMessage("");

      const response = await axios.post(
        `${API_URL}/api/manual-upi/submit`,
        {
          candidateId: resolvedCandidateId,
          planKey: upiCheckout.planKey,
          paymentReference: upiReference.trim(),
          payerName: upiPayerName.trim(),
          payerUpiId: upiPayerId.trim(),
          paymentDate: upiPaymentDate,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setUpiMessage(
        response.data?.message ||
          "Payment submitted. Checking payment status..."
      );

      localStorage.setItem(
        "subscriptionStatus",
        response.data?.status === "approved"
          ? "active"
          : "payment_pending"
      );

      localStorage.setItem(
        "pendingPaymentPlan",
        upiCheckout.planName || ""
      );

      localStorage.setItem(
        "pendingPaymentId",
        response.data?.paymentId || ""
      );

      await waitForUpiActivationAndRedirect({
        candidateId: resolvedCandidateId,
        planName: upiCheckout.planName,
        maxAttempts:
          response.data?.autoApproved ? 3 : 40,
      });
    } catch (error) {
      console.error(
        "SUBMIT UPI PAYMENT ERROR:",
        error.response?.data || error.message
      );

      setUpiError(
        error.response?.data?.message ||
          "Unable to submit the payment details."
      );
    } finally {
      setUpiSubmitting(false);
    }
  };

  const checkUpiPaymentStatus = async () => {
    const resolvedCandidateId = getCandidateId();

    if (!resolvedCandidateId) {
      setUpiError("Candidate account information is missing.");
      return;
    }

    try {
      setPaymentStatusLoading(true);
      setUpiError("");

      const response = await axios.get(
        `${API_URL}/api/manual-upi/status/${resolvedCandidateId}`
      );

      const subscription = response.data?.subscription;
      const payment = response.data?.payment;

      if (
        subscription?.status === "active" &&
        ["Pro", "Ultimate"].includes(subscription?.plan)
      ) {
        const updatedUser = {
          ...user,
          plan: subscription.plan,
          activePlan: subscription.plan,
          subscriptionStatus: "active",
          subscriptionStartedAt: subscription.startsAt || null,
          subscriptionExpiresAt: subscription.expiresAt || null,
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("plan", subscription.plan);
        localStorage.setItem("activePlan", subscription.plan);
        localStorage.setItem("subscriptionStatus", "active");

        setUpiMessage(`${subscription.plan} subscription is active.`);

        window.setTimeout(() => {
          goTo(
            subscription.plan === "Ultimate"
              ? "/ultimate-dashboard"
              : dashboardPath
          );
        }, 800);

        return;
      }

      if (payment?.status === "rejected") {
        setUpiError(
          payment.rejectionReason ||
            "Your payment could not be verified. Please contact support."
        );
        return;
      }

      setUpiMessage(
        payment?.status === "pending"
          ? "Payment verification is still pending. Please check again after the admin reviews it."
          : "No approved payment was found yet."
      );
    } catch (error) {
      console.error(
        "CHECK UPI PAYMENT STATUS ERROR:",
        error.response?.data || error.message
      );

      setUpiError(
        error.response?.data?.message ||
          "Unable to check payment status."
      );
    } finally {
      setPaymentStatusLoading(false);
    }
  };

  const dashboardData = {
    name: user?.name || user?.fullName || "VENKATESHA A",
    aiMatchScore: user?.aiMatchScore || 90,
    applications: user?.applicationsCount || 0,
    interviews: user?.interviewsCount || 0,
    profileStrength: user?.profileStrength || 90,
    autoApply: user?.autoApplyCount || 0,
    recentActivity: user?.recentActivity || [
      "Recruiter viewed your profile",
      "Profile strength improved",
      "New jobs matched your skills",
    ],
  };

  const stats = [
    ["👥", dashboardData.applications, "Applications"],
    ["☑️", "7", "Live Jobs"],
    ["🏢", "6", "Hiring Companies"],
    ["⭐", `${dashboardData.profileStrength}%`, "Profile Strength"],
    ["☀️", "28", "Career Alerts"],
  ];

  const features = [
    { title: "Skill Intelligence", img: "/images/skill-intelligence.png", route: "/skill-assessment" },
    { title: "Auto Apply Engine", img: "/images/auto-apply.png", route: "/auto-apply" },
    { title: "Instant Job Alerts", img: "/images/job-alerts.png", route: "/job-alerts" },
    { title: "Hidden Opportunities", img: "/images/hidden-opportunities.png", route: "/jobs?type=hidden" },
    { title: "AI Match Score", img: "/images/match.png", route: "/jobs?sort=match" },
    { title: "Resume Studio", img: "/images/resume-studio.png", route: "/resume-studio" },
    { title: "AI Interview Prep", img: "/images/interview.png", route: "/ai-interview-prep" },
  ];

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    let timer;

    const startAutoScroll = () => {
      timer = setInterval(() => {
        const isEnd =
          slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 10;

        slider.scrollTo({
          left: isEnd ? 0 : slider.scrollLeft + 380,
          behavior: "smooth",
        });
      }, 2600);
    };

    const stopAutoScroll = () => clearInterval(timer);

    startAutoScroll();

    slider.addEventListener("mouseenter", stopAutoScroll);
    slider.addEventListener("mouseleave", startAutoScroll);

    return () => {
      clearInterval(timer);
      slider.removeEventListener("mouseenter", stopAutoScroll);
      slider.removeEventListener("mouseleave", startAutoScroll);
    };
  }, []);

  const scrollFeatures = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -380 : 380,
      behavior: "smooth",
    });
  };


  const handleFeatureClick = (feature) => {
    if (hasPremiumAccess()) {
      goTo(feature.route);
      return;
    }

    document.getElementById("pricing")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    const loadAccessStatus = async () => {
      const resolvedCandidateId = getCandidateId();
      if (!resolvedCandidateId) return;

      try {
        const response = await axios.get(
          `${API_URL}/api/access/status/${resolvedCandidateId}`
        );

        const accessEndsAt = response.data?.accessEndsAt || "";

        if (
          response.data?.hasTemporaryAccess &&
          accessEndsAt &&
          new Date(accessEndsAt).getTime() > Date.now()
        ) {
          setTemporaryAccessEndsAt(accessEndsAt);
          localStorage.setItem("temporaryAccessEndsAt", accessEndsAt);
        } else {
          setTemporaryAccessEndsAt("");
          localStorage.removeItem("temporaryAccessEndsAt");
        }
      } catch (error) {
        console.log("ACCESS STATUS ERROR:", error);
      }
    };

    loadAccessStatus();
  }, [candidateId]);

  useEffect(() => {
    loadReferralData();
  }, [candidateId]);

  useEffect(() => {
    if (!temporaryAccessEndsAt) return undefined;

    const timer = window.setInterval(() => {
      if (new Date(temporaryAccessEndsAt).getTime() <= Date.now()) {
        localStorage.removeItem("temporaryAccessEndsAt");
        setTemporaryAccessEndsAt("");
      }
    }, 30000);

    return () => window.clearInterval(timer);
  }, [temporaryAccessEndsAt]);

  const searchNow = (e) => {
    if (e.key !== "Enter") return;

    const q = search.trim();
    if (!q) return goTo("/jobs");

    const lower = q.toLowerCase();

    if (
      lower.includes("company") ||
      lower.includes("tcs") ||
      lower.includes("infosys") ||
      lower.includes("wipro") ||
      lower.includes("google") ||
      lower.includes("microsoft") ||
      lower.includes("amazon")
    ) {
      return goTo(`/companies?search=${encodeURIComponent(q)}`);
    }

    if (lower.includes("resume")) return goTo("/resume-studio");
    if (lower.includes("interview")) return goTo("/ai-interview-prep");
    if (lower.includes("salary")) return goTo("/salary-predictor");
    if (lower.includes("skill")) return goTo("/skill-assessment");
    if (lower.includes("auto apply")) return goTo("/auto-apply");

    goTo(`/jobs?search=${encodeURIComponent(q)}`);
  };
  const loadReferralData = async () => {
  if (!candidateId) {
    setReferralData({
      referralCode: "",
      referralLink: "",
      stats: {
        totalReferrals: 0,
        successfulReferrals: 0,
        couponsEarned: 0,
        premiumMinutesEarned: 0,
      },
    });

    return;
  }

  try {
    setReferralLoading(true);
    setReferralMessage("");

    const response = await axios.get(
      `${API_URL}/api/referrals/me`,
      {
        params: {
          candidateId,
        },
      }
    );

    setReferralData({
      referralCode:
        response.data?.referralCode || "",
      referralLink:
        response.data?.referralLink || "",
      stats: {
        totalReferrals:
          Number(
            response.data?.stats
              ?.totalReferrals
          ) || 0,

        successfulReferrals:
          Number(
            response.data?.stats
              ?.successfulReferrals
          ) || 0,

        couponsEarned:
          Number(
            response.data?.stats
              ?.couponsEarned
          ) || 0,

        premiumMinutesEarned:
          Number(
            response.data?.stats
              ?.premiumMinutesEarned
          ) || 0,
      },
    });
  } catch (error) {
    console.error(
      "REFERRAL LOAD ERROR:",
      error.response?.data || error.message
    );

    setReferralMessage(
      error.response?.data?.message ||
        "Unable to load your referral link."
    );
  } finally {
    setReferralLoading(false);
  }
};

const copyReferralLink = async () => {
  if (!candidateId) {
    alert(
      "Please sign in to generate your referral link."
    );

    goTo("/candidate-login");
    return;
  }

  if (!referralData.referralLink) {
    await loadReferralData();
    return;
  }

  try {
    await navigator.clipboard.writeText(
      referralData.referralLink
    );

    setReferralMessage(
      "Referral link copied successfully."
    );

    setTimeout(() => {
      setReferralMessage("");
    }, 2500);
  } catch (error) {
    console.error(
      "COPY REFERRAL ERROR:",
      error
    );

    const temporaryInput =
      document.createElement("input");

    temporaryInput.value =
      referralData.referralLink;

    document.body.appendChild(
      temporaryInput
    );

    temporaryInput.select();

    document.execCommand("copy");

    document.body.removeChild(
      temporaryInput
    );

    setReferralMessage(
      "Referral link copied successfully."
    );
  }
};

const shareReferralLink = async () => {
  if (!candidateId) {
    alert(
      "Please sign in to invite friends."
    );

    goTo("/candidate-login");
    return;
  }

  if (!referralData.referralLink) {
    await loadReferralData();
    return;
  }

  const shareData = {
    title: "Join NoPrompt Jobs",
    text:
      "Join NoPrompt Jobs using my referral link and build your career with AI-powered tools.",
    url: referralData.referralLink,
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await copyReferralLink();

    alert(
      "Your referral link was copied. Share it with your friends."
    );
  } catch (error) {
    if (error?.name !== "AbortError") {
      console.error(
        "SHARE REFERRAL ERROR:",
        error
      );
    }
  }
};

return (
    <div className="services-page-v2">
      <header className="services-top-header">
        <img
          src="/logo.png"
          alt="NoPromptJobs"
          className="services-logo"
          onClick={() => goTo(dashboardPath)}
        />

        <input
          className="services-search-box"
          placeholder="🔍 Search jobs, companies, skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={searchNow}
        />

        <nav>
          <button onClick={() => goTo(dashboardPath)}>Dashboard</button>
          <button onClick={() => goTo("/jobs")}>Jobs</button>
          <button onClick={() => goTo("/companies")}>Companies</button>
          <button className="active" onClick={() => goTo("/services")}>
            Services
          </button>
          <button onClick={() => goTo("/notifications")}>
            Notifications <b>3</b>
          </button>
        </nav>

        <div className="services-profile-chip" onClick={() => goTo(profilePath)}>
          <span>V</span>
          <strong>{dashboardData.name}</strong>
          <small>⌄</small>
        </div>
      </header>

      <section className="services-hero-v2">
        <div className="hero-left-content">
          <span className="ai-badge">⚡ AI-POWERED CAREER INTELLIGENCE</span>

          <h1>
            Your <b>AI Co-Pilot</b> For <br />
            Smarter Job Search & <b>Career Growth</b>
          </h1>

          <p>
            Apply smarter, get noticed earlier, and land your dream role faster
            with the power of AI.
          </p>

          <div className="hero-btns">
            <button onClick={() => startPayment("ultimate")}>
              {hasPremiumAccess() ? "👑 Ultimate Dashboard" : "🚀 Upgrade to Ultimate"}
            </button>

            <button
              className="ghost"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore All Features →
            </button>
          </div>

          <div className="hero-checks">
            <span>✅ AI-Powered</span>
            <span>✅ Verified & Trusted</span>
            <span>✅ Privacy First</span>
            <span>✅ Secure & Reliable</span>
          </div>
        </div>

        <div className="services-dashboard-preview-card">
          <aside className="preview-side">
            <div className="preview-logo" onClick={() => goTo(dashboardPath)}>
              N
            </div>
            <button onClick={() => goTo(dashboardPath)}>Overview</button>
            <span onClick={() => goTo("/applications")}>Applications</span>
            <span onClick={() => goTo("/auto-apply")}>Auto Apply</span>
            <span onClick={() => goTo("/job-alerts")}>Alerts</span>
            <span onClick={() => goTo("/resume-studio")}>Resume</span>
            <span onClick={() => goTo("/ai-interview-prep")}>Interview Prep</span>
          </aside>

          <main className="preview-main">
            <div className="preview-head">
              <div>
                <h2>Welcome back, {dashboardData.name}! 👋</h2>
                <p>Smart career overview</p>
              </div>
              <b>♡ Verified</b>
            </div>

            <div className="preview-grid">
              <div>
                <p>AI Match Score</p>
                <h1>{dashboardData.aiMatchScore}</h1>
                <b>Excellent Match</b>
              </div>

              <div>
                <p>Applications</p>
                <div className="mini-two">
                  <section>
                    <h1>{dashboardData.applications}</h1>
                    <small>Applied</small>
                  </section>
                  <section>
                    <h1>{dashboardData.interviews}</h1>
                    <small>Interviewing</small>
                  </section>
                </div>
              </div>

              <div>
                <p>Profile Strength</p>
                <h1>{dashboardData.profileStrength}%</h1>
                <b>Strong</b>
              </div>

              <div>
                <p>Auto Apply</p>
                <h1>{dashboardData.autoApply}</h1>
                <b>Applied</b>
              </div>

              <div className="activity-box">
                <p>Recent Activity</p>
                {dashboardData.recentActivity.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          </main>
        </div>
      </section>

      <section className="services-stats-card">
        {stats.map((s) => (
          <div key={s[2]}>
            <span>{s[0]}</span>
            <h2>{s[1]}</h2>
            <p>{s[2]}</p>
          </div>
        ))}
      </section>

      <section className="services-title">
        <span>POWERFUL FEATURES</span>
        <h2>
          Everything NoPromptPro has,
          <br />
          plus your own AI trust layer
        </h2>
        <p>
          Powerful tools to automate, analyze and accelerate your career journey.
        </p>
      </section>

      <section id="features" className="feature-scroll-area">
        <button className="feature-arrow left" onClick={() => scrollFeatures("left")}>
          ←
        </button>

        <div className="services-feature-scroll" ref={scrollRef}>
          {features.map((f) => (
            <div className="service-feature-card" key={f.title}>
              <img
                src={f.img}
                alt={f.title}
                onError={(e) => {
                  e.currentTarget.src = "/images/resume-studio.png";
                }}
              />
              <h3>{f.title}</h3>
              <button onClick={() => handleFeatureClick(f)}>Explore →</button>
            </div>
          ))}
        </div>

        <button className="feature-arrow right" onClick={() => scrollFeatures("right")}>
          →
        </button>
      </section>

      <section className="trust-passport-row">
        <div className="trust-dark-card">
          <h2>Candidate Trust Passport</h2>
          <p>
            Your verified identity and professional credibility that opens doors
            to better opportunities.
          </p>
          <button onClick={() => goTo("/trust-passport")}>
            Explore Trust Passport →
          </button>
        </div>

        <div className="trust-dark-card checks">
          <span>✅ Identity Verified</span>
          <span>✅ Resume Verified</span>
          <span>✅ Skill Certifications</span>
          <span>✅ LinkedIn Verification</span>
          <span>✅ Resume Tested</span>
          <span>✅ Real User Videos</span>
          <span>✅ Status Verification</span>
          <span>✅ Strong Role Intent</span>
        </div>
      </section>

<section id="pricing" className="pricing-section">
        <div className="price-card">
          <h3>Basic</h3>
          <h2>₹0</h2>
          <p>For basic job seekers</p>
          <span>✓ Basic profile</span>
          <span>✓ Job alerts</span>
          <span>✓ Basic resume upload</span>
          <button onClick={() => goTo("/candidate-email-verify")}>
            Get Started
          </button>
        </div>

        <div className="price-card popular">
          <small>Limited Offer</small>
          <h3>Pro</h3>

          <div className="price-discount">
            <del>₹{plans.pro.actualPrice}/month</del>
            <h2>₹{getFinalPrice("pro")}/month</h2>
            <b>Offer price ₹{plans.pro.offerPrice}/month</b>
          </div>

          <p>For serious job seekers</p>
          <span>✓ Auto Apply</span>
          <span>✓ Job Alerts</span>
          <span>✓ AI Resume Studio</span>
          <span>✓ Trust Passport</span>
          <span>✓ Interview Practice</span>
          <span>✓ Salary Predictor</span>

          <button onClick={() => startPayment("pro")}>
            🚀 Upgrade Pro →
          </button>
        </div>

        <div className="price-card ultimate-card">
          <small>Best Value</small>
          <h3>Ultimate</h3>

          <div className="price-discount">
            <del>₹{plans.ultimate.actualPrice}/month</del>
            <h2>₹{getFinalPrice("ultimate")}/month</h2>
            <b>Offer price ₹{plans.ultimate.offerPrice}/month</b>
          </div>

          <p>For career accelerators</p>
          <span>✓ Everything in Pro</span>
          <span>✓ Priority recruiter visibility</span>
          <span>✓ AI Career Coach</span>
          <span>✓ Advanced insights</span>
          <span>✓ Ultimate Dashboard Access</span>

          <button onClick={() => startPayment("ultimate")}>
            {hasPremiumAccess() ? "👑 Open Ultimate Dashboard" : "👑 Upgrade Ultimate"}
          </button>
        </div>

        <div className="price-card dark">
          <h3>Ready to accelerate your career?</h3>
          <p>Use premium AI tools based on your real profile and live job data.</p>

          <button onClick={() => startPayment("ultimate")}>
            {hasPremiumAccess() ? "👑 Ultimate Dashboard" : "🚀 Upgrade Plan"}
          </button>

          <span>✅ Real-time career insights</span>
          <span>✅ Live job intelligence</span>
          <span>✅ Premium career tools</span>
        </div>
      </section>

            <section className="services-offers-grid">
        <article className="coupon-box">
          <div className="offer-card-heading">
            <div className="offer-card-icon" aria-hidden="true">🎟️</div>

            <div>
              <span className="offer-eyebrow">EXCLUSIVE ACCESS</span>
              <h2>Have a Coupon Code?</h2>
              <p>
                Enter a valid coupon code to unlock a limited premium experience.
                Codes are verified securely by our server.
              </p>
            </div>
          </div>

          <label className="coupon-field-label" htmlFor="service-coupon-code">
            Coupon code
          </label>

          <div className="coupon-input-wrapper">
            <input
              id="service-coupon-code"
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(event) => {
                setCouponCode(event.target.value);
                setCouponError("");
                setCouponMessage("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !couponLoading) {
                  applyCoupon();
                }
              }}
              autoComplete="off"
              spellCheck="false"
            />

            {!appliedCoupon ? (
              <button
                type="button"
                className="coupon-apply-btn"
                onClick={applyCoupon}
                disabled={couponLoading}
              >
                {couponLoading ? "Verifying..." : "Apply Coupon"}
              </button>
            ) : (
              <button
                type="button"
                className="coupon-remove-btn"
                onClick={removeCoupon}
              >
                Clear
              </button>
            )}
          </div>

          {couponError && (
            <div className="coupon-status coupon-status-error" role="alert">
              <span aria-hidden="true">!</span>
              <p>{couponError}</p>
            </div>
          )}

          {couponMessage && (
            <div className="coupon-status coupon-status-success" role="status">
              <span aria-hidden="true">✓</span>
              <div>
                <strong>Access activated</strong>
                <p>{couponMessage}</p>
                {temporaryAccessEndsAt && (
                  <small>
                    Available until{" "}
                    {new Date(temporaryAccessEndsAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                )}
              </div>
            </div>
          )}

          {!couponMessage && !couponError && (
            <div className="coupon-status coupon-status-info">
              <span aria-hidden="true">i</span>
              <p>Your coupon will be validated before access is activated.</p>
            </div>
          )}

          <div className="coupon-benefits">
            <div>
              <span className="coupon-benefit-icon" aria-hidden="true">◷</span>
              <div>
                <strong>Limited-time access</strong>
                <p>Eligible coupons can unlock premium services for 30 minutes.</p>
              </div>
            </div>

            <div>
              <span className="coupon-benefit-icon" aria-hidden="true">◇</span>
              <div>
                <strong>Premium experience</strong>
                <p>Explore eligible Ultimate tools during the access window.</p>
              </div>
            </div>
          </div>

          <p className="coupon-security-note">
            Coupon codes are case-sensitive and can be subject to account limits.
          </p>
        </article>

        <article className="referral-card">
          <div className="offer-card-heading">
            <div className="offer-card-icon referral-icon" aria-hidden="true">🎁</div>

            <div>
              <span className="offer-eyebrow">REFER &amp; EARN</span>
              <h2>Invite friends. Earn rewards.</h2>
              <p>
                Share your personal referral link. Rewards are credited only after
                a referral completes the required signup or subscription action.
              </p>
            </div>
          </div>

          <div className="referral-flow">
            <button
              type="button"
              className="referral-flow-action"
              onClick={shareReferralLink}
              disabled={referralLoading || !candidateId}
            >
              <span aria-hidden="true">👥</span>
              <strong>Invite friends</strong>
              <p>Share your secure referral link.</p>
            </button>

            <b aria-hidden="true">→</b>

            <div>
              <span aria-hidden="true">🎫</span>
              <strong>Earn rewards</strong>
              <p>Receive coupons or premium minutes.</p>
            </div>
          </div>

          <div className="referral-link-panel">
            <div>
              <span>Your referral link</span>
              <strong>
                {referralLoading
                  ? "Loading your referral link..."
                  : referralData.referralLink || "Sign in to generate your referral link"}
              </strong>
            </div>

            <div className="referral-link-actions">
              <button
                type="button"
                onClick={shareReferralLink}
                disabled={referralLoading || !referralData.referralLink}
              >
                Share
              </button>

              <button
                type="button"
                onClick={copyReferralLink}
                disabled={referralLoading || !referralData.referralLink}
              >
                {copyMessage || "Copy"}
              </button>
            </div>
          </div>

          {referralMessage && (
            <div className="referral-message" role="status">
              {referralMessage}
            </div>
          )}

          <div className="referral-stats">
            <div>
              <span>Total referrals</span>
              <strong>{referralData.stats.totalReferrals}</strong>
            </div>

            <div>
              <span>Successful</span>
              <strong>{referralData.stats.successfulReferrals}</strong>
            </div>

            <div>
              <span>Coupons earned</span>
              <strong>{referralData.stats.couponsEarned}</strong>
            </div>

            <div>
              <span>Premium time</span>
              <strong>{referralData.stats.premiumMinutesEarned} mins</strong>
            </div>
          </div>

          <p className="referral-note">
            More successful referrals unlock more rewards.
          </p>
        </article>
      </section>

      {upiCheckout && (
        <div
          className="upi-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeUpiCheckout();
            }
          }}
        >
          <section
            className="upi-checkout-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upi-checkout-title"
          >
            <button
              type="button"
              className="upi-modal-close"
              aria-label="Close payment window"
              onClick={closeUpiCheckout}
              disabled={upiSubmitting}
            >
              ×
            </button>

            <div className="upi-modal-heading">
              <span>UPI</span>
              <div>
                <small>SECURE MANUAL PAYMENT</small>
                <h2 id="upi-checkout-title">Complete your payment</h2>
                <p>
                  Pay using your preferred UPI application. NoPrompt Jobs never
                  asks for or stores your UPI PIN.
                </p>
              </div>
            </div>

            <div className="upi-order-summary">
              <div>
                <span>Selected plan</span>
                <strong>{upiCheckout.planName}</strong>
              </div>
              <div>
                <span>Amount to pay</span>
                <strong>₹{upiCheckout.amount}</strong>
              </div>
            </div>

            <div className="upi-merchant-box">
              <span>Pay to</span>
              <strong>{upiCheckout.businessName}</strong>
              <code>
                {upiCreating
                  ? "Preparing secure UPI request..."
                  : upiCheckout.upiId || "UPI ID unavailable"}
              </code>

              {upiCheckout.qrCodeDataUrl && (
                <div className="upi-qr-payment">
                  <div className="upi-qr-frame">
                    <img
                      src={upiCheckout.qrCodeDataUrl}
                      alt={`Scan to pay ₹${upiCheckout.amount} to ${upiCheckout.businessName}`}
                    />
                  </div>

                  <div>
                    <strong>Scan and pay</strong>
                    <p>
                      Open Google Pay, PhonePe, Paytm, BHIM or your banking
                      application on your phone and scan this QR code.
                    </p>
                  </div>
                </div>
              )}

              <div className="upi-payment-actions">
                <button
                  type="button"
                  onClick={openUpiApplication}
                  disabled={upiCreating || !upiCheckout.intentUrl}
                >
                  {upiCreating ? "Preparing..." : "Pay with UPI App"}
                </button>

                <button
                  type="button"
                  className="secondary"
                  onClick={copyBusinessUpiId}
                  disabled={upiCreating || !upiCheckout.upiId}
                >
                  Copy UPI ID
                </button>
              </div>

              <p className="upi-device-help">
                On mobile, “Pay with UPI App” opens an installed UPI app.
                On a laptop, scan the QR code using your phone.
              </p>
            </div>

            <div className="upi-divider">
              <span>After completing the payment</span>
            </div>

            <div className="upi-form-grid">
              <label>
                UPI transaction reference / UTR *
                <input
                  type="text"
                  placeholder="Enter the transaction reference"
                  value={upiReference}
                  onChange={(event) => {
                    setUpiReference(event.target.value);
                    setUpiError("");
                  }}
                  autoComplete="off"
                />
              </label>

              <label>
                Payer name
                <input
                  type="text"
                  placeholder="Name used for payment"
                  value={upiPayerName}
                  onChange={(event) => setUpiPayerName(event.target.value)}
                />
              </label>

              <label>
                Payer UPI ID (optional)
                <input
                  type="text"
                  placeholder="example@bank"
                  value={upiPayerId}
                  onChange={(event) => setUpiPayerId(event.target.value)}
                  autoComplete="off"
                />
              </label>

              <label>
                Payment date *
                <input
                  type="date"
                  value={upiPaymentDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setUpiPaymentDate(event.target.value)}
                />
              </label>
            </div>

            {upiError && (
              <div className="upi-message error" role="alert">
                {upiError}
              </div>
            )}

            {upiMessage && (
              <div className="upi-message success" role="status">
                {upiMessage}
              </div>
            )}

            <button
              type="button"
              className="upi-submit-button"
              onClick={submitUpiPayment}
              disabled={upiSubmitting || upiCreating || !upiCheckout.upiId}
            >
              {upiSubmitting
                ? "Submitting payment..."
                : "Submit Payment for Verification"}
            </button>

            <button
              type="button"
              className="upi-check-status-button"
              onClick={checkUpiPaymentStatus}
              disabled={paymentStatusLoading}
            >
              {paymentStatusLoading
                ? "Checking status..."
                : "I already submitted — Check Status"}
            </button>

            <p className="upi-security-note">
              Never share your UPI PIN, OTP or bank password with NoPrompt Jobs
              or anyone else. Access opens only after your payment is verified.
            </p>
          </section>
        </div>
      )}

      <style>{`
        .upi-modal-backdrop { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; padding: 24px; background: rgba(5, 12, 35, .7); backdrop-filter: blur(12px); }
        .upi-checkout-modal { position: relative; width: min(640px, 100%); max-height: calc(100vh - 48px); overflow-y: auto; padding: 32px; border: 1px solid rgba(117, 93, 255, .18); border-radius: 28px; background: #fff; box-shadow: 0 34px 90px rgba(5, 13, 42, .28); box-sizing: border-box; }
        .upi-modal-close { position: absolute; top: 18px; right: 18px; width: 38px; height: 38px; border: 0; border-radius: 12px; background: #f1f3fa; color: #17213d; font-size: 25px; cursor: pointer; }
        .upi-modal-heading { display: flex; gap: 17px; padding-right: 42px; }
        .upi-modal-heading > span { display: grid; place-items: center; flex: 0 0 60px; height: 60px; border-radius: 18px; background: linear-gradient(135deg, #2d6df6, #852de9); color: white; font-size: 15px; font-weight: 850; }
        .upi-modal-heading small { color: #6450dc; font-size: 11px; font-weight: 850; letter-spacing: .12em; }
        .upi-modal-heading h2 { margin: 6px 0 8px; color: #0e193b; font-size: 27px; }
        .upi-modal-heading p { margin: 0; color: #69738d; line-height: 1.6; }
        .upi-order-summary { display: grid; grid-template-columns: 1fr 1fr; margin-top: 25px; border: 1px solid #e5e8f3; border-radius: 17px; overflow: hidden; }
        .upi-order-summary > div { padding: 17px 20px; }
        .upi-order-summary > div + div { border-left: 1px solid #e5e8f3; }
        .upi-order-summary span, .upi-merchant-box > span { display: block; margin-bottom: 5px; color: #838ca4; font-size: 11px; }
        .upi-order-summary strong { color: #101a3c; font-size: 17px; }
        .upi-merchant-box { margin-top: 18px; padding: 21px; border-radius: 19px; background: linear-gradient(135deg, #f4f7ff, #f8f2ff); }
        .upi-merchant-box strong { color: #101a3c; font-size: 17px; }
        .upi-merchant-box code { display: block; margin-top: 6px; color: #4c45d1; font-family: inherit; font-size: 14px; font-weight: 800; }
        .upi-qr-payment { display: grid; grid-template-columns: 154px minmax(0, 1fr); align-items: center; gap: 18px; margin-top: 18px; padding: 16px; border: 1px solid #dfe3f5; border-radius: 18px; background: #fff; }
        .upi-qr-frame { display: grid; place-items: center; width: 154px; height: 154px; padding: 8px; border: 1px solid #e4e7f2; border-radius: 16px; background: #fff; box-sizing: border-box; box-shadow: 0 12px 30px rgba(27, 33, 82, .08); }
        .upi-qr-frame img { display: block; width: 100%; height: 100%; object-fit: contain; }
        .upi-qr-payment strong { display: block; color: #111b3e; font-size: 17px; }
        .upi-qr-payment p { margin: 8px 0 0; color: #68728d; font-size: 13px; line-height: 1.55; }
        .upi-device-help { margin: 12px 0 0; color: #747d96; font-size: 11px; line-height: 1.5; text-align: center; }
        .upi-payment-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 17px; }
        .upi-payment-actions button, .upi-submit-button, .upi-check-status-button { min-height: 49px; border: 0; border-radius: 14px; background: linear-gradient(135deg, #2e6df6, #822de8); color: white; font: inherit; font-weight: 800; cursor: pointer; }
        .upi-payment-actions .secondary, .upi-check-status-button { border: 1px solid #d7dcf0; background: white; color: #423ac8; }
        .upi-divider { display: flex; align-items: center; gap: 14px; margin: 24px 0; color: #838ca3; font-size: 11px; }
        .upi-divider::before, .upi-divider::after { content: ""; flex: 1; height: 1px; background: #e5e8f2; }
        .upi-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
        .upi-form-grid label { color: #1a2341; font-size: 12px; font-weight: 750; }
        .upi-form-grid input { width: 100%; height: 49px; margin-top: 8px; padding: 0 14px; border: 1px solid #dfe4f1; border-radius: 13px; outline: none; color: #121c3d; font: inherit; box-sizing: border-box; }
        .upi-form-grid input:focus { border-color: #6d5bec; box-shadow: 0 0 0 4px rgba(109, 91, 236, .1); }
        .upi-message { margin-top: 16px; padding: 13px 15px; border-radius: 12px; font-size: 13px; font-weight: 700; }
        .upi-message.error { border: 1px solid #ffcaca; background: #fff3f3; color: #b62e3b; }
        .upi-message.success { border: 1px solid #bcebd0; background: #effcf5; color: #13744c; }
        .upi-submit-button, .upi-check-status-button { width: 100%; margin-top: 18px; }
        .upi-check-status-button { margin-top: 10px; }
        .upi-submit-button:disabled, .upi-check-status-button:disabled, .upi-modal-close:disabled { cursor: not-allowed; opacity: .62; }
        .upi-security-note { margin: 14px 0 0; color: #7f889f; font-size: 11px; line-height: 1.5; text-align: center; }
        @media (max-width: 620px) { .upi-modal-backdrop { padding: 12px; } .upi-checkout-modal { padding: 24px 18px; border-radius: 22px; } .upi-form-grid, .upi-order-summary, .upi-payment-actions, .upi-qr-payment { grid-template-columns: 1fr; } .upi-qr-frame { width: min(230px, 100%); height: auto; aspect-ratio: 1; margin: 0 auto; } .upi-order-summary > div + div { border-top: 1px solid #e5e8f3; border-left: 0; } .upi-modal-heading > span { flex-basis: 50px; height: 50px; } .upi-modal-heading h2 { font-size: 23px; } }
      `}</style>

<footer className="services-footer-v2">
        <div>
          <img
            src="/logo.png"
            alt="NoPromptJobs"
            onClick={() => goTo(dashboardPath)}
          />
          <p>
            AI-powered platform to help you find better jobs, build skills and
            grow your career.
          </p>
        </div>

        <div>
          <h4>Platform</h4>
          <button onClick={() => goTo(dashboardPath)}>Dashboard</button>
          <button onClick={() => goTo("/jobs")}>Jobs</button>
          <button onClick={() => goTo("/companies")}>Companies</button>
          <button onClick={() => goTo("/services")}>Services</button>
        </div>

        <div>
          <h4>Tools</h4>
          <button onClick={() => goTo("/resume-studio")}>AI Resume Studio</button>
          <button onClick={() => goTo("/ai-interview-prep")}>Interview Prep</button>
          <button onClick={() => goTo("/skill-assessment")}>Skill Assessment</button>
          <button onClick={() => goTo("/salary-predictor")}>Salary Predictor</button>
        </div>

        <div>
          <h4>Company</h4>
          <button onClick={() => goTo("/about")}>About Us</button>
          <button onClick={() => goTo("/careers")}>Careers</button>
          <button onClick={() => goTo("/blog")}>Blog</button>
          <button onClick={() => goTo("/contact")}>Contact Us</button>
        </div>

        <div>
          <h4>Connect With Us</h4>
          <div className="footer-socials">
            <button
              type="button"
              className="social-instagram"
              aria-label="Open NoPromptJobs on Instagram"
              onClick={() => window.open("https://instagram.com", "_blank", "noopener,noreferrer")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <defs>
                  <linearGradient id="servicesInstagramGradient" x1="3" y1="21" x2="21" y2="3">
                    <stop offset="0%" stopColor="#ffdc80" />
                    <stop offset="24%" stopColor="#fcaf45" />
                    <stop offset="48%" stopColor="#f77737" />
                    <stop offset="72%" stopColor="#e1306c" />
                    <stop offset="100%" stopColor="#833ab4" />
                  </linearGradient>
                </defs>
                <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="url(#servicesInstagramGradient)" strokeWidth="2.2" />
                <circle cx="12" cy="12" r="4.1" fill="none" stroke="url(#servicesInstagramGradient)" strokeWidth="2.2" />
                <circle cx="17.4" cy="6.7" r="1.2" fill="#e1306c" />
              </svg>
            </button>

            <button
              type="button"
              className="social-facebook"
              aria-label="Open NoPromptJobs on Facebook"
              onClick={() => window.open("https://facebook.com", "_blank", "noopener,noreferrer")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" fill="#1877f2" />
                <path d="M14.2 8.2h2.6V4.7c-.45-.06-1.95-.2-3.4-.2-3.35 0-5.65 2.05-5.65 5.85V13H4.2v4h3.55v7h4.6v-7h3.65l.58-4h-4.23v-2.25c0-1.15.32-2.55 1.85-2.55Z" fill="#fff" />
              </svg>
            </button>

            <button
              type="button"
              className="social-youtube"
              aria-label="Open NoPromptJobs on YouTube"
              onClick={() => window.open("https://youtube.com", "_blank", "noopener,noreferrer")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="5" fill="#ff0000" />
                <path d="m10 8.5 6 3.5-6 3.5v-7Z" fill="#fff" />
              </svg>
            </button>

            <button
              type="button"
              className="social-linkedin"
              aria-label="Open NoPromptJobs on LinkedIn"
              onClick={() => window.open("https://linkedin.com", "_blank", "noopener,noreferrer")}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" fill="#0a66c2" />
                <circle cx="7.1" cy="8" r="1.7" fill="#fff" />
                <rect x="5.7" y="10.2" width="2.9" height="8" rx=".7" fill="#fff" />
                <path d="M10.4 10.2h2.8v1.1c.7-.9 1.7-1.45 3.15-1.45 2.65 0 3.95 1.65 3.95 4.7v3.65h-2.95v-3.4c0-1.6-.5-2.45-1.65-2.45-1.3 0-2.15.9-2.15 2.75v3.1h-3.15v-8Z" fill="#fff" />
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
