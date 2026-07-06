import { describe, expect, it } from "vitest";
import {
  mapSpeechErrorToMessageKey,
  mergeTranscript,
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

  it("falls back to generic voice error", () => {
    expect(mapSpeechErrorToMessageKey("audio-capture")).toBe("issuesNew.voiceError");
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