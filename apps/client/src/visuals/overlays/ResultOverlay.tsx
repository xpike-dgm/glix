import type { JSX, ReactNode } from "react";

export interface AuthoritativePlayerScore {
  readonly id: string;
  readonly nickname: string;
  readonly score: number;
  readonly miniGameScore?: number | undefined;
  readonly rank?: number | undefined;
  readonly isWinner?: boolean | undefined;
}

export interface ResultOverlayProps {
  readonly gameName: string;
  readonly final?: boolean | undefined;
  readonly scores?: readonly AuthoritativePlayerScore[] | undefined;
  readonly winner?: AuthoritativePlayerScore | null | undefined;
  readonly onReturnLobby?: (() => void) | undefined;
  readonly children?: ReactNode | undefined;
  readonly disableInteraction?: boolean | undefined;
}

export function ResultOverlay({
  gameName,
  final = false,
  scores,
  winner,
  onReturnLobby,
  children,
  disableInteraction = false
}: ResultOverlayProps): JSX.Element {
  return (
    <div
      className={`glix-result-fullscreen ${final ? "is-final" : ""}`}
      role="region"
      aria-label={`${gameName} maç sonuçları`}
    >
      <div className="glix-result-header">
        <span className="glix-result-badge">
          {final ? "★ MAÇ SONUCU" : "TUR SONUCU"}
        </span>
        <h1 className="glix-result-title">
          {final ? "Tebrikler!" : gameName}
        </h1>
      </div>

      {/* Authoritative Winner Spotlight Card */}
      {winner && (
        <section className="glix-winner-spotlight" aria-label="Kazanan oyuncu">
          <div className="glix-winner-crown" aria-hidden="true">
            👑
          </div>
          <div className="glix-winner-name">{winner.nickname}</div>
          <div className="glix-winner-score">{winner.score} Puan</div>
        </section>
      )}

      {/* Authoritative Scores Rail */}
      {scores && scores.length > 0 && (
        <div className="glix-scores-list" role="list" aria-label="Skor sıralaması">
          {scores.map((player, idx) => (
            <div className="glix-score-item" key={player.id} role="listitem">
              <span className="glix-score-rank">
                {player.rank !== undefined ? `#${player.rank}` : `#${idx + 1}`}
              </span>
              <span className="glix-score-nick">{player.nickname}</span>
              {player.miniGameScore !== undefined && (
                <span className="glix-score-delta">+{player.miniGameScore}</span>
              )}
              <span className="glix-score-total">{player.score}</span>
            </div>
          ))}
        </div>
      )}

      {/* Child slot for custom minigame result components */}
      {children && (
        disableInteraction ? (
          <fieldset style={{ border: "none", padding: 0, margin: 0, width: "100%" }} disabled>
            {children}
          </fieldset>
        ) : (
          <div style={{ width: "100%" }}>{children}</div>
        )
      )}

      {/* Return to Lobby button */}
      {onReturnLobby && (
        <div style={{ width: "100%", maxWidth: "440px", marginTop: "12px" }}>
          <button
            className="glix-btn-start-match"
            type="button"
            onClick={onReturnLobby}
            aria-label="Lobiye dön"
          >
            <span>Lobiye Dön</span>
          </button>
        </div>
      )}
    </div>
  );
}
