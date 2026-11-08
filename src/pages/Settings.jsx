import Icon from "../components/Icon";
import { PageHeader } from "../components/UI";
export default function Settings({ onBack, catalog }) {
  return (
    <section className="standalone-page settings-page">
      <PageHeader
        title="Settings"
        subtitle="Make Access feel like you."
        onBack={onBack}
      />
      <div className="page-body">
        <div className="preview-note">
          <Icon name="Sparkles" />
          <div>
            <strong>A little preview of what’s next</strong>
            <p>
              These preferences are a preview and cannot be changed in this
              demo.
            </p>
          </div>
        </div>
        <h2>Your preferences</h2>
        {[
          {
            icon: "Accessibility",
            label: "Accessibility preferences",
            value: "All features",
          },
          { icon: "Volume2", label: "Notifications", value: "On" },
          {
            icon: "PersonStanding",
            label: "Public profile",
            value: "Alex Morgan",
          },
          { icon: "Layers", label: "Appearance", value: "Light" },
          { icon: "MapPin", label: "Language", value: "English" },
        ].map((s) => (
          <div className="settings-row" key={s.label} aria-disabled="true">
            <Icon name={s.icon} />
            <div>
              <strong>{s.label}</strong>
              <span>{s.value}</span>
            </div>
            <Icon name="LockKeyhole" size={15} />
          </div>
        ))}
        {catalog.attribution?.length > 0 && (
          <>
            <h2>Data credits</h2>
            <ul className="data-credits">
              {catalog.attribution.map((credit) => (
                <li key={credit}>{credit}</li>
              ))}
              <li>
                <a href="https://portal.ttf.nexyo.io/products?id=8beab1aa-496d-4791-bc13-788e3b85e2c8">
                  Street data: Hackathon Veterans
                </a>
                ,{" "}
                <a href="https://creativecommons.org/licenses/by-sa/4.0/">
                  CC BY-SA 4.0
                </a>
              </li>
            </ul>
          </>
        )}
        <div className="settings-footer">
          <img src="/favicon.svg" alt="" />
          <strong>Access</strong>
          <p>A little more accessible, together.</p>
          <span>Hackathon edition · 1.0</span>
        </div>
      </div>
    </section>
  );
}
