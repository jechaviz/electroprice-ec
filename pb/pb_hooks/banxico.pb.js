routerAdd("GET", "/api/electroprice/rates/usd-mxn", (e) => {
  const BANXICO_FIX_SERIES = "SF43718";
  const BANXICO_FIX_ENDPOINT = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${BANXICO_FIX_SERIES}/datos/oportuno`;
  const BANXICO_FIX_PUBLIC_PAGE = "https://www.banxico.org.mx/tipcamb/llenarTiposCambioAction.do?idioma=sp";
  const parseBanxicoRate = (payload) => {
    const datum = payload?.bmx?.series?.[0]?.datos?.[0];
    if (!datum?.dato) {
      throw new Error("Banxico response did not include a FIX value.");
    }

    const value = Number(String(datum.dato).replace(",", "").trim());
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Banxico FIX value is invalid.");
    }

    return {
      value,
      observedAt: datum.fecha,
    };
  };

  const decodeHtml = (value) => String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");

  const bodyToText = (response) => {
    if (typeof response.raw === "string") return response.raw;
    if (typeof response.body === "string") return response.body;
    const bytes = response.body || [];
    let text = "";
    const chunkSize = 8192;
    for (let index = 0; index < bytes.length; index += chunkSize) {
      text += String.fromCharCode.apply(null, bytes.slice(index, index + chunkSize));
    }
    return text;
  };

  const extractElementTextById = (html, id) => {
    const marker = `id="${id}"`;
    const markerIndex = html.indexOf(marker);
    if (markerIndex < 0) {
      throw new Error(`Banxico public page did not include ${id}.`);
    }

    const afterMarker = html.slice(markerIndex);
    const openEnd = afterMarker.indexOf(">");
    const closeStart = afterMarker.indexOf("</", openEnd + 1);
    if (openEnd < 0 || closeStart < 0) {
      throw new Error(`Banxico public page has malformed ${id} element.`);
    }

    const value = decodeHtml(afterMarker.slice(openEnd + 1, closeStart)).trim();
    if (!value) {
      throw new Error(`Banxico public page included empty ${id}.`);
    }
    return value;
  };

  const parseBanxicoPublicFixPage = (html) => {
    const observedAt = extractElementTextById(html, `fecha${BANXICO_FIX_SERIES}`);
    const valueText = extractElementTextById(html, `td${BANXICO_FIX_SERIES}`);
    const value = Number(String(valueText).replace(",", "").trim());
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error("Banxico public FIX value is invalid.");
    }

    return { value, observedAt };
  };

  const fetchPublicFixRate = () => {
    const response = $http.send({
      method: "GET",
      url: BANXICO_FIX_PUBLIC_PAGE,
      headers: {
        Accept: "text/html,application/xhtml+xml",
      },
      timeout: 8,
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw new Error(`Banxico public FIX page returned ${response.statusCode}.`);
    }

    return parseBanxicoPublicFixPage(bodyToText(response));
  };

  const rateResponse = (rate, source) => e.json(200, {
    base: "USD",
    quote: "MXN",
    source,
    series: BANXICO_FIX_SERIES,
    value: rate.value,
    observedAt: rate.observedAt,
    fetchedAt: new Date().toISOString(),
  });

  const token = $os.getenv("BANXICO_API_TOKEN");
  if (!token) {
    try {
      return rateResponse(fetchPublicFixRate(), "banxico_public_fix_page");
    } catch (error) {
      return e.json(502, {
        error: String(error?.message || error),
        source: "banxico_public_fix_page",
        series: BANXICO_FIX_SERIES,
      });
    }
  }

  try {
    const response = $http.send({
      method: "GET",
      url: BANXICO_FIX_ENDPOINT,
      headers: {
        Accept: "application/json",
        "Bmx-Token": token,
      },
      timeout: 8,
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      return e.json(502, {
        error: `Banxico SIE returned ${response.statusCode}.`,
        source: "banxico_sie",
        series: BANXICO_FIX_SERIES,
      });
    }

    const rate = parseBanxicoRate(response.json);
    return rateResponse(rate, "banxico_sie");
  } catch (error) {
    try {
      return rateResponse(fetchPublicFixRate(), "banxico_public_fix_page");
    } catch (fallbackError) {
      return e.json(502, {
        error: String(error?.message || error),
        fallbackError: String(fallbackError?.message || fallbackError),
        source: "banxico_sie",
        series: BANXICO_FIX_SERIES,
      });
    }
  }
});
