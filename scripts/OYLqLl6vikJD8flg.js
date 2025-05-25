const crowd = this.effect.getFlag("wfrp4e", "crowd") ?? 0;
const bonus = 2 + Math.floor(crowd * 0.1);

args.fields.slBonus += bonus ;