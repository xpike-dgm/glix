import type { JSX } from "react";
import type {
  ClientActionState,
  GizliAlisverisOwnState,
  GizliAlisverisPublicState,
  JsonValue,
  MatchPlayerState,
  RuntimePhaseId
} from "@glix/shared";

export interface GizliAlisverisStageProps {
  readonly publicState: GizliAlisverisPublicState;
  readonly ownState: GizliAlisverisOwnState | null | undefined;
  readonly phase?: RuntimePhaseId;
  readonly selfPlayerId: string | null;
  readonly players?: readonly MatchPlayerState[];
  readonly now?: number;
  readonly isSpectator: boolean;
  readonly actionState?: ClientActionState | null;
  readonly onSubmit: (payload: JsonValue) => void;
}

function playerName(players: readonly MatchPlayerState[] | undefined, playerId: string): string {
  return players?.find((p) => p.id === playerId)?.nickname ?? "Oyuncu";
}

const PRODUCT_GLYPHS: Record<string, string> = {
  "hologram-sticker": "✨",
  "enerji-icecegi": "⚡",
  "neon-rozet": "🏵️",
  "retro-kartus": "🕹️",
  "mini-hoparlor": "🔊",
  "arcade-eldiveni": "🥊",
  "piksel-kamera": "📷",
  "jet-canta": "🚀",
  "kristal-kulaklik": "🎧",
  "holo-kask": "🪖",
  "mini-drone": "🛸",
  "gizli-sandik": "📦"
};

