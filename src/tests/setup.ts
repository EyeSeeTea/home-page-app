import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { TextDecoder, TextEncoder } from "util";

afterEach(() => {
    cleanup();
});

// Optional: mute console in tests (was jest.fn() in CRA setup)
global.console = {
    ...console,
    log: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
};

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
