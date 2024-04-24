if (args.test.result.critical && args.test.result.critical != "Total Power")
{
   args.test.result.other.push(`<a class ="table-click critical-roll" data-modifier="20" data-table = "crit${args.test.result.hitloc.result}"><i class="fas fa-list"></i> Bonecrusher Critical (+20)</a> (only if Critical Cast selected)`)
}