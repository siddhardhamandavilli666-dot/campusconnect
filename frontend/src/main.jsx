import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight, CheckCircle2, ClipboardList, Search,
  ShoppingBag, Store, Plus, LogOut, X, Send,
  Users, Target, Star, PackageCheck
} from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";

const rawApiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").trim().replace(/\/+$/, "");
export const API = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;
export const FILE_BASE_URL = (import.meta.env.VITE_FILE_BASE_URL || API.replace(/\/api$/, "")).trim().replace(/\/+$/, "");

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function api(path, options = {}) {
  const token = localStorage.getItem("cc_token");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(API + path, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function App() {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("cc_user") || "null")
  );

  const [page, setPage] = useState("home");
  const [showRequest, setShowRequest] = useState(false);
  const [toast, setToast] = useState(null);

  function notify(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function login(data) {
    localStorage.setItem("cc_token", data.token);
    localStorage.setItem("cc_user", JSON.stringify(data.user));

    setUser(data.user);
    setPage("dashboard");
    notify("Login successful");
  }

  function logout() {
    localStorage.clear();
    setUser(null);
    setPage("home");
  }

  if (!user) {
    if (page === "login") {
      return (
        <Auth
          mode="login"
          setPage={setPage}
          onLogin={login}
          notify={notify}
        />
      );
    }

    if (page === "register") {
      return (
        <Auth
          mode="register"
          setPage={setPage}
          onLogin={login}
          notify={notify}
        />
      );
    }

    return <Home setPage={setPage} />;
  }

  return (
    <>
      <Navbar
        user={user}
        page={page}
        setPage={setPage}
        logout={logout}
      />

      {page === "home" && <Home setPage={setPage} />}

      {page === "services" && (
        <Services
          user={user}
          openRequest={() => setShowRequest(true)}
        />
      )}

      {page === "about" && <About />}

      {page === "venture" && <Venture />}

      {page === "dashboard" && user.role === "student" && (
        <StudentDashboard
          user={user}
          openRequest={() => setShowRequest(true)}
          notify={notify}
        />
      )}

      {page === "dashboard" && user.role === "vendor" && (
        <VendorDashboard notify={notify} />
      )}

      {showRequest && user.role === "student" && (
        <NewRequestModal
          close={() => setShowRequest(false)}
          notify={notify}
        />
      )}

      {toast && (
        <div className={`toast-message ${toast.type}`}>
          <CheckCircle2 size={18} />
          {toast.message}
        </div>
      )}
    </>
  );
}

function Navbar({ user, page, setPage, logout }) {
  return (
    <nav className="navbar-custom">
      <button className="brand-btn" onClick={() => setPage("home")}>
        <span className="logo">C</span>
        Campus<span>Connect</span>
      </button>

      <div className="nav-links">
        <button className={page === "home" ? "selected" : ""} onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("services")}>Services</button>
        <button onClick={() => setPage("about")}>About</button>
        <button onClick={() => setPage("venture")}>Venture</button>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
      </div>

      <div className="nav-actions">
        <span className="user-chip">{user.name}</span>
        <button className="btn btn-outline-danger btn-sm nav-logout" onClick={logout}>
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </nav>
  );
}

function Home({ setPage }) {
  return (
    <>
      <section className="hero">
        <div className="hero-grid" />

        <div className="hero-copy">
          <div className="eyebrow">
            <span className="pulse" />
            CAMPUS SERVICES, CONNECTED
          </div>

          <h1>
            Everything your campus needs, <span>in one place.</span>
          </h1>

          <p>
            CampusConnect connects students with trusted campus and local
            service providers for printing, food, repairs, stationery,
            transport and more.
          </p>

          <div className="hero-actions">
            <button className="btn-primary-cc" onClick={() => setPage("register")}>
              Get Started <ArrowRight size={18} />
            </button>

            <button className="btn-ghost-cc" onClick={() => setPage("services")}>
              Explore Services
            </button>
          </div>

          <div className="trust-row">
            <span><CheckCircle2 size={15} /> Student focused</span>
            <span><CheckCircle2 size={15} /> Local vendors</span>
            <span><CheckCircle2 size={15} /> Simple ordering</span>
          </div>
        </div>

        <div className="scene-wrap">
          <div className="campus-scene">
            <div className="ring ring1" />
            <div className="ring ring2" />
            <div className="orb orb-a" />
            <div className="orb orb-b" />

            <div className="campus-3d">
              <div className="roof" />
              <div className="building">
                <div className="windows">
                  <i /><i /><i /><i /><i /><i />
                </div>
                <div className="door" />
              </div>
              <div className="path" />
              <div className="cap">◆</div>
            </div>

            <div className="scene-card card-top">
              <Store size={18} />
              <div>
                <b>Verified Vendors</b>
                <small>Trusted local services</small>
              </div>
            </div>

            <div className="scene-card card-left">
              <ClipboardList size={18} />
              <div>
                <b>New Request</b>
                <small>Get quotes quickly</small>
              </div>
            </div>

            <div className="scene-card card-right">
              <ShoppingBag size={18} />
              <div>
                <b>Order Tracking</b>
                <small>Follow your service</small>
              </div>
            </div>

            <div className="floating-icon fi1">🍔</div>
            <div className="floating-icon fi2">🖨️</div>
            <div className="floating-icon fi3">🔧</div>
            <div className="floating-icon fi4">📚</div>
          </div>
        </div>
      </section>

      <section className="search-strip">
        <div>
          <div className="mini-label">DISCOVER</div>
          <h3>What do you need today?</h3>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input placeholder="Search printing, food, repairs..." />
          <button onClick={() => setPage("services")}>Search</button>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div className="eyebrow">SERVICES</div>
          <h2>Campus life, made easier.</h2>
          <p>
            Find everyday services without wasting time searching across
            multiple places.
          </p>
        </div>

        <div className="category-grid">
          {[
            ["🖨️", "Printing", "Projects, assignments and documents"],
            ["🍔", "Food", "Meals, snacks and quick delivery"],
            ["📚", "Stationery", "Books, notes and supplies"],
            ["🔧", "Repairs", "Laptop, phone and other repairs"]
          ].map(([icon, title, text]) => (
            <button
              className="category-card"
              key={title}
              onClick={() => setPage("services")}
            >
              <span className="cat-icon">{icon}</span>
              <b>{title}</b>
              <small>{text}</small>
              <ArrowRight className="cat-arrow" size={18} />
            </button>
          ))}
        </div>
      </section>

      <section className="section problem-section">
        <div className="split">
          <div>
            <div className="eyebrow green">THE PROBLEM</div>
            <h2>
              Students shouldn't have to <span>search everywhere.</span>
            </h2>

            <div className="problem-points">
              <p><CheckCircle2 size={18} /> Difficult to find reliable nearby services</p>
              <p><CheckCircle2 size={18} /> No easy way to compare quotations</p>
              <p><CheckCircle2 size={18} /> Unclear order and service status</p>
            </div>
          </div>

          <div className="stat-3d">
            <div className="stat-card">
              <strong>1</strong>
              <span>Connected campus platform</span>
            </div>

            <div className="stat-card offset">
              <strong>3</strong>
              <span>Simple steps: request, quote, order</span>
            </div>

            <div className="stat-card">
              <strong>24/7</strong>
              <span>Digital access to services</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section dark-section">
        <div className="section-head">
          <div className="eyebrow">HOW IT WORKS</div>
          <h2>Request. Compare. Connect.</h2>
          <p>One simple workflow for students and vendors.</p>
        </div>

        <div className="steps">
          <Step number="01" icon={<ClipboardList />} title="Create" text="Tell us what service you need and submit a request." />
          <Step number="02" icon={<Search />} title="Discover" text="Vendors see your request and send quotations." />
          <Step number="03" icon={<ShoppingBag />} title="Connect" text="Choose a quotation, place an order and track it." />
        </div>
      </section>

      <section className="section cta-section">
        <div className="cta-3d">
          <div>
            <div className="eyebrow green">READY TO CONNECT?</div>
            <h2>Make campus life <span>simpler.</span></h2>
            <p>
              Join CampusConnect as a student or vendor and bring campus
              services into one connected platform.
            </p>
            <button className="btn-primary-cc" onClick={() => setPage("register")}>
              Create Account <ArrowRight size={18} />
            </button>
          </div>

          <div className="mini-globe">
            <div className="globe-ring" />
            <div className="globe-core"><Users size={38} /></div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function Step({ number, icon, title, text }) {
  return (
    <div className="step-card">
      <span>{number}</span>
      {icon}
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer>
      <div>
        <div className="brand footer-brand">
          <span className="logo">C</span> Campus<span>Connect</span>
        </div>
        <p>Connecting students and campus service providers through one simple platform.</p>
      </div>

      <div>
        <b>Platform</b>
        <span>Students</span>
        <span>Vendors</span>
        <span>Services</span>
      </div>

      <div>
        <b>Venture</b>
        <span>Problem</span>
        <span>Solution</span>
        <span>Business Model</span>
      </div>

      <div>
        <b>Project</b>
        <span>EDVC</span>
        <span>CampusConnect</span>
        <span>2026</span>
      </div>

      <div className="footer-bottom">
        CampusConnect
      </div>
    </footer>
  );
}

function Services({ user, openRequest }) {
  return (
    <div className="inner-page">
      <section className="page-hero">
        <div className="eyebrow">CAMPUS SERVICES</div>
        <h1>Find the service you <span>need.</span></h1>
        <p>
          Students can request services and vendors can respond with
          quotations through the platform.
        </p>
      </section>

      <section className="section">
        <div className="category-grid">
          {[
            ["🖨️", "Printing", "Assignments, projects and documents"],
            ["🍔", "Food", "Meals and snacks"],
            ["📚", "Stationery", "Books and supplies"],
            ["🔧", "Repairs", "Laptop and phone repairs"],
            ["🚗", "Transport", "Campus and local travel"],
            ["📦", "Other", "Any campus-related service"]
          ].map(([icon, title, text]) => (
            <div className="category-card" key={title}>
              <span className="cat-icon">{icon}</span>
              <b>{title}</b>
              <small>{text}</small>
            </div>
          ))}
        </div>

        {user?.role === "student" && (
          <div className="service-cta">
            <div>
              <h2>Need something?</h2>
              <p>Create a request and let vendors send you quotations.</p>
            </div>
            <button className="btn-primary-cc" onClick={openRequest}>
              <Plus size={18} /> New Request
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function About() {
  return (
    <div className="inner-page">
      <section className="page-hero">
        <div className="eyebrow">ABOUT</div>
        <h1>Built around <span>student needs.</span></h1>
        <p>
          CampusConnect is a campus-focused service marketplace designed to
          reduce the time students spend finding reliable services.
        </p>
      </section>

      <section className="section">
        <div className="venture-grid">
          <InfoCard icon={<Target />} title="Problem" text="Students often depend on scattered contacts and informal searches to find services." />
          <InfoCard icon={<CheckCircle2 />} title="Solution" text="One platform for service requests, vendor quotations and order tracking." />
          <InfoCard icon={<Users />} title="Community" text="Students create demand while local vendors gain access to campus customers." />
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="venture-card">
      {icon}
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Venture() {
  return (
    <div className="inner-page">
      <section className="page-hero">
        <div className="eyebrow">EDVC VENTURE</div>
        <h1>CampusConnect <span>Business Model.</span></h1>
        <p>
          A simple campus marketplace connecting students with trusted
          service providers.
        </p>
      </section>

      <section className="section">
        <div className="venture-grid">
          <InfoCard title="Customer Segments" icon={<Users />} text="Students, campus communities and local service providers." />
          <InfoCard title="Value Proposition" icon={<Star />} text="Fast service discovery, quotation comparison and simple tracking." />
          <InfoCard title="Channels" icon={<Search />} text="Web platform, campus promotion and student communities." />
          <InfoCard title="Revenue" icon={<ShoppingBag />} text="Small commission on completed orders and optional vendor plans." />
          <InfoCard title="Key Partners" icon={<Store />} text="Local vendors, campus clubs and student communities." />
          <InfoCard title="Key Activities" icon={<PackageCheck />} text="Vendor onboarding, platform management and customer support." />
        </div>
      </section>

      <section className="section">
        <div className="validation-card">
          <div>
            <h2>Business Model <span>Canvas</span></h2>
            <p>
              CampusConnect creates value by bringing fragmented campus
              services into one digital marketplace.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Auth({ mode, setPage, onLogin, notify }) {
  const [type, setType] = useState(mode);
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = type === "login"
        ? "/auth/login"
        : "/auth/register";

      const body = type === "login"
        ? form
        : { ...form, role };

      const data = await api(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
      });

      onLogin(data);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-side">
          <div className="logo big">C</div>
          <h2>Campus<span>Connect</span></h2>
          <p>
            Connect with services, vendors and opportunities around your campus.
          </p>
          <div className="hero-pill">Create → Discover → Connect</div>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <div className="auth-tabs">
            <button type="button" className={type === "login" ? "active" : ""} onClick={() => setType("login")}>
              Login
            </button>
            <button type="button" className={type === "register" ? "active" : ""} onClick={() => setType("register")}>
              Register
            </button>
          </div>

          {type === "register" && (
            <>
              <label>
                Full Name
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </label>

              <label>
                Account Type
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="vendor">Vendor</option>
                </select>
              </label>
            </>
          )}

          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </label>

          <button className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? "Please wait..." : type === "login" ? "Login" : "Create Account"}
          </button>

          <button
            type="button"
            className="btn btn-light"
            onClick={() => setPage("home")}
          >
            Back to Home
          </button>
        </form>
      </div>
    </div>
  );
}

function StudentDashboard({ user, openRequest, notify }) {
  const [requests, setRequests] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState(null);

  async function load() {
    try {
      const [requestData, quoteData, orderData] = await Promise.all([
        api("/requests/my"),
        api("/quotations/my"),
        api("/orders/my")
      ]);

      setRequests(requestData);
      setQuotes(quoteData);
      setOrders(orderData);
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function acceptQuote(id) {
    try {
      await api(`/quotations/${id}/accept`, {
        method: "POST"
      });

      notify("Quotation accepted. Order created.");
      load();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function payForOrder(order) {
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        notify("Razorpay Checkout could not be loaded. Check your internet connection.", "error");
        return;
      }

      const payment = await api("/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ order_id: order.id })
      });

      const options = {
        key: payment.key_id,
        amount: payment.amount,
        currency: payment.currency,
        name: payment.name,
        description: payment.description,
        order_id: payment.razorpay_order_id,
        prefill: payment.prefill,
        theme: { color: "#4f46e5" },
        handler: async (response) => {
          try {
            await api("/payments/verify", {
              method: "POST",
              body: JSON.stringify({
                order_id: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            notify("Payment successful");
            load();
          } catch (error) {
            notify(error.message, "error");
          }
        },
        modal: {
          ondismiss: () => notify("Payment window closed", "error")
        }
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", () => notify("Payment failed. Please try again.", "error"));
      checkout.open();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function review(orderId, rating, comment) {
    try {
      await api("/reviews", {
        method: "POST",
        body: JSON.stringify({
          order_id: orderId,
          rating,
          comment
        })
      });

      notify("Review submitted successfully");
      setReviewOrder(null);
    } catch (error) {
      notify(error.message, "error");
    }
  }

  return (
    <main className="dashboard-main">
      <div className="dashboard-head">
        <div>
          <div className="eyebrow">STUDENT DASHBOARD</div>
          <h1>Welcome, <span>{user.name}</span></h1>
          <p>Manage your service requests, quotations and orders.</p>
        </div>

        <button className="btn-primary-cc" onClick={openRequest}>
          <Plus size={19} /> New Request
        </button>
      </div>

      <section className="container">
        <div className="metric-row">
          <Metric icon={<ClipboardList />} value={requests.length} label="My Requests" />
          <Metric icon={<Send />} value={quotes.length} label="Quotations" />
          <Metric icon={<ShoppingBag />} value={orders.length} label="Orders" />
        </div>

        <DashboardCard title="My Requests">
          {loading ? <p>Loading...</p> :
            requests.length === 0
              ? <Empty text="No requests yet. Click New Request to create one." />
              : requests.map(request => (
                <div className="list-row" key={request.id}>
                  <div className="icon-box"><ClipboardList size={20}/></div>
                  <div>
                    <strong>{request.title}</strong>
                    <small>{request.service_type} · {request.location}</small>
                    {request.file_name && (
                      <small className="attachment-note">📎 {request.file_name}</small>
                    )}
                  </div>
                  <span className="status">{request.status}</span>
                </div>
              ))
          }
        </DashboardCard>

        <DashboardCard title="Quotations">
          {quotes.length === 0
            ? <Empty text="Vendor quotations will appear here." />
            : quotes.map(quote => (
              <div className="quote-row" key={quote.id}>
                <div>
                  <strong>{quote.title}</strong>
                  <small>{quote.vendor_name} · ₹{quote.amount}</small>
                  {quote.message && <p>{quote.message}</p>}
                </div>

                {quote.status === "PENDING" && (
                  <button
                    className="btn btn-success"
                    onClick={() => acceptQuote(quote.id)}
                  >
                    Accept
                  </button>
                )}

                <span className="status">{quote.status}</span>
              </div>
            ))
          }
        </DashboardCard>

        <DashboardCard title="Orders">
          {orders.length === 0
            ? <Empty text="Accepted quotations become orders." />
            : orders.map(order => (
              <div className="list-row" key={order.id}>
                <div className="icon-box"><ShoppingBag size={20}/></div>
                <div>
                  <strong>{order.title}</strong>
                  <small>Vendor: {order.vendor_name} · ₹{order.amount}</small>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="status">{order.status}</span>
                  <span className="status">Payment: {order.payment_status || "PENDING"}</span>
                  {order.payment_status !== "PAID" && order.status !== "CANCELLED" && (
                    <button className="btn btn-sm btn-success" onClick={() => payForOrder(order)}>
                      Pay ₹{order.amount}
                    </button>
                  )}
                  {order.status === "COMPLETED" && (
                    <button className="btn btn-sm btn-outline-success" onClick={() => setReviewOrder(order)}>
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))
          }
        </DashboardCard>
      </section>

      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          close={() => setReviewOrder(null)}
          submit={review}
        />
      )}
    </main>
  );
}

function VendorDashboard({ notify }) {
  const [requests, setRequests] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quoteRequest, setQuoteRequest] = useState(null);

  async function load() {
    try {
      const [requestData, quoteData, orderData] = await Promise.all([
        api("/requests/open"),
        api("/quotations/vendor"),
        api("/orders/my")
      ]);

      setRequests(requestData);
      setQuotes(quoteData);
      setOrders(orderData);
    } catch (error) {
      notify(error.message, "error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateOrder(id, status) {
    try {
      await api(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });

      notify("Order status updated");
      load();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  async function submitQuotation(event) {
    event.preventDefault();

    const data = new FormData(event.target);

    try {
      await api("/quotations", {
        method: "POST",
        body: JSON.stringify({
          request_id: quoteRequest.id,
          amount: data.get("amount"),
          message: data.get("message")
        })
      });

      notify("Quotation submitted successfully");
      setQuoteRequest(null);
      load();
    } catch (error) {
      notify(error.message, "error");
    }
  }

  return (
    <main className="dashboard-main">
      <div className="dashboard-head">
        <div>
          <div className="eyebrow">VENDOR DASHBOARD</div>
          <h1>Manage your <span>services.</span></h1>
          <p>Find requests, submit quotations and manage accepted orders.</p>
        </div>
      </div>

      <section className="container">
        <div className="metric-row">
          <Metric icon={<ClipboardList />} value={requests.length} label="Open Requests" />
          <Metric icon={<Send />} value={quotes.length} label="My Quotations" />
          <Metric icon={<ShoppingBag />} value={orders.length} label="My Orders" />
        </div>

        <DashboardCard title="Student Service Requests">
          {requests.length === 0
            ? <Empty text="There are no open student requests right now." />
            : requests.map(request => (
              <div className="request-card" key={request.id}>
                <div>
                  <span className="pill">{request.service_type}</span>
                  <h4>{request.title}</h4>
                  <p>{request.description}</p>
                  <small>
                    Student: {request.student_name} · {request.location} ·
                    Budget: ₹{request.budget}
                  </small>

                  {request.service_type === "Printing" && (
                    <div className="request-details">
                      <span>Copies: {request.copies}</span>
                      <span>{request.print_type}</span>
                      <span>{request.paper_size}</span>
                      <span>{request.sides}</span>
                    </div>
                  )}

                  {request.service_type === "Repair" && request.device_type && (
                    <div className="request-details">
                      <span>Device: {request.device_type}</span>
                    </div>
                  )}

                  {request.service_type === "Transport" && (
                    <div className="request-details">
                      <span>From: {request.pickup_location}</span>
                      <span>To: {request.drop_location}</span>
                      {request.travel_date && <span>Date: {request.travel_date}</span>}
                      {request.travel_time && <span>Time: {request.travel_time}</span>}
                      <span>People: {request.people_count || 1}</span>
                    </div>
                  )}

                  {request.special_requirements && (
                    <p className="request-extra"><strong>Special requirements:</strong> {request.special_requirements}</p>
                  )}

                  {request.file_url && (
                    <a
                      className="attachment-link"
                      href={`${FILE_BASE_URL}${request.file_url}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      📎 View / Download {request.file_name}
                    </a>
                  )}
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setQuoteRequest(request)}
                >
                  <Send size={16}/> Send Quotation
                </button>
              </div>
            ))
          }
        </DashboardCard>

        <DashboardCard title="My Quotations">
          {quotes.length === 0
            ? <Empty text="Your submitted quotations will appear here." />
            : quotes.map(quote => (
              <div className="list-row" key={quote.id}>
                <div className="icon-box"><Send size={19}/></div>
                <div>
                  <strong>{quote.title}</strong>
                  <small>Student: {quote.student_name} · ₹{quote.amount}</small>
                </div>
                <span className="status">{quote.status}</span>
              </div>
            ))
          }
        </DashboardCard>

        <DashboardCard title="My Orders">
          {orders.length === 0
            ? <Empty text="Accepted student quotations will become orders here." />
            : orders.map(order => (
              <div className="list-row" key={order.id}>
                <div className="icon-box"><ShoppingBag size={19}/></div>
                <div>
                  <strong>{order.title}</strong>
                  <small>Student: {order.student_name} · ₹{order.amount}</small>
                </div>

                <select
                  className="order-status-select"
                  value={order.status}
                  onChange={e => updateOrder(order.id, e.target.value)}
                >
                  <option value="PLACED">PLACED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
            ))
          }
        </DashboardCard>
      </section>

      {quoteRequest && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={submitQuotation}>
            <button type="button" className="close" onClick={() => setQuoteRequest(null)}>
              <X/>
            </button>

            <h3>Send Quotation</h3>
            <p className="text-muted">{quoteRequest.title}</p>

            <label>
              Amount (₹)
              <input name="amount" type="number" min="1" required />
            </label>

            <label>
              Message
              <textarea
                name="message"
                rows="4"
                placeholder="Explain your service and delivery details..."
              />
            </label>

            <button className="btn btn-primary">
              Submit Quotation
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

function Metric({ icon, value, label }) {
  return (
    <div className="metric">
      <div className="metric-icon">{icon}</div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function DashboardCard({ title, children }) {
  return (
    <div className="dashboard-table">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

function NewRequestModal({ close, notify }) {
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState("");

  async function submit(event) {
    event.preventDefault();

    const form = event.target;
    const data = new FormData(form);
    const file = data.get("attachment");

    if (serviceType === "Printing" && (!file || file.size === 0)) {
      notify("Please upload the file you want to print.", "error");
      return;
    }

    setLoading(true);

    try {
      await api("/requests", {
        method: "POST",
        body: data
      });

      notify("New request created successfully!");
      close();
      window.location.reload();
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="modal-card request-modal-wide" onSubmit={submit}>
        <button type="button" className="close" onClick={close}>
          <X />
        </button>

        <h3>Create New Request</h3>
        <p className="text-muted">
          Tell vendors exactly what service you need.
        </p>

        <label>
          Service Type
          <select
            name="service_type"
            required
            value={serviceType}
            onChange={e => setServiceType(e.target.value)}
          >
            <option value="">Select a service</option>
            <option>Printing</option>
            <option>Food</option>
            <option>Stationery</option>
            <option>Repair</option>
            <option>Transport</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Request Title
          <input
            name="title"
            required
            placeholder={serviceType === "Printing" ? "Example: Print my DBMS project" : "Example: Need laptop repair"}
          />
        </label>

        {serviceType === "Printing" && (
          <>
            <div className="upload-box">
              <label>
                File to Print <span className="required-mark">*</span>
                <input
                  name="attachment"
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
                <small>PDF, JPG, PNG, DOC or DOCX · maximum 10 MB</small>
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Number of Copies
                <input name="copies" type="number" min="1" defaultValue="1" required />
              </label>

              <label>
                Print Type
                <select name="print_type" required defaultValue="B&W">
                  <option>B&W</option>
                  <option>Color</option>
                </select>
              </label>

              <label>
                Paper Size
                <select name="paper_size" required defaultValue="A4">
                  <option>A4</option>
                  <option>A3</option>
                </select>
              </label>

              <label>
                Sides
                <select name="sides" required defaultValue="Single">
                  <option>Single</option>
                  <option>Double</option>
                </select>
              </label>
            </div>
          </>
        )}

        {serviceType === "Repair" && (
          <>
            <label>
              Device Type
              <input name="device_type" placeholder="Laptop, phone, tablet..." />
            </label>

            <div className="upload-box">
              <label>
                Problem Photo <span className="optional-mark">(optional)</span>
                <input name="attachment" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" />
                <small>JPG or PNG · maximum 10 MB</small>
              </label>
            </div>
          </>
        )}

        {serviceType === "Stationery" && (
          <div className="upload-box">
            <label>
              Reference Photo <span className="optional-mark">(optional)</span>
              <input name="attachment" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" />
              <small>Upload a photo of the book/item you need.</small>
            </label>
          </div>
        )}

        {serviceType === "Other" && (
          <div className="upload-box">
            <label>
              Reference Attachment <span className="optional-mark">(optional)</span>
              <input name="attachment" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" />
              <small>PDF, JPG or PNG · maximum 10 MB</small>
            </label>
          </div>
        )}

        {serviceType === "Transport" && (
          <div className="form-grid-2">
            <label>
              Pickup Location
              <input name="pickup_location" required placeholder="Where should we pick you up?" />
            </label>
            <label>
              Drop Location
              <input name="drop_location" required placeholder="Where should we take you?" />
            </label>
            <label>
              Date
              <input name="travel_date" type="date" />
            </label>
            <label>
              Time
              <input name="travel_time" type="time" />
            </label>
            <label>
              Number of People
              <input name="people_count" type="number" min="1" defaultValue="1" />
            </label>
          </div>
        )}

        {serviceType === "Food" && (
          <div className="info-note">
            <strong>Food request:</strong> Mention the food item, quantity and any special instructions in the description below.
          </div>
        )}

        <label>
          Description
          <textarea
            name="description"
            required
            rows="3"
            placeholder={serviceType === "Food" ? "Example: 2 veg meals, less spicy..." : "Describe what you need..."}
          />
        </label>

        <label>
          Location
          <input
            name="location"
            required
            placeholder="Example: VIT Campus"
          />
        </label>

        <label>
          Special Requirements <span className="optional-mark">(optional)</span>
          <textarea
            name="special_requirements"
            rows="2"
            placeholder="Any extra instructions for the vendor..."
          />
        </label>

        <label>
          Budget (₹) <span className="optional-mark">(optional)</span>
          <input
            name="budget"
            type="number"
            min="0"
            placeholder="Your expected budget"
          />
        </label>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-light" onClick={close}>
            Cancel
          </button>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Request"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ReviewModal({ order, close, submit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <div className="modal-backdrop">
      <form
        className="modal-card"
        onSubmit={e => {
          e.preventDefault();
          submit(order.id, rating, comment);
        }}
      >
        <button type="button" className="close" onClick={close}>
          <X/>
        </button>

        <h3>Review Service</h3>
        <p className="text-muted">{order.title}</p>

        <label>
          Rating
          <select value={rating} onChange={e => setRating(Number(e.target.value))}>
            <option value="5">★★★★★ — Excellent</option>
            <option value="4">★★★★ — Good</option>
            <option value="3">★★★ — Average</option>
            <option value="2">★★ — Poor</option>
            <option value="1">★ — Very Poor</option>
          </select>
        </label>

        <label>
          Comment
          <textarea
            rows="4"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
          />
        </label>

        <button className="btn btn-success">
          Submit Review
        </button>
      </form>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
