if (args.test.options.useOnesAttractive && (args.test.result.roll <= game.settings.get("wfrp4e", "automaticSuccess") || args.test.result.roll <= args.test.target)) {

   let SL = Math.floor(args.test.target / 10) - Math.floor(args.test.result.roll / 10)
   let ones = Number(args.test.result.roll.toString().split("").pop())

   if (ones == 0) {
      ones = 10;
   }

   if (ones > SL) {
      args.test.data.result.SL = "+" + (ones + args.test.successBonus + args.test.slBonus)
      args.test.result.other.push(`<b>${this.effect.name}</b>: Used unit dice as SL`)
   }
}