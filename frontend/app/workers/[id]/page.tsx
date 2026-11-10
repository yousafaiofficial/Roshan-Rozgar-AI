"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  Star,
  UserRound,
} from "lucide-react";
import styles from "./profile.module.css";
import { apiCall, apiFetch } from "../../api";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Worker = {
  id: number;
  name: string;
  city: string;
  neighborhood: string;
  skill: string;
  extra_skills: string[];
  bio: string;
  rate: number;
  pricing_type: "job" | "hour";
  available: boolean;
  photo: string | null;
  rating: number | null;
  review_count: number;
  completed_jobs: number;
  experience_years: number;
  safety_rating: number | null;
  quality_rating: number | null;
  punctuality_rating: number | null;
  professionalism_rating: number | null;
  communication_rating: number | null;
};

type ProfileUser = { id: number; role: "customer" | "worker" };

export default function WorkerProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    description: "",
    budget: "",
    scheduled_at: "",
  });
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    void params.then(({ id: workerId }) => {
      setId(workerId);
      void fetch(`${API}/api/workers/${workerId}`)
        .then((response) =>
          response.ok ? response.json() : Promise.reject(),
        )
        .then((profile: Worker) => setWorker(profile))
        .catch(() => setMessage("Worker profile could not be loaded."));
      void apiFetch("/api/me")
        .then(async (response) =>
          response.ok ? ((await response.json()) as ProfileUser) : null,
        )
        .then(
          (user) =>
            setIsOwner(
              Boolean(
                user && user.id === Number(workerId) && user.role === "worker",
              ),
            ),
        )
        .catch(() => setIsOwner(false));
    });
  }, [params]);

  const request = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await apiCall("/api/jobs", "POST", {
        worker_id: Number(id),
        description: form.description,
        budget: Number(form.budget),
        scheduled_at: form.scheduled_at,
      });
      setMessage("Service request sent successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Request could not be sent.",
      );
    }
  };

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const body = new FormData();
      body.append("file", file);
      const uploaded = await apiCall("/api/uploads", "POST", body);
      const updated = await apiCall("/api/workers/me", "PATCH", {
        photo: uploaded.url,
      });
      setWorker(updated);
      setMessage("Profile photo updated.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Profile photo could not be updated.",
      );
    }
  };

  if (!worker)
    return <main className={styles.loading}>{message || "Loading profile…"}</main>;

  const photo = worker.photo
    ? worker.photo.startsWith("/api/")
      ? API + worker.photo
      : worker.photo
    : null;
  const ratings = [
    ["Safety", worker.safety_rating],
    ["Quality", worker.quality_rating],
    ["Punctuality", worker.punctuality_rating],
    ["Professionalism", worker.professionalism_rating],
    ["Communication", worker.communication_rating],
  ] as const;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/#workers" className={styles.back}>
          <ArrowLeft size={18} /> Back to workers
        </Link>
        <section className={styles.hero}>
          <div className={styles.photo}>
            {photo ? (
              <img src={photo} alt={`${worker.name}, ${worker.skill}`} />
            ) : (
              <UserRound size={86} />
            )}
            {isOwner && (
              <label className={styles.upload}>
                <Camera size={18} /> Update photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={upload}
                />
              </label>
            )}
          </div>
          <div>
            <span className={styles.trade}>{worker.skill}</span>
            <h1>{worker.name}</h1>
            <p className={styles.location}>
              <MapPin size={18} />
              {worker.neighborhood && `${worker.neighborhood}, `}
              {worker.city}
            </p>
            <div className={styles.facts}>
              <span>
                <Clock3 />{" "}
                {worker.available
                  ? "Available for requests"
                  : "Currently booked"}
              </span>
              <span>
                <BriefcaseBusiness />{" "}
                {worker.experience_years
                  ? `${worker.experience_years} years experience`
                  : "Experience not provided"}
              </span>
              {worker.completed_jobs > 0 && (
                <span>
                  <CheckCircle2 /> {worker.completed_jobs} completed jobs
                </span>
              )}
            </div>
            {worker.review_count > 0 ? (
              <p className={styles.rating}>
                <Star fill="currentColor" /> {worker.rating} from{" "}
                {worker.review_count} review
                {worker.review_count === 1 ? "" : "s"}
              </p>
            ) : (
              <p className={styles.muted}>No customer reviews yet</p>
            )}
          </div>
        </section>
        <div className={styles.grid}>
          <div>
            <section className={styles.panel}>
              <h2>About</h2>
              <p>
                {worker.bio ||
                  "This professional has not added a biography yet."}
              </p>
            </section>
            <section className={styles.panel}>
              <h2>Skills and services</h2>
              <div className={styles.skills}>
                <span>{worker.skill}</span>
                {worker.extra_skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </section>
            <section className={styles.panel}>
              <h2>Customer review categories</h2>
              {worker.review_count ? (
                <div className={styles.categories}>
                  {ratings.map(([label, value]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{value ?? "—"} / 5</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.muted}>
                  Category ratings will appear after a customer completes and
                  reviews a booking.
                </p>
              )}
            </section>
          </div>
          <aside className={styles.booking}>
            <h2>Request service</h2>
            <p className={styles.price}>
              Rs. {worker.rate.toLocaleString()}{" "}
              <small>
                {worker.pricing_type === "hour"
                  ? "per hour"
                  : "starting estimate"}
              </small>
            </p>
            <form onSubmit={request}>
              <label>
                Describe the work
                <textarea
                  required
                  minLength={8}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>
              <label>
                Budget (PKR)
                <input
                  required
                  type="number"
                  min="1"
                  value={form.budget}
                  onChange={(event) =>
                    setForm({ ...form, budget: event.target.value })
                  }
                />
              </label>
              <label>
                Preferred date and time
                <input
                  required
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(event) =>
                    setForm({ ...form, scheduled_at: event.target.value })
                  }
                />
              </label>
              <button disabled={!worker.available}>Send service request</button>
            </form>
            {message && (
              <p className={styles.message} role="status">
                {message}
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
