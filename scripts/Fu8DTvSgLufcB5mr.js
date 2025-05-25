async function rollTable(characteristics, formula, name) {
  const roll = new Roll(formula);
  await roll.toMessage({flavor: name});

  const values = roll.dice[0].values;

  for (const value of values) {
    let characteristic;
    switch (value) {
      case 1: case 2: characteristic = "ws"; break;
      case 3: case 4: characteristic = "i"; break;
      case 5: case 6: characteristic = "int"; break;
      case 7: case 8: characteristic = "fel"; break;
      case 9: case 10: characteristic = "*"; break;
      default: continue;
    }

    if (characteristics.has(characteristic)) {
      await rollTable(characteristics, "1d10", name);
    } else {
      characteristics.add(characteristic);
    }
  }
}

const characteristics = new Set();
await rollTable(characteristics, "2d10", this.effect.name)

if (characteristics.has("*")) {
  characteristics.delete("*");
  const availableChoices = foundry.utils.duplicate(game.wfrp4e.config.characteristics);

  for (const ch of characteristics) delete availableChoices[ch];

  const result = warhammer.apps.ValueDialog.create({
    text: "Choose a characteristic",
  }, "", availableChoices);

  if (!result) return;

  characteristics.add(result);
}

this.effect.setFlag("wfrp4e", "characteristicsToSwap", Array.from(characteristics));