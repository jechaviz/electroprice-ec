import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  currencyErrorSignal,
  currencyRateMetadataSignal,
  exchangeRateMarkupSignal,
  ratesSignal,
} from "../signals/config.signals";
import { CurrencyService } from "./CurrencyService";

describe("CurrencyService Banxico rates", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    exchangeRateMarkupSignal.value = 0.02;
    ratesSignal.value = { MXN: 1, USD: 0.05 };
    currencyRateMetadataSignal.value = null;
    currencyErrorSignal.value = null;
  });

  it("uses Banxico FIX and applies the configured exchange spread", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        source: "banxico_sie",
        series: "SF43718",
        value: 17.25,
        observedAt: "20/05/2026",
        fetchedAt: "2026-05-20T18:00:00.000Z",
      }),
    }));

    await CurrencyService.fetchRates();

    // MXN is the base (1); the USD→MXN rate lives in metadata and USD = 1/rate.
    expect(ratesSignal.value.MXN).toBe(1);
    expect(ratesSignal.value.USD).toBeCloseTo(1 / 17.595, 5);
    expect(currencyRateMetadataSignal.value).toMatchObject({
      source: "banxico_sie",
      baseUsdMxnRate: 17.25,
      effectiveUsdMxnRate: 17.595,
      markup: 0.02,
      stale: false,
      series: "SF43718",
    });
    expect(currencyErrorSignal.value).toBeNull();
  });

  it("falls back to a cached Banxico rate without setting a fatal currency error", async () => {
    localStorage.setItem("ep_banxico_usd_mxn_rate", JSON.stringify({
      value: 17.5,
      observedAt: "19/05/2026",
      fetchedAt: new Date().toISOString(),
      source: "banxico_sie",
      series: "SF43718",
    }));
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await CurrencyService.fetchRates();

    expect(ratesSignal.value.MXN).toBe(1);
    expect(ratesSignal.value.USD).toBeCloseTo(1 / 17.85, 5);
    expect(currencyRateMetadataSignal.value?.source).toBe("cache");
    expect(currencyRateMetadataSignal.value?.stale).toBe(true);
    expect(currencyErrorSignal.value).toBeNull();
  });

  it("recalculates the effective rate when the spread changes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ value: 18, fetchedAt: "2026-05-20T18:00:00.000Z" }),
    }));

    await CurrencyService.fetchRates();
    exchangeRateMarkupSignal.value = 0.035;
    CurrencyService.recalculateEffectiveRates();

    expect(ratesSignal.value.USD).toBeCloseTo(1 / 18.63, 5);
    expect(currencyRateMetadataSignal.value?.effectiveUsdMxnRate).toBe(18.63);
    expect(currencyRateMetadataSignal.value?.markup).toBe(0.035);
  });
});
