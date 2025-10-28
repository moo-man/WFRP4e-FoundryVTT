if (args.test.isFumble && args.test.options.supercharge) {
  args.test.result.tables.misfire = {
        label : "Misfire (Supercharged)",
        class : "fumble-roll",
        modifier : 0,
        key : "artillery-misfires"
      }  
}