if (args.test.isCritical || args.test.isFumble)
  args.test.result.tables.miscast = {
    label : game.i18n.localize("ROLL.MinorMis"),
    class : "fumble-roll",
    key : "minormis",
  }
delete args.test.result.critical;
delete args.test.result.tables.critical;