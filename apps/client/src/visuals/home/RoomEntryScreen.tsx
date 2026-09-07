import { type JSX, type FormEvent } from "react";
import { MAX_NICKNAME_LENGTH, ROOM_CODE_LENGTH } from "@glix/shared";

export interface RoomEntryScreenProps {
  readonly mode: "create" | "join";
  readonly nickname: string;
  readonly roomCode: string;
  readonly error: string | null;
  readonly isSubmitting?: boolean | undefined;
  readonly onModeChange: (mode: "create" | "join") => void;
  readonly onNicknameChange: (nickname: string) => void;
  readonly onRoomCodeChange: (roomCode: string) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  readonly onBack: () => void;
}

export function RoomEntryScreen({
  mode,
  nickname,
  roomCode,
  error,
  isSubmitting = false,
  onModeChange,
  onNicknameChange,
  onRoomCodeChange,
  onSubmit,
  onBack
}: RoomEntryScreenProps): JSX.Element {
  const isJoin = mode === "join";

  return (
    <section className="glix-entry-screen" aria-labelledby="glix-entry-title">
      <div className="glix-entry-topbar">
        <button
          className="glix-btn-back"
          type="button"
          onClick={onBack}
          aria-label="Ana sayfaya dön"
        >
          ← Ana Sayfa
        </button>
      </div>

      <div className="glix-entry-card">
        {/* Segmented Mode Switcher */}
        <div className="glix-segmented-tabs" role="tablist" aria-label="Oda işlem modu">
          <button
            className={`glix-segment-btn ${!isJoin ? "active-create" : ""}`}
            type="button"
            role="tab"
            aria-selected={!isJoin}
            onClick={() => onModeChange("create")}
          >
            Oda Kur
          </button>
          <button
            className={`glix-segment-btn ${isJoin ? "active-join" : ""}`}
            type="button"
            role="tab"
            aria-selected={isJoin}
            onClick={() => onModeChange("join")}
          >
            Odaya Katıl
          </button>
        </div>

        <h1 id="glix-entry-title" className="glix-home-title" style={{ fontSize: "1.8rem", textAlign: "left", marginBottom: "6px" }}>
          {isJoin ? "Odaya Katıl" : "Oda Kur"}
        </h1>
        <p className="glix-home-tagline" style={{ textAlign: "left", fontSize: "0.92rem", marginBottom: "20px" }}>
          {isJoin
            ? "Arkadaşının paylaştığı 5 haneli oda kodunu ve takma adını gir."
            : "Bir takma ad belirle, odanı kur ve arkadaşlarını davet et."}
        </p>

        <form onSubmit={onSubmit} noValidate>
          {/* Room Code field if Join */}
          {isJoin && (
            <div className="glix-form-group">
              <label htmlFor="glix-entry-roomcode" className="glix-field-label">
                Oda Kodu
              </label>
              <div className="glix-input-wrapper">
                <input
                  id="glix-entry-roomcode"
                  className="glix-input-text glix-input-code"
                  type="text"
                  value={roomCode}
                  onChange={(e) =>
                    onRoomCodeChange(
                      e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, ROOM_CODE_LENGTH)
                    )
                  }
                  placeholder="ABCDE"
                  maxLength={ROOM_CODE_LENGTH}
                  autoComplete="off"
                  autoFocus
                  required
                />
                {roomCode.length > 0 && (
                  <button
                    type="button"
                    className="glix-input-clear"
                    onClick={() => onRoomCodeChange("")}
                    aria-label="Oda kodunu temizle"
                  >
                    ×
                  </button>
                )}
              </div>
              <small className="glix-field-hint">Arkadaşının ekranındaki 5 karakterli kod.</small>
            </div>
          )}

          {/* Nickname field */}
          <div className="glix-form-group">
            <label htmlFor="glix-entry-nickname" className="glix-field-label">
              Takma Adın
            </label>
            <div className="glix-input-wrapper">
              <input
                id="glix-entry-nickname"
                className="glix-input-text"
                type="text"
                value={nickname}
                onChange={(e) => onNicknameChange(e.target.value.slice(0, MAX_NICKNAME_LENGTH))}
                placeholder="Örn: NeonKedi"
                maxLength={MAX_NICKNAME_LENGTH}
                autoComplete="nickname"
                autoFocus={!isJoin}
                required
              />
              {nickname.length > 0 && (
                <button
                  type="button"
                  className="glix-input-clear"
                  onClick={() => onNicknameChange("")}
                  aria-label="Takma adı temizle"
                >
                  ×
                </button>
              )}
            </div>
            <small className="glix-field-hint">
              {nickname.length}/{MAX_NICKNAME_LENGTH} karakter (bu maçta görünecek adın)
            </small>
          </div>

          {error && (
            <div className="glix-entry-error" role="alert">
              {error}
            </div>
          )}

          <button
            className={isJoin ? "glix-btn-cta-magenta" : "glix-btn-cta-cyan"}
            type="submit"
            disabled={isSubmitting}
            style={{ marginTop: "12px" }}
          >
            {isSubmitting
              ? "Bağlanıyor..."
              : isJoin
                ? "Odaya Katıl →"
                : "Oda Kur →"}
          </button>
        </form>
      </div>
    </section>
  );
}
