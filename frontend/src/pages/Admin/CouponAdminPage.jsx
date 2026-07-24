import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./CouponAdminPage.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyForm = {
  code: "",
  title: "",
  description: "",
  rewardType: "PREMIUM_MINUTES",
  premiumMinutes: 30,
  discountPercent: 0,
  discountAmount: 0,
  usageLimit: 100,
  perUserLimit: 1,
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: "2027-12-31",
  isActive: true,
};

function CouponAdminPage() {
  const [adminKey, setAdminKey] = useState(
    localStorage.getItem("couponAdminKey") || ""
  );
  const [coupons, setCoupons] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const headers = useMemo(
    () => ({
      "x-admin-key": adminKey,
    }),
    [adminKey]
  );

  const loadCoupons = async () => {
    if (!adminKey) return;

    try {
      setLoading(true);
      setError("");

      const [couponResponse, analyticsResponse] =
        await Promise.all([
          axios.get(`${API_URL}/api/admin/coupons`, {
            params: { search, status },
            headers,
          }),
          axios.get(
            `${API_URL}/api/admin/coupons/analytics`,
            { headers }
          ),
        ]);

      setCoupons(couponResponse.data?.data || []);
      setAnalytics(analyticsResponse.data?.data || null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load coupons."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [adminKey, search, status]);

  const saveAdminKey = () => {
    localStorage.setItem("couponAdminKey", adminKey);
    loadCoupons();
  };

  const submitCoupon = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");
      setMessage("");

      if (editingId) {
        await axios.put(
          `${API_URL}/api/admin/coupons/${editingId}`,
          form,
          { headers }
        );

        setMessage("Coupon updated successfully.");
      } else {
        await axios.post(
          `${API_URL}/api/admin/coupons`,
          form,
          { headers }
        );

        setMessage("Coupon created successfully.");
      }

      setForm(emptyForm);
      setEditingId("");
      await loadCoupons();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to save coupon."
      );
    } finally {
      setLoading(false);
    }
  };

  const editCoupon = (coupon) => {
    setEditingId(coupon._id);
    setForm({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || "",
      rewardType: coupon.rewardType,
      premiumMinutes: coupon.premiumMinutes || 0,
      discountPercent: coupon.discountPercent || 0,
      discountAmount: coupon.discountAmount || 0,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit,
      validFrom: new Date(coupon.validFrom)
        .toISOString()
        .slice(0, 10),
      validUntil: new Date(coupon.validUntil)
        .toISOString()
        .slice(0, 10),
      isActive: coupon.isActive,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCoupon = async (coupon) => {
    try {
      await axios.patch(
        `${API_URL}/api/admin/coupons/${coupon._id}/status`,
        { isActive: !coupon.isActive },
        { headers }
      );

      await loadCoupons();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to change coupon status."
      );
    }
  };

  const deleteCoupon = async (coupon) => {
    if (!window.confirm(`Delete ${coupon.code}?`)) return;

    try {
      const response = await axios.delete(
        `${API_URL}/api/admin/coupons/${coupon._id}`,
        { headers }
      );

      setMessage(response.data?.message || "Coupon removed.");
      await loadCoupons();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to remove coupon."
      );
    }
  };

  return (
    <main className="coupon-admin-page">
      <header className="coupon-admin-header">
        <div>
          <span>NO PROMPT JOBS</span>
          <h1>Coupon Management</h1>
          <p>
            Create, activate, deactivate and monitor genuine
            MongoDB-backed coupons.
          </p>
        </div>

        <div className="admin-key-box">
          <label htmlFor="coupon-admin-key">
            Coupon admin key
          </label>
          <div>
            <input
              id="coupon-admin-key"
              type="password"
              value={adminKey}
              onChange={(event) =>
                setAdminKey(event.target.value)
              }
              placeholder="Enter COUPON_ADMIN_KEY"
            />
            <button type="button" onClick={saveAdminKey}>
              Connect
            </button>
          </div>
        </div>
      </header>

      {analytics && (
        <section className="coupon-analytics">
          <article>
            <span>Total coupons</span>
            <strong>{analytics.totalCoupons}</strong>
          </article>
          <article>
            <span>Active</span>
            <strong>{analytics.activeCoupons}</strong>
          </article>
          <article>
            <span>Redemptions</span>
            <strong>{analytics.totalRedemptions}</strong>
          </article>
          <article>
            <span>Premium minutes</span>
            <strong>
              {analytics.premiumMinutesGranted}
            </strong>
          </article>
        </section>
      )}

      <section className="coupon-admin-layout">
        <form
          className="coupon-editor"
          onSubmit={submitCoupon}
        >
          <div className="section-heading">
            <div>
              <span>COUPON EDITOR</span>
              <h2>
                {editingId ? "Edit coupon" : "Create coupon"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setEditingId("");
                  setForm(emptyForm);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="coupon-form-grid">
            <label>
              Code
              <input
                value={form.code}
                onChange={(event) =>
                  setForm({
                    ...form,
                    code: event.target.value.toUpperCase(),
                  })
                }
                required
              />
            </label>

            <label>
              Title
              <input
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                  })
                }
                required
              />
            </label>

            <label className="full-width">
              Description
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Reward type
              <select
                value={form.rewardType}
                onChange={(event) =>
                  setForm({
                    ...form,
                    rewardType: event.target.value,
                  })
                }
              >
                <option value="PREMIUM_MINUTES">
                  Premium minutes
                </option>
                <option value="DISCOUNT_PERCENT">
                  Percentage discount
                </option>
                <option value="DISCOUNT_AMOUNT">
                  Fixed discount
                </option>
              </select>
            </label>

            {form.rewardType === "PREMIUM_MINUTES" && (
              <label>
                Premium minutes
                <input
                  type="number"
                  min="1"
                  value={form.premiumMinutes}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      premiumMinutes: Number(
                        event.target.value
                      ),
                    })
                  }
                />
              </label>
            )}

            {form.rewardType === "DISCOUNT_PERCENT" && (
              <label>
                Discount percentage
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form.discountPercent}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      discountPercent: Number(
                        event.target.value
                      ),
                    })
                  }
                />
              </label>
            )}

            {form.rewardType === "DISCOUNT_AMOUNT" && (
              <label>
                Discount amount
                <input
                  type="number"
                  min="1"
                  value={form.discountAmount}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      discountAmount: Number(
                        event.target.value
                      ),
                    })
                  }
                />
              </label>
            )}

            <label>
              Total usage limit
              <input
                type="number"
                min="1"
                value={form.usageLimit}
                onChange={(event) =>
                  setForm({
                    ...form,
                    usageLimit: Number(
                      event.target.value
                    ),
                  })
                }
              />
            </label>

            <label>
              Per-user limit
              <input
                type="number"
                min="1"
                value={form.perUserLimit}
                onChange={(event) =>
                  setForm({
                    ...form,
                    perUserLimit: Number(
                      event.target.value
                    ),
                  })
                }
              />
            </label>

            <label>
              Valid from
              <input
                type="date"
                value={form.validFrom}
                onChange={(event) =>
                  setForm({
                    ...form,
                    validFrom: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Valid until
              <input
                type="date"
                value={form.validUntil}
                onChange={(event) =>
                  setForm({
                    ...form,
                    validUntil: event.target.value,
                  })
                }
                required
              />
            </label>
          </div>

          <label className="active-toggle">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm({
                  ...form,
                  isActive: event.target.checked,
                })
              }
            />
            Coupon is active
          </label>

          {error && (
            <div className="admin-message error">
              {error}
            </div>
          )}

          {message && (
            <div className="admin-message success">
              {message}
            </div>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading || !adminKey}
          >
            {loading
              ? "Saving..."
              : editingId
                ? "Update coupon"
                : "Create coupon"}
          </button>
        </form>

        <section className="coupon-list-panel">
          <div className="coupon-list-toolbar">
            <div>
              <span>LIVE DATABASE</span>
              <h2>Coupons</h2>
            </div>

            <div className="coupon-filters">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search coupons"
              />

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
              >
                <option value="">All status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="coupon-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Coupon</th>
                  <th>Reward</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id}>
                    <td>
                      <strong>{coupon.code}</strong>
                      <span>{coupon.title}</span>
                    </td>

                    <td>
                      {coupon.rewardType ===
                        "PREMIUM_MINUTES" &&
                        `${coupon.premiumMinutes} mins`}

                      {coupon.rewardType ===
                        "DISCOUNT_PERCENT" &&
                        `${coupon.discountPercent}%`}

                      {coupon.rewardType ===
                        "DISCOUNT_AMOUNT" &&
                        `₹${coupon.discountAmount}`}
                    </td>

                    <td>
                      {coupon.usedCount}/{coupon.usageLimit}
                    </td>

                    <td>
                      <span
                        className={
                          coupon.isActive
                            ? "status-pill active"
                            : "status-pill inactive"
                        }
                      >
                        {coupon.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          onClick={() => editCoupon(coupon)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleCoupon(coupon)}
                        >
                          {coupon.isActive
                            ? "Disable"
                            : "Enable"}
                        </button>

                        <button
                          type="button"
                          className="danger"
                          onClick={() => deleteCoupon(coupon)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!coupons.length && !loading && (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No coupons found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export default CouponAdminPage;
