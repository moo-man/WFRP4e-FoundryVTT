if (args.test.isCritical || args.test.isFumble)
  args.test.result.tables.miscast = {
    label : game.i18n.localize("ROLL.MajorMis"),
    class : "fumble-roll",
    key : "majormis",
  }
delete args.test.result.critical;
delete args.test.result.tables.critical;