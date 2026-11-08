import { useCallback, useEffect, useState } from "react";
import { api, isMock } from "./api/client";
import Icon from "./components/Icon";
import { ErrorMessage, IconButton, Modal } from "./components/UI";
import MapView from "./components/MapView";
import ReportDialog from "./components/ReportDialog";
import Explore from "./pages/Explore";
import SearchPage from "./pages/Search";
import LocationDetails from "./pages/LocationDetails";
import Review from "./pages/Review";
import Achievements from "./pages/Achievements";
import Settings from "./pages/Settings";

const routeFromHash = () => {
  const [page = "", id] = window.location.hash.slice(1).split("/");
  return {
    page: ["location", "review", "search", "achievements", "settings"].includes(
      page,
    )
      ? page
      : "home",
    id,
  };
};
export default function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [locations, setLocations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [category, setCategory] = useState("All places");
  const [place, setPlace] = useState(null);
  const [menu, setMenu] = useState(false);
  const [report, setReport] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [retry, setRetry] = useState(0);
  const [detailTab, setDetailTab] = useState("overview");
  const navigate = useCallback((page = "home", id) => {
    window.location.hash =
      page === "home" ? "" : `${page}${id ? `/${id}` : ""}`;
    setMenu(false);
    setReport(null);
  }, []);
  const notify = useCallback(
    (message) => setToast({ message, id: Date.now() }),
    [],
  );
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const change = () => {
      setRoute(routeFromHash());
      setReport(null);
      setMenu(false);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    let active = true;
    setError("");
    Promise.all([api.getLocations(), api.getProfile(), api.getCatalog()])
      .then(([l, p, c]) => {
        if (active) {
          setLocations(l);
          setProfile(p);
          setCatalog(c);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  useEffect(() => {
    let active = true;
    setDetailError("");
    if (["location", "review"].includes(route.page)) {
      setPlace(null);
      api
        .getLocation(route.id)
        .then((value) => {
          if (active) setPlace(value);
        })
        .catch((e) => {
          if (active) setDetailError(e.message);
        });
    }
    return () => {
      active = false;
    };
  }, [route.id, route.page, retry]);
  const select = useCallback(
    (id) => {
      setDetailTab("overview");
      navigate("location", id);
    },
    [navigate],
  );
  const updatePlace = (value) => {
    setPlace(value);
    setLocations((list) => list.map((l) => (l.id === value.id ? value : l)));
  };
  const filtered =
    category === "All places"
      ? locations
      : locations.filter((l) => l.category === category);
  const mapScreen = ["home", "location"].includes(route.page);
  if (!profile || !catalog)
    return (
      <main className="boot-screen">
        <img src="/logo.png" alt="" />
        <h1>Helping Hand</h1>
        {error ? (
          <ErrorMessage message={error} retry={() => setRetry((n) => n + 1)} />
        ) : (
          <p>Loading…</p>
        )}
      </main>
    );
  return (
    <div
      className={`app ${mapScreen ? "map-page" : "content-page"} ${route.page === "location" ? "has-detail" : ""}`}
    >
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="app-header">
        <IconButton
          icon="Menu"
          label="Open menu"
          className="menu-button"
          onClick={() => setMenu(true)}
        />
        <button
          className="brand"
          onClick={() => navigate()}
          aria-label="Helping Hand home"
        >
          <img src="/logo.png" alt="" />
          <span>Helping Hand</span>
        </button>
        <div className="header-search">
          <button className="search-trigger" onClick={() => navigate("search")}>
            <Icon name="Search" size={20} />
            <span>Search a place or address</span>
          </button>
        </div>
        <div className="header-right">
          <button
            className="points-button"
            onClick={() => navigate("achievements")}
          >
            <Icon name="Sparkles" size={18} />
            <strong>{profile.points}</strong>
            <span>points</span>
          </button>
          <button
            className="avatar"
            onClick={() => setMenu(true)}
            aria-label="Open your profile"
          >
            {profile.initials}
          </button>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="main-content">
        {mapScreen && (
          <MapView
            locations={route.page === "location" ? locations : filtered}
            selected={route.page === "location" ? route.id : null}
            onSelect={select}
            notify={notify}
          />
        )}
        {route.page === "home" && (
          <Explore
            locations={filtered}
            category={category}
            onCategory={setCategory}
            onSelect={select}
          />
        )}
        {route.page === "location" &&
          (detailError ? (
            <div className="detail-panel">
              <ErrorMessage
                message={detailError}
                retry={() => setRetry((n) => n + 1)}
              />
              <button className="secondary-button" onClick={() => navigate()}>
                Back to map
              </button>
            </div>
          ) : place ? (
            <LocationDetails
              key={place.id}
              place={place}
              catalog={catalog}
              onClose={() => navigate()}
              onReview={() => navigate("review", place.id)}
              onReport={() => setReport({})}
              onIssue={(issue) => setReport({ issue })}
              notify={notify}
              initialTab={detailTab}
            />
          ) : (
            <div className="detail-panel loading-panel">
              Loading place details…
            </div>
          ))}
        {route.page === "search" && (
          <SearchPage
            onBack={() => navigate()}
            onSelect={select}
            initialLocations={locations}
          />
        )}
        {route.page === "review" &&
          (detailError ? (
            <ErrorMessage
              message={detailError}
              retry={() => setRetry((n) => n + 1)}
            />
          ) : place ? (
            <Review
              place={place}
              catalog={catalog}
              onBack={() => navigate("location", place.id)}
              onSubmit={(result) => {
                updatePlace(result.location);
                setProfile(result.profile);
                setDetailTab("reviews");
                navigate("location", result.location.id);
                notify(
                  `Thank you! You earned ${result.pointsAwarded} community points for your review.`,
                );
              }}
            />
          ) : (
            <div className="standalone-page loading-panel">
              Loading review form…
            </div>
          ))}
        {route.page === "achievements" && (
          <Achievements profile={profile} onBack={() => navigate()} />
        )}
        {route.page === "settings" && <Settings onBack={() => navigate()} />}
      </main>
      {route.page === "home" && (
        <nav className="mobile-nav" aria-label="Main navigation">
          <button className="active" onClick={() => navigate()}>
            <Icon name="Compass" />
            <span>Explore</span>
          </button>
          <button onClick={() => navigate("achievements")}>
            <Icon name="Trophy" />
            <span>Achievements</span>
          </button>
          <button onClick={() => setMenu(true)}>
            <Icon name="PersonStanding" />
            <span>Profile</span>
          </button>
        </nav>
      )}
      {menu && (
        <Modal
          title="Your profile"
          className="drawer-backdrop"
          onClose={() => setMenu(false)}
        >
          <div className="drawer-body">
            <div className="profile-card">
              <span className="avatar big">{profile.initials}</span>
              <h2>{profile.name}</h2>
              <button
                className="profile-points"
                onClick={() => navigate("achievements")}
              >
                <Icon name="Sparkles" />
                <strong>{profile.points}</strong> community points
              </button>
            </div>
            <nav className="drawer-nav">
              <button onClick={() => navigate()}>
                <Icon name="Compass" />
                Explore the map
                <Icon name="ChevronRight" size={17} />
              </button>
              <button onClick={() => navigate("achievements")}>
                <Icon name="Trophy" />
                Achievements
                <Icon name="ChevronRight" size={17} />
              </button>
              <button onClick={() => navigate("settings")}>
                <Icon name="Settings" />
                Settings
                <Icon name="ChevronRight" size={17} />
              </button>
            </nav>
          </div>
        </Modal>
      )}
      {report && place && (
        <ReportDialog
          place={place}
          catalog={catalog}
          issue={report.issue}
          onClose={() => setReport(null)}
          onUpdated={async (value, message) => {
            updatePlace(value);
            setReport(null);
            notify(message);
            try {
              setProfile(await api.getProfile());
            } catch {
              /* Existing profile stays visible if refresh fails. */
            }
          }}
        />
      )}
      <div className="toast-region" role="status" aria-live="polite">
        {toast && (
          <div className="toast">
            <span>
              <Icon name="Check" size={18} />
            </span>
            <p>{toast.message}</p>
            <IconButton
              icon="X"
              label="Dismiss notification"
              onClick={() => setToast(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
