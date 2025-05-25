let SL = 1;

do {
  const signedSL = SL >= 0 ? `+${SL}` : "SL";
  const content = `
  <div>
    <p style="font-weight: bold;">You have accrued ${signedSL} ${SL > 1 ? "SLs" : "SL"}. Do you want to roll d10?</p>
    <p>1–6: add +1 SL</p>
    <p>7–10: lose all accrued SLs and perform next Test at –1 SL</p>
  </div>
`;
  const choice = await foundry.applications.api.DialogV2.confirm({
    yes: {label: "Roll", icon: "fas fa-dice"},
    no: {label: `Keep ${signedSL} SL`, icon: "fas fa-check"},
    content,
  });

  if (!choice) break;

  const roll = new Roll("1d10");
  await roll.toMessage({flavor: this.effect.name});

  if (roll.total >= 7) {
    SL = -1;
    break;
  }

  SL++;
} while (true);

this.effect.setFlag("wfrp4e", "SL", SL);