let data = this.effect.getFlag("wfrp4e", "handOfGlory");
let changes = [];

if (!data)
{
  return;
}

if (data.characteristic == "movement")
{
  changes = [{key: "system.details.move.value", mode: 2, value: 2}]
}
else 
{
  let currentTotal = this.actor.system.characteristics[data.characteristic].value;
  let newTotal = this.actor.system.characteristics[data.characteristic].value + data.roll;
  let bonusOffset = Math.floor(currentTotal / 10) - Math.floor(newTotal / 10); // e.g. 37 + 15 bonus = 52, calculation bonus modifier should be -2

  changes = changes.concat({
    key: `system.characteristics.${data.characteristic}.modifier`,
    mode: 2,
    value: data.roll
  }, 
  {
    key: `system.characteristics.${data.characteristic}.calculationBonusModifier`,
    mode: 2,
    value: bonusOffset
  })
}
  
this.effect.updateSource({changes});