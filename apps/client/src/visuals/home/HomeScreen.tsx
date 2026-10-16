import { useState, type JSX } from "react";
import { ConnectionStateBadge } from "../hud/ConnectionStateBadge";
import type { VisualConnectionState } from "../types";
import { GlixWordmark } from "./GlixWordmark";
import { SocialPylonArena } from "./SocialPylonArena";

export interface HomeScreenProps {
  readonly connection?: VisualConnectionState | undefined;
  readonly onCreateRoom: () => void;
  readonly onJoinRoom: () => void;
  readonly onHowToPlay?: (() => void) | undefined;
}

export function HomeScreen({
  connection = "connected",
  onCreateRoom,
  onJoinRoom,
  onHowToPlay
}: HomeScreenProps): JSX.Element {
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <main className="glix-home-screen" aria-labelledby="glix-app-title">
      {/* Top Header */}
      <header className="glix-home-header">
        <button
          className="glix-home-brand"
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="GLIX ana sayfa"
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
        >
          <GlixWordmark compact />
        </button>
        {/* Only show badge if NOT healthy connected to keep the header minimal */}
        {connection !== "connected" && (
          <ConnectionStateBadge connection={connection} />
        )}
      </header>

      {/* Hero Stage */}
      <section className="glix-home-hero">
        <h1 id="glix-app-title" className="glix-home-title">
          Aynı oda.<br />Farklı hamle.
        </h1>
        <p className="glix-home-tagline">
          Arkadaşlarınla en eğlenceli mini oyunlar burada.
        </p>

        <div className="glix-home-visual" aria-label="GLIX Parti Arenası">
          <SocialPylonArena />
        </div>

        {/* Action Stack */}
        <div className="glix-home-actions" aria-label="Oyun başlangıç butonları">
          <button
            className="glix-btn-cta-cyan"
            type="button"
            onClick={onCreateRoom}
          >
            <span>＋</span>
            <span>Oda Kur</span>
          </button>

          <button
            className="glix-btn-cta-magenta"
            type="button"
            onClick={onJoinRoom}
          >
            <span>↗</span>
            <span>Odaya Katıl</span>
          </button>

          {/* Inline Collapsible Rules Accordion */}
          <div className="glix-home-rules-accordion">
            <button
              className="glix-home-rules-trigger"
              type="button"
              onClick={() => {
                setRulesOpen(!rulesOpen);
                onHowToPlay?.();
              }}
              aria-expanded={rulesOpen}
              aria-controls="glix-how-to-play-content"
            >
              <span>Nasıl oynanır?</span>
              <span className={`glix-accordion-arrow ${rulesOpen ? "open" : ""}`}>
                ▼
              </span>
            </button>

            {rulesOpen && (
              <div id="glix-how-to-play-content" className="glix-home-rules-body">
                <div className="glix-rule-step">
                  <span className="glix-rule-num">1</span>
                  <span>Bir oyuncu <strong>Oda Kur</strong> butonuna basarak odayı açar ve 5 haneli kodu paylaşır.</span>
                </div>
                <div className="glix-rule-step">
                  <span className="glix-rule-num">2</span>
                  <span>Diğerleri <strong>Odaya Katıl</strong> diyerek kodu ve takma adını girer.</span>
                </div>
                <div className="glix-rule-step">
                  <span className="glix-rule-num">3</span>
                  <span>Herkes hazır olduğunda mini oyunlar başlar; en yüksek puanı toplayan kazanır!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Clean Mobile Footer */}
      <footer className="glix-home-footer">
        <span>2–8 OYUNCU</span>
        <span>•</span>
        <span>TELEFON-ÖNCELİKLİ</span>
        <span>•</span>
        <span>HESAP GEREKMEZ</span>
      </footer>
    </main>
  );
}
