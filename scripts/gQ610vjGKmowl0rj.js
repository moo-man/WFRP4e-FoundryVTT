let data = this.effect.getFlag("wfrp4e", "handOfGlory");
let changes = [];

if (!data)
{
  return;
}

for(let characteristic of ["ws", "bs", "s", "t", "i", "ag"])
{

  let currentTotal = this.actor.system.characteristics[characteristic].value;
  let newTotal = this.actor.system.characteristics[characteristic].value + data.roll;
  let bonusOffset = Math.floor(currentTotal / 10) - Math.floor(newTotal / 10); // e.g. 37 + 15 bonus = 52, calculation bonus modifier should be -2

  changes = changes.concat({
    key: `system.characteristics.${characteristic}.modifier`,
    mode: 2,
    value: data.roll
  }, 
  {
    key: `system.characteristics.${characteristic}.calculationBonusModifier`,
    mode: 2,
    value: bonusOffset
  })
}

changes.push({key: "system.details.move.value", mode: 2, value: 2});

  
this.effect.updateSource({changes});