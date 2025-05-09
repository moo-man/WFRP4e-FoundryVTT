
export default class WFRP_Audio {
  static PlayContextAudio(context) {
    this.MatchContextAudio(context).then(sound => {
      if (!sound || !sound.file) {
        console.warn("wfrp4e | Sound file not found for context: %o", context)
        return
      }
      warhammer.utility.log(`wfrp4e | Playing Sound: ${sound.file}`)
      AudioHelper.play({ src: sound.file }, sound.global)
    })
    
  }

  static FindContext(test) {
    let context = undefined

    if (test.skill) {
      if (test.skill.name == game.i18n.localize("NAME.ConsumeAlcohol")) {
        context = { item: test.skill, action: "consumeAlcohol" }
        context.outcome = (test.result.roll <= 5 || test.result.roll <= test.result.target) ? "success" : "fail"
      }
      if (test.skill.name == game.i18n.localize("NAME.PickLock")) {
        context = { item: test.skill, action: "pickLock" }
      }
      else if (test.skill.name == game.i18n.localize("NAME.Stealth")) {
        context = { item: test.skill, action: "stealth" }
        context.outcome = (test.result.roll <= 5 || test.result.roll <= test.result.target) ? "success" : "fail"
      }
    }
    if (test.weapon) {
      context = { item: test.weapon, action: "fire" }
      if (test.result.misfire)
        context.action = "misfire"

      if (test.weapon.isRanged && test.failed &&
        (test.weapon.weaponGroup.value === "bow"
          || test.weapon.weaponGroup.value === "crossbow"
          || test.weapon.weaponGroup.value === "blackpowder"
          || test.weapon.weaponGroup.value === "engineering")) {
        let delayedContext = foundry.utils.deepClone(context)
        delayedContext.action = "miss"
        setTimeout((delayedContext) => { this.PlayContextAudio(delayedContext) }, 1000, delayedContext)
      }

      if (test.weapon.weaponGroup == "explosives" || test.weapon.weaponGroup == "throwing")
        context.action = "throw"
    }
    if (test.result.critical && test.weapon && test.weapon.properties.qualities.impale) {
      context = { item: {}, action: "hit", outcome: "crit_impale" }
    }
    if (test.spell) {
        if (test.result.castOutcome == "success"){
        context = { item: test.spell, action: "cast" }
        if (test.spell.damage)
          context.outcome = "damage"
      }

      if (test.result.minormis || test.result.majormis)
        context = { item: test.spell, action: "miscast" }
    }
    if (test.prayer) {
      if (test.result.outcome == "success")
        context = { item: test.prayer, action: "cast" }

      if (test.result.wrath)
        context = { item: test.prayer, action: "miscast" }
    }

    return context
  }



  /** CONTEXTUAL MODEL
   *  context = {
   *      action : equip, cast, lose, gain, etc.
   *      item : item associated with the action
   *      outcome : typcially success or failure, or other specifier, sometimes unused
   *  }
   */