export function GizliAlisverisStage({
  publicState,
  ownState,
  selfPlayerId,
  players,
  isSpectator,
  actionState,
  onSubmit
}: GizliAlisverisStageProps): JSX.Element {
  const isFinished = publicState.finished;
  const cartSet = new Set(ownState?.cartProductIds ?? []);
  const spent = ownState?.spent ?? 0;
  const remaining = ownState?.remainingBudget ?? (publicState.budget ?? 60);

  const isPending = actionState?.status === "pending";
  const isRejected = actionState?.status === "rejected";

  const handleToggle = (productId: string) => {
    if (isPending || isFinished || isSpectator) return;
    onSubmit({ kind: "shopping-toggle", productId });
  };

  const highestValue = Math.max(0, ...(publicState.results?.map((r) => r.basketValue) ?? [0]));

  return (
    <div className="alisveris-stage" role="region" aria-label="Gizli Alışveriş oyun alanı">
      <header className="stage11c-game-header">
        <div>
          <span className="stage11c-eyebrow">MARKET KONVEYÖRÜ & BÖLÜŞÜM</span>
          <h2 className="stage11c-game-title">Gizli Alışveriş</h2>
        </div>
      </header>

      {/* Action status notification */}
      {isSpectator ? (
        <div className="stage11c-status-bar is-spectator" role="status">
          <span>İZLEMEDE</span>
          <small>Oyuncular sepetlerini hazırlıyor</small>
        </div>
      ) : isPending ? (
        <div className="stage11c-status-bar is-pending" role="status">
          <span>SİNYAL İLETİLİYOR…</span>
          <small>Sepet güncelleniyor</small>
        </div>
      ) : isRejected ? (
        <div className="stage11c-status-bar is-rejected" role="alert">
          <span>REDDEDİLDİ</span>
          <small>{actionState?.reason ?? "Lütfen tekrar deneyin"}</small>
        </div>
      ) : (
        <div className="stage11c-status-bar is-accepted" role="status">
          <span>✓ SEPET HAZIR ({cartSet.size} ÜRÜN)</span>
          <small>Süre bitene kadar istediğin gibi değiştir</small>
        </div>
      )}

      {/* Live Budget Meter */}
      <section className="alisveris-register-header" aria-label="Kredi ve bütçe durumu">
        <div className="register-budget-stat">
          <small>HARCANAN KREDİ</small>
          <strong>{spent} / 60</strong>
        </div>
        <div className="register-budget-stat" style={{ textAlign: "right" }}>
          <small>KALAN KREDİ</small>
          <strong style={{ color: remaining < 15 ? "#ff7788" : "#00ffcc" }}>{remaining}</strong>
        </div>
      </section>

      <div className="register-progress-bar" aria-hidden="true">
        <div
          className="register-progress-fill"
          style={{ width: `${Math.min(100, (spent / (publicState.budget ?? 60)) * 100)}%` }}
        />
      </div>

      {/* Product Shelf & Results Apparatus */}
      <section className="stage11c-apparatus" aria-label="Market reyonu ve sepetler">
        {isFinished ? (
          /* Results Conveyor */
          <div className="alisveris-results-board">
            <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#72f4ff", letterSpacing: "0.08em" }}>
              📦 ÜRÜN BÖLÜŞÜM HESABI (FİYAT ÷ ALICI SAYISI):
            </div>

            <div className="alisveris-division-list" role="list">
              {publicState.products.map((prod) => {
                const buyers = publicState.productBuyerCounts?.[prod.id] ?? 0;
                if (buyers === 0) return null;
                const valuePerBuyer = prod.price / buyers;
                return (
                  <div key={prod.id} className="division-row" role="listitem">
                    <span>
                      {PRODUCT_GLYPHS[prod.id] ?? "🛍️"} <b>{prod.name}</b> ({prod.price} Kredi)
                    </span>
                    <span style={{ color: buyers === 1 ? "#00ffaa" : "#ffd000" }}>
                      ÷ {buyers} alıcı = <b>{valuePerBuyer.toFixed(1)} Puan</b>
                      {buyers === 1 && " (TEK ALICI!)"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#72f4ff", marginTop: "0.5rem" }}>
              🏆 SEPET SONUÇLARI:
            </div>

            <div className="acgozluluk-breakdown-list" aria-label="Sepet sıralaması">
              {publicState.results?.map((res) => {
                const isSelf = res.playerId === selfPlayerId;
                const isWinner = Math.abs(res.basketValue - highestValue) < 1e-9 && highestValue > 0;
                return (
                  <div
                    className="acgozluluk-breakdown-item"
                    key={res.playerId}
                    style={isWinner ? { borderColor: "#ffd700", background: "rgba(45, 35, 10, 0.7)" } : undefined}
                  >
                    <span>
                      {isWinner ? "👑 " : "🛒 "}
                      {playerName(players, res.playerId)}{isSelf ? " (Sen)" : ""}
                    </span>
                    <span>Sepet Değeri: <b>{res.basketValue.toFixed(1)}</b></span>
                    <strong style={{ color: isWinner ? "#ffd700" : "#8da4be" }}>
                      {isWinner ? "+1 Puan" : "0"}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Interactive Product Shelf */
          <div className="alisveris-shelf-grid" role="group" aria-label="Ürün reyonu">
            {publicState.products.map((prod) => {
              const inCart = cartSet.has(prod.id);
              const canAfford = inCart || remaining >= prod.price;
              const disabled = isPending || !canAfford;

              return (
                <button
                  key={prod.id}
                  type="button"
                  className={`alisveris-product-card ${inCart ? "is-in-cart" : ""}`}
                  disabled={disabled}
                  onClick={() => handleToggle(prod.id)}
                  aria-pressed={inCart}
                  aria-label={`${prod.name}, ${prod.price} Kredi, ${inCart ? "Sepette" : canAfford ? "Sepete Ekle" : "Yetersiz Kredi"}`}
                >
                  <div className="product-card-top">
                    <span className="product-name">
                      {PRODUCT_GLYPHS[prod.id] ?? "🛍️"} {prod.name}
                    </span>
                    <span className="product-price-tag">{prod.price} K</span>
                  </div>

                  <div className="product-action-label">
                    {inCart ? "✓ SEPETTE" : canAfford ? "+ EKLE" : "YETERSİZ"}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}