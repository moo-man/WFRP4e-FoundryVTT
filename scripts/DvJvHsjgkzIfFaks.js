if (!args.test.preData.options?.runeOfParrying) return
if (!this.item.equipped.value || !args.test.item) return;
args.test.preData.canReverse = true