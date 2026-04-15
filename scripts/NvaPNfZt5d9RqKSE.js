if (args.test.isCritical) {
  args.test.result.tables.critical.modifier 
    = (typeof args.test.result.tables.critical.modifier ==='undefined') 
    ? 20 
    : args.test.result.tables.critical.modifier + 20
}