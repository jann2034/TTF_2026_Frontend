import fs from "node:fs";
// A schematic fallback only. Venue coordinates and the online map use WGS84.
let blocks = "";
for (let y = 20; y < 1200; y += 115)
  for (let x = 20; x < 1600; x += 145) {
    if (x > 570 && x < 760) continue;
    blocks += `<rect x="${x}" y="${y}" width="105" height="75" rx="5" fill="${(x + y) % 3 ? "#e4e7e5" : "#e8e4da"}" stroke="#d5dbd8" stroke-width="2"/>`;
  }
fs.writeFileSync(
  "public/demo-map.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200"><rect width="1600" height="1200" fill="#f4f5f1"/>${blocks}<path d="M-80 350 Q450 200 600 450 T1700 650" fill="none" stroke="#b6d6dd" stroke-width="42"/><path d="M650-50 630 1300 M-50 750 1700 350 M250-50 450 1300 M-20 1050 1650 920" fill="none" stroke="#cdd5d7" stroke-width="35"/><path d="M650-50 630 1300 M-50 750 1700 350 M250-50 450 1300 M-20 1050 1650 920" fill="none" stroke="white" stroke-width="25"/><rect x="200" y="700" width="190" height="230" rx="55" fill="#dce8d7"/><path d="m235 730 120 160m-115-40 110-85" stroke="#f5f6ed" stroke-width="10"/><g fill="#8d999e" font-family="Arial,sans-serif" font-size="21"><text x="720" y="490" transform="rotate(-14 720 490)">Kirchenstraße</text><text x="670" y="860" transform="rotate(-89 670 860)">Pflanzmannstraße</text><text x="850" y="330">Alterbachstraße</text><text x="225" y="830" font-size="15" fill="#8aa180">Riverside Park</text><text x="1050" y="1000" font-size="13" letter-spacing="5">SALZBURG</text></g></svg>`,
);
