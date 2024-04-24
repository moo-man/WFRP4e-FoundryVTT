if (args.test.options.cardsharp && args.test.succeeded)
{

let SL = Math.floor(args.test.target / 10) - Math.floor(args.test.result.roll / 10)
let ones = Number(args.test.result.roll.toString().split("").pop())

if (ones > SL)
   args.test.result.other.push(`<span class="hide-option"><b>${this.effect.name}</b>: ${ones + args.test.successBonus + args.test.slBonus} SL</span>`)
}