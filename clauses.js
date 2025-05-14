(function() {
  const css = `
    .clause {
      border: 1px solid #ccc;
      padding: 10px;
      margin-bottom: 20px;
      border-radius: 5px;
      background: #fff;
    }
    .clause-header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .clause-title {
      display: block;
      width: 100%;
      margin-left: 0;
      font-size: 18px;
    }
    .clause-body {
      margin: 8px 0 16px 0;
      white-space: pre-wrap;
    }
    .clause-content label {
      font-weight: bold;
      margin-top: 8px;
      display: block;
    }
    .clause-content select,
    .clause-content input,
    .clause-content textarea {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
    }
    @media (max-width: 767px) {
      .clause-title { font-size: 16px; }
      .clause-content select,
      .clause-content input,
      .clause-content textarea { font-size: 14px; }
    }
    /* Print-only styles: italicize clause content on PDF output */
    @media print {
      .clause-body {
        font-family: 'Times New Roman', serif;
        font-style: italic;
      }
    }
  `;
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);
})();

// 1) Data
window.clauses = [
  { id: 2, title: 'Preventiemaatregel – Blusmiddelen                        NR 01577', content:
    '- Blustoestellen, BENOR gekeurd, à rato van 1 eenheid (1 EH = 6kg poeder of equivalent) per 150m² met een minimum van 2 toestellen per niveau (in geval uitbatingruimten op verdiepingen)\n' +
    '- Alle blusmiddelen dienen onderworpen te zijn aan onderhoudscontract (jaarlijks onderhoud).\n' +
    '- Alle blusmiddelen dienen duidelijk zichtbaar en strategisch te worden opgehangen, dienen goed bereikbaar te zijn en moeten aangeduid worden met pictogrammen.\n'
  },
  { id: 3, title: 'Preventiemaatregel – Vrijstaande verwarmingsinstallaties       NR 01578', content:
    '(Toegelaten indien vermogen < 70 Kwatt.)\n' +
    '- Vrije zone van minstens 2m rondom het verwarmingstoestel. Binnen deze zone mogen geen brandbare goederen voorkomen. Deze zone dient afgebakend te worden met bv gele verf of bij voorkeur afgezet met een metalen balustrade.\n' +
    '- Warmtegeneratoren, verwarmingstoestellen algemeen, schoorstenen en de rookgangen moeten op voldoende afstand van brandbare goederen en materialen opgesteld zijn of er zodanig van afgezonderd/geïsoleerd zijn dat brandgevaar voorkomen wordt.\n' +
    '- Houtkachels dienen op een niet brandbare ondergrond geplaatst te worden en omboord met een onbrandbare opstaande rand van 10 cm om te verhinderen dat gloeiende deeltjes op de werkvloer terecht komen. As van houtkachels, haarden dient in een metalen recipiënt met dito deksel of vlammentemmer leeggemaakt te worden.\n' +
    '- Verwarmingstoestellen met vaste brandstof of stookolie en hun rookafvoerkanalen dienen jaarlijks te worden nagezien en onderhouden door bevoegde vaklui.\n' +
    '- Verwarmingstoestellen op gas dienen tweejaarlijks nagezien en onderhouden te worden door bevoegde vaklui.\n' +
    '- Bewijsstukken moeten ter beschikking gehouden worden van de verzekeraar.\n'
  },
  { id: 4, title: 'Preventiemaatregel – Stookplaats                               NR 01579', content:
    '(Noodzakelijk indien vermogen >70 Kwatt.)\n' +
    '- De stookplaats mag geen brandbare materialen of goederen bevatten en mag niet als werkplaats of opslagruimte gebruikt worden.\n' +
    '- Wanden, vloeren, dak- of plafond dienen opgetrokken te zijn in brandwerende materialen met brandweerstand REI 60’\n' +
    '- Zelfsluitende deur met brandweerstand EI 30’\n' +
    '- Verluchtingsroosters dienen brandwerend en zelfsluitend te zijn (brandweerstand 30’ en 60’ indien uitgevend in het gebouw). De dimensionering van de verluchtingsroosters moet bepaald worden door de installateur van de stookinstallatie, en is in functie van de aard en het type toestel.\n'
  },
  { id: 5, title: 'Preventiemaatregel – Tanks, vaten, recipiënten                  NR 01580', content:
    'Stookolie, vloeibare oliën, vloeibare corrosieven, toxische vloeistoffen, …\n' +
  
    '- De opslag, zowel binnen of  buiten de gebouwen dient ingekuipt en/of dubbelwandig te zijn. (inkuiping met minimum het 1/2e volume van de gestockeerde producten).\n' 
  },
  { id: 6, title: 'Preventiemaatregel – Verontreinigd afval                             NR 01581', content:
  '- Het is niet toegelaten afval dat spontaan of gemakkelijk zou kunnen ontvlammen door zelfontbranding te laten ophopen (vb. met olie, verf of solvent-doordrenkte vodden, filters van spuitwanden of spuitcabines, karton …). Dergelijke afvalmaterialen moeten gedeponeerd worden in aangepaste (onbrandbare) recipiënten met bijpassende deksels, zodat ieder brandgevaar wordt uitgesloten.\n' +
  '- Deze afvalbakken moeten geplaatst worden in een brandveilige omgeving, bij voorkeur buiten het gebouw en op afstand. Binnen een straal van 2 m mogen geen gemakkelijk brandbare goederen of ontstekingsbronnen aanwezig zijn.\n' +
  '- De hoeveelheid verontreinigd afval moet beperkt blijven en de bakken dienen periodiek te worden geleegd en afgevoerd.\n'
},
{ id: 7, title: 'Preventiemaatregel – Buitenopslag                                    NR 01582', content:
  '- Tegen de buitengevels van gebouwen mogen geen brandbare goederen gestapeld worden (vb. houten paletten).\n' +
  '- Indien er buitenopslag plaatsvindt, dient deze zo ver mogelijk van de gebouwen te worden gesitueerd (bij voorkeur op minimaal 10 m) en beperkt in hoogte te zijn.\n' +
  '- In geval van een noodzakelijke interventie moeten de gebouwen altijd vlot bereikbaar zijn voor hulpdiensten; doorgangen langs de gevels moeten vrijgehouden worden.\n' 
},
{ id: 8, title: 'Preventiemaatregel – Opslag brandbaar bedrijfsafval                    NR 01583', content:
  '- Afval moet worden opgeslagen in afsluitbare containers (met deksel) wanneer deze in of tegen het gebouw staan.\n' +
  '- Opslag in open containers buiten het gebouw:\n' +
  '  o Afstand tot de gebouwen bij voorkeur 10 m of meer, binnen een omheinde zone of terrein (ter beperking van brandstichting en voor optimale bereikbaarheid).\n' +
  '- Opslag in open containers binnen het gebouw:\n' +
  '  o Minimale vrije zone van 2 m rondom de container; binnen deze zone geen brandbare goederen of ontstekingsbronnen (verwarmingsinstallaties, elektrische contacten, batterijladers, …).\n' +
  '- Brandbaar afval moet worden beperkt en er dient een contract te zijn voor periodieke ophaling door een erkend afvalverwerkingsbedrijf.\n'
},
{ id: 9, title: 'Preventiemaatregel – Controle elektrische installaties                  NR 01584', content:
  '- De LS-installatie (LaagSpanning) dient periodiek (elke 5 jaar) gekeurd te worden conform de geldende wetgeving (CODEX, AREI, art. 262, 270, 271).\n' +
  '- De HS-installatie (HoogSpanning) dient periodiek (jaarlijks) gekeurd te worden conform de geldende wetgeving (CODEX, AREI, art. 267, 272).\n' +
  '- De verzekerde dient de keuringsattesten te allen tijde ter beschikking te houden van de verzekeraar.\n'
},
{ id: 10, title: 'Preventiemaatregel – Opladen van heftrucks, heftoestellen, reinigingstoestellen, …          NR 01585', content:
  '- Vrije zone van minimaal 2 m rond het toestel en laadstation; binnen deze zone geen brandbare goederen of ontstekingsbronnen en het toestel mag niet tegen, op of onder brandbaar materiaal geplaatst worden. Preferentieel gemarkeerd met gele vloerverf.\n' +
  '- Bij het laadstation moeten voedingskabels altijd opgehangen of van de vloer weggeleid worden om beschadiging (bijvoorbeeld door overrijden met een heftruck) te voorkomen.\n' 
},
{ id: 11, title: 'Preventiemaatregel – Algemeen en strikt toegepast rookverbod                   NR 01586', content:
  '- Het rookverbod moet duidelijk aangeduid worden met geschikte pictogrammen bij alle toegangsdeuren van de gebouwen.\n' +
  '- Uitzonderlijk kan buiten een gecentraliseerde rookzone worden ingericht, met brandvrije vloer en vlamdovende asbakken.\n' 
},
{ id: 12, title: 'Preventiemaatregel – Opslag gasflessen                                          NR 01587', content:
  '- Gasflessen en gastanks moeten conform de geldende wetgeving gecentraliseerd en bij voorkeur buiten het gebouw worden opgeslagen, beschut tegen weersomstandigheden, goed bereikbaar en beveiligd tegen omvallen of aanrijding.\n' +
  '- Het rookverbod bij de gasopslag moet duidelijk zichtbaar zijn.\n' +
  '- Volle en lege flessen dienen gescheiden te worden en duidelijk gemarkeerd met de aard van de inhoud.\n' +
  '- Indien buitenopslag niet mogelijk is, mogen gasflessen binnen in de nabijheid van een goed bereikbare ingang worden geplaatst, met duidelijke aanduiding van de aanwezige flessen.\n' 
},
{ id: 13, title: 'Preventiemaatregel – Brandwerende deuren / poorten                             NR 01588', content:
  '- Brandwerende deuren moeten de opening volledig afsluiten, zelfsluitend zijn (met deurpomp) en mogen enkel in open stand geblokkeerd worden door elektromagnetische contacten gekoppeld aan brand- of rookdetectie.\n' +
  '- Brandwerende poorten dienen tijdens sluitingsuren altijd gesloten te zijn.\n' +
  '- Brandpoorten moeten automatisch bediend worden via branddetectiesturing en rookmelders aan beide zijden. Indien automatische sluiting niet mogelijk is, moeten ze na werktijd handmatig gesloten worden. Bij inbraakalarm kan een magneetcontact een signaal geven bij een openstaande deur of poort.\n' +
  '- De doorgangen van deuren en poorten moeten te allen tijde vrijgehouden worden van obstakels die het volledig sluiten kunnen verhinderen.\n' 
},
{ id: 14, title: 'Preventiemaatregel – Zonnepanelen, installaties >500 m²          NR 01589', content:
  '- Keuringen:\n' +
  'Conform AREI dient de nieuwe installatie en eventuele aanpassingen aan de bestaande elektrische installaties, gekeurd te zijn voor ingebruikname.\n' +
  'Uiterlijk 3 jaar na de ingebruikname van de installatie dient een thermografisch onderzoek uitgevoerd te worden op alle combinerboxen en omvormers. Dit onderzoek moet uitgevoerd worden in de periode 01/04-30/05, en moet naderhand jaarlijks herhaald worden.\n' +
  'Een gunstig verslag moet voorgelegd worden.\n' +
  '- Onderhoud:\n' +
  'Visuele controle:\n' +
  'Minstens 1 x/jaar, bij voorkeur in de periode 01/04-30/05, dient een bevoegd persoon een visuele controle te doen van de volledige installatie - de panelen, de bekabelingen en connectoren, de combinerboxen, de omvormers – alsook van de staat van de dakbedekking.\n' +
  'Bijhouden van de vaststellingen en ondernomen acties in een logboek dat beschikbaar moet blijven voor de Verzekeraar.\n' +
  'Panelen:\n' +
  '(Gedeeltelijke) bedekkingen van de panelen kunnen de spanningen in het DC-gedeelte van de installatie opdrijven en doen het rendement van de installatie dalen. Daarom dienen de panelen minstens 1 x/jaar gereinigd te worden\n' +
  '- Toegankelijkheid:\n' +
  'Bovendakse panelen en combinerboxen:\n' +
  'In het geval geen vaste trap, deur of opengaand raam rechtstreeks toegang geeft tot het dak waarop de installaties zijn geplaatst, moet Verzekerde voorzien in een onmiddellijk beschikbare voldoende hoge ladder waarmee toegang kan verschaft worden tot het dak in geval van nood (melding rendementsverlies, …).\n' +
  'Omvormers:\n' +
  'Omvormers moeten in een brandveilige omgeving opgesteld staan, ttz. in een zone zonder brandbare goederen noch ontstekingsbronnen, min. 2 m rondom de installatie.\n' +
  'Een vlotte doorgang naar de omvormers moet steeds gegarandeerd zijn. Zo nodig dient de brandveilige zone én de vrij te houden doorgang, gemarkeerd te worden met gele vloerverf.\n' 
},
{ id: 15, title: 'Preventiemaatregel – Opslag solventen                              NR 01591', content:
  '- Gebruik:\n' +
  'Binnen de werkplaatsen mogen slechts beperkte hoeveelheden ontvlambare producten aanwezig zijn, beperkt tot de behoeften van 1 dag.\n' +
  '- Opslag:\n' +
  '  o < 50 l:\n' +
  '    De solventen mogen gestockeerd worden binnen de werkplaats. Vrije ruimte van 2 m rondom de opslag. Binnen deze veiligheidszone mogen geen warmtebronnen voorkomen, noch elektrische contacten. De veiligheidszone kan eventueel aangeduid worden met gele vloerverf.\n' +
  '  o 50-250 l.:\n' +
  '    Solventen moeten ingekuipt gestockeerd worden in een brandvrije kluis (kast met brandweerstand 60’). De kast moet voorzien zijn van alle noodzakelijke waarschuwingspictogrammen: aanwezigheid van ontvlambare producten, toxische producten, …\n' +
  '  o > 250 l.:\n' +
  '    Conform lokaal ontvlambare en brandbare producten. Vloer, muren, plafond, dienen brandwerend te zijn, REI 60. Zelfsluitende brandwerende deur met weerstand REI 30’. Onder- en bovenverluchting. In geval naar binnen het gebouw dienen verluchtingsopeningen afgesloten te zijn d.m.v. een zelfsluitend brandwerend rooster met weerstand REI 30’. Veiligheidspictogrammen (explosiegevaar, rookverbod, …) aan de buitenzijde. CO2 blusser aan de inkomdeur.\n' 
},
{ id: 16, title: 'Preventiemaatregel – Orde en netheid                                 NR 01592', content:
  '- Orde en netheid moeten een permanente zorg zijn gezien dit een invloed heeft op de brandveiligheid.\n' +
  '- Daarom:\n' +
  '  o Moet alle afval (productieafval, verpakking, …) regelmatig verwijderd worden en afgevoerd worden naar geschikte containers.\n' +
  '  o Wekelijks moet een reinigingsbeurt georganiseerd worden waarbij alle machines en de bedrijfsvloer ‘bezemschoon’ of zo goed als mogelijk stofvrij gemaakt moeten worden. Bijzondere aandacht moet ook gegeven worden aan stof op en rond motoren, elektrische installaties zoals bijvoorbeeld contacten en armaturen, op en in zekeringenkasten, enz. …\n' 
},
{ id: 17, title: 'Preventiemaatregel – Blusmiddelen (bijkomende voorzieningen)', content:
  '- Er moet voorzien worden in haspels: 1 per 500m² met een minimum van 2 per niveau (in geval uitbatingruimten op verdiepingen).\n' +
  '(NBN EN 671-1, Regels goed vakmanschap Fireforum)\n' +
  '- Elke haspel moet steeds vlot bereikbaar zijn. De doorgangen tot de haspels mogen niet verhinderd worden door vaste of gebruikelijke hindernissen, zoals machines, rekken, stockage allerhande, …. Eventueel moet de vrij te houden doorgang gemarkeerd worden dmv gele vloerverf.\n' +
  '- Automatische blusinstallatie met afsluiting van de brandstoftoevoer te plaatsen op de stookoliebranders.\n' +
  '(NBN EN 3-1 t.e.m.3-4)\n' +
  '- Blusdeken, te plaatsen in de onmiddellijke nabijheid van fornuizen en/of werkzaamheden met verhitte vloeistoffen, open vlam, …\n' +
  '(EN 1869:1997)\n' +
  '- CO2 blusser nabij volgende technische installaties en/of locaties:\n' +
  '  o Belangrijke elektriciteitsborden / HS-installatie, transfo-installaties, …\n' +
  '  o Laadstations elektrische heftrucks, reinigingsmachines, …\n' +
  '  o Opslag ingekuipte brandstoffen, solventen, …\n' +
  '  o Laswerken\n' +
  '  o Omvormers en schakelkast zonnepanelen\n' +
  '  o Fornuizen\n' +
  '  o Keuken (HORECA)\n' 
},
{ id: 18, title: 'Preventiemaatregel – Thermografie', content:
  '-   Er dient een thermografische controle uitgevoerd te worden van de elektrische installatie door een geaccrediteerd controleorganisme. Deze controle heeft betrekking op :\n' +
  '    o   Het geheel van de hoogspanningsinstallatie, inclusief connectoren, transformatoren, railsystemen, scheidingsschakelaars, beveiligingsschakelaars , enz.…\n' +
  '    o   Het laagspanning hoofdschakelbord, inclusief railsysteem, verdeel- en schakelkasten of verdeel- of schakelborden.\n' +
  '    o   De borden, sturings- en verdeelkasten alsook deze van de machines.\n' +
  '-   Verzekerde dient de gunstige keuringsattesten ter beschikking te houden van  de brandverzekeraar.\n' 
},
{ id: 19, title: 'Preventiemaatregel - Explosieve omgevingen', content:
  '-   Verzekerde dient alle maatregelen te treffen die redelijk geacht worden om te voorkomen dat een explosieve omgeving kan ontstaan op de werkplek. Daartoe dient indien nodig door Verzekerde of een bevoegd persoon een explosieveiligheidsdocument te worden opgesteld.\n' +
  '-   Een zoneringsdossier moet opgesteld worden door een bevoegd studiebureau, ondertekend door Verzekerde en een erkend keuringsorganisme. Na uitvoering van de explosievrije zone dient deze gekeurd te worden door een erkend controleorganisme, naderhand 5-jaarlijks.\n' +
  '-   De elektrische installaties in ATEX-zones dienen jaarlijks gekeurd te worden.\n' +
  '-   Dit betreft een wettelijk eis. Aangezien de beheersing van de explosierisico’s in de praktijk voldoende is, is de situatie voor P&Vgroep/Vivium aanvaardbaar en wordt deze aanbeveling behouden in klasse C\n' +
  '(CODEX afd. X, hdst. 4 en ATEX richtlijnen 114 en 153 , AREI, Boeken 1 en 2, delen. 6 en 7, hfdst 102, ARAB art 52.8.1-8.2-8.3, KB 26/03/2003, KB 28/03/2014)\n' +
  '-   Verzekerde dient de zoneringsstudie en de gunstige keuringsattesten ter beschikking te houden van de brandverzekeraar.\n' 
},
{ id: 20, title: 'Preventiemaatregel – Vuurvergunning', content:
  '-   De procedure “Vuurvergunning“ moet toegepast worden in geval van werken met open vlam, uitgevoerd door derden (snijden, lassen, branden, roofingwerken…)\n' +
  'Een vuurvergunning wordt afgeleverd door de zaakvoerder of diens aangestelde (vb de veiligheidsverantwoordelijke, de preventieadviseur, …).\n' +
  'Het gebruik van de vuurvergunning impliceert dat:\n' +
  '    o   voor aanvang van de werken formeel werd nagegaan of er voldoende preventieve en beschermingsmaatregelen werden genomen teneinde ontstaan en uitbreiding van brand en van explosie te voorkomen\n' +
  '    o   tijdens en na de werken nagegaan moet worden of de toepassing van de vereiste maatregelen worden/werden gerespecteerd.\n' +
  'Formulieren kunnen besteld worden bij ANPI/NVVB, Parc Scientifque, 1348 Ottignies-Louvain La Neuve. Telefoon 010/47.52.42, fax 010/47.52.70, E-mail: publications@anpi.be – www.anpi.be\n' +
  '(KB 28/03/2014)\n' 
},
{ id: 21, title: 'Preventiemaatregel - Brand-en rookdetectie', content:
  '-   Het verzekerde risico dient beveiligd te worden met Brand-en Rookdetectie met doorseining naar een erkende meldkamer. De installatie dient te voldoen aan het ASSURALIA “Reglement van automatische brandmelders” en NBN S21-100-1 en 2 en addenda, 101, 105, 106. en NTN ANPI 162. Plaatser / installateur en installatie dienen ASSURALIA / BOSEC gekeurd en aanvaard te zijn.\n' +
  '-   Doormelding naar een permanent bemande receptie, of naar een inwonende conciërge, of naar een erkende meldkamer.\n' +
  '-   Bij de in-gebruikname moet een goedkeuringsattest conforme uitvoering / attest van goede werking afgeleverd zijn en moet de installatie 3-jaarlijks gekeurd worden door een erkend keuringsorganisme. Jaarlijks moet de installatie onderworpen worden aan nazicht en onderhoud. Dit mag gebeuren door een bevoegd technicus/installateur. Keuringsattest en onderhoudsboekje/stavingsstukken van uitvoering worden bijgehouden en worden ter beschikking gehouden van de brandverzekeraar.\n' +
  '(NBN S 21-100-1)\n' 
},
{ id: 22, title: 'Preventiemaatregel - Brandwerende deuren/ poorten', content:
  '-   Brandwerende deuren dienen de deuropening volledig af te sluiten, en moeten zelfsluitend zijn (voorzien van deurpomp). Deuren mogen enkel in open stand geblokkeerd worden door elektromagnetische contacten gekoppeld aan brand- of rookdetectie.\n' +
  '-   Brandwerende poorten moeten steeds afgesloten zijn tijdens de sluitingsuren. Een brandpoort moet bediend worden door een branddetectiesturing, via rookmelders aan beide kanten van de poort. In geval de poorten niet automatisch sluiten door detectie of een andere vorm van activatie (vb. alarm, smetlood, …) moet erop toegezien worden dat de brandpoorten na de werkuren manueel worden gesloten.\n' +
  'Indien een inbraakalarm aanwezig kan een magneetcontact op elke branddeur en poort signaal geven bij een openstaande deur of poort.\n' +
  '-   De deur- en poortdoorgangen moeten altijd vrij gehouden worden van enig obstakel in de opening die het volledig dichtvallen van de deur of poort zou kunnen beletten.\n' +
  '(NBN EN 1634-1  en NBN EN 13501-1 en -2 : brandclassificatie van bouwproducten)\n' 
},
{ id: 23, title: 'Preventiemaatregel – Luchtcompressoren', content:
  '-\tPersluchtcompressoren bevatten vaak brandbare olie en er bestaat steeds kans op oververhitting door mechanische wrijving.\n' +
  '-\tDaarom dient rondom de compressor een brandvrije zone gevrijwaard te blijven. Deze zone , min. 2 m rondom het toestel, wordt best aangeduid dmv een gele vloerverf of een metalen balustrade.\n' +
  '-\tPersluchtcompressoren vereisen een periodiek onderhoud, op vervallen termijn of draaiuren. Bewijs van uitvoering dit ter beschikking gehouden te worden van de brandverzekeraar.\n'
},
{ id: 24, title: 'Preventiemaatregel - Laswerken/ gebruik lasscherm', content:
  '-\tGezien de brandbare goederen in werkplaats (…) is het noodzakelijk om bij laswerken de nodige voorzorgen te nemen :\n' +
  'o\tVoldoende vrije ruimte (enkele m.) tot de brandbare goederen en gebruik van een lasscherm dat belet dat vonken ongecontroleerd wegvliegen.\n' +
  'o\tBlustoestel en/of branddeken in de onmiddellijke omgeving van de laswerken.\n' +
  'o\tIngeval de werken occasioneel uitgevoerd worden door een derde : gebruik vuurvergunning. Zie clausule desbetreffend.\n' 
},
{ id: 25, title: 'Preventiemaatregel – Koelinstallaties', content:
  '-\tKoelinstallaties zijn best ondergebracht in een technisch lokaal, speciaal daartoe bestemd, brandwerend gecompartimenteerd, REI 60’, voorzien van voldoende verluchting, vlot toegankelijk, netjes en niet in gebruik voor andere doeleinden.\n' +
  '-\tProfessionele koelinstallaties moeten geïnstalleerd zijn/worden en moeten onderhouden zijn/worden door een erkende koeltechnieker/erkend koeltechnisch bedrijf.\n' +
  '(Vlarem II, Titel II, Art. 5.16.3.3 (> 5kW), Hfdst 6.8 (< 5 kW))\n' +
  '-\tHet conformiteits- en keuringsattest moeten ter beschikking blijven voor de Verzekeringsmaatschappij mocht daarom verzocht worden.\n' 
},
{ id: 26, title: 'Preventiemaatregel - Dampkappen (HORECA)', content:
  '-\tWekelijks dienen de (metalen) filters en dampkap gereinigd te worden. Dit kan gebeuren door eigen personeel.\n' +
  '-\tMinstens 1X/jaar dienen afzuigleidingen en afzuigmotoren zeer grondig gereinigd te worden door een gespecialiseerd bedrijf. Deze periodiciteit moet verhoogd worden wanneer dit door intens gebruik noodzakelijk blijkt. Bewijs daarvan is voor te leggen aan de Verzekeraar indien zij daarom verzoekt.\n' 
},
{ id: 27, title: 'Preventiemaatregel - Compartimentering', content:
        '- Volgende lokalen / activiteiten moeten brandwerend gecompartimenteerd worden :\n' +
        '  o Wanden, vloeren, dak- of plafond dienen opgetrokken te zijn in brandwerende materialen (brandklasse A0) met brandweerstand (R)EI 60’.\n' +
        '  o Zelfsluitende branddeur met weerstand EI 30’.\n' +
        '  o Verluchtingsrooster, brandwerend, en zelfsluitend, EI 30’.\n' +
        '  o Veiligheidssignalisaties, eventueel : rookverbod / vonkvrije omgeving.\n' +
        '  o Hoge gebouwen (>25 m) : Wanden (R)EI 120, deuren EI 60 of 2 x EI 30.\n' +
        '     Stookplaats (Building, indien gemeenschappelijke installatie)\n' +
        '     Technische lokalen (Liftmachinekamer, technische ruimte airco, …)\n' +
        '     Afvallokaal\n' +
        '     Opslaglokaal solventen\n' +
        '     Keuken (HORECA)\n' +
        '- Leidingdoorgangen doorheen compartimenterende wanden en/of doorheen brandwerende scheidingen en brandmuren (o.a. voor fluïda, elektriciteit, lucht en gassen, …) en de uitzetvoegen mogen de vereiste weerstand tegen brand van de bouwelementen niet nadelig beïnvloeden. De doorgangen dienen voldoende brandwerend geïsoleerd te worden.\n' +
        '(KB Basisnormen Brandpreventie)\n'
},
{ id: 29, title: 'Preventiemaatregel - Keuken (HORECA)', content:
  '-\tDe keuken moet brandwerend gecompartimenteerd zijn van de gelagzaal en de rest van het gebouw. Scheidende wanden, vloeren en plafonds moeten een brandweerstand hebben van minstens 60’, deuren – die zelfsluitend moeten zijn-, doorgangen, luchtkokers, … hebben een minimale brandweerstand van 30’.\n' +
  '-\tIn geval er geen brandwerende scheiding van de keuken is, moet boven de bakplaten, fornuizen, friteuses, … een vaste automatische blusinstallatie voorzien worden, gekoppeld aan een automatische afsluitkraan op de energietoevoer naar deze toestellen. Deze blusinstallatie moet onderworpen zijn aan een jaarlijks onderhoud.\n' +
  '(KB 12/07/2012, KB 19/12/97>4/4/2003>13/06/2007)\n\n' +
  'OF\n\n' +
  '-\tBoven de bakplaten, fornuizen, friteuses, … moet een vaste automatische blusinstallatie voorzien worden, gekoppeld aan een automatische afsluitkraan op de energietoevoer naar deze toestellen. Deze blusinstallatie moet onderworpen zijn aan een jaarlijks onderhoud.\n\n' +
  '-\tIn geval van gasgestookte toestellen moet in de keuken, of aan de toegangsdeur, voorzien worden in een noodknop, die in geval van nood, manueel de energietoevoer naar alle toestellen afsluit.\n' 
},
{ id: 30, title: 'Preventiemaatregel - Onderhoud en herstellingen', content:
        '- Volgende vastgestelde gebreken aan gebouwen, afwerkingen en/of technische installaties dienen uitgevoerd te worden :<br>' +
        '  o <input type="text" id="defect-1" placeholder="beschrijving…" /> <br>' +
        '  o <input type="text" id="defect-2" placeholder="beschrijving…" /> <br>' +
        '  o <input type="text" id="defect-3" placeholder="beschrijving…" /> <br>' +
        'Opmerking(en): <textarea id="comment-6" rows="2"></textarea>'
},
{
      id: 31,
      title: 'Preventiemaatregel – [Vul titel in]',
      content:
        '<textarea id="free-text-31" rows="4" style="width:100%;" placeholder="Voer hier de tekst in..."></textarea>'
    },


];

