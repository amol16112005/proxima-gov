import { describe, expect, it } from "vitest";
import {
  mapSpeechErrorToMessageKey,
  mergeTranscript,
  probeMicrophonePermission,
  speechLocaleFromAppLocale,
} from "./speechRecognition";

describe("speechLocaleFromAppLocale", () => {
  it("maps Hindi locale to hi-IN", () => {
    expect(speechLocaleFromAppLocale("hi")).toBe("hi-IN");
  });

  it("maps English locale to en-IN", () => {
    expect(speechLocaleFromAppLocale("en")).toBe("en-IN");
  });
});

describe("mapSpeechErrorToMessageKey", () => {
  it("maps permission errors", () => {
    expect(mapSpeechErrorToMessageKey("not-allowed")).toBe("issuesNew.voiceMicDenied");
    expect(mapSpeechErrorToMessageKey("service-not-allowed")).toBe("issuesNew.voiceMicDenied");
  });

  it("maps no-speech and network errors", () => {
    expect(mapSpeechErrorToMessageKey("no-speech")).toBe("issuesNew.voiceNoSpeech");
    expect(mapSpeechErrorToMessageKey("network")).toBe("issuesNew.voiceNetwork");
  });

  it("maps audio-capture to mic denied", () => {
    expect(mapSpeechErrorToMessageKey("audio-capture")).toBe("issuesNew.voiceMicDenied");
  });

  it("falls back to generic voice error", () => {
    expect(mapSpeechErrorToMessageKey("bad-grammar")).toBe("issuesNew.voiceError");
  });
});

describe("probeMicrophonePermission", () => {
  it("returns unavailable when mediaDevices is missing", async () => {
    const original = navigator.mediaDevices;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });
    await expect(probeMicrophonePermission()).resolves.toBe("unavailable");
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: original,
    });
  });
});

describe("mergeTranscript", () => {
  it("returns spoken text when base is empty", () => {
    expect(mergeTranscript("", "  broken road  ")).toBe("broken road");
  });

  it("appends spoken text to existing base", () => {
    expect(mergeTranscript("Ward 5", "near school")).toBe("Ward 5 near school");
  });

  it("keeps base when spoken is empty", () => {
    expect(mergeTranscript("Existing title", "   ")).toBe("Existing title");
  });
});