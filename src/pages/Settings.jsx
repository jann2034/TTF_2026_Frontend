import Icon from "../components/Icon";
import { PageHeader } from "../components/UI";
export default function Settings({ onBack }) {
  return (
    <section className="standalone-page settings-page">
      <PageHeader
        title="Settings"
        subtitle="Make Helping Hand feel like you."
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
        <div className="settings-footer">
          <img src="/logo.png" alt="" />
          <strong>Helping Hand</strong>
          <p>A little more accessible, together.</p>
          <span>Hackathon edition · 1.0</span>
        </div>
      </div>
    </section>
  );
}
