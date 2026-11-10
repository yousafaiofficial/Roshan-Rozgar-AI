"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Wrench,
  Zap,
  Droplets,
  Wind,
  Hammer,
  Paintbrush,
  Sparkles,
  CarFront,
  MapPin,
  Search,
  ShieldCheck,
  ArrowRight,
  Clock3,
  Star,
  CheckCircle2,
  X,
  UserRound,
  Menu,
  Mic,
  Phone,
  CalendarDays,
  Camera,
  ClipboardList,
  LogOut,
  Languages,
  HardHat,
  MessageCircle,
} from "lucide-react";
import VoiceWorkerOnboarding from "./VoiceWorkerOnboarding";
import Link from "next/link";
import { apiCall, apiFetch } from "./api";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const categories = [
  { name: "Electrician", icon: Zap },
  { name: "Plumber", icon: Droplets },
  { name: "AC Technician", icon: Wind },
  { name: "Carpenter", icon: Hammer },
  { name: "Painter", icon: Paintbrush },
  { name: "Cleaner", icon: Sparkles },
  { name: "Mechanic", icon: CarFront },
  { name: "Other Services", icon: Wrench },
];
type Worker = {
  id: number;
  name: string;
  city: string;
  skill: string;
  extra_skills: string[];
  bio: string;
  rate: number;
  available: boolean;
  verified: boolean;
  photo: string | null;
  rating: number | null;
  review_count: number;
  neighborhood: string;
  experience_years: number;
  pricing_type: "job" | "hour";
  completed_jobs: number;
};
type User = {
  id: number;
  name: string;
  role: "customer" | "worker";
  city: string;
};
type Job = {
  id: number;
  worker_id: number;
  customer_id: number;
  worker_name: string;
  customer_name: string;
  description: string;
  budget: number;
  scheduled_at: string;
  status: string;
  agreed_price: number | null;
  photo: string | null;
};
type Modal =
  | "login"
  | "register"
  | "forgot"
  | "reset"
  | "request"
  | "notify"
  | "review"
  | null;
