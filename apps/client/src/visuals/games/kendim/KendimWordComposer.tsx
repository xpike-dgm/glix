import { useState, useCallback } from "react";
import type { JSX, ChangeEvent, FormEvent } from "react";

interface KendimWordComposerProps {
  readonly initialWord: string;
  readonly hasWritten: boolean;
  readonly isSpectator: boolean;
  readonly onSubmitWord: (word: string) => void;
}

export function KendimWordComposer({
  initialWord,
  hasWritten,
  isSpectator,
  onSubmitWord
}: KendimWordComposerProps): JSX.Element {
  const [word, setWord] = useState(initialWord);
  const [isPending, setIsPending] = useState(false);

  const isLocked = hasWritten || isPending;
  const trimmed = word.trim();
  const canSubmit = !isSpectator && !isLocked && trimmed.length > 0;

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setWord(event.target.value.toLocaleUpperCase("tr-TR"));
  }, []);

  const handleSubmit = useCallback((event?: FormEvent) => {
    if (event) event.preventDefault();
    if (!canSubmit) return;
    setIsPending(true);
    onSubmitWord(trimmed);
  }, [canSubmit, onSubmitWord, trimmed]);

  // Responsive font size calculation for long words without arbitrary character caps
  const wordLength = word.length;
  const fontScaleClass = wordLength > 20 ? "is-extra-long" : wordLength > 12 ? "is-long" : "is-standard";

  if (isSpectator) {
    return (
      <div className="kendim-composer-container" aria-label="İzleyici Bilgi Paneli">
        <div className="kendim-scanner-card is-spectator">
          <div className="kendim-card-hologram-strip" aria-hidden="true" />
          <div className="kendim-scanner-header">
            <span className="kendim-scanner-badge">GÖZLEM MODU</span>
            <h2 className="kendim-scanner-title">OYUNCULAR KELİMELERİNİ MÜHÜRLÜYOR</h2>
          </div>

          <div className="kendim-scanner-screen">
            <div className="kendim-radar-reticle" aria-hidden="true">
              <span className="kendim-radar-sweep" />
              <span className="kendim-radar-dot" />
            </div>
            <p className="kendim-scanner-hint">
              Her oyuncu kendisini anlatan tek bir kelime giriyor. Kelimeler anonim kartlara dönüştürülecek.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kendim-composer-container" aria-label="Kendim Kelime Yazma Sahnesi">
      <div className={`kendim-scanner-card ${isLocked ? "is-sealed" : ""}`}>
        <div className="kendim-card-hologram-strip" aria-hidden="true" />

        <div className="kendim-scanner-header">
          <span className="kendim-scanner-badge">KİMLİK KARTI #01</span>
          <h2 className="kendim-scanner-title">KENDİNİ TEK KELİMEYLE ANLAT</h2>
          <p className="kendim-scanner-prompt">
            {isLocked
              ? "Kartın mühürlendi. Diğer oyuncuların kelimeleri bekleniyor."
              : "Seni en iyi tarif eden kelimeyi yaz. Eşleştirme turunda kartın anonim dağıtılacak."}
          </p>
        </div>

        <form className="kendim-scanner-form" onSubmit={handleSubmit}>
          <div className="kendim-card-plate">
            <div className="kendim-card-plate-inner">
              <span className="kendim-card-watermark" aria-hidden="true">GLIX · KENDİM</span>

              <div className="kendim-input-wrapper">
                <input
                  type="text"
                  className={`kendim-word-input ${fontScaleClass}`}
                  value={word}
                  disabled={isLocked}
                  placeholder="BİR KELİME YAZ"
                  aria-label="Kendini anlatan tek kelime"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  onChange={handleChange}
                />
              </div>

              {isLocked && (
                <div className="kendim-seal-stamp" aria-label="Kelime Mühürlendi">
                  <span className="kendim-seal-ring" />
                  <span className="kendim-seal-icon" aria-hidden="true">🔒</span>
                  <span className="kendim-seal-text">MÜHÜRLENDİ</span>
                </div>
              )}
            </div>
          </div>

          <div className="kendim-scanner-actions">
            <button
              type="submit"
              className="kendim-seal-button"
              disabled={!canSubmit}
            >
              <span className="kendim-seal-button-glow" aria-hidden="true" />
              <span className="kendim-seal-button-content">
                <span className="kendim-seal-btn-icon" aria-hidden="true">
                  {isLocked ? "✓" : "✦"}
                </span>
                <strong>{isLocked ? "KELİME KİLİTLENDİ" : "KELİMEYİ MÜHÜRLE"}</strong>
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
