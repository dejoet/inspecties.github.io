
// script.js

// Importeer jsPDF. Deze regel gaat ervan uit dat jsPDF via een <script> tag in de HTML is geladen.
// Voorbeeld: <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
const { jsPDF } = window.jspdf;

/**
 * Wacht tot de volledige HTML-structuur geladen is voordat JavaScript-code wordt uitgevoerd.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Roep de functie 'renderClauses' aan. Deze functie wordt verwacht
  // gedefinieerd te zijn in een ander bestand (bijv. clauses.js) en
  // beschikbaar te zijn op het 'window' object.
  // Deze functie is waarschijnlijk verantwoordelijk voor het dynamisch
  // genereren van HTML-elementen voor de clausules op de webpagina.
  if (typeof renderClauses === 'function') {
    renderClauses();
  } else {
    console.warn('De functie renderClauses is niet gevonden. Zorg ervoor dat clauses.js correct geladen is.');
  }

  // Optioneel: Koppel de 'genereerPDF' functie aan de klik-gebeurtenis van een knop.
  // Dit is een alternatief voor een inline 'onclick' attribuut in de HTML.
  // Voorbeeld HTML: <button id="btnGenereer">Genereer PDF</button>
  const btnGenereer = document.getElementById('btnGenereer');
  if (btnGenereer) {
    btnGenereer.addEventListener('click', genereerPDF);
  } else {
    // Als de knop niet direct gevonden wordt, kan het zijn dat de gebruiker een andere manier
    // van aanroepen heeft (bijv. inline onclick). We voegen hier geen foutmelding toe
    // om de flexibiliteit te behouden, maar het is goed om dit te weten.
    console.info('Element met id "btnGenereer" niet gevonden voor automatische event listener. Functie genereerPDF() kan nog steeds handmatig of via inline onclick worden aangeroepen.');
  }
});

/**
 * Genereert een PDF-document op basis van de ingevulde formuliergegevens en geselecteerde clausules.
 * Het document bevat secties zoals basisgegevens, beschrijvingen, diefstalinformatie, preventieclausules en fotobewijs.
 */

// ------------- HELPERS ---------------

// Verzamelt al je form-waarden in één object
function collectFormData() {
  const data = {};
  document.querySelectorAll('#inspectie-form input, #inspectie-form select, #inspectie-form textarea')
    .forEach(el => {
      if (el.type === 'file') return;          // foto’s niet exporteren
      if (el.type === 'checkbox') data[el.id] = el.checked;
      else                            data[el.id] = el.value;
    });
  return data;
}

// Vul het formulier met data uit een object
function applyFormData(data) {
  Object.entries(data).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = val;
    else                        el.value   = val;
    // trigger eventueel change-event zodat je live opslaan en UI up-to-date blijft
    el.dispatchEvent(new Event('change'));
  });
}

// ------------- EXPORT ---------------

function exportForm() {
  const data = collectFormData();
  const json = JSON.stringify(data, null, 2);
  // automatische bestandsnaam, je mag hier zelf iets anders kiezen
  const defaultName = data.beheerder
    ? `Inspectie_${data.beheerder}.json`
    : `Inspectie_Formulier.json`;

  // Blob aanmaken en download starten
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href       = url;
  a.download   = prompt('Bestandsnaam', defaultName) || defaultName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ------------- IMPORT ---------------

// event komt van <input type="file" onchange="importForm(event)">
function importForm(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      applyFormData(data);
      alert('Formulier geladen: ' + file.name);
    } catch(err) {
      alert('Fout bij inladen JSON: ' + err);
    }
  };
  reader.readAsText(file);
}

