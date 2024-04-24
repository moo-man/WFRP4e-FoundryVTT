args.item.system.qualities.value.push({name : "magical"});
args.item.system.damage.value += ` + ${parseInt(this.effect.sourceTest.result.SL)}`;
args.item.name += ` (${this.effect.name})`