function formatCnic(value: string) {
  const digits = value.replace(/-/g, "");
  if (!/^[0-9]*$/.test(digits) || digits.length > 13) {
    throw Error("CNIC must contain exactly 13 digits.");
  }
  if (digits.length <= 5) return digits;
  if (digits.length <= 12)
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}
function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ur-PK";
  window.speechSynthesis.speak(u);
}
export default function Home() {
  const [workers, setWorkers] = useState<Worker[]>([]),
    [skill, setSkill] = useState(""),
    [city, setCity] = useState(""),
    [modal, setModal] = useState<Modal>(null),
    [selected, setSelected] = useState<Worker | null>(null),
    [user, setUser] = useState<User | null>(null),
    [jobs, setJobs] = useState<Job[]>([]),
    [showJobs, setShowJobs] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [urdu, setUrdu] = useState(false),
    [menu, setMenu] = useState(false),
    [loading, setLoading] = useState(false),
    [form, setForm] = useState<Record<string, string>>({}),
    [ratings, setRatings] = useState<Record<string, number>>({
      safety: 5,
      quality: 5,
      punctuality: 5,
      professionalism: 5,
      communication: 5,
    }),
    [reviewJob, setReviewJob] = useState<Job | null>(null);
  const set = (key: string, value: string) =>
    setForm((v) => ({ ...v, [key]: value }));
  const loadWorkers = useCallback(async () => {
    try {
      const q = new URLSearchParams();
      if (skill) q.set("skill", skill);
      if (city) q.set("city", city);
      setWorkers(await apiCall("/api/workers?" + q.toString()));
    } catch (e) {
      setError(String(e));
    }
  }, [skill, city]);
  const loadJobs = useCallback(async () => {
    try {
      setJobs(await apiCall("/api/jobs"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    void loadWorkers();
  }, [loadWorkers]);
  useEffect(() => {
    void apiFetch("/api/me")
      .then(async (response) => {
        if (response.ok) setUser((await response.json()) as User);
        else if (response.status !== 401)
          setError("Your account could not be loaded.");
      })
      .catch(() => setError("Your account could not be loaded."));
  }, []);
  const open = (m: Modal, w?: Worker) => {
    setModal(m);
    setSelected(w || null);
    setForm({});
    setError("");
    setSuccess("");
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (modal === "login" || modal === "register") {
        const isRegister = modal === "register";
        if (
          isRegister &&
          form.cnic &&
          !/^(?:[0-9]{13}|[0-9]{5}-[0-9]{7}-[0-9])$/.test(form.cnic)
        ) {
          throw Error("CNIC must contain exactly 13 digits (XXXXX-XXXXXXX-X).");
        }
        const data = isRegister
          ? {
              ...form,
              ...(form.cnic ? { cnic: form.cnic } : {}),
              rate: Number(form.rate || 1000),
              extra_skills: (form.extra_skills || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : { phone: form.phone, password: form.password };
        const result = await apiCall(
          "/api/auth/" + (isRegister ? "register" : "login"),
          "POST",
          data,
        );
        setUser(result.user);
        setModal(null);
        void loadJobs();
      } else if (modal === "forgot") {
        await apiCall("/api/auth/forgot-password", "POST", {
          phone: form.phone,
        });
        setModal("reset");
        setSuccess("If an account matches, a recovery code has been sent.");
      } else if (modal === "reset") {
        await apiCall("/api/auth/reset-password", "POST", {
          phone: form.phone,
          token: form.reset_token,
          password: form.new_password,
        });
        setForm({ phone: form.phone });
        setModal("login");
        setSuccess("Password updated. Log in with your new password.");
      } else if (modal === "request") {
        if (!selected) throw Error("Select a worker");
        let photo;
        const input = document.getElementById(
          "problem-photo",
        ) as HTMLInputElement | null;
        if (input?.files?.[0]) {
          const fd = new FormData();
          fd.append("file", input.files[0]);
          const d = await apiCall("/api/uploads", "POST", fd);
          photo = d.url;
        }
        await apiCall(
          "/api/jobs",
          "POST",
          {
            worker_id: selected.id,
            description: form.description,
            budget: Number(form.budget),
            scheduled_at: form.scheduled_at,
            photo,
          },
        );
        setModal(null);
        setSuccess("Request sent. Worker can accept it from My Jobs.");
        setShowJobs(true);
        void loadJobs();
      } else if (modal === "notify") {
        await apiCall("/api/notify", "POST", form);
        setSuccess(
          "Availability request saved. SMS notifications are not currently connected.",
        );
        setModal(null);
      } else if (modal === "review" && reviewJob) {
        await apiCall(
          "/api/jobs/" + reviewJob.id + "/review",
          "POST",
          { ...ratings, comment: form.comment || "" },
        );
        setModal(null);
        setSuccess("Review submitted. Thank you!");
        void loadWorkers();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const action = async (
    id: number,
    type: "accept" | "decline" | "complete",
    price?: number,
  ) => {
    setError("");
    try {
      await apiCall(
        "/api/jobs/" + id + "/" + type,
        "POST",
        type === "accept" ? { agreed_price: price } : undefined,
      );
      void loadJobs();
      void loadWorkers();
      setSuccess("Job updated successfully.");
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const listen = (field: string) => {
    const w = window as unknown as {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) {
      setError(
        "Speech recognition is not supported in this browser. Try Chrome or type instead.",
      );
      return;
    }
    const rec = new Recognition();
    rec.lang = "ur-PK";
    rec.onresult = (e: any) =>
      set(
        field,
        ((form[field] || "") + " " + e.results[0][0].transcript).trim(),
      );
    rec.onerror = () =>
      setError(
        "Microphone could not capture speech. Check browser permissions.",
      );
    rec.start();
  };
  return (
    <>
      <header className="topbar">
        <div className="container nav">
          <a className="brand" href="#home">
            <span className="brandmark">
              <HardHat size={24} />
            </span>
            Roshan Rozgar<span style={{ color: "var(--copper)" }}>AI</span>
          </a>
          <nav className="navlinks">
            <a href="#services">Services</a>
            <a href="#workers">Find Workers</a>
            <a href="#how">How it works</a>
          </nav>
          <div className="navright">
            <button
              className="btn secondary small"
              onClick={() => setUrdu(!urdu)}
            >
              <Languages size={15} />
              {urdu ? "English" : "اردو"}
            </button>
            {user ? (
              <>
                <button
                  className="btn small"
                  onClick={() => {
                    setShowJobs(!showJobs);
                    void loadJobs();
                    setTimeout(
                      () =>
                        document
                          .getElementById("jobs")
                          ?.scrollIntoView({ behavior: "smooth" }),
                      100,
                    );
                  }}
                >
                  <ClipboardList size={16} />
                  My Jobs
                </button>
                <button
                  className="btn secondary small"
                  aria-label="Log out"
                  onClick={async () => {
                   try {
                     await apiCall("/api/auth/logout", "POST");
                     setUser(null);
                     setShowJobs(false);
                     setJobs([]);
                     setSuccess("You have been logged out.");
                   } catch (logoutError) {
                     setError((logoutError as Error).message);
                   }
                  }}
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <button className="btn small" onClick={() => open("login")}>
                Log in <ArrowRight size={15} />
              </button>
            )}
            <button
              className="btn secondary small menu"
              aria-label="Open menu"
              onClick={() => setMenu(!menu)}
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
        {menu && (
          <div
            className="container"
            style={{ paddingBottom: 14, display: "flex", gap: 18 }}
          >
            <a href="#services" onClick={() => setMenu(false)}>
              Services
            </a>
            <a href="#workers" onClick={() => setMenu(false)}>
              Workers
            </a>
            <a href="#how" onClick={() => setMenu(false)}>
              How it works
            </a>
          </div>
        )}
      </header>
      <main id="home">
        <div className="container hero">
          <div>
            <div className="eyebrow">SKILLED HANDS. STRONGER COMMUNITIES.</div>
            <h1>
              {urdu ? (
                <>
                  Apne ilaqay ke <span>maahir kaamgar</span> dhoondein.
                </>
              ) : (
                <>
                  Pakistan&apos;s skills.
                  <br />
                  <span>Your neighbourhood.</span>
                </>
              )}
            </h1>
            <p className="lead">
              Find electricians, plumbers, AC technicians and more in your city.
              Share the job, agree on a price and book with confidence.
            </p>
            <div className="searchbox">
              <div className="field">
                <Search size={19} />
                <select
                  aria-label="Select service"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                >
                  <option value="">All services</option>
                  {categories.map((c) => (
                    <option key={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <MapPin size={19} />
                <select
                  aria-label="Select city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">All cities</option>
                  <option>Islamabad</option>
                  <option>Rawalpindi</option>
                </select>
              </div>
              <button
                className="btn copper"
                onClick={() =>
                  document
                    .getElementById("workers")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Find workers <ArrowRight size={17} />
              </button>
            </div>
            <div className="hero-notes">
              <span>
                <ShieldCheck size={17} />
                Transparent profiles
              </span>
              <span>
                <Clock3 size={17} />
                Availability shown
              </span>
              <span>
                <MessageCircle size={17} />
                Agree before booking
              </span>
            </div>
          </div>
          <div className="visual">
            <img
              className="heroimage"
              src="/images/pakistani-electrician-hero.png"
              alt="Pakistani electrician inspecting a home electrical panel"
            />
            <div className="floating float1">
              <span className="iconbubble">
                <MapPin size={18} />
              </span>
              <span>
                Local professionals<small>Islamabad & Rawalpindi</small>
              </span>
            </div>
            <div className="floating float2">
              <span className="iconbubble">
                <ShieldCheck size={18} />
              </span>
              <span>
                Price agreed first<small>Know before you book</small>
              </span>
            </div>
          </div>
        </div>
        <VoiceWorkerOnboarding />
        <section className="section" id="services">
          <div className="container">
            <div className="sectionhead">
              <div>
                <div className="eyebrow">WHAT DO YOU NEED?</div>
                <h2>Explore our services</h2>
                <p>Choose the right skill for your job.</p>
              </div>
            </div>
            <div className="servicegrid">
              {categories.map((c) => (
                <button
                  className="service"
                  key={c.name}
                  onClick={() => {
                    setSkill(c.name === "Other Services" ? "" : c.name);
                    document
                      .getElementById("workers")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span className="serviceicon">
                    <c.icon size={25} strokeWidth={1.8} />
                  </span>
                  <strong>{c.name}</strong>
                  <small>Explore workers →</small>
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="section" id="workers">
          <div className="container">
            <div className="sectionhead">
              <div>
                <div className="eyebrow">PEOPLE BEHIND THE SKILLS</div>
                <h2>Find your next professional</h2>
                <p>Example profiles are fictional and not identity verified.</p>
              </div>
              <button
                className="btn secondary small"
                onClick={() => {
                  setSkill("");
                  setCity("");
                }}
              >
                Show all
              </button>
            </div>
            {workers.length ? (
              <div className="workergrid">
                {workers.map((w) => (
                  <article className="workercard" key={w.id}>
                    <div className="workercover">
                      {w.photo ? <img className="workerphoto" src={w.photo.startsWith('/api/') ? API+w.photo : w.photo} alt={`${w.name}, ${w.skill} in ${w.city}`} /> : <div className="avatar" aria-label="No profile photo"><UserRound size={42} strokeWidth={1.5} /></div>}
                      <span
                        className={"available " + (!w.available ? "busy" : "")}
                      >
                        {w.available ? "Available" : "Booked"}
                      </span>
                    </div>
                    <div className="workerdetail">
                      <h3>{w.name}</h3>
                      <span className="sub">{w.skill}</span>
                      <div className="meta">
                        <MapPin size={14} />
                        {w.neighborhood ? `${w.neighborhood}, ` : ''}{w.city} <span>·</span>{" "}
                        {w.review_count ? (
                          <>
                            {" "}
                            <Star size={13} /> {w.rating} ({w.review_count})
                          </>
                        ) : (
                          "No reviews yet"
                        )}
                      </div>
                      <p>{w.bio || "Skilled local professional."}</p>
                      <div className="skillchips">{w.extra_skills.slice(0,2).map(item=><span key={item}>{item}</span>)}</div>
                      <div className="workerfoot">
                        <div>
                          <strong>Rs. {w.rate.toLocaleString()}</strong>
                          <small>{w.pricing_type==='hour'?'Per hour':'Starting estimate'}</small>
                        </div>
                        <div className="cardactions"><Link className="btn secondary small" href={`/workers/${w.id}`}>View profile</Link><button
                          className="btn small"
                          disabled={!w.available}
                          onClick={() => {
                            if (!user) {
                              open("login");
                              setError(
                                "Log in as a customer to request a job.",
                              );
                            } else if (user.role !== "customer") {
                              setError("Only customers can request jobs.");
                            } else open("request", w);
                          }}
                        >
                          Request service <ArrowRight size={14} />
                        </button></div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty">
                <Search size={32} color="#c46b45" />
                <h3>No matching workers yet</h3>
                <p className="muted">
                  Try another service or city, or request an availability alert.
                </p>
                <button className="btn copper" onClick={() => open("notify")}>
                  Notify me when available
                </button>
              </div>
            )}
          </div>
        </section>
        <section className="section" id="how">
          <div className="container">
            <div className="banner">
              <div>
                <h2>Skilled work deserves visibility.</h2>
                <p>
                  Are you a worker? Create your profile and start receiving
                  local requests.
                </p>
              </div>
              <button className="btn copper" onClick={() => open("register")}>
                Join as a worker <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </section>
        {showJobs && user && (
          <section className="section" id="jobs">
            <div className="container">
              <div className="sectionhead">
                <div>
                  <div className="eyebrow">YOUR DASHBOARD</div>
                  <h2>
                    {user.role === "worker"
                      ? "Incoming job requests"
                      : "Your job requests"}
                  </h2>
                </div>
                <button
                  className="btn secondary small"
                  onClick={() => void loadJobs()}
                >
                  Refresh
                </button>
              </div>
              {jobs.length ? (
                jobs.map((j) => (
                  <div className="jobcard" key={j.id}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <h3>
                        {user.role === "worker"
                          ? j.customer_name
                          : j.worker_name}
                      </h3>
                      <span className="status">{j.status.toUpperCase()}</span>
                    </div>
                    <p>{j.description}</p>
                    <div className="meta">
                      <CalendarDays size={14} />
                      {j.scheduled_at.replace("T", " ")} <span>·</span> Offered
                      Rs. {j.budget}
                      {j.agreed_price ? " · Agreed Rs. " + j.agreed_price : ""}
                    </div>
                    {j.photo && (
                      <a
                        href={API + j.photo}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--copper)", fontSize: 13 }}
                      >
                        View problem photo
                      </a>
                    )}
                    <div className="jobactions">
                      {user.role === "worker" && j.status === "pending" && (
                        <>
                          <button
                            className="btn small"
                            onClick={() => {
                              const v = window.prompt(
                                "Confirm agreed price in PKR",
                                String(j.budget),
                              );
                              if (v && Number(v) > 0)
                                void action(j.id, "accept", Number(v));
                            }}
                          >
                            Accept & agree price
                          </button>
                          <button
                            className="btn secondary small"
                            onClick={() => void action(j.id, "decline")}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {j.status === "accepted" && (
                        <button
                          className="btn small"
                          onClick={() => void action(j.id, "complete")}
                        >
                          Mark completed
                        </button>
                      )}
                      {user.role === "customer" && j.status === "completed" && (
                        <button
                          className="btn copper small"
                          onClick={() => {
                            setReviewJob(j);
                            open("review");
                          }}
                        >
                          Leave category review
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty">
                  No jobs yet.{" "}
                  {user.role === "worker"
                    ? "Wait for a customer request."
                    : "Find a worker and send a request."}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      <footer className="footer">
        <div className="container">
          <div>
            <strong style={{ color: "var(--espresso)" }}>
              Roshan Rozgar AI
            </strong>{" "}
            · Local skilled-worker marketplace
          </div>
          <div>
            Example profiles · No identity verification or online payments
          </div>
        </div>
      </footer>
      {success && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 18,
            right: 18,
            zIndex: 30,
            background: "#fff",
            padding: 16,
            border: "1px solid #e7ded4",
            borderRadius: 12,
            boxShadow: "0 8px 30px #0002",
            maxWidth: 340,
          }}
        >
          {success}
          <button
            style={{ marginLeft: 12, border: 0, background: "none" }}
            onClick={() => setSuccess("")}
          >
            ×
          </button>
        </div>
      )}
      {error && !modal && (
        <div
          role="alert"
          style={{
            position: "fixed",
            bottom: 18,
            left: 18,
            zIndex: 30,
            background: "#fff",
            padding: 16,
            border: "1px solid #d99c8b",
            borderRadius: 12,
            maxWidth: 340,
          }}
        >
          {error}
          <button
            style={{ marginLeft: 12, border: 0, background: "none" }}
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}
      {modal && (
        <div
          className="modalshade"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={modal}
          >
            <div className="modalheader">
              <div>
                <div className="eyebrow">ROSHAN ROZGAR AI</div>
                <h2>
                  {modal === "login"
                    ? "Welcome back"
                    : modal === "register"
                      ? "Create your account"
                      : modal === "forgot"
                        ? "Recover your account"
                        : modal === "reset"
                          ? "Set a new password"
                      : modal === "request"
                        ? "Request " + selected?.skill
                        : modal === "notify"
                          ? "Join availability waitlist"
                          : "Rate your experience"}
                </h2>
              </div>
              <button
                className="close"
                onClick={() => setModal(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            {modal === "login" && (
              <p className="muted">
                New here?{" "}
                <button
                  style={{
                    border: 0,
                    background: "none",
                    color: "var(--copper)",
                    fontWeight: 800,
                  }}
                  onClick={() => open("register")}
                >
                  Create an account
                </button>
              </p>
            )}
            {modal === "register" && (
              <p className="muted">
                Choose a role. Worker profiles will be visible to customers.
              </p>
            )}
            {modal === "request" && (
              <p className="muted">
                Send a request to {selected?.name}. Price is agreed when the
                worker accepts.
              </p>
            )}
            {modal === "notify" && (
              <p className="notice">
                This saves your availability request. SMS delivery is not currently connected.
              </p>
            )}
            <form onSubmit={submit}>
              {(modal === "login" ||
                modal === "register" ||
                modal === "forgot" ||
                modal === "reset") && (
                <div className="formgrid">
                  {modal === "register" && (
                    <>
                      <div className="formgroup full">
                        <label htmlFor="auth-role">Account type</label>
                        <select
                          id="auth-role"
                          required
                          value={form.role || ""}
                          onChange={(e) => set("role", e.target.value)}
                        >
                          <option value="">Select role</option>
                          <option value="customer">
                            Customer — hire a worker
                          </option>
                          <option value="worker">
                            Worker — offer services
                          </option>
                        </select>
                      </div>
                      <div className="formgroup full">
                        <label htmlFor="auth-name">Full name</label>
                        <input
                          id="auth-name"
                          required
                          value={form.name || ""}
                          onChange={(e) => set("name", e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  <div className="formgroup">
                    <label htmlFor="auth-phone">Phone number</label>
                    <input
                      id="auth-phone"
                      required
                      placeholder="03XXXXXXXXX"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      pattern="(?:03[0-9]{9}|\\+?923[0-9]{9})"
                      title="Use 03XXXXXXXXX, +923XXXXXXXXX, or 923XXXXXXXXX."
                      value={form.phone || ""}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                  {(modal === "login" || modal === "register") && (
                    <div className="formgroup">
                    <label htmlFor="auth-password">Password</label>
                    <input
                      id="auth-password"
                      type="password"
                      minLength={modal === "register" ? 12 : 1}
                      autoComplete={
                        modal === "register" ? "new-password" : "current-password"
                      }
                      required
                      value={form.password || ""}
                      onChange={(e) => set("password", e.target.value)}
                    />
                    </div>
                  )}
                  {modal === "reset" && (
                    <>
                      <div className="formgroup">
                        <label htmlFor="reset-token">8-digit SMS recovery code</label>
                        <input
                          id="reset-token"
                          required
                          inputMode="numeric"
                          pattern="[0-9]{8}"
                          maxLength={8}
                          autoComplete="one-time-code"
                          value={form.reset_token || ""}
                          onChange={(e) => set("reset_token", e.target.value)}
                        />
                      </div>
                      <div className="formgroup">
                        <label htmlFor="reset-password">New password (at least 12 characters)</label>
                        <input
                          id="reset-password"
                          required
                          minLength={12}
                          type="password"
                          autoComplete="new-password"
                          value={form.new_password || ""}
                          onChange={(e) => set("new_password", e.target.value)}
                        />
                      </div>
                    </>
                  )}
                  {modal === "register" && (
                    <>
                      <div className="formgroup">
                        <label htmlFor="auth-city">City</label>
                        <select
                          id="auth-city"
                          required
                          value={form.city || ""}
                          onChange={(e) => set("city", e.target.value)}
                        >
                          <option value="">Choose city</option>
                          <option>Islamabad</option>
                          <option>Rawalpindi</option>
                        </select>
                      </div>
                      <div className="formgroup">
                        <label htmlFor="auth-cnic">CNIC (optional, format only)</label>
                        <input
                        id="auth-cnic"
                        placeholder="XXXXX-XXXXXXX-X"
                        inputMode="numeric"
                        maxLength={15}
                        value={form.cnic || ""}
                        onChange={(e) => {
                          try {
                            set("cnic", formatCnic(e.target.value));
                            setError("");
                          } catch (validationError) {
                            setError((validationError as Error).message);
                          }
                        }}
                        />
                        <small>Only the format is checked. It is not verified or stored.</small>
                      </div>
                      {form.role === "worker" && (
                        <>
                          <div className="formgroup">
                            <label>Main skill</label>
                            <select
                              required
                              value={form.skill || ""}
                              onChange={(e) => set("skill", e.target.value)}
                            >
                              <option value="">Choose skill</option>
                              {categories.map((c) => (
                                <option key={c.name}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="formgroup">
                            <label>Starting rate (PKR)</label>
                            <input
                              type="number"
                              min="0"
                              value={form.rate || "1000"}
                              onChange={(e) => set("rate", e.target.value)}
                            />
                          </div>
                          <div className="formgroup full">
                            <label>Additional skills (comma-separated)</label>
                            <input
                              placeholder="Painter, Carpenter"
                              value={form.extra_skills || ""}
                              onChange={(e) =>
                                set("extra_skills", e.target.value)
                              }
                            />
                          </div>
                          <div className="formgroup full">
                            <label>About your work</label>
                            <textarea
                              value={form.bio || ""}
                              onChange={(e) => set("bio", e.target.value)}
                            />
                            <button
                              className="btn secondary small"
                              type="button"
                              onClick={() => listen("bio")}
                            >
                              <Mic size={15} /> Speak in Urdu
                              (browser-dependent)
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
              {modal === "forgot" && (
                <p className="muted">
                  Enter your registered phone number. If recovery SMS is not
                  configured, the app will tell you instead of pretending it
                  sent a code.
                </p>
              )}
              {modal === "login" && (
                <p className="muted" style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    style={{
                      border: 0,
                      padding: 0,
                      background: "none",
                      color: "var(--copper)",
                      fontWeight: 800,
                    }}
                    onClick={() => {
                      setError("");
                      setModal("forgot");
                    }}
                  >
                    Forgot password?
                  </button>
                </p>
              )}
              {modal === "request" && (
                <>
                  <div className="formgroup">
                    <label>Describe the problem</label>
                    <textarea
                      required
                      minLength={8}
                      placeholder="What needs to be fixed?"
                      value={form.description || ""}
                      onChange={(e) => set("description", e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn secondary small"
                      onClick={() => listen("description")}
                    >
                      <Mic size={16} /> Speak in Urdu
                    </button>
                  </div>
                  <div className="formgrid">
                    <div className="formgroup">
                      <label>Offered budget (PKR)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={form.budget || ""}
                        onChange={(e) => set("budget", e.target.value)}
                      />
                    </div>
                    <div className="formgroup">
                      <label>Preferred date & time</label>
                      <input
                        type="datetime-local"
                        required
                        value={form.scheduled_at || ""}
                        onChange={(e) => set("scheduled_at", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="formgroup">
                    <label>Problem photo (optional, max 5 MB)</label>
                    <input
                      id="problem-photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                    />
                  </div>
                </>
              )}
              {modal === "notify" && (
                <div className="formgrid">
                  <div className="formgroup">
                    <label>Phone</label>
                    <input
                      required
                      pattern="(?:03[0-9]{9}|\\+?923[0-9]{9})"
                      title="Use 03XXXXXXXXX, +923XXXXXXXXX, or 923XXXXXXXXX."
                      value={form.phone || ""}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                  <div className="formgroup">
                    <label>City</label>
                    <select
                      required
                      value={form.city || ""}
                      onChange={(e) => set("city", e.target.value)}
                    >
                      <option value="">Select city</option>
                      <option>Islamabad</option>
                      <option>Rawalpindi</option>
                    </select>
                  </div>
                  <div className="formgroup full">
                    <label>Required skill</label>
                    <select
                      required
                      value={form.skill || ""}
                      onChange={(e) => set("skill", e.target.value)}
                    >
                      <option value="">Select service</option>
                      {categories.map((c) => (
                        <option key={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {modal === "review" && (
                <>
                  <div className="reviewgrid">
                    {Object.keys(ratings).map((k) => (
                      <div className="formgroup" key={k}>
                        <label style={{ textTransform: "capitalize" }}>
                          {k}
                        </label>
                        <select
                          value={ratings[k]}
                          onChange={(e) =>
                            setRatings((v) => ({
                              ...v,
                              [k]: Number(e.target.value),
                            }))
                          }
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <option value={n} key={n}>
                              {n} / 5
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="formgroup">
                    <label>Comment (optional)</label>
                    <textarea
                      value={form.comment || ""}
                      onChange={(e) => set("comment", e.target.value)}
                    />
                  </div>
                </>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="btn copper"
                type="submit"
                disabled={loading}
                style={{ width: "100%", marginTop: 18 }}
              >
                {loading
                  ? "Please wait…"
                  : modal === "login"
                    ? "Log in"
                    : modal === "register"
                      ? "Create account"
                      : modal === "forgot"
                        ? "Send recovery code"
                        : modal === "reset"
                          ? "Reset password"
                      : modal === "request"
                        ? "Send job request"
                        : modal === "notify"
                          ? "Save waitlist request"
                          : "Submit review"}{" "}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