  static async MatchContextAudio(context) {
    if (!game.settings.get("wfrp4e", "soundPath") || !context)
      return {}

    try {
      let files, file, group;
      await foundry.applications.apps.FilePicker.implementation.browse("user", game.settings.get("wfrp4e", "soundPath")).then(resp => {
        files = resp.files
      })
      if (context.action == "hit")
        file = "hit"
      let globalSound = false;
      {
        switch (context.item.type) {
          case "weapon":
            group = context.item.weaponGroup.value
            if (group == "crossbow")
              file = context.action == "equip" ? "weapon_bow" : "weapon_xbow"
            else if (group == "bow")
              file = "weapon_bow"
            else if (group == "fencing" || group == "parry" || group == "twohanded")
              file = context.action == "fire" ? "weapon-" : "weapon_sword"
            else if (group == "flail" && context.action == "fire") {
              file = "weapon_flail-"
              if (context.item.properties.qualities.impact)
                file = "weapon_flail_impact"
            }
            else if (group == "blackpowder" || group == "engineering")
              file = "weapon_gun"
            else if (group == "explosives")
              file = "weapon_bomb"
            else if (group == "throwintg") {
              file = "weapon-"
              if (context.action != "equip") {
                file = "weapon_throw"
                if (context.item.properties.qualities.hack)
                  file = "weapon_axe_throw"
              }
            }
            else if (group == "entangling" && context.action != "swing")
              file = "weapon_entangling"
            else
              file = "weapon-"
            break;
          case "armour":
            if (context.action.includes("equip")) {
              group = context.item.armorType.value;
              file = group.includes("Leather") ? "leather" : group;
            }
            else if (context.action == "hit") {
              group = context.item.type
              file = context.outcome || "";
            }
            break;
          case "trapping":
            file = context.item.trappingType.value.includes("clothing") ? "cloth" : "item";
            break;
          case "spell":
            file = "spell";
            break;
          case "prayer":
            file = "prayer";
            break;
          case "round":
            file = "round";
            globalSound = true;
            break;
          case "skill":
            file = "skill";
            break;
          case "money":
            file = "money";
            break;
          case "shield":
            file = "weapon_shield";
            break;
          case "throw":
            file = "hit_throw-";
            break;
          case "throw_axe":
            file = "hit_throw_axe";
            break;
        }
      }
      if (context.item.special == "warhammer")
        file = "warhammer"
      files = files.filter(f => f.includes(file))

      if (context.item.type == "weapon") {
        globalSound = true;

        if (context.action == "miss")
          files = files.filter(f => f.includes("-miss"))
        else if (context.action == "misfire")
          files = files.filter(f => f.includes("-misfire"))
        else if (context.action == "fire") {
          if (file == "weapon_xbow" || file == "weapon_bow" || file == "weapon_gun" || file.includes("throw"))
            files = files.filter(f => f.includes("-fire"))
          else if (file != "weapon_bomb")
            files = files.filter(f => f.includes("-swing"))
          else
            files = files.filter(f => f.includes("-throw"))
        }
        else if (context.action == "load")
          files = files.filter(f => f.includes("-load"))
        else if (context.action == "damage") {
          globalSound = false;
          files = files.filter(f => f.includes("damage"))
          if (context.outcome == "shield")
            files = files.filter(f => f.includes("shield"))
        }

      }
      if (context.item.type == "shield") {
        files = files.filter(f => f.includes(context.action));
      }
      if (context.action == "equip") {
        if (context.outcome || context.item.type == "weapon") {
          files = files.filter(f => f.includes("-equip"))
        }
        else {
          files = files.filter(f => f.includes("deequip"))
        }
      }
      if (context.action == "hit") {
        files = files.filter(f => f.includes("hit"))
      }

      if (context.item.type == "spell") {
        if (context.action == "memorize")
          files = files.filter(f => f.includes("-memorize"))
        else if (context.action == "unmemorize")
          files = files.filter(f => f.includes("unmemorize"))
        else if (context.action == "cast") {
          if (context.outcome == "damage")
            files = files.filter(f => f.includes("damage-cast"))
          else
            files = files.filter(f => f.includes("-cast") && !f.includes("damage"))
          globalSound = true;
        }
        else {
          files = files.filter(f => f.includes("miscast"))
          globalSound = true;
        }
      }

      if (context.item.type == "prayer") {
        globalSound = true;
        if (context.action == "cast")
          files = files.filter(f => f.includes("-cast"))
        else
          files = files.filter(f => f.includes("miscast"))
      }

      if (context.action == "hit") {
        globalSound = true;
        if (context.outcome == "blocked")
          files = files.filter(f => f.includes(context.item.armourType))
        else if (context.item.type == "armour")
          files = files.filter(f => f.includes("armour"))
        else
          files = files.filter(f => !f.includes("armour")) // all non-armour sounds

        if (context.outcome == "normal")
          files = files.filter(f => f.includes("normal"))

        if (context.outcome == "warhammer")
          files = files.filter(f => f.includes("warhammer"))


        if (context.outcome == "crit")
          files = files.filter(f => f.includes("crit-"))
        if (context.outcome == "crit_impale")
          files = files.filter(f => f.includes("crit_impale"))
      }

      if (context.item.type == "skill") {
        if (context.action == "consumeAlcohol")
          files = files.filter(f => f.includes(`consumeAlcohol-${context.outcome == "fail" ? 'fail' : 'success'}`))
        if (context.action == "stealth")
          files = files.filter(f => f.includes(`stealth-${context.outcome == "fail" ? 'fail' : 'success'}`))
        if (context.action == "pickLock")
          files = files.filter(f => f.includes(context.action))
      }

      return { file: files[(await new Roll(`1d${files.length}-1`).roll({allowInteractive : false})).total], global: globalSound }
    }
    catch (e) {
      warhammer.utility.log("Sound Context Error: " + e, true)
    }
  }
}