function genereerPDF() {
  // Initialiseer een nieuw jsPDF document.
  // "p": portretmodus
  // "mm": eenheid in millimeters
  // "a4": papierformaat A4
  const doc = new jsPDF("p", "mm", "a4");

  // Haal de afmetingen van de pagina en stel marges in.
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15; // Marge aan alle kanten van de pagina
  let y = margin;    // Huidige y-positie op de pagina, startend bij de bovenmarge

  // ---------------------------------------------------------------------------
  // HULPFUNCTIES BINNEN genereerPDF
  // ---------------------------------------------------------------------------

  /**
   * Zorgt ervoor dat er voldoende verticale ruimte is op de huidige pagina.
   * Als de benodigde hoogte de paginalimiet overschrijdt, wordt een nieuwe pagina toegevoegd.
   * @param {number} height - De benodigde hoogte in mm.
   */
  function ensureSpace(height) {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin; // Reset y-positie naar de bovenmarge op de nieuwe pagina
    }
  }

  /**
   * Tekent een sectietitel met een oranje onderlijn.
   * @param {string} text - De tekst van de titel.
   */
  function drawTitle(text) {
    const fontSizePt = 11;
    const lineWidth = 0.2; // Dikte van de oranje lijnen
    
    // Afstanden:
    // distTopLineToBaseline: Afstand van het midden van de bovenste lijn tot de baseline van de tekst.
    // Gekozen zodat de lijn netjes boven de kapitalen/ascenders van de tekst komt.
    // Een 11pt Gill Sans MT heeft een cap height van ong. 2.6mm en ascender van ong. 2.8mm.
    // Als we de lijn 3mm boven de baseline plaatsen, is er een kleine ruimte boven de letters.
    const distTopLineToBaseline = 3.0; // mm 
    
    // distBaselineToBottomLine: Afstand van de baseline van de tekst tot het midden van de onderste lijn.
    // Gevraagd om deze dichterbij te brengen. 1.5mm is een goede waarde.
    const distBaselineToBottomLine = 1.5; // mm
    
    // Ruimte na de gehele titelconstructie (onderste lijn tot volgende content).
    const spaceAfterBlock = 6; // mm (was 8mm, kan aangepast worden naar wens)

    // Bereken de totale hoogte die nodig is voor deze titelconstructie voor de ensureSpace check.
    // Dit is de afstand van de bovenkant van de bovenste lijn tot de onderkant van de onderste lijn,
    // plus de ruimte na het blok.
    // Totale hoogte = (afstand van midden bovenlijn tot midden onderlijn) + lijndikte + ruimte na blok
    // Afstand midden bovenlijn tot midden onderlijn = distTopLineToBaseline + distBaselineToBottomLine
    const blockHeight = distTopLineToBaseline + distBaselineToBottomLine;
    ensureSpace(blockHeight + lineWidth + spaceAfterBlock);

    doc.setFont("Gill Sans MT", "bold");
    doc.setFontSize(fontSizePt);
    doc.setTextColor(0); // Zwarte tekstkleur
    doc.setDrawColor(255, 102, 0); // Oranje kleur voor de lijnen
    doc.setLineWidth(lineWidth);

    // 1. Bovenste oranje lijn
    // y is de startpositie van de hele titelblokconstructie.
    // De lijn wordt getekend met y als het midden van de lijn.
    const yLine1 = y + (lineWidth / 2);
    doc.line(margin, yLine1, pageWidth - margin, yLine1);

    // 2. Titeltekst
    // De baseline van de tekst wordt berekend vanaf het midden van de bovenste lijn.
    const yTextBaseline = yLine1 + distTopLineToBaseline;
    doc.text(text, margin, yTextBaseline);

    // 3. Onderste oranje lijn
    // Het midden van de onderste lijn wordt berekend vanaf de baseline van de tekst.
    const yLine2 = yTextBaseline + distBaselineToBottomLine;
    doc.line(margin, yLine2, pageWidth - margin, yLine2);

    // 4. Update de globale y-positie voor de volgende content.
    // Start vanaf de onderkant van de onderste lijn.
    y = yLine2 + (lineWidth / 2) + spaceAfterBlock;
  }

  /**
   * Slaat het gegenereerde PDF-document op.
   * De bestandsnaam wordt dynamisch bepaald op basis van de waarde van het 'beheerder' inputveld.
   */
  function savePdf() {
    const beheerderInput = document.getElementById("beheerder");
    const beheerder = beheerderInput ? beheerderInput.value.trim() : "";
    const naam = beheerder ? `Inspectie_${beheerder.replace(/[^a-zA-Z0-9_]/g, '_')}.pdf` : "Inspectierapport.pdf"; // Vervang ongeldige tekens in bestandsnaam
    doc.save(naam);
  }

  // ---------------------------------------------------------------------------
  // START OPBOUW PDF-DOCUMENT
  // ---------------------------------------------------------------------------

  // Laad het logo en voeg het toe aan de PDF.
  // Dit gebeurt asynchroon; de rest van de PDF-generatie start pas nadat het logo geladen is.
  const logo = new Image();
  logo.src = "data:image/png;base64,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"; // VERVANG "urlinvoegen" MET DE DAADWERKELIJKE URL OF BASE64 DATA VAN HET LOGO

  logo.onload = function() {
    // Voeg het geladen logo toe aan de PDF.
    // "PNG": formaat van de afbeelding (jsPDF ondersteunt ook JPEG, etc.)
    // margin, y: positie (linker bovenhoek)
    // 170, 20: breedte en hoogte van de afbeelding in mm
    doc.addImage(logo, "PNG", margin, y, 42, 42);
    y += 48; // Verhoog y-positie na het logo (logohoogte + extra ruimte)

    // ---------------------------------------------------------------------------
    // SECTIE: HEADER (Inspectierapport Titel)
    // ---------------------------------------------------------------------------


    const headerH = 20; // Hoogte van het headerblok
    ensureSpace(headerH + 10); // Zorg voor ruimte voor header + marge eronder
    // doc.setDrawColor(0); // Zwarte randkleur - NIET MEER NODIG
    // doc.setFillColor(230, 230, 230); // Lichtgrijze achtergrondkleur (RGB) - NIET MEER NODIG
    // doc.rect(margin, y, pageWidth - 2 * margin, headerH, "FD"); // Teken een gevulde rechthoek met rand (Fill and Draw) - VERWIJDERD

    const midY = y + headerH / 2; // Verticale middellijn van de headerbox
    doc.setFont("Gill Sans MT", "bold");
    doc.setFontSize(36);
    doc.setTextColor(135, 9, 48); // Donkerrode tekstkleur
    doc.text("Inspectierapport", margin + 3, midY - 7, { baseline: "middle" }); // Iets hoger geplaatst

    doc.setFontSize(48);
    doc.setTextColor(0, 75, 134); // Blauwe tekstkleur
    doc.text("Risicoanalyse | BRAND", margin + 3, midY + 15, { baseline: "middle" }); // Iets lager geplaatst
    y += headerH + 10; // Verhoog y-positie na header + extra ruimte

    // ---------------------------------------------------------------------------
    // SECTIE: INFO KADER (Contactinformatie)
    // ---------------------------------------------------------------------------
    const extraSpace = 40; // Bijvoorbeeld 40 punten extra ruimte
    y += extraSpace; // Verhoog de y-positie
    
    const infoH = 20; // Hoogte van het infokader
    ensureSpace(infoH + 10);
    doc.setDrawColor(0); // Zwarte randkleur
    doc.setFillColor(255, 255, 255); // Witte achtergrondkleur
    doc.rect(margin, y, pageWidth - 2 * margin, infoH, "FD"); // Teken gevulde rechthoek met rand

    let infoY = y + 6; // Start y-positie voor tekst binnen het infokader
    const infoData = [
      ["Naam", "Joetri Van Dijck"],
      ["Functie", "Field Underwriter"],
      ["E-mail", "joetri.van.dijck@vivium.be"]
    ];

    doc.setFontSize(11);
    infoData.forEach(([label, value]) => {
      doc.setFont("Gill Sans MT", "bold");
      doc.setTextColor(0); // Zwarte tekst
      doc.text(`${label}:`, margin + 3, infoY);
      doc.setFont("Gill Sans MT", "normal");
      doc.text(value, margin + 40, infoY); // Waarde iets verder naar rechts
      infoY += 6; // Volgende regel
    });
    y += infoH + 10; // Verhoog y-positie na infokader + extra ruimte

    // ---------------------------------------------------------------------------
    // SECTIE: BASISGEGEVENS
    // ---------------------------------------------------------------------------
    drawTitle('Basisgegevens');
    const basisgegevensFields = [
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
    basisgegevensFields.forEach(([label, elementId]) => {
      const inputElement = document.getElementById(elementId);
      const value = inputElement ? inputElement.value.trim() : "";
      if (!value) return; // Sla over als het veld leeg is

      ensureSpace(7); // Ruimte voor één regel tekst
      doc.setFont("Gill Sans MT", "bold");
      doc.text(`${label}:`, margin, y);
      doc.setFont("Gill Sans MT", "normal");
      doc.text(value, margin + 50, y); // Waarde verder naar rechts
      y += 7; // Volgende regel
    });

    // ---------------------------------------------------------------------------
    // SECTIE: BESCHRIJVING INSPECTIE & OPMERKINGEN (Algemeen)
    // ---------------------------------------------------------------------------
    const beschrijvingSections = [
      { title: "Beschrijving Activiteit", id: "tekstveld" },
      { title: "Opmerkingen", id: "tekst1" }
    ];

    beschrijvingSections.forEach(section => {
      const textAreaElement = document.getElementById(section.id);
      const textContent = textAreaElement ? textAreaElement.value.trim() : "";
      if (!textContent) return; // Sla over als het tekstveld leeg is

      drawTitle(section.title);
      // Verdeel lange tekst over meerdere regels, passend binnen de paginabreedte (met marges)
      const lines = doc.splitTextToSize(textContent, pageWidth - 2 * margin);
      doc.setFont("Gill Sans MT", "normal"); // Zorg dat de body tekst normaal is
      doc.setFontSize(11);
      lines.forEach(line => {
        ensureSpace(6); // Ruimte per regel
        doc.text(line, margin, y);
        y += 6;
      });
    });

    // ---------------------------------------------------------------------------
    // SECTIE: DIEFSTALSECTIES (Dynamisch opgebouwd)
    // ---------------------------------------------------------------------------
    const diefstalCategories = [
      { title: "Omgeving", ids: ["th-ligging", "th-bouwtype", "th-toegangen", "th-sociale", "th-risicoadres", "th-risicoadres-omschrijving", "th-vlucht", "th-omgevings-opm"] },
      { title: "Antecedenten", ids: ["th-antecedent-incident", "th-antecedent-omschrijving"] },
      { title: "Inhoud", ids: ["th-inhoud-omschrijving", "th-dekking", "th-verzekeraar"] },
      { title: "Kluis", ids: ["th-kluis-aanwezig", "th-kluis-merk", "th-kluis-afm", "th-kluis-elektrisch", "th-kluis-mechanisch", "th-kluis-standplaats", "th-kluis-waarde", "th-kluis-conform", "th-kluis-beoordeling", "th-kluis-opm"] },
      { title: "Beveiliging terrein", ids: ["th-terrein-beoordeling", "th-perimetermaatregelen"] },
      { title: "Mechanische beveiliging", ids: ["th-mech-gevels", "th-mech-dak", "th-mech-deuren", "th-mech-poorten", "th-mech-vaste-ramen", "th-mech-open-ramen", "th-mech-koepels", "th-mech-opm"] },
      { title: "Elektronische beveiliging", ids: ["th-elec-alarmsysteem", "th-elec-installateur", "th-elec-fod", "th-elec-incert", "th-elec-onderhoud", "th-elec-conformiteit", "th-elec-doormelding", "th-elec-omschrijving"] }
    ];

    doc.setFontSize(11);
    diefstalCategories.forEach(category => {
      // Controleer eerst of er minstens één veld in deze categorie een waarde heeft
      const hasValues = category.ids.some(id => {
        const element = document.getElementById(id);
        return element && element.value.trim();
      });

      if (hasValues) {
        drawTitle(category.title);
        category.ids.forEach(id => {
          const inputElement = document.getElementById(id);
          const value = inputElement ? inputElement.value.trim() : "";
          if (!value) return; // Sla dit specifieke veld over als het leeg is

          // Label (haal 'th-' prefix weg voor weergave)
          const label = id.replace(/^th-/, '').replace(/-/g, ' '); // Vervang '-' met spaties voor betere leesbaarheid
          const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1); // Eerste letter hoofdletter

          // Verdeel de waarde over meerdere regels indien nodig
          const lines = doc.splitTextToSize(value, pageWidth - 2 * margin - 50); // 50mm gereserveerd voor label
          const blockHeight = lines.length * 6; // Hoogte van de tekstblock
          
          ensureSpace(blockHeight + 2); // +2 voor kleine marge onder label

          doc.setFont("Gill Sans MT", "bold");
          doc.text(`${formattedLabel}:`, margin, y);
          doc.setFont("Gill Sans MT", "normal");
          doc.text(lines, margin + 50, y); // Tekst van waarde naast het label
          y += blockHeight + 4; // Verhoog y met hoogte van tekstblok + extra ruimte
        });
      }
    });

    // -------------------------------------------------------
// SECTIE: BESLUIT
// Nieuwe pagina na diefstal, voor clausules
// -------------------------------------------------------
doc.addPage();
y = margin;               // terug naar boven
// 1) Kader en titel “Besluit” in 14pt
const boxH = 12;                    // hoogte van het kader in mm
ensureSpace(boxH + 4);              // ruimte voor kader + marge
doc.setDrawColor(0);                // zwarte rand
doc.setLineWidth(0.5);
doc.rect(margin, y, pageWidth - 2 * margin, boxH);  // kader
doc.setFont("Gill Sans MT","bold").setFontSize(14);
doc.text(
  "Besluit",
  margin + 2,                     // klein inspringen van de tekst
  y + boxH/2,                     // verticaal in het midden van het kader
  { baseline: "middle" }
);
y += boxH + 6;                     // ruimte na het kader

// 1) Herinspectie
{
  const val = document.getElementById('besluit-herinspectie').value || '-';
  ensureSpace(7);
  doc.setFont('Gill Sans MT','bold').setFontSize(11).text('Herinspectie:', margin, y);
  doc.setFont('Gill Sans MT','normal').text(val, margin + 50, y);
  y += 7;
}

// 2) Antecedenten
{
  const val = document.getElementById('besluit-antecedenten').value || '-';
  ensureSpace(7);
  doc.setFont('Gill Sans MT','bold').text('Antecedenten:', margin, y);
  doc.setFont('Gill Sans MT','normal').text(val, margin + 50, y);
  y += 7;

  // Als er een omschrijving is ingevuld, toon die
  const oms = document.getElementById('besluit-antecedenten-omschrijving').value.trim();
  if (oms) {
    ensureSpace(6);
    doc.setFont('Gill Sans MT','italic').setFontSize(10).text('Indien “Ja”, omschrijf:', margin, y);
    y += 6;
    const lines = doc.splitTextToSize(oms, pageWidth - 2 * margin);
    doc.setFont('Gill Sans MT','normal').setFontSize(11);
    lines.forEach(line => {
      ensureSpace(6);
      doc.text(line, margin, y);
      y += 6;
    });
    y += 4;
  }
}

// 3) Technische beoordeling
{
  const val = document.getElementById('besluit-technische').value || '-';
  ensureSpace(7);
  doc.setFont('Gill Sans MT','bold').setFontSize(11).text('Technische beoordeling:', margin, y);
  doc.setFont('Gill Sans MT','normal').text(val, margin + 50, y);
  y += 7;
}

// 4) Persoonlijk advies
{
  const adv = document.getElementById('besluit-advies').value.trim();
  if (adv) {
    // Gewone label in zwart, bold 11pt
    ensureSpace(10);
    doc.setFont('Gill Sans MT', 'bold').setFontSize(11).setTextColor(0);
    doc.text('Persoonlijk advies m.b.t. acceptatie', margin, y);
    y += 7;

    // De adviestekst zelf
    doc.setFont('Gill Sans MT', 'normal').setFontSize(11);
    const lines = doc.splitTextToSize(adv, pageWidth - 2 * margin);
    lines.forEach(line => {
      ensureSpace(6);
      doc.text(line, margin, y);
      y += 6;
    });
    y += 8;
  }
}

    // ---------------------------------------------------------------------------
    // SECTIE: PREVENTIECLAUSULES
    // Deze sectie wordt alleen toegevoegd als er clausules zijn geselecteerd.
    // De 'clauses' variabele wordt verwacht uit clauses.js te komen.
    // ---------------------------------------------------------------------------
    // Controleer of 'clauses' bestaat en een array is
    if (typeof clauses !== 'undefined' && Array.isArray(clauses)) {
        const anyClauseChecked = clauses.some(c => {
            const checkbox = document.getElementById(`chk-${c.id}`);
            return checkbox && checkbox.checked;
        });

        if (anyClauseChecked) {
            doc.addPage(); // Forceer een nieuwe pagina voor de preventieclausules
            y = margin;    // Reset y-positie

            // Titel "Preventie" in een kader
            ensureSpace(18); // Ruimte voor het kader en tekst
            const boxH = 12; // Hoogte van het kader
            doc.setDrawColor(0); // Zwarte randkleur
            doc.rect(margin, y, pageWidth - 2 * margin, boxH, 'D'); // Teken alleen de rand (Draw-only)
            doc.setFont("Gill Sans MT", "bold").setFontSize(12).setTextColor(0);
            doc.text("Preventie", margin + 3, y + boxH / 2, { baseline: "middle", align: "left" });
            y += boxH + 8; // Ruimte na het kader

            // Introductietekst voor de clausules
            doc.setFont("Gill Sans MT", "italic").setFontSize(12);
            ensureSpace(8);
            doc.text("Clausule – Prioriteitsbepaling van de preventiemaatregel(s) \u00A0\u00A0\u00A0\u00A0NR 1576", margin, y); // \u00A0 is een non-breaking space
            y += 8;

            // Lijst met prioriteitsdefinities
            doc.setFont("Gill Sans MT", "italic").setFontSize(10);
            const priorityBullets = [
                "A: Noodzakelijk uit te voeren alvorens te kunnen accepteren,",
                "B: Uit te voeren uiterlijk tegen aangeduide datum,",
                "C: Wenselijke preventiemaatregelen, echter niet verplichtend,",
                "D: Reeds (grotendeels) aanwezig, doch dient integraal bestendigd te worden."
            ];
            priorityBullets.forEach(bulletText => {
                ensureSpace(6);
                doc.text(bulletText, margin + 4, y); // Met kleine inspringing
                y += 6;
            });
            y += 4; // Extra ruimte

            // Overeenkomsttekst
            doc.setFont("Gill Sans MT", "normal").setFontSize(10); // Normale tekst voor de overeenkomst
            const agreementText =
                "Er is tussen de partijen uitdrukkelijk overeengekomen dat bij niet-uitvoering van de hierna vermelde " +
                "en gespecificeerde verplichtingen binnen de opgegeven termijn, de Verzekeringsnemer geen recht heeft op " +
                "enige verzekeringsprestatie wanneer er een oorzakelijk verband bestaat tussen de niet-uitvoering van een of " +
                "meerdere verplichtingen en het overkomen van een schadegeval. De maatschappij behoudt bovendien het recht om " +
                "de polis wegens niet- of gedeeltelijke uitvoering van de opgelegde preventiemaatregelen op te zeggen, dit met " +
                "in acht name van een vooropzeg van 30 (dertig) dagen.";
            const agreementLines = doc.splitTextToSize(agreementText, pageWidth - 2 * margin);
            agreementLines.forEach(line => {
                ensureSpace(6);
                doc.text(line, margin, y);
                y += 6;
            });

            // Wit scheidingslijntje (of eerder, een lege ruimte met potentiële lijn)
            y += 4;
            // doc.setDrawColor(255, 255, 255); // Wit - dit zal onzichtbaar zijn op witte achtergrond. Als een echte lijn nodig is, andere kleur.
            // doc.setLineWidth(0.5);
            // doc.line(margin, y, pageWidth - margin, y);
            y += 8; // Ruimte voor de eerste clausuletitel

            // Verwerk elke geselecteerde clausule
            clauses.forEach(clause => {
                const clauseCheckbox = document.getElementById(`chk-${clause.id}`);
                if (!clauseCheckbox || !clauseCheckbox.checked) return; // Sla over als niet aangevinkt

                // 1. Titel van de clausule
                doc.setFont('Gill Sans MT', 'italic').setFontSize(12);
                ensureSpace(10); // Ruimte voor titel, lijn en wat marge
                doc.text(clause.title, margin, y);

                // 2. Lijn direct onder de titel
                const titleBaselineY = y;
                const lineOffsetY = titleBaselineY + 2; // Offset voor de lijn onder de tekst
                doc.setDrawColor(0); // Zwarte lijn
                doc.setLineWidth(0.5);
                doc.line(margin, lineOffsetY, pageWidth - margin, lineOffsetY);
                y = lineOffsetY + 6; // y-positie na de lijn + marge

                // 3. Prioriteit en Termijn
                const priorityElement = document.getElementById(`priority-${clause.id}`);
                const deadlineElement = document.getElementById(`deadline-${clause.id}`);
                const priorityValue = priorityElement ? priorityElement.value : 'N/A';
                const deadlineValue = deadlineElement && deadlineElement.value ? deadlineElement.value : '-';

                ensureSpace(14); // Ruimte voor 2 regels (Prioriteit & Termijn)
                doc.setFont('Gill Sans MT', 'bolditalic').setFontSize(11);
                doc.text('Prioriteit:', margin, y);
                doc.setFont('Gill Sans MT', 'italic');
                doc.text(priorityValue, margin + 40, y);
                y += 6;

                doc.setFont('Gill Sans MT', 'bolditalic');
                doc.text('Termijn:', margin, y);
                doc.setFont('Gill Sans MT', 'italic');
                doc.text(deadlineValue, margin + 40, y);
                y += 8; // Extra ruimte na termijn

                // 4. Inhoud van de clausule
                doc.setFont('Gill Sans MT', 'italic').setFontSize(11); // Standaard stijl voor clausule-inhoud
                if (clause.id === 30) { // Speciale behandeling voor clausule ID 30
                    const defect1 = document.getElementById('defect-1')?.value || '...';
                    const defect2 = document.getElementById('defect-2')?.value || '...';
                    const defect3 = document.getElementById('defect-3')?.value || '...';
                    
                    ensureSpace(6);
                    doc.text('- Volgende vastgestelde gebreken aan gebouwen, afwerkingen en/of technische installaties dienen uitgevoerd te worden :', margin, y);
                    y += 6;
                    [defect1, defect2, defect3].forEach(defectText => {
                        ensureSpace(6);
                        doc.text(`  o ${defectText}`, margin, y); // Inspringen met 'o' als bullet
                        y += 6;
                    });
                } else if (clause.id === 31) { // Speciale behandeling voor clausule ID 31
                    const freeText31 = document.getElementById('free-text-31')?.value || '';
                    const lines31 = doc.splitTextToSize(freeText31, pageWidth - 2 * margin);
                    lines31.forEach(line => {
                        ensureSpace(6);
                        doc.text(line, margin, y);
                        y += 6;
                    });
                } else { // Standaard clausule-inhoud
                    const contentLines = doc.splitTextToSize(clause.content, pageWidth - 2 * margin);
                    contentLines.forEach(line => {
                        ensureSpace(6);
                        doc.text(line, margin, y);
                        y += 6;
                    });
                }

                // 5. Opmerkingen bij de clausule (indien aanwezig)
                const commentElement = document.getElementById(`comment-${clause.id}`);
                const commentText = commentElement ? commentElement.value.trim() : "";
                if (commentText) {
                    ensureSpace(10); // Ruimte voor titel "Opmerking(en)"
                    doc.setFont('Gill Sans MT', 'bolditalic');
                    doc.text('Opmerking(en):', margin, y); // ":" toegevoegd voor consistentie
                    // y += 4; // Oorspronkelijk stond hier een lijn, die is nu weggelaten. Als die terug moet:
                    // doc.setDrawColor(0); // zwarte lijn
                    // doc.line(margin, y + 2, pageWidth - margin, y + 2); // lijn onder "Opmerking(en)"
                    y += 6; // Naar volgende regel voor de opmerkingstekst

                    doc.setFont('Gill Sans MT', 'italic'); // Opmerkingen in italic
                    const commentLines = doc.splitTextToSize(commentText, pageWidth - 2 * margin);
                    commentLines.forEach(line => {
                        ensureSpace(6);
                        doc.text(line, margin, y);
                        y += 6;
                    });
                }
                y += 8; // Extra ruimte voor de volgende clausule
            });
        }
    } else {
        console.warn("Variabele 'clauses' is niet gedefinieerd of geen array. Preventieclausules worden overgeslagen.");
    }


    // ---------------------------------------------------------------------------
    // SECTIE: FOTOBEWIJS
    // Wordt altijd op een nieuwe pagina gestart als er afbeeldingen zijn.
    // ---------------------------------------------------------------------------
    const afbeeldingenInput = document.getElementById('afbeeldingen');
    const files = afbeeldingenInput ? Array.from(afbeeldingenInput.files) : [];

    if (files.length > 0) {
      doc.addPage();
      y = margin;
      drawTitle("Fotobewijs");

      const maxImgWidth = 80;  // Maximale breedte van een afbeelding in mm
      const maxImgHeight = 60; // Maximale hoogte van een afbeelding in mm
      const gapX = 5;          // Horizontale ruimte tussen afbeeldingen (indien meerdere per rij)
      const gapY = 5;          // Verticale ruimte tussen afbeeldingrijen
      let currentColumn = 0;   // Houdt bij in welke kolom de volgende afbeelding komt (0 of 1 voor twee kolommen)
      const imagesPerRow = 2;  // Aantal afbeeldingen per rij

      // Functie om afbeeldingen één voor één asynchroon te verwerken en toe te voegen.
      // Gebruikt een IIFE (Immediately Invoked Function Expression) met recursie.
      (function processImageFile(index) {
        if (index >= files.length) {
          // Alle afbeeldingen zijn verwerkt, sla de PDF op.
          savePdf();
          return;
        }

        const reader = new FileReader();
        reader.onerror = () => {
          console.error(`Fout bij het lezen van bestand: ${files[index].name}`);
          processImageFile(index + 1); // Ga door met de volgende afbeelding
        };

        reader.onload = function(event) {
          const img = new Image();
          img.onerror = () => {
            console.error(`Fout bij het laden van afbeelding: ${files[index].name}`);
            processImageFile(index + 1); // Ga door met de volgende afbeelding
          };

          img.onload = function() {
            // Bereken de afmetingen van de afbeelding om te passen binnen maxW x maxH, met behoud van aspect ratio.
            let w = img.width;
            let h = img.height;
            if (w > maxImgWidth) {
              h = (maxImgWidth / w) * h;
              w = maxImgWidth;
            }
            if (h > maxImgHeight) {
              w = (maxImgHeight / h) * w;
              h = maxImgHeight;
            }
            
            // Bereken x-positie. Start nieuwe rij als nodig.
            let xPos = margin + currentColumn * (maxImgWidth + gapX);

            // Controleer of er een nieuwe pagina of nieuwe rij nodig is.
            if (currentColumn === 0 && index > 0) { // Begin van een nieuwe rij (niet de allereerste afbeelding)
                // Eerst controleren of dit de eerste afbeelding van een *nieuwe* rij is na een volle rij
                // De y-positie is al verhoogd na de vorige rij.
            }

            // Controleer of de afbeelding op de huidige pagina past.
            // Als we aan het begin van een kolom staan en het past niet, nieuwe pagina.
            if (y + h > pageHeight - margin) {
              doc.addPage();
              y = margin;
              drawTitle("Fotobewijs (vervolg)"); // Titel voor vervolgpagina
              currentColumn = 0; // Reset kolom op nieuwe pagina
              xPos = margin; // Reset xPos voor de eerste kolom
            }

            // Voeg de afbeelding toe.
            doc.addImage(img, "JPEG", xPos, y, w, h, undefined, "FAST"); // "FAST" voor snellere rendering (kan kwaliteit beïnvloeden)

            currentColumn++;
            if (currentColumn >= imagesPerRow) {
              currentColumn = 0; // Reset naar eerste kolom
              y += maxImgHeight + gapY; // Ga naar volgende rij
            }

            // Verwerk de volgende afbeelding.
            processImageFile(index + 1);
          };
          img.src = event.target.result; // event.target.result bevat de base64 data URL
        };
        reader.readAsDataURL(files[index]); // Lees het bestand als Data URL (base64)
      })(0); // Start de verwerking met de eerste afbeelding (index 0)

    } else {
      // Geen afbeeldingen, sla de PDF direct op.
      savePdf();
    }
  }; // Einde van logo.onload

  // Fallback voor als het logo niet laadt
  logo.onerror = function() {
    console.error("Logo kon niet geladen worden. PDF wordt zonder logo gegenereerd.");
    // Optioneel: Roep hier direct de code aan die normaal in logo.onload staat,
    // maar zonder de doc.addImage(logo, ...) call, of met een placeholder.
    // Voor nu, gaan we ervan uit dat de PDF-generatie stopt als het logo essentieel is,
    // of je kunt de rest van de PDF hieronder dupliceren (niet ideaal).
    // Eenvoudigste is om de gebruiker te informeren en mogelijk toch door te gaan:
    y += 28; // Simuleer ruimte voor logo
    // ... (dan hier de rest van de PDF generatie code, startend met HEADER)
    // ECHTER: de huidige structuur is afhankelijk van de asynchrone logo.onload.
    // Het is beter om de flow te behouden en een foutmelding te geven.
    // Of, als het logo niet kritisch is, de code die nu in logo.onload staat hier te plaatsen.
    // Voor dit voorbeeld, wordt de PDF niet verder gegenereerd als het logo faalt.
    alert("Fout bij het laden van het bedrijfslogo. Het PDF-rapport kan niet correct worden gegenereerd.");
  };
}


/**
 * Zoekt een locatie op via Google Maps Static API en toont deze in een <img> element.
 */
function zoekOpGoogleMaps() {
  const locatieInput = document.getElementById("locatie");
  if (!locatieInput) {
    alert("Locatie inputveld niet gevonden.");
    return;
  }
  const loc = locatieInput.value.trim();
  if (!loc) {
    alert("Voer een locatie in.");
    return;
  }

  // LET OP: Het is GEEN goede praktijk om API-sleutels direct in client-side JavaScript te embedden.
  // Deze sleutel kan misbruikt worden. Overweeg een backend proxy service te gebruiken.
  const apiKey = "AIzaSyA1uZJGvM7-gPJ5dB0e9l_4dV5EIBPYXUE"; // DEZE SLEUTEL IS ZICHTBAAR!
  const url = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(loc)}&zoom=14&size=600x400&markers=color:red%7Clabel:S%7C${encodeURIComponent(loc)}&key=${apiKey}`;

  const mapImageElement = document.getElementById("map-image");
  if (mapImageElement) {
    mapImageElement.src = url;
  } else {
    alert("Element om kaart in te tonen (map-image) niet gevonden.");
  }
}