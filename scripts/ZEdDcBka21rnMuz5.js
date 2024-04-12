let initiativeSetting = game.settings.get("wfrp4e", "initiativeRule")

switch (initiativeSetting) {
  case "default":
    args.initiative += "+10"
    break;

  case "sl":
    args.initiative += "+1"
    break;

  case "d10Init":
    args.initiative += "+10"
    break;

  case "d10InitAgi":
    args.initiative += "+1"
    break;
}