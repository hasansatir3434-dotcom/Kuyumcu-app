import { useState, useEffect, useCallback } from "react";

// ─── SABITLER ─────────────────────────────────────────────────────────────────
const KATEGORILER = [
  { id: "altin_satis", label: "Altın Satış", ikon: "🥇", renk: "#c8860a" },
  { id: "gumus_satis", label: "Gümüş Satış", ikon: "⚪", renk: "#aaaaaa" },
  { id: "hurda_alim", label: "Hurda Alım", ikon: "♻️", renk: "#4a9060" },
  { id: "tamir", label: "Tamir / İşçilik", ikon: "🔧", renk: "#4a70b0" },
];

const AYARLAR_ALTIN = ["8 Ayar","10 Ayar","14 Ayar","18 Ayar","21 Ayar","22 Ayar","24 Ayar"];
const AYARLAR_GUMUS = ["700","800","900","925","999"];

const formatTL = (n) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 2 }).format(n || 0);

const tarihStr = () => new Date().toLocaleString("tr-TR");
let _fisNo = 2000;
const yeniFisNo = () => `F${++_fisNo}`;

// ─── LOCAL STORAGE ────────────────────────────────────────────────────────────
const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const DUKKAN_DEFAULT = {
  ad: "ALTIN DÜNYASI KUYUMCULUK",
  adres: "Kapalıçarşı No:42, İstanbul",
  telefon: "0212 555 44 33",
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  input: {
    width: "100%", boxSizing: "border-box",
    background: "#0d0600", border: "1px solid #3a2008",
    borderRadius: 8, padding: "11px 14px",
    color: "#f0d080", fontFamily: "inherit", fontSize: 15,
    outline: "none", WebkitAppearance: "none",
  },
  btn: (bg = "#c8860a", color = "#1a0800") => ({
    background: bg, border: "none", borderRadius: 8,
    padding: "13px 0", color, fontFamily: "inherit",
    fontSize: 15, fontWeight: 700, cursor: "pointer",
    width: "100%", letterSpacing: 0.5,
  }),
  card: {
    background: "#1a0c02", borderRadius: 12,
    border: "1px solid #2e1a06", padding: 14, marginBottom: 10,
  },
  label: {
    color: "#7a5a30", fontSize: 11, letterSpacing: 1,
    marginBottom: 4, display: "block",
  },
};

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ aktif, setAktif }) {
  const items = [
    { id: "fis", ikon: "🧾", label: "Fiş Kes" },
    { id: "hurda", ikon: "♻️", label: "Hurda" },
    { id: "cari", ikon: "👥", label: "Cariler" },
    { id: "ayarlar", ikon: "⚙️", label: "Ayarlar" },
  ];
  return (
    <div style={{ display: "flex", background: "#110700", borderTop: "1px solid #2e1a06", flexShrink: 0 }}>
      {items.map(it => (
        <button key={it.id} onClick={() => setAktif(it.id)} style={{
          flex: 1, background: "none", border: "none",
          padding: "10px 0 8px", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        }}>
          <span style={{ fontSize: 22 }}>{it.ikon}</span>
          <span style={{ fontSize: 10, color: aktif === it.id ? "#c8860a" : "#555", fontFamily: "inherit" }}>
            {it.label}
          </span>
          {aktif === it.id && <div style={{ width: 20, height: 2, background: "#c8860a", borderRadius: 1 }} />}
        </button>
      ))}
    </div>
  );
}

