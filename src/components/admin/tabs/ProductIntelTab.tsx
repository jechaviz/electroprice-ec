import React, { useEffect, useMemo, useState } from "react";
import { MissingPiecesService } from "../../../services/MissingPiecesService";
import type { Product, Wholesaler } from "../../../types";
import { loadPocketBase } from "../../../utils/pocketBaseClient";
import ImageWithFallback from "../../common/ImageWithFallback";

interface ProductIntelTabProps {
  products: Product[];
  wholesalers: Wholesaler[];
  formatPrice: (price: number) => string;
}

const getWholesalerName = (wholesalers: Wholesaler[], id: string) =>
  wholesalers.find((item) => item.id === id)?.name || id;

const getSourceSummary = (product: Product) => [
  { label: "Specs", value: Object.keys(product.specs || {}).length },
  { label: "Imagenes", value: product.gallery?.length || 0 },
  { label: "Docs", value: product.documents?.length || 0 },
  { label: "Software", value: product.softwareLinks?.length || 0 },
  { label: "Aliases", value: product.providerAliases?.length || 0 },
];

const getPriceSpread = (product: Product) => {
  const prices = product.wholesalerStock
    .filter((stock) => stock.price > 0 && stock.stock > 0)
    .sort((a, b) => a.price - b.price);
  if (prices.length < 2) return null;
  return {
    best: prices[0],
    second: prices[1],
    amount: prices[1].price - prices[0].price,
    percent: ((prices[1].price - prices[0].price) / prices[1].price) * 100,
  };
};

const ROWS_PER_PAGE = 24;