// 2) Renderfunctie
window.renderClauses = function(containerId = 'clausesContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  window.clauses.forEach(clause => {
    const div = document.createElement('div');
    div.className = 'clause';
    div.innerHTML = `
      <div class="clause-header">
        <input type="checkbox" id="chk-${clause.id}" />
        <label for="chk-${clause.id}" class="clause-title">${clause.title}</label>
      </div>
      <!-- body standaard verbergen -->
      <div class="clause-body" id="body-${clause.id}" style="display:none; margin:8px 0 16px 24px;">
        ${clause.content}
      </div>
      <div id="details-${clause.id}" class="clause-details clause-content" style="display:none; margin:8px 0 16px 24px;">
        <label>Prioriteit:</label>
        <select id="priority-${clause.id}">
          <option>A</option><option>B</option><option>C</option><option>D</option>
        </select>
        <label style="margin-left:16px;">Termijn:</label>
        <input type="date" id="deadline-${clause.id}" />
        <label style="display:block; margin-top:8px;">Opmerking(en):</label>
        <textarea id="comment-${clause.id}" rows="2" style="width:100%;"></textarea>
      </div>
    `;
    container.appendChild(div);

    const chk     = document.getElementById(`chk-${clause.id}`);
    const body    = document.getElementById(`body-${clause.id}`);
    const details = document.getElementById(`details-${clause.id}`);

    chk.addEventListener('change', () => {
      const displayStyle = chk.checked ? 'block' : 'none';
      body.style.display    = displayStyle;
      details.style.display = displayStyle;
    });
  });
};

// End of script
