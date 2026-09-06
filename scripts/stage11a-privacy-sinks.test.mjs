import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import * as ts from "typescript";

const repoRoot = process.cwd();
const stage11aFiles = [
  "apps/client/src/visuals/games/Stage11ATimingPressureStage.tsx",
  "apps/client/src/visuals/games/stage11a/ButonaBasStage.tsx",
  "apps/client/src/visuals/games/stage11a/GizliHirsizStage.tsx",
  "apps/client/src/visuals/games/stage11a/KorKronometreStage.tsx",
  "apps/client/src/visuals/games/stage11a/AsiriYuklemeStage.tsx",
  "apps/client/src/visuals/games/stage11a/SonKisiStage.tsx"
];

const privacyAuditFiles = [
  ...stage11aFiles,
  "apps/client/src/App.tsx"
];

const privateActionIdentifiers = [
  "actionState",
  "feedbackTone",
  "hasPressed",
  "hasTapped",
  "isAcknowledgedAction",
  "isAccepted",
  "isPending",
  "isPendingAction",
  "isRejected",
  "isServerFrozen",
  "localPending",
  "localSeal",
  "localStopRequested",
  "ackStatus",
  "buttonLabel",
  "latchLabel"
];

const playerFacingInternalTerms = [
  "STAGE 11.8A",
  "ADAPTER SONUCU",
  "NATIVE SONUÇ",
  "SERVER REVEAL",
  "PRIVATE TELEMETRY",
  "RESULT BUFFER",
  "PENDING /",
  "ACCEPTED /",
  "REJECTED /",
  "SERVER RİTMİ",
  "PROTOCOL",
  "BATCH"
];

function readStageFile(relativePath) {
  const filePath = resolve(repoRoot, relativePath);
  const sourceText = readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    relativePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  return { filePath, sourceText, sourceFile };
}

function jsxAttributeExpression(attribute, sourceFile) {
  const initializer = attribute.initializer;
  if (!initializer || !ts.isJsxExpression(initializer) || !initializer.expression) return null;
  return initializer.expression.getText(sourceFile);
}

function assertNoPrivateIdentifierInSink(attribute, sourceFile, relativePath) {
  const expression = jsxAttributeExpression(attribute, sourceFile);
  if (!expression) return;

  const attributeName = attribute.name.text;
  const matched = privateActionIdentifiers.find((identifier) => expression.includes(identifier));
  assert.equal(
    matched,
    undefined,
    `${relativePath}: ${matched} cannot enter ${attributeName} DOM identity/accessibility sink`
  );
}

function walk(node, visitor) {
  visitor(node);
  ts.forEachChild(node, (child) => walk(child, visitor));
}

test("Stage 11.8A UI has no private action state in DOM identity/accessibility sinks", () => {
  for (const relativePath of privacyAuditFiles) {
    const { sourceFile } = readStageFile(relativePath);
    walk(sourceFile, (node) => {
      if (ts.isJsxElement(node)) {
        const tagName = node.openingElement.tagName.getText(sourceFile).toLowerCase();
        if (tagName === "title" || tagName === "desc" || tagName === "metadata") {
          const matched = privateActionIdentifiers.find((identifier) => node.getText(sourceFile).includes(identifier));
          assert.equal(
            matched,
            undefined,
            `${relativePath}: ${matched} cannot enter SVG metadata`
          );
        }
      }

      if (!ts.isJsxAttribute(node)) return;

      const attributeName = node.name.text;
      assert.ok(
        !attributeName.startsWith("data-"),
        `${relativePath}: data-* attributes are not allowed on Stage 11.8A surfaces`
      );

      if (
        attributeName === "id" ||
        attributeName === "className" ||
        attributeName.startsWith("aria-")
      ) {
        assertNoPrivateIdentifierInSink(node, sourceFile, relativePath);
      }
    });

    const { sourceText } = readStageFile(relativePath);
    assert.doesNotMatch(sourceText, /(?:window|globalThis)\.__[A-Za-z0-9_$]*/);
    assert.doesNotMatch(sourceText, /aria-busy\s*=/);
  }
});

test("Stage 11.8A UI copy contains no internal review terminology", () => {
  for (const relativePath of stage11aFiles) {
    const { sourceText } = readStageFile(relativePath);
    for (const term of playerFacingInternalTerms) {
      assert.doesNotMatch(
        sourceText,
        new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"),
        `${relativePath}: player-facing term remains: ${term}`
      );
    }
  }
});

test("Shared shell copy contains no protocol or connection-code terminology", () => {
  const { sourceText: appSource } = readStageFile("apps/client/src/App.tsx");
  assert.doesNotMatch(appSource, /PROTOKOL/i);

  const { sourceText: viewportSource } = readStageFile("apps/client/src/visuals/viewport/GameViewport.tsx");
  for (const term of ["SYNC", "RECONNECT", "OFFLINE"]) {
    assert.doesNotMatch(
      viewportSource,
      new RegExp(term, "i"),
      `GameViewport.tsx: player-facing connection term remains: ${term}`
    );
  }
});
