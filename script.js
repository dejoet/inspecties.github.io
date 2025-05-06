// Origineel script uitgebreid met oranje lijnen onder elke sectietitel, paginering en fotobewijs op nieuwe pagina
function genereerPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // Hulpfunctie: nieuwe pagina als niet genoeg ruimte
  function ensureSpace(height) {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  // Titel met oranje lijn eronder (tekstkleur zwart, lijn oranje)
  function drawTitle(text) {
    doc.setFont("Times New Roman", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0); // titel in zwart
    ensureSpace(10);
    doc.text(text, margin, y);
    y += 4;
    doc.setDrawColor(255, 102, 0); // oranje lijn
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8; // extra ruimte onder de oranje lijn
  }

  function savePdf() {
    const beheerder = document.getElementById("beheerder").value.trim();
    const naam = beheerder ? `Inspectie_${beheerder}.pdf` : "Inspectierapport.pdf";
    doc.save(naam);
  }

  const logo = new Image();
  logo.src = "data:image/png;base64,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";
  logo.onload = function() {
    doc.addImage(logo, "PNG", margin, y, 170, 20);
    y += 28;

    // HEADER
    const headerH = 20;
    ensureSpace(headerH + 10);
    doc.setDrawColor(0).setFillColor(230);
    doc.rect(margin, y, pageWidth - 2 * margin, headerH, "FD");
    const midY = y + headerH / 2;
    doc.setFont("Times New Roman", "bold").setFontSize(18).setTextColor(135, 9, 48);
    doc.text("Inspectierapport", margin + 3, midY - 4, { baseline: "middle" });
    doc.setFontSize(20).setTextColor(0, 75, 134);
    doc.text("Risicoanalyse | BRAND", margin + 3, midY + 6, { baseline: "middle" });
    y += headerH + 10;

    // INFO KADER
    const infoH = 20;
    ensureSpace(infoH + 10);
    doc.setDrawColor(0).setFillColor(255);
    doc.rect(margin, y, pageWidth - 2 * margin, infoH, "FD");
    let infoY = y + 6;
    const infoData = [
      ["Naam", "Joetri Van Dijck"],
      ["Functie", "Field Underwriter"],
      ["E-mail", "joetri.van.dijck@vivium.be"]
    ];
    doc.setFontSize(11);
    infoData.forEach(([lab, val]) => {
      doc.setFont("Times New Roman", "bold");
      doc.setTextColor(0);
      doc.text(`${lab}:`, margin + 3, infoY);
      doc.setFont("Times New Roman", "normal");
      doc.text(val, margin + 40, infoY);
      infoY += 6;
    });
    y += infoH + 10;

    // BASISGEGEVENS
    drawTitle('Basisgegevens');
    const basis = [
      ["Maatschappij", "maatschappij"],
      ["Zetel", "zetel"],
      ["Beheerder", "beheerder"],
      ["Polisnummer", "polisnummer"],
      ["Verzekerde", "verzekerde"],
      ["Ligging Risico", "liggingrisico"],
      ["Producent", "producent"],
      ["Datum Bezoek", "datumbezoek"],
      ["Datum Rapport", "datumrapport"]
    ];
    doc.setFontSize(11);
    basis.forEach(([lab, id]) => {
      const val = document.getElementById(id).value;
      if (!val) return;
      ensureSpace(7);
      doc.setFont("Times New Roman", "bold");
      doc.text(`${lab}:`, margin, y);
      doc.setFont("Times New Roman", "normal");
      doc.text(val, margin + 50, y);
      y += 7;
    });

    // BESCHRIJVING + OPMERKINGEN
    const beschSections = [
      ["Beschrijving inspectie", "tekstveld"],
      ["Opmerkingen", "tekst1"]
    ];
    beschSections.forEach(([title, id]) => {
      const txt = document.getElementById(id).value;
      if (!txt) return;
      drawTitle(title);
      const lines = doc.splitTextToSize(txt, pageWidth - 2 * margin);
      doc.setFontSize(11);
      lines.forEach(line => {
        ensureSpace(6);
        doc.text(line, margin, y);
        y += 6;
      });
    });

    // DIEFSTALSECTIES
    const categories = [
      ["Omgeving", ["th-ligging","th-bouwtype","th-toegangen","th-sociale","th-risicoadres","th-risicoadres-omschrijving","th-vlucht","th-omgevings-opm"]],
      ["Antecedenten", ["th-antecedent-incident","th-antecedent-omschrijving"]],
      ["Inhoud", ["th-inhoud-omschrijving","th-dekking","th-verzekeraar"]],
      ["Kluis", ["th-kluis-aanwezig","th-kluis-merk","th-kluis-afm","th-kluis-elektrisch","th-kluis-mechanisch","th-kluis-standplaats","th-kluis-waarde","th-kluis-conform","th-kluis-beoordeling","th-kluis-opm"]],
      ["Beveiliging terrein", ["th-terrein-beoordeling","th-perimetermaatregelen"]],
      ["Mechanische beveiliging", ["th-mech-gevels","th-mech-dak","th-mech-deuren","th-mech-poorten","th-mech-vaste-ramen","th-mech-open-ramen","th-mech-koepels","th-mech-opm"]],
      ["Elektronische beveiliging", ["th-elec-alarmsysteem","th-elec-installateur","th-elec-fod","th-elec-incert","th-elec-onderhoud","th-elec-conformiteit","th-elec-doormelding","th-elec-omschrijving"]]
    ];
    doc.setFontSize(11);
    categories.forEach(([cat, ids]) => {
      drawTitle(cat);
      ids.forEach(id => {
        const val = document.getElementById(id).value;
        if (!val) return;
        const lines = doc.splitTextToSize(val, pageWidth - 2 * margin - 50);
        const blockH = lines.length * 6 + 4;
        ensureSpace(blockH);
        doc.setFont("Times New Roman", "bold");
        doc.text(`${id.replace('th-','')}:`, margin, y);
        doc.setFont("Times New Roman", "normal");
        doc.text(lines, margin + 50, y);
        y += blockH;
      });
    });

    // FOTOBEWIJS altijd nieuwe pagina
    const files = Array.from(document.getElementById('afbeeldingen').files);
    if (files.length) {
      doc.addPage();
      y = margin;
      drawTitle("Fotobewijs");
      const maxW = 80, maxH = 60, gapX = 10, gapY = 10;
      let col = 0;
      files.forEach((file, i) => {
        const reader = new FileReader();
        reader.onload = e => {
          const img = new Image(); img.src = e.target.result;
          img.onload = () => {
            let w = maxW, h = maxW * img.height / img.width;
            if (h > maxH) { h = maxH; w = maxH * img.width / img.height; }
            if (col === 0 && i) y += maxH + gapY;
            if (y + h > pageHeight - margin) { doc.addPage(); y = margin; col = 0; }
            const x = margin + col * (maxW + gapX);
            doc.addImage(img, "JPEG", x, y, w, h, "", "FAST");
            col = (col + 1) % 2;
            if (i === files.length - 1) savePdf();
          };
        };
        reader.readAsDataURL(file);
      });
    } else {
      savePdf();
    }
  };
}

// Google Maps knop
function zoekOpGoogleMaps() {
  const loc = document.getElementById("locatie").value.trim();
  if (!loc) {
    alert("Voer een locatie in.");
    return;
  }
  const key = "YOUR_GOOGLE_MAPS_API_KEY";
  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(loc)}&zoom=14&size=600x400&markers=color:red%7Clabel:S%7C${encodeURIComponent(loc)}&key=${key}`;
  document.getElementById("map-image").src = url;
}