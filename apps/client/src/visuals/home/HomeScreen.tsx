import type { JSX } from "react";
import { ConnectionStateBadge } from "../hud/ConnectionStateBadge";
import type { VisualConnectionState } from "../types";
import { GlixWordmark } from "./GlixWordmark";
import { SocialPylonArena } from "./SocialPylonArena";

interface HomeScreenProps {
  readonly connection: VisualConnectionState;
  readonly onCreateRoom: () => void;
  readonly onJoinRoom: () => void;
  readonly onHowToPlay: () => void;
}

export function HomeScreen({
  connection,
  onCreateRoom,
  onJoinRoom,
  onHowToPlay
}: HomeScreenProps): JSX.Element {
  return (
    <section className="glix-home-screen" aria-labelledby="app-title">
      <header className="glix-home-header">
        <button className="glix-home-brand" type="button" onClick={() => window.scrollTo({ top: 0 })} aria-label="GLIX ana sayfa">
          <GlixWordmark compact />
        </button>
        <ConnectionStateBadge connection={connection} />
      </header>

      <div className="glix-home-stage">
        <div className="glix-home-copy">
          <p className="glix-kicker"><span /> NEON SOCIAL ARCADE</p>
          <h1 id="app-title">Aynı oda.<br /><em>Farklı hamle.</em></h1>
          <p className="glix-home-deck">Telefonunu al. Odaya gir. İlk hamleyi sen yap.</p>
        </div>

        <div className="glix-home-hero" aria-label="GLIX Social Pylon Token Arena">
          <SocialPylonArena />
        </div>

        <div className="glix-home-actions" aria-label="Oyun başlangıcı">
          <button className="glix-home-cta glix-home-cta-primary" type="button" onClick={onCreateRoom}>
            <span className="glix-cta-mark">＋</span>
            <span><strong>ODA KUR</strong><small>YENİ BİR MAÇ</small></span>
          </button>
          <button className="glix-home-cta glix-home-cta-secondary" type="button" onClick={onJoinRoom}>
            <span className="glix-cta-mark">↗</span>
            <span><strong>ODAYA KATIL</strong><small>KODLA GİR</small></span>
          </button>
          <button className="glix-how-to-play" type="button" onClick={onHowToPlay}>
            NASIL OYNANIR <span aria-hidden="true">↗</span>
          </button>
        </div>
      </div>

      <footer className="glix-home-footer">
        <span>2–8 OYUNCU</span>
        <i />
        <span>YALNIZCA TAKMA AD</span>
        <i />
        <span>GLIX / PARTY CORE</span>
      </footer>
    </section>
  );
}
