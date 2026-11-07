import { useRef, useState } from "react";
import { api } from "../api/client";
import Icon from "./Icon";
import { Modal, ErrorMessage } from "./UI";
export default function ReportDialog({
  place,
  catalog,
  issue,
  onClose,
  onUpdated,
}) {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const info = issue && catalog.reportTypes.find((t) => t.id === issue.type);
  const save = async (relevant) => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = issue
        ? await api.voteReport(place.id, issue.id, relevant)
        : await api.addReport(place.id, { type, description });
      onUpdated(
        result,
        issue
          ? relevant
            ? "Thanks for confirming. Your update helps others."
            : "Issue marked as resolved. Thanks for the update!"
          : "Issue reported. Thanks for looking out for others.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      pending.current = false;
    }
  };
  return (
    <Modal
      title={issue ? "Community update" : "Report a live issue"}
      onClose={() => !busy && onClose()}
    >
      <div className="modal-body">
        {issue ? (
          <>
            <span className="round-illustration warning">
              <Icon name={info?.icon || "TriangleAlert"} size={30} />
            </span>
            <h3>{info?.label || "Accessibility issue"}</h3>
            <p>
              {issue.description ||
                "A community member reported this accessibility issue."}
            </p>
            <div className="report-meta">
              <Icon name="Clock3" size={16} />
              Reported {new Date(issue.createdAt).toLocaleDateString(
                "en-GB",
              )} · {issue.confirmations} confirmations
            </div>
            <h4>Is this still happening?</h4>
            <p className="muted">
              Only update this if you have checked it yourself.
            </p>
            {error && <ErrorMessage message={error} />}
            <button
              className="primary-button full"
              disabled={busy}
              onClick={() => save(true)}
            >
              <Icon name="Check" size={18} />
              {busy ? "Updating…" : "Yes, still an issue"}
            </button>
            <button
              className="secondary-button full"
              disabled={busy}
              onClick={() => save(false)}
            >
              No, it’s resolved
            </button>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <p>
              Let people know about a temporary barrier at{" "}
              <strong>{place.name}</strong>.
            </p>
            <label className="text-label" htmlFor="issue-type">
              What’s happening?
            </label>
            <select
              id="issue-type"
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Choose an issue</option>
              {catalog.reportTypes.map((t) => (
                <option
                  key={t.id}
                  value={t.id}
                  disabled={place.reports.some((r) => r.type === t.id)}
                >
                  {t.label}
                  {place.reports.some((r) => r.type === t.id)
                    ? " (already reported)"
                    : ""}
                </option>
              ))}
            </select>
            <label className="text-label" htmlFor="issue-description">
              A little more detail <span>Optional</span>
            </label>
            <textarea
              id="issue-description"
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Where is the issue? Is there an alternative?"
              rows={4}
            />
            <p className="data-note">
              Temporary issues go here. Permanent obstacles belong in a review.
            </p>
            {error && <ErrorMessage message={error} />}
            <button
              type="submit"
              className="primary-button full"
              disabled={busy || !type}
            >
              {busy ? "Reporting…" : "Share live update"}
              <Icon name="ArrowRight" size={18} />
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
