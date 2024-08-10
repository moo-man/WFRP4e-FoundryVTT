if (args.attackerTest.data.preData.rollClass !== "CharacteristicTest") return;
if (args.attackerTest.data.preData.characteristic !== "s") return;

const SL = args.opposedTest.data.opposeResult.differenceSL;

const targetId = this.effect.getFlag("wfrp4e", "target");
const target = canvas.scene.tokens.get(targetId);

if (SL > 4) {
  args.opposedTest.data.opposeResult.other.push(`<b>${args.defenderTest.actor.name}</b> was forced to let go of <b>${target.name}</b>.`);
  return await this.effect.delete();
}

if (SL > 0) {
  args.opposedTest.data.opposeResult.other.push(`<b>${args.defenderTest.actor.name}</b> was prevented from squeezing <b>${target.name}</b> for one turn.`);
  let turns = this.effect.getFlag("wfrp4e", "turns");
  this.effect.setFlag("wfrp4e", "turns", turns + 1);
}