export const ProductIntelTab: React.FC<ProductIntelTabProps> = ({ products, wholesalers, formatPrice }) => {
  const missingPieces = useMemo(() => new MissingPiecesService(), []);
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(products.map((product) => [product.id, product.businessNotes || ""]))
  );
  const [savedId, setSavedId] = useState<string | null>(null);
  const rows = useMemo(() => products.map((product) => ({
    product,
    assessment: missingPieces.assess(product),
    bestOffer: missingPieces.findBestOffer(product.wholesalerStock),
    spread: getPriceSpread(product),
  })).sort((a, b) => a.assessment.contentScore - b.assessment.contentScore), [missingPieces, products]);
  const summary = useMemo(() => {
    const incomplete = rows.filter((row) => row.assessment.missingPieces.length > 0);
    const averageScore = rows.length
      ? Math.round(rows.reduce((sum, row) => sum + row.assessment.contentScore, 0) / rows.length)
      : 0;
    const estimatedCost = rows.reduce((sum, row) => sum + row.assessment.enrichmentEstimateUsd, 0);
    return { incomplete: incomplete.length, averageScore, estimatedCost };
  }, [rows]);
  const pageCount = Math.max(1, Math.ceil(rows.length / ROWS_PER_PAGE));
  const visibleRows = rows.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  useEffect(() => {
    setPage((value) => Math.min(value, pageCount));
  }, [pageCount]);

  useEffect(() => {
    setNotes((current) => ({
      ...Object.fromEntries(products.map((product) => [product.id, product.businessNotes || ""])),
      ...current,
    }));
  }, [products]);

  const saveNote = async (productId: string) => {
    const value = notes[productId] || "";
    const pb = await loadPocketBase();
    await pb.collection("products").update(productId, { business_notes: value });
    setSavedId(productId);
    setTimeout(() => setSavedId(null), 1800);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: "Productos", value: rows.length, icon: "fa-boxes-stacked" },
          { label: "Score contenido", value: `${summary.averageScore}%`, icon: "fa-gauge-high" },
          { label: "Por completar", value: summary.incomplete, icon: "fa-puzzle-piece" },
          { label: "Costo Missing Pieces", value: `$${summary.estimatedCost.toFixed(2)}`, icon: "fa-wand-magic-sparkles" },
        ].map((metric) => (
          <div key={metric.label} className="rounded-lg border border-base-content/10 bg-base-200/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-base-content/45">{metric.label}</p>
                <p className="mt-2 text-2xl font-black tracking-tight">{metric.value}</p>
              </div>
              <i className={`fa-solid ${metric.icon} text-xl text-primary`} />
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-base-content/10 bg-base-200/60">
        <div className="border-b border-base-content/10 px-5 py-4">
          <h2 className="text-xl font-black">Product intelligence</h2>
          <p className="text-sm text-base-content/50">Ficha canonica, costos por proveedor, ventaja competitiva y notas internas.</p>
        </div>
        <div className="divide-y divide-base-content/10">
          {visibleRows.map(({ product, assessment, bestOffer, spread }) => (
            <article key={product.id} className="grid gap-4 p-5 xl:grid-cols-[1.1fr_1fr_1fr]">
              <div className="min-w-0">
                <div className="flex gap-3">
                  <ImageWithFallback src={product.imageUrl} alt="" className="h-20 w-20 rounded-lg object-contain bg-base-100 p-2" />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black">{product.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-base-content/40">{assessment.canonicalKey}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="badge badge-primary">{assessment.contentScore}% contenido</span>
                      <span className="badge badge-secondary">{assessment.identityConfidence}% identidad</span>
                      <span className="badge badge-ghost">{product.enrichmentStatus || "raw"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {product.wholesalerStock.map((stock) => (
                    <div key={`${product.id}-${stock.wholesalerId}`} className={`rounded-md border p-3 text-xs ${bestOffer?.providerId === stock.wholesalerId ? "border-success/40 bg-success/10" : "border-base-content/10 bg-base-100/50"}`}>
                      <div className="flex justify-between gap-3">
                        <span className="font-bold">{getWholesalerName(wholesalers, stock.wholesalerId)}</span>
                        <span className="font-mono font-black">{formatPrice(stock.price)}</span>
                      </div>
                      <p className="mt-1 text-base-content/45">stock: {stock.stock}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border border-base-content/10 bg-base-100/60 p-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-base-content/45">Ventaja competitiva</h3>
                  {bestOffer ? (
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between"><span>Proveedor elegido</span><b>{getWholesalerName(wholesalers, bestOffer.providerId)}</b></div>
                      <div className="flex justify-between"><span>Costo base</span><b>{formatPrice(bestOffer.wholesalePrice)}</b></div>
                      <div className="flex justify-between"><span>Precio retail 15%</span><b>{formatPrice(bestOffer.retailPrice)}</b></div>
                      <div className="flex justify-between text-success"><span>Diferencia vs segunda opcion</span><b>{spread ? `${formatPrice(spread.amount)} (${spread.percent.toFixed(1)}%)` : "N/A"}</b></div>
                    </div>
                  ) : <p className="mt-3 text-sm text-base-content/45">Sin offer vivo para comparar.</p>}
                </div>

                <div className="rounded-lg border border-base-content/10 bg-base-100/60 p-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-base-content/45">Fuentes y piezas</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getSourceSummary(product).map((source) => (
                      <span key={source.label} className="badge badge-ghost">{source.label}: {source.value}</span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(assessment.missingPieces.length ? assessment.missingPieces.slice(0, 6) : ["completo"]).map((piece) => (
                      <span key={piece} className={`badge ${piece === "completo" ? "badge-success" : "badge-warning"}`}>{piece}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-base-content/10 bg-base-100/60 p-4">
                <label className="text-xs font-black uppercase tracking-widest text-base-content/45" htmlFor={`note-${product.id}`}>Notas ElectroPrice</label>
                <textarea
                  id={`note-${product.id}`}
                  className="textarea textarea-bordered mt-3 min-h-28 w-full rounded-md bg-base-200/60 text-sm"
                  value={notes[product.id] || ""}
                  onChange={(event) => setNotes((current) => ({ ...current, [product.id]: event.target.value }))}
                  placeholder="Margen especial, proveedor preferido, bundle sugerido, objeciones comerciales..."
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <a className="link link-primary text-xs font-bold" href={product.manufacturerUrl || "#"} target="_blank" rel="noreferrer">Fuente fabricante</a>
                  <button type="button" className="btn btn-primary btn-sm rounded-md" onClick={() => saveNote(product.id)}>
                    {savedId === product.id ? "Guardado" : "Guardar nota"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {pageCount > 1 && (
          <div className="flex items-center justify-between gap-3 border-t border-base-content/10 px-5 py-4">
            <p className="text-xs font-bold text-base-content/45">
              {Math.min(rows.length, (page - 1) * ROWS_PER_PAGE + 1)}-{Math.min(rows.length, page * ROWS_PER_PAGE)} de {rows.length}
            </p>
            <div className="join">
              <button type="button" className="btn join-item btn-sm" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Anterior</button>
              <button type="button" className="btn join-item btn-sm" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>Siguiente</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
