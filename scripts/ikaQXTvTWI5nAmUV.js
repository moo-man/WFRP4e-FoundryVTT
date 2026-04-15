const excessSL = this.effect.sourceTest.result.baseSL - this.effect.sourceItem.system.sl;
let slToSpend = excessSL;

let levels = 0;
let duration = 0;

while (slToSpend > 0) {
  let content = `<p>You achieved ${excessSL} and you still have ${slToSpend} SL to spend on enhancing your Sword Dance.</p>`;
  content += `<p>So far you selected ${levels} additional levels in War Leader and +${duration} Rounds of duration.</p>`;
  await foundry.applications.api.DialogV2.confirm({
    yes: {label: "Additional War Leader", icon: "fas fa-person", callback: () => levels++},
    no: {label: "+1 Round Duration", icon: "fas fa-clock", callback: () => duration++},
    content,
  });

  slToSpend--;
}

await this.actor.addEffectItems("Compendium.wfrp4e-core.items.Item.vCgEAetBMngR53aT", this.effect, {"system.advances.value": 1 + levels});
await this.effect.update({duration:{rounds: this.actor.system.characteristics.wp.bonus + duration}});