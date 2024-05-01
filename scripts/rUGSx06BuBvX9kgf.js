if (args.test.result.charging)
{
   args.test.result.damage += 1
   args.test.result.additionalDamage += 1
   if (!args.test.result.resolute) {
      args.test.result.breakdown.damage.other.push({label : this.effect.name, value : this.item.Advances});
      args.test.result.resolute = true // Prevent duplicate messages
     }
}
