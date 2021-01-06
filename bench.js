let applyAP = (args.damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_TB || args.damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)
let applyTB = (args.damageType == game.wfrp4e.config.DAMAGE_TYPE.IGNORE_AP || args.damageType == game.wfrp4e.config.DAMAGE_TYPE.NORMAL)


if (applyAP) {
   let AP = args.AP

   args.totalWoundLoss += AP.used
   let apIndex = args.messageElements.findIndex(i => i.includes(game.i18n.localize("AP")))
   args.messageElements[apIndex] = "0/" + AP.value + " " + game.i18n.localize("AP")
}

if (applyTB) {
   let TB = args.actor.data.data.characteristics.t.bonus

   args.totalWoundLoss += TB
   let apIndex = args.messageElements.findIndex(i => i.includes(game.i18n.localize("TB")))
   args.messageElements[apIndex] = "0/" + TB + " " + game.i18n.localize("TB")
}

args.actor.data.items.filter(i => {

   if (i.type == "talent")
      return false
   if (i.type == "skill") 
   {
      i.data.advances.value = 0
      if (i.data.advanced.value == "adv")
         return false
   }
})