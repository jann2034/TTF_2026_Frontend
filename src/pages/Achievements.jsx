import { useEffect, useState } from "react";
import { api } from "../api/client";
import Icon from "../components/Icon";
import { PageHeader, ErrorMessage } from "../components/UI";
export default function Achievements({ profile, onBack }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    api
      .getAchievements()
      .then((data) => {
        if (active) {
          setItems(data);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  return (
    <section className="standalone-page achievements-page">
      <PageHeader
        title="Your achievements"
        onBack={onBack}
      />
      <div className="page-body">
        <div className="achievement-hero">
          <Icon name="Trophy" size={45} />
          <h2>
            {profile.points}
            <span>community points</span>
          </h2>
        </div>
        <div className="section-heading">
          <h2>Your milestones</h2>
          <span>
            {items
              ? `${items.filter((a) => a.unlocked).length} of ${items.length} unlocked`
              : "Loading…"}
          </span>
        </div>
        {error && (
          <ErrorMessage message={error} retry={() => setRetry((n) => n + 1)} />
        )}
        <div className="achievement-list">
          {items?.map((item) => (
            <article
              key={item.id}
              className={`achievement-card ${item.unlocked ? "unlocked" : "locked"}`}
            >
              <div className="achievement-badge">
                <Icon name={item.icon} size={28} />
                {item.unlocked && (
                  <span>
                    <Icon name="Check" size={10} />
                  </span>
                )}
              </div>
              <div className="achievement-info">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                {item.unlocked ? (
                  <span className="unlocked-label">
                    <Icon name="CheckCheck" size={13} />
                    Unlocked
                  </span>
                ) : (
                  <>
                    <div
                      className="progress-track"
                      role="progressbar"
                      aria-label={item.name}
                      aria-valuemin={0}
                      aria-valuemax={item.target}
                      aria-valuenow={item.progress}
                    >
                      <span
                        style={{
                          width: `${(item.progress / item.target) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="progress-count">
                      {item.progress} / {item.target}
                    </span>
                  </>
                )}
              </div>
              {!item.unlocked && <Icon name="LockKeyhole" size={15} />}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