// ─── SATIR GİRİŞİ ─────────────────────────────────────────────────────────────
function SatirGiris({ satir, index, kategori, onChange, onSil }) {
  const showGram = kategori !== "tamir";
  const showAyar = kategori === "altin_satis" || kategori === "hurda_alim" || kategori === "gumus_satis";
  const showBirimFiyat = kategori !== "tamir";
  const ayarlar = kategori === "gumus_satis" ? AYARLAR_GUMUS : AYARLAR_ALTIN;

  const hesaplaTutar = (s) => {
    if (kategori === "tamir") return parseFloat(s.iscilik) || 0;
    const gram = parseFloat(s.gram) || 0;
    const birimFiyat = parseFloat(s.birimFiyat) || 0;
    const iscilik = parseFloat(s.iscilik) || 0;
    if (kategori === "hurda_alim") return gram * birimFiyat;
    return gram * birimFiyat + iscilik;
  };

  const guncelle = (alan, deger) => {
    const yeni = { ...satir, [alan]: deger };
    yeni.tutar = hesaplaTutar(yeni);
    onChange(yeni);
  };

  return (
    <div style={{ ...S.card, borderColor: "#3a2008", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ color: "#c8860a", fontSize: 12, fontWeight: 700 }}>KALEM {index + 1}</span>
        <button onClick={onSil} style={{
          background: "none", border: "none", color: "#993333",
          fontSize: 20, cursor: "pointer", padding: 0, lineHeight: 1,
        }}>✕</button>
      </div>

      {/* Açıklama */}
      <span style={S.label}>AÇIKLAMA</span>
      <input
        value={satir.aciklama}
        onChange={e => guncelle("aciklama", e.target.value)}
        placeholder="Örn: 22 Ayar Bilezik"
        style={{ ...S.input, marginBottom: 10 }}
      />

      {/* Ayar */}
      {showAyar && (
        <>
          <span style={S.label}>AYAR</span>
          <select value={satir.ayar} onChange={e => guncelle("ayar", e.target.value)} style={{ ...S.input, marginBottom: 10 }}>
            {ayarlar.map(a => <option key={a}>{a}</option>)}
          </select>
        </>
      )}

      {/* Gram + Birim Fiyat yan yana */}
      {showGram && showBirimFiyat && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div>
            <span style={S.label}>GRAM</span>
            <input
              value={satir.gram}
              onChange={e => guncelle("gram", e.target.value)}
              type="number" inputMode="decimal" placeholder="0.000"
              style={S.input}
            />
          </div>
          <div>
            <span style={S.label}>BİRİM FİYAT (TL/gr)</span>
            <input
              value={satir.birimFiyat}
              onChange={e => guncelle("birimFiyat", e.target.value)}
              type="number" inputMode="decimal" placeholder="0.00"
              style={S.input}
            />
          </div>
        </div>
      )}

      {/* İşçilik - satış işlemlerinde */}
      {(kategori === "altin_satis" || kategori === "gumus_satis") && (
        <>
          <span style={S.label}>İŞÇİLİK (TL)</span>
          <input
            value={satir.iscilik}
            onChange={e => guncelle("iscilik", e.target.value)}
            type="number" inputMode="decimal" placeholder="0.00"
            style={{ ...S.input, marginBottom: 10 }}
          />
        </>
      )}

      {/* Tamir - sadece tutar */}
      {kategori === "tamir" && (
        <>
          <span style={S.label}>TUTAR (TL)</span>
          <input
            value={satir.iscilik}
            onChange={e => guncelle("iscilik", e.target.value)}
            type="number" inputMode="decimal" placeholder="0.00"
            style={{ ...S.input, marginBottom: 10 }}
          />
        </>
      )}

      {/* Otomatik hesaplanan tutar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: 10, borderTop: "1px solid #2e1a06",
      }}>
        {showGram && satir.gram && satir.birimFiyat ? (
          <span style={{ color: "#555", fontSize: 11 }}>
            {satir.gram}gr × {formatTL(parseFloat(satir.birimFiyat))}
            {(kategori === "altin_satis" || kategori === "gumus_satis") && satir.iscilik
              ? ` + ${formatTL(parseFloat(satir.iscilik))} işçilik`
              : ""}
          </span>
        ) : <span />}
        <span style={{ color: "#e8c060", fontWeight: 700, fontSize: 17 }}>{formatTL(satir.tutar)}</span>
      </div>
    </div>
  );
}

// ─── FİŞ EKRANI ───────────────────────────────────────────────────────────────
function FisEkrani({ cariler, dukkan }) {
  const [kategori, setKategori] = useState("altin_satis");
  const [satirlar, setSatirlar] = useState([]);
  const [cariId, setCariId] = useState("");
  const [fisGoster, setFisGoster] = useState(null);

  const bosSatir = () => ({
    id: Date.now() + Math.random(),
    aciklama: "", gram: "", birimFiyat: "",
    ayar: kategori === "gumus_satis" ? "925" : "22 Ayar",
    iscilik: "", tutar: 0,
  });

  const satirEkle = () => setSatirlar(p => [...p, bosSatir()]);

  const satirGuncelle = (id, yeniSatir) =>
    setSatirlar(p => p.map(s => s.id === id ? { ...yeniSatir, id } : s));

  const satirSil = (id) => setSatirlar(p => p.filter(s => s.id !== id));

  const kategoriDegistir = (k) => { setKategori(k); setSatirlar([]); };

  const toplam = satirlar.reduce((a, s) => a + (s.tutar || 0), 0);

  const fisCik = () => {
    if (satirlar.length === 0) return;
    setFisGoster({
      no: yeniFisNo(),
      tarih: tarihStr(),
      kategori,
      satirlar,
      toplam,
      cari: cariler.find(c => c.id === cariId) || null,
      dukkan,
    });
  };

  if (fisGoster) return (
    <FisGoruntule
      fis={fisGoster}
      onKapat={() => { setFisGoster(null); setSatirlar([]); setCariId(""); }}
    />
  );

  const kat = KATEGORILER.find(k => k.id === kategori);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      {/* Kategori */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {KATEGORILER.map(k => (
          <button key={k.id} onClick={() => kategoriDegistir(k.id)} style={{
            background: kategori === k.id ? k.renk + "22" : "#1a0c02",
            border: `1px solid ${kategori === k.id ? k.renk : "#2e1a06"}`,
            borderRadius: 10, padding: "11px 8px", cursor: "pointer",
            color: kategori === k.id ? k.renk : "#555",
            fontFamily: "inherit", fontSize: 13,
            fontWeight: kategori === k.id ? 700 : 400,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {k.ikon} {k.label}
          </button>
        ))}
      </div>

      {/* Müşteri */}
      <div style={S.card}>
        <span style={S.label}>MÜŞTERİ (OPSİYONEL)</span>
        <select
          value={cariId}
          onChange={e => setCariId(e.target.value)}
          style={{ ...S.input, color: cariId ? "#f0d080" : "#555" }}
        >
          <option value="">— Misafir Müşteri —</option>
          {cariler.map(c => <option key={c.id} value={c.id}>{c.ad}</option>)}
        </select>
      </div>

      {/* Satirlar */}
      {satirlar.map((s, i) => (
        <SatirGiris
          key={s.id} satir={s} index={i} kategori={kategori}
          onChange={(yeni) => satirGuncelle(s.id, yeni)}
          onSil={() => satirSil(s.id)}
        />
      ))}

      <button onClick={satirEkle} style={{
        ...S.btn("#1a0c02", kat.renk),
        border: `1px dashed ${kat.renk}55`, marginBottom: 14,
      }}>
        + {kat.ikon} Satır Ekle
      </button>

      {/* Toplam */}
      {satirlar.length > 0 && (
        <div style={{ ...S.card, borderColor: "#c8860a44", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "#666", fontSize: 12 }}>TOPLAM</div>
              <div style={{ color: "#555", fontSize: 11 }}>{satirlar.length} kalem</div>
            </div>
            <span style={{ color: "#c8860a", fontSize: 26, fontWeight: 700 }}>{formatTL(toplam)}</span>
          </div>
        </div>
      )}

      <button
        onClick={fisCik}
        disabled={satirlar.length === 0}
        style={{
          ...S.btn(
            satirlar.length > 0 ? "linear-gradient(135deg,#c8860a,#e8a020)" : "#1a0c02",
            satirlar.length > 0 ? "#1a0800" : "#444"
          ),
          fontSize: 16,
        }}
      >
        🧾 Fiş Kes
      </button>
    </div>
  );
}

// ─── FİŞ GÖRÜNTÜLE ────────────────────────────────────────────────────────────
function FisGoruntule({ fis, onKapat }) {
  const katLabel = KATEGORILER.find(k => k.id === fis.kategori)?.label || "";

  const yazdir = () => {
    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Fiş ${fis.no}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Courier New', monospace; font-size: 13px; width: 280px; padding: 12px; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .hr { border: none; border-top: 1px dashed #999; margin: 8px 0; }
      .row { display: flex; justify-content: space-between; }
      .small { font-size: 11px; color: #666; }
      .total { font-size: 16px; font-weight: bold; }
      @media print { .noprint { display: none; } }
    </style></head><body>
    <div class="center bold" style="font-size:14px;margin-bottom:2px">${fis.dukkan.ad}</div>
    <div class="center small">${fis.dukkan.adres}</div>
    <div class="center small">Tel: ${fis.dukkan.telefon}</div>
    <hr class="hr">
    <div class="row"><span>Fiş No: <b>${fis.no}</b></span><span class="small">${fis.tarih}</span></div>
    <div class="small">İşlem: ${katLabel}</div>
    ${fis.cari ? `<div class="small">Müşteri: <b>${fis.cari.ad}</b></div>` : ""}
    <hr class="hr">
    ${fis.satirlar.map(s => `
      <div class="bold" style="margin-top:6px">${s.aciklama || "Ürün"}</div>
      <div class="row small">
        <span>${[
          s.gram ? s.gram + "gr" : "",
          s.ayar || "",
          s.birimFiyat ? formatTL(parseFloat(s.birimFiyat)) + "/gr" : "",
          s.iscilik && fis.kategori !== "hurda_alim" && fis.kategori !== "tamir" ? "İşç: " + formatTL(parseFloat(s.iscilik)) : "",
        ].filter(Boolean).join(" | ")}</span>
        <b>${formatTL(s.tutar)}</b>
      </div>
    `).join("")}
    <hr class="hr">
    <div class="row total"><span>TOPLAM</span><span>${formatTL(fis.toplam)}</span></div>
    <hr class="hr">
    <div class="center small" style="margin-top:8px">Teşekkür ederiz 🙏</div>
    <div class="noprint" style="margin-top:16px">
      <button onclick="window.print()" style="width:100%;padding:10px;background:#c8860a;color:#fff;border:none;border-radius:6px;font-size:14px;cursor:pointer;font-family:inherit">
        🖨️ Yazdır / PDF Olarak Kaydet
      </button>
    </div>
    </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      {/* Önizleme */}
      <div style={{
        background: "#fff", color: "#111", borderRadius: 8, padding: 18,
        fontFamily: "'Courier New', monospace", fontSize: 13,
        maxWidth: 300, margin: "0 auto",
        boxShadow: "0 0 30px #c8860a44",
      }}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>{fis.dukkan.ad}</div>
          <div style={{ fontSize: 11, color: "#666" }}>{fis.dukkan.adres}</div>
          <div style={{ fontSize: 11, color: "#666" }}>Tel: {fis.dukkan.telefon}</div>
        </div>
        <div style={{ borderTop: "1px dashed #aaa", margin: "8px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span>Fiş No: <strong>{fis.no}</strong></span>
          <span style={{ fontSize: 11, color: "#888" }}>{fis.tarih}</span>
        </div>
        <div style={{ fontSize: 11, color: "#666" }}>İşlem: {katLabel}</div>
        {fis.cari && <div style={{ fontSize: 12 }}>Müşteri: <strong>{fis.cari.ad}</strong></div>}
        <div style={{ borderTop: "1px dashed #aaa", margin: "8px 0" }} />

        {fis.satirlar.map((s, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700 }}>{s.aciklama || "Ürün"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555" }}>
              <span>
                {[
                  s.gram ? s.gram + "gr" : "",
                  s.ayar || "",
                  s.birimFiyat ? formatTL(parseFloat(s.birimFiyat)) + "/gr" : "",
                ].filter(Boolean).join(" | ")}
              </span>
              <strong>{formatTL(s.tutar)}</strong>
            </div>
            {s.iscilik && fis.kategori !== "hurda_alim" && fis.kategori !== "tamir" && (
              <div style={{ fontSize: 11, color: "#888", textAlign: "right" }}>
                + {formatTL(parseFloat(s.iscilik))} işçilik
              </div>
            )}
          </div>
        ))}

        <div style={{ borderTop: "1px dashed #aaa", paddingTop: 8, marginTop: 4, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15 }}>
          <span>TOPLAM</span>
          <span>{formatTL(fis.toplam)}</span>
        </div>
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#888" }}>
          — Teşekkür ederiz 🙏 —
        </div>
      </div>

      {/* Butonlar */}
      <div style={{ maxWidth: 300, margin: "14px auto 0", display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={yazdir} style={S.btn("linear-gradient(135deg,#c8860a,#e8a020)", "#1a0800")}>
          🖨️ Yazdır / PDF Kaydet
        </button>
        <button onClick={onKapat} style={{ ...S.btn("#1a0c02", "#c8860a"), border: "1px solid #2e1a06" }}>
          ← Yeni Fiş
        </button>
      </div>
    </div>
  );
}

// ─── HURDA ALIM ───────────────────────────────────────────────────────────────
function HurdaEkrani({ cariler, dukkan }) {
  const [tur, setTur] = useState("altin");
  const [gram, setGram] = useState("");
  const [ayar, setAyar] = useState("14 Ayar");
  const [gumusAyar, setGumusAyar] = useState("700");
  const [birimFiyat, setBirimFiyat] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [cariId, setCariId] = useState("");
  const [fisGoster, setFisGoster] = useState(null);

  const tutar = (parseFloat(gram) || 0) * (parseFloat(birimFiyat) || 0);

  const fisCik = () => {
    if (!gram || !birimFiyat) return;
    setFisGoster({
      no: yeniFisNo(),
      tarih: tarihStr(),
      kategori: "hurda_alim",
      satirlar: [{
        aciklama: aciklama || `${tur === "altin" ? ayar : gumusAyar + " Gümüş"} Hurda`,
        gram, birimFiyat,
        ayar: tur === "altin" ? ayar : gumusAyar,
        iscilik: "", tutar,
      }],
      toplam: tutar,
      cari: cariler.find(c => c.id === cariId) || null,
      dukkan,
    });
  };

  if (fisGoster) return (
    <FisGoruntule
      fis={fisGoster}
      onKapat={() => { setFisGoster(null); setGram(""); setBirimFiyat(""); setAciklama(""); }}
    />
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      <div style={{ ...S.card, borderColor: "#4a906044" }}>
        <div style={{ color: "#4a9060", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>♻️ HURDA ALIM</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[["altin", "🥇 Altın"], ["gumus", "⚪ Gümüş"]].map(([val, lbl]) => (
            <button key={val} onClick={() => setTur(val)} style={{
              background: tur === val ? "#4a906022" : "#0d0600",
              border: `1px solid ${tur === val ? "#4a9060" : "#2e1a06"}`,
              borderRadius: 8, padding: "11px 0", cursor: "pointer",
              color: tur === val ? "#4a9060" : "#555",
              fontFamily: "inherit", fontSize: 14, fontWeight: tur === val ? 700 : 400,
            }}>{lbl}</button>
          ))}
        </div>

        <span style={S.label}>MÜŞTERİ (OPSİYONEL)</span>
        <select value={cariId} onChange={e => setCariId(e.target.value)} style={{ ...S.input, marginBottom: 12, color: cariId ? "#f0d080" : "#555" }}>
          <option value="">— Misafir —</option>
          {cariler.map(c => <option key={c.id} value={c.id}>{c.ad}</option>)}
        </select>

        <span style={S.label}>AÇIKLAMA (OPSİYONEL)</span>
        <input value={aciklama} onChange={e => setAciklama(e.target.value)}
          placeholder="Örn: Altın yüzük, kolye parçası..."
          style={{ ...S.input, marginBottom: 12 }} />

        <span style={S.label}>AYAR</span>
        {tur === "altin" ? (
          <select value={ayar} onChange={e => setAyar(e.target.value)} style={{ ...S.input, marginBottom: 12 }}>
            {AYARLAR_ALTIN.map(a => <option key={a}>{a}</option>)}
          </select>
        ) : (
          <select value={gumusAyar} onChange={e => setGumusAyar(e.target.value)} style={{ ...S.input, marginBottom: 12 }}>
            {AYARLAR_GUMUS.map(a => <option key={a}>{a}</option>)}
          </select>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          <div>
            <span style={S.label}>GRAM</span>
            <input value={gram} onChange={e => setGram(e.target.value)}
              type="number" inputMode="decimal" placeholder="0.000" style={S.input} />
          </div>
          <div>
            <span style={S.label}>ALIŞ FİYATI (TL/gr)</span>
            <input value={birimFiyat} onChange={e => setBirimFiyat(e.target.value)}
              type="number" inputMode="decimal" placeholder="0.00" style={S.input} />
          </div>
        </div>

        {/* Canlı hesap */}
        {gram && birimFiyat && (
          <div style={{ padding: "12px 14px", background: "#0a1a0a", borderRadius: 8, border: "1px solid #4a906055", marginBottom: 14 }}>
            <div style={{ color: "#555", fontSize: 12 }}>
              {gram}gr × {formatTL(parseFloat(birimFiyat))}/gr
            </div>
            <div style={{ color: "#4a9060", fontSize: 24, fontWeight: 700, marginTop: 2 }}>
              {formatTL(tutar)}
            </div>
            <div style={{ color: "#555", fontSize: 11 }}>müşteriye ödenecek</div>
          </div>
        )}

        <button onClick={fisCik} disabled={!gram || !birimFiyat} style={{
          ...S.btn(
            gram && birimFiyat ? "linear-gradient(135deg,#4a9060,#5ab070)" : "#1a0c02",
            "#fff"
          ),
        }}>
          🧾 Hurda Fişi Kes
        </button>
      </div>
    </div>
  );
}

// ─── CARİ HESAPLAR ────────────────────────────────────────────────────────────
function CariEkrani({ cariler, setCariler }) {
  const [ekran, setEkran] = useState("liste");
  const [secilenId, setSecilenId] = useState(null);
  const [yeniAd, setYeniAd] = useState("");
  const [yeniTel, setYeniTel] = useState("");
  const [islemTip, setIslemTip] = useState("odeme");
  const [islemTutar, setIslemTutar] = useState("");
  const [islemAcik, setIslemAcik] = useState("");

  const secilen = cariler.find(c => c.id === secilenId);

  const cariEkle = () => {
    if (!yeniAd.trim()) return;
    setCariler(p => [...p, { id: Date.now(), ad: yeniAd.trim(), telefon: yeniTel.trim(), bakiye: 0, islemler: [] }]);
    setYeniAd(""); setYeniTel(""); setEkran("liste");
  };

  const islemYap = () => {
    const tutar = parseFloat(islemTutar);
    if (!tutar || !secilen) return;
    const delta = islemTip === "odeme" ? tutar : -tutar;
    const islem = {
      id: Date.now(), tip: islemTip, tutar,
      aciklama: islemAcik || (islemTip === "odeme" ? "Ödeme alındı" : "Borç eklendi"),
      tarih: tarihStr(),
    };
    setCariler(p => p.map(c => c.id === secilenId
      ? { ...c, bakiye: c.bakiye + delta, islemler: [islem, ...(c.islemler || [])] }
      : c));
    setIslemTutar(""); setIslemAcik("");
  };

  const cariSil = (id) => {
    if (!window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return;
    setCariler(p => p.filter(c => c.id !== id));
    setEkran("liste");
  };

  if (ekran === "yeni") return (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      <button onClick={() => setEkran("liste")} style={{ background: "none", border: "none", color: "#c8860a", cursor: "pointer", fontFamily: "inherit", fontSize: 14, marginBottom: 14 }}>← Geri</button>
      <div style={S.card}>
        <div style={{ color: "#c8860a", fontWeight: 700, marginBottom: 12 }}>Yeni Müşteri</div>
        <span style={S.label}>AD SOYAD</span>
        <input value={yeniAd} onChange={e => setYeniAd(e.target.value)} placeholder="Müşteri adı..." style={{ ...S.input, marginBottom: 10 }} />
        <span style={S.label}>TELEFON</span>
        <input value={yeniTel} onChange={e => setYeniTel(e.target.value)} placeholder="0XXX XXX XX XX" type="tel" style={{ ...S.input, marginBottom: 14 }} />
        <button onClick={cariEkle} style={S.btn()}>Kaydet</button>
      </div>
    </div>
  );

  if (ekran === "detay" && secilen) return (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button onClick={() => setEkran("liste")} style={{ background: "none", border: "none", color: "#c8860a", cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>← Geri</button>
        <button onClick={() => cariSil(secilen.id)} style={{ background: "none", border: "none", color: "#993333", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Sil</button>
      </div>

      <div style={S.card}>
        <div style={{ color: "#c8860a", fontWeight: 700, fontSize: 16 }}>{secilen.ad}</div>
        {secilen.telefon && <div style={{ color: "#666", fontSize: 13, marginTop: 2 }}>{secilen.telefon}</div>}
        <div style={{ marginTop: 12, padding: "12px 14px", background: "#0d0600", borderRadius: 8 }}>
          <div style={{ color: "#666", fontSize: 11, letterSpacing: 1 }}>BAKİYE</div>
          <div style={{ color: secilen.bakiye < 0 ? "#e05050" : secilen.bakiye > 0 ? "#50b050" : "#555", fontSize: 26, fontWeight: 700, marginTop: 2 }}>
            {formatTL(secilen.bakiye)}
          </div>
          <div style={{ color: "#555", fontSize: 11 }}>
            {secilen.bakiye < 0 ? "BORÇLU" : secilen.bakiye > 0 ? "ALACAKLI" : "SIFIR"}
          </div>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ color: "#888", fontSize: 12, marginBottom: 10, letterSpacing: 1 }}>İŞLEM YAP</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[["odeme", "✅ Ödeme Al", "#1a4a1a", "#4a9060"], ["borc", "➕ Borç Ekle", "#4a1a1a", "#a04040"]].map(([val, lbl, bg, brd]) => (
            <button key={val} onClick={() => setIslemTip(val)} style={{
              background: islemTip === val ? bg : "#0d0600",
              border: `1px solid ${islemTip === val ? brd : "#2e1a06"}`,
              borderRadius: 8, padding: "10px 0", cursor: "pointer",
              color: islemTip === val ? "#fff" : "#555",
              fontFamily: "inherit", fontSize: 13,
            }}>{lbl}</button>
          ))}
        </div>
        <span style={S.label}>TUTAR (TL)</span>
        <input value={islemTutar} onChange={e => setIslemTutar(e.target.value)}
          type="number" inputMode="decimal" placeholder="0.00" style={{ ...S.input, marginBottom: 10 }} />
        <span style={S.label}>AÇIKLAMA</span>
        <input value={islemAcik} onChange={e => setIslemAcik(e.target.value)}
          placeholder="Opsiyonel..." style={{ ...S.input, marginBottom: 12 }} />
        <button onClick={islemYap} style={S.btn()}>Kaydet</button>
      </div>

      {(secilen.islemler || []).length > 0 && (
        <div style={S.card}>
          <div style={{ color: "#888", fontSize: 12, marginBottom: 10, letterSpacing: 1 }}>İŞLEM GEÇMİŞİ</div>
          {(secilen.islemler || []).map(is => (
            <div key={is.id} style={{ padding: "8px 0", borderBottom: "1px solid #1a0c02", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#ccc", fontSize: 13 }}>{is.aciklama}</div>
                <div style={{ color: "#555", fontSize: 11 }}>{is.tarih}</div>
              </div>
              <div style={{ color: is.tip === "odeme" ? "#50b050" : "#e05050", fontWeight: 700, fontSize: 14 }}>
                {is.tip === "odeme" ? "+" : "-"}{formatTL(is.tutar)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ color: "#c8860a", fontWeight: 700 }}>Müşteriler ({cariler.length})</span>
        <button onClick={() => setEkran("yeni")} style={{
          background: "#c8860a", border: "none", borderRadius: 6,
          padding: "8px 16px", color: "#1a0800", fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit", fontSize: 13,
        }}>+ Ekle</button>
      </div>

      {cariler.length === 0 && (
        <div style={{ textAlign: "center", color: "#444", padding: 40 }}>Henüz müşteri yok</div>
      )}

      {cariler.map(c => (
        <button key={c.id} onClick={() => { setSecilenId(c.id); setEkran("detay"); }} style={{
          ...S.card, width: "100%", textAlign: "left", cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          border: "1px solid #2e1a06",
        }}>
          <div>
            <div style={{ color: "#e8c060", fontWeight: 600, fontSize: 15 }}>{c.ad}</div>
            {c.telefon && <div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>{c.telefon}</div>}
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: c.bakiye < 0 ? "#e05050" : c.bakiye > 0 ? "#50b050" : "#555", fontWeight: 700, fontSize: 15 }}>
              {formatTL(c.bakiye)}
            </div>
            <div style={{ fontSize: 10, color: c.bakiye < 0 ? "#e05050" : c.bakiye > 0 ? "#50b050" : "#555" }}>
              {c.bakiye < 0 ? "BORÇLU" : c.bakiye > 0 ? "ALACAKLI" : "SIFIR"}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── AYARLAR ─────────────────────────────────────────────────────────────────
function AyarlarEkrani({ dukkan, setDukkan }) {
  const [form, setForm] = useState(dukkan);
  const [kaydedildi, setKaydedildi] = useState(false);

  const kaydet = () => {
    setDukkan(form);
    setKaydedildi(true);
    setTimeout(() => setKaydedildi(false), 2000);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      <div style={S.card}>
        <div style={{ color: "#c8860a", fontWeight: 700, marginBottom: 14, fontSize: 15 }}>🏪 Dükkan Bilgileri</div>
        <span style={S.label}>DÜKKAN ADI</span>
        <input value={form.ad} onChange={e => setForm(p => ({ ...p, ad: e.target.value }))}
          style={{ ...S.input, marginBottom: 10 }} />
        <span style={S.label}>ADRES</span>
        <input value={form.adres} onChange={e => setForm(p => ({ ...p, adres: e.target.value }))}
          style={{ ...S.input, marginBottom: 10 }} />
        <span style={S.label}>TELEFON</span>
        <input value={form.telefon} onChange={e => setForm(p => ({ ...p, telefon: e.target.value }))}
          type="tel" style={{ ...S.input, marginBottom: 14 }} />
        <button onClick={kaydet} style={S.btn(kaydedildi ? "#4a9060" : "#c8860a")}>
          {kaydedildi ? "✅ Kaydedildi!" : "💾 Kaydet"}
        </button>
      </div>

      <div style={{ ...S.card, borderColor: "#4a70b044" }}>
        <div style={{ color: "#4a70b0", fontWeight: 700, marginBottom: 8 }}>🖨️ Bluetooth Yazıcı</div>
        <div style={{ color: "#555", fontSize: 13, lineHeight: 1.6 }}>
          Xprinter XP-P300 veya benzeri 58mm termal yazıcı desteklenir. Şu an fişleri tarayıcı üzerinden PDF olarak kaydedip paylaşabilirsiniz.
        </div>
        <div style={{ marginTop: 10, padding: "8px 12px", background: "#0d0600", borderRadius: 6, color: "#c8860a", fontSize: 12 }}>
          ⚙️ Bluetooth yazıcı entegrasyonu yakında eklenecek
        </div>
      </div>

      <div style={{ ...S.card, borderColor: "#3a2008" }}>
        <div style={{ color: "#888", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>ℹ️ Uygulama Hakkında</div>
        <div style={{ color: "#555", fontSize: 12, lineHeight: 1.7 }}>
          Versiyon: 3.0<br />
          Tüm veriler cihazınızda saklanır.<br />
          Fiş kesmek için Fiş Kes sekmesini kullanın.<br />
          Yazdır butonuyla PDF kaydedebilir veya Bluetooth yazıcıya gönderebilirsiniz.
        </div>
      </div>
    </div>
  );
}

// ─── ANA UYGULAMA ─────────────────────────────────────────────────────────────
export default function App() {
  const [sekme, setSekme] = useState("fis");
  const [cariler, setCariler] = useState(LS.get("cariler", []));
  const [dukkan, setDukkan] = useState(LS.get("dukkan", DUKKAN_DEFAULT));

  useEffect(() => { LS.set("cariler", cariler); }, [cariler]);
  useEffect(() => { LS.set("dukkan", dukkan); }, [dukkan]);

  return (
    <div style={{
      height: "100vh", display: "flex", flexDirection: "column",
      background: "#0d0600",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#e8c060", maxWidth: 480, margin: "0 auto",
      boxShadow: "0 0 60px #00000099",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg,#1a0a00,#2a1400,#1a0a00)",
        borderBottom: "2px solid #c8860a44",
        padding: "12px 16px", flexShrink: 0,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <span style={{ fontSize: 24 }}>💍</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#c8860a", letterSpacing: 1 }}>{dukkan.ad}</div>
          <div style={{ fontSize: 10, color: "#555", letterSpacing: 1 }}>KUYUMCU YÖNETİM SİSTEMİ</div>
        </div>
      </div>

      {/* Ekranlar */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {sekme === "fis" && <FisEkrani cariler={cariler} dukkan={dukkan} />}
        {sekme === "hurda" && <HurdaEkrani cariler={cariler} dukkan={dukkan} />}
        {sekme === "cari" && <CariEkrani cariler={cariler} setCariler={setCariler} />}
        {sekme === "ayarlar" && <AyarlarEkrani dukkan={dukkan} setDukkan={setDukkan} />}
      </div>

      <BottomNav aktif={sekme} setAktif={setSekme} />
    </div>
  );
}
