import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileEdit,
  Loader2,
  Save,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../../components/admin/StatusBadge";
import TagMultiSelect from "../../components/admin/TagMultiSelect";
import { CATEGORIES } from "../../constants/interests";
import {
  createAdminEvent,
  deleteAdminEvent,
  fetchAdminEvent,
  getApiErrorMessage,
  updateAdminEvent,
} from "../../services/api";
import type { AdminEvent, AdminEventPayload, EventStatus } from "../../types";
import { toDateInputValue } from "../../utils/format";
import {
  adminEventFormSchema,
  type AdminEventFormValues,
} from "../../validation/adminEvent";

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100";

function getDefaultValues(): AdminEventFormValues {
  let timezone = "UTC";

  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    timezone = "UTC";
  }

  return {
    title: "",
    summary: "",
    description: "",
    category: "",
    requiredSkills: [],
    interests: [],
    bannerUrl: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    timezone,
    location: "",
    isOnline: false,
    registrationUrl: "",
  };
}

function toFormValues(event: AdminEvent): AdminEventFormValues {
  return {
    title: event.title,
    summary: event.summary,
    description: event.description,
    category: event.category,
    requiredSkills: event.requiredSkills,
    interests: event.interests,
    bannerUrl: event.bannerUrl ?? "",
    eventDate: toDateInputValue(event.eventDate),
    startTime: event.startTime,
    endTime: event.endTime ?? "",
    timezone: event.timezone || "UTC",
    location: event.location,
    isOnline: event.isOnline,
    registrationUrl: event.registrationUrl,
  };
}

export default function AdminEventFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadRetryKey, setLoadRetryKey] = useState(0);
  const [currentStatus, setCurrentStatus] = useState<EventStatus>("DRAFT");
  const [submitting, setSubmitting] = useState<EventStatus | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdminEventFormValues>({
    resolver: zodResolver(adminEventFormSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setLoadError(null);

    fetchAdminEvent(id)
      .then((event) => {
        if (!active) return;
        setCurrentStatus(event.status);
        reset(toFormValues(event));
      })
      .catch((loadFailure: unknown) => {
        if (!active) return;
        setLoadError(getApiErrorMessage(loadFailure));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, reset, loadRetryKey]);

  const requiredSkills = watch("requiredSkills") ?? [];
  const interests = watch("interests") ?? [];
  const isOnline = watch("isOnline");

  const submitWithStatus = useCallback(
    (status: EventStatus) => {
      setSubmitError(null);

      void handleSubmit(async (values) => {
        setSubmitting(status);

        const payload: AdminEventPayload = {
          ...values,
          bannerUrl: values.bannerUrl || null,
          eventDate: values.eventDate || null,
          endTime: values.endTime || null,
          registrationUrl: values.registrationUrl || "",
          status,
        };

        try {
          if (id) {
            await updateAdminEvent(id, payload);
          } else {
            await createAdminEvent(payload);
          }
          navigate("/admin/events");
        } catch (submitFailure) {
          setSubmitError(getApiErrorMessage(submitFailure));
        } finally {
          setSubmitting(null);
        }
      })();
    },
    [handleSubmit, id, navigate],
  );

  async function handleDelete() {
    if (!id) return;

    if (
      !window.confirm(
        "Delete this event permanently? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(true);
    setSubmitError(null);

    try {
      await deleteAdminEvent(id);
      navigate("/admin/events");
    } catch (deleteFailure) {
      setSubmitError(getApiErrorMessage(deleteFailure));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 py-24 text-sm font-medium text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        Loading event...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <h1 className="text-sm font-bold text-red-900">
                Unable to load this event
              </h1>
              <p className="mt-1 text-sm text-red-700">{loadError}</p>
              <button
                type="button"
                onClick={() => setLoadRetryKey((key) => key + 1)}
                className="mt-4 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const busy = submitting !== null || deleting;
  const primaryStatus: EventStatus =
    currentStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        to="/admin/events"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            {isEdit ? "Edit event" : "New event"}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            {isEdit ? "Update event details" : "Create an event"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Save incomplete work as a draft. Publishing requires event date,
            scheduling, skills, interests and a registration link.
          </p>
        </div>
        {isEdit ? (
          <div className="flex items-center gap-2">
            <StatusBadge status={currentStatus} />
          </div>
        ) : null}
      </div>

      {submitError ? (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {submitError}
        </div>
      ) : null}

      <form className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold tracking-tight text-slate-950">
              Core details
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              The title is required for drafts. Everything else can be completed
              before publishing.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="event-title"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="event-title"
                  type="text"
                  placeholder="e.g. Production-ready React patterns"
                  className={fieldClass}
                  maxLength={160}
                  {...register("title")}
                />
                {errors.title ? (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.title.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="event-summary"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Summary
                </label>
                <textarea
                  id="event-summary"
                  rows={3}
                  maxLength={300}
                  placeholder="A short summary shown on event cards."
                  className={fieldClass}
                  {...register("summary")}
                />
                <div className="mt-1 flex items-center justify-between gap-2">
                  {errors.summary ? (
                    <p className="text-xs font-medium text-red-600">
                      {errors.summary.message}
                    </p>
                  ) : (
                    <span className="text-xs text-slate-400">
                      At least 10 characters before publishing.
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">Max 300</span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="event-description"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Description
                </label>
                <textarea
                  id="event-description"
                  rows={7}
                  maxLength={10_000}
                  placeholder="Describe the agenda, audience and outcomes."
                  className={fieldClass}
                  {...register("description")}
                />
                <div className="mt-1 flex items-center justify-between gap-2">
                  {errors.description ? (
                    <p className="text-xs font-medium text-red-600">
                      {errors.description.message}
                    </p>
                  ) : (
                    <span className="text-xs text-slate-400">
                      At least 30 characters before publishing.
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="event-category"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Category
                </label>
                <input
                  id="event-category"
                  type="text"
                  list="event-category-options"
                  maxLength={60}
                  placeholder="e.g. Backend"
                  className={fieldClass}
                  {...register("category")}
                />
                <datalist id="event-category-options">
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
                {errors.category ? (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.category.message}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <TagMultiSelect
                label="Required skills"
                description="Technologies attendees should already know."
                selected={requiredSkills}
                onChange={(next) =>
                  setValue("requiredSkills", next, { shouldValidate: true })
                }
                tone="skill"
                disabled={busy}
              />
              <TagMultiSelect
                label="Interests / topics"
                description="Topics the event will explore. These feed the recommendation score."
                selected={interests}
                onChange={(next) =>
                  setValue("interests", next, { shouldValidate: true })
                }
                tone="interest"
                disabled={busy}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold tracking-tight text-slate-950">
              Schedule and location
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="event-date"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Event date
                </label>
                <input
                  id="event-date"
                  type="date"
                  className={fieldClass}
                  {...register("eventDate")}
                />
                {errors.eventDate ? (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.eventDate.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="event-timezone"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Timezone
                </label>
                <input
                  id="event-timezone"
                  type="text"
                  list="event-timezone-options"
                  maxLength={64}
                  className={fieldClass}
                  {...register("timezone")}
                />
                <datalist id="event-timezone-options">
                  <option value="UTC" />
                  <option value="Asia/Kolkata" />
                  <option value="Europe/London" />
                  <option value="America/New_York" />
                  <option value="Asia/Singapore" />
                </datalist>
                {errors.timezone ? (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.timezone.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="event-start-time"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Start time
                </label>
                <input
                  id="event-start-time"
                  type="time"
                  className={fieldClass}
                  {...register("startTime")}
                />
                {errors.startTime ? (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.startTime.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="event-end-time"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  End time
                </label>
                <input
                  id="event-end-time"
                  type="time"
                  className={fieldClass}
                  {...register("endTime")}
                />
                {errors.endTime ? (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.endTime.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <label
                  htmlFor="event-location"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Venue or online location
                </label>
                <input
                  id="event-location"
                  type="text"
                  maxLength={160}
                  placeholder={
                    isOnline ? "e.g. Online" : "e.g. Bengaluru - Convention Centre"
                  }
                  className={fieldClass}
                  {...register("location")}
                />
                {errors.location ? (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.location.message}
                  </p>
                ) : null}
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  {...register("isOnline")}
                />
                Online event
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-base font-bold tracking-tight text-slate-950">
              Links
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="event-registration-url"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Registration URL
                </label>
                <input
                  id="event-registration-url"
                  type="url"
                  placeholder="https://example.com/register"
                  className={fieldClass}
                  {...register("registrationUrl")}
                />
                {errors.registrationUrl ? (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.registrationUrl.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="event-banner-url"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Banner image URL (optional)
                </label>
                <input
                  id="event-banner-url"
                  type="url"
                  placeholder="https://images.example.com/banner.jpg"
                  className={fieldClass}
                  {...register("bannerUrl")}
                />
                {errors.bannerUrl ? (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.bannerUrl.message}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {isEdit ? (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </button>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => submitWithStatus(primaryStatus)}
                disabled={busy}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting === primaryStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : primaryStatus === "PUBLISHED" ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <FileEdit className="h-4 w-4" />
                )}
                {primaryStatus === "PUBLISHED" ? "Save changes" : "Save draft"}
              </button>

              <button
                type="button"
                onClick={() =>
                  submitWithStatus(
                    primaryStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                  )
                }
                disabled={busy}
                className={
                  primaryStatus === "PUBLISHED"
                    ? "inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    : "inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                }
              >
                {submitting ===
                (primaryStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED") ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : primaryStatus === "PUBLISHED" ? (
                  <FileEdit className="h-4 w-4" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
                {primaryStatus === "PUBLISHED"
                  ? "Save as draft"
                  : "Publish event"}
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Publishing checklist
              </h2>
            </div>
            <ul className="mt-4 space-y-2.5 text-xs leading-5 text-slate-600">
              {[
                "Title with at least 5 characters",
                "Summary with at least 10 characters",
                "Description with at least 30 characters",
                "Category, required skills and interests",
                "Future event date, start time and timezone",
                "Venue or online location",
                "Valid registration URL",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-5 text-slate-500">
              Drafts are private. Published events appear on the public site and
              in recommendations while their date is in the future.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Current status</h2>
            <div className="mt-3">
              <StatusBadge status={currentStatus} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              {currentStatus === "PUBLISHED"
                ? "This event is live. Saving changes re-validates the publication requirements."
                : "This event is still a draft and is not visible to public users."}
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
