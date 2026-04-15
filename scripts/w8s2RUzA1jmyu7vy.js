if (args.test.isCritical && args.test.weapon.weaponGroup.value == "crossbow") {
  args.test.result.tables.critical.modifier 
    = (typeof args.test.result.tables.critical.modifier ==='undefined') 
    ? 10 
    : args.test.result.tables.critical.modifier + 10
}