const visor = this.item.getFlag('wfrp4e', 'visor');

if (!visor)
  args.fields.modifier -= 10;
else
  args.fields.modifier -= 20;