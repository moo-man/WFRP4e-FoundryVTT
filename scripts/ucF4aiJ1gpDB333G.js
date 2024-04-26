if (args.test.options.catfall && (args.test.result.roll <= game.settings.get("wfrp4e", "automaticSuccess") || args.test.result.roll <= args.test.target) && !args.test.result.catfall)
{
   args.test.result.other.push(`<b>${this.effect.name}</b>: Fall distance damage reduced by ${Number(args.test.result.SL) + 1} yards`)
   args.test.result.catfall = true; // Prevent duplicate messages
}