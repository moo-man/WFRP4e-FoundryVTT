export default class WFRP_Audio {
  static PlayContextAudio(context) {
    this.MatchContextAudio(context).then(sound => {
      console.log(`wfrp4e | Playing Sound: ${sound.file}`)
      AudioHelper.play({ src: sound.file }, sound.global)
    })
  }

  static FindContext(testResult) {
    let context = undefined

    if (testResult.skill) {
      if (testResult.skill.name == game.i18n.localize("NAME.ConsumeAlcohol")) {
        context = { item: testResult.skill, action: "consumeAlcohol" }
        context.outcome = (testResult.roll <= 5 || testResult.roll <= testResult.target) ? "success" : "fail"
      }
      if (testResult.skill.name == game.i18n.localize("NAME.PickLock")) {
        context = { item: testResult.skill, action: "pickLock" }
      }
      else if (testResult.skill.name == game.i18n.localize("NAME.Stealth")) {
        context = { item: testResult.skill, action: "stealth" }
        context.outcome = (testResult.roll <= 5 || testResult.roll <= testResult.target) ? "success" : "fail"
      }
    }
    if (testResult.weapon) {
      context = { item: testResult.weapon, action: "fire" }
      if (testResult.extra.misfire)
        context.action = "misfire"

      if (testResult.weapon.rangedWeaponType && testResult.roll > testResult.target &&
        (testResult.weapon.data.weaponGroup.value === "bow"
          || testResult.weapon.data.weaponGroup.value === "crossbow"
          || testResult.weapon.data.weaponGroup.value === "blackpowder"
          || testResult.weapon.data.weaponGroup.value === "engineering")) {
        let delayedContext = duplicate(context)
        delayedContext.action = "miss"
        setTimeout((delayedContext) => { this.PlayContextAudio(delayedContext) }, 1000, delayedContext)
      }

      if (testResult.weapon.data.weaponGroup == "explosives" || testResult.weapon.data.weaponGroup == "throwing")
        context.action = "throw"
    }
    if (testResult.extra.critical && testResult.weapon && testResult.weapon.properties.qualities.includes(game.i18n.localize("PROPERTY.Impale"))) {
      context = { item: {}, action: "hit", outcome: "crit_impale" }
    }
    if (testResult.spell) {
      if (testResult.description == game.i18n.localize("ROLL.CastingSuccess")) {
        context = { item: testResult.spell, action: "cast" }
        if (testResult.spell.damage)
          context.outcome = "damage"
      }

      if (testResult.extra.minormis || testResult.extra.majormis)
        context = { item: testResult.spell, action: "miscast" }
    }
    if (testResult.prayer) {
      if (testResult.description == game.i18n.localize("ROLL.PrayGranted"))
        context = { item: testResult.prayer, action: "cast" }

      if (testResult.extra.wrath)
        context = { item: testResult.prayer, action: "miscast" }
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
      let files = ""
      let file, group;
      await FilePicker.browse("user", game.settings.get("wfrp4e", "soundPath")).then(resp => {
        files = resp.files
      })
      if (context.action == "hit")
        file = "hit"
      let globalSound = false;
      {
        switch (context.item.type) {
          case "weapon":
            group = context.item.data.weaponGroup.value
            if (group == "crossbow")
              file = context.action == "equip" ? "weapon_bow" : "weapon_xbow"
            else if (group == "bow")
              file = "weapon_bow"
            else if (group == "fencing" || group == "parry" || group == "twohanded")
              file = context.action == "fire" ? "weapon-" : "weapon_sword"
            else if (group == game.i18n.localize("SPEC.Flail").toLowerCase() && context.action == "fire") {
              file = "weapon_flail-"
              if (context.item.properties.qualities.includes(game.i18n.localize("PROPERTY.Impact")))
                file = "weapon_flail_impact"
            }
            else if ((group == game.i18n.localize("SPEC.Blackpowder").toLowerCase() || group == game.i18n.localize("SPEC.Engineering").toLowerCase()))
              file = "weapon_gun"
            else if ((group == game.i18n.localize("SPEC.Explosives").toLowerCase()))
              file = "weapon_bomb"
            else if ((group == game.i18n.localize("SPEC.Throwing").toLowerCase())) {
              file = "weapon-"
              if (context.action != "equip") {
                file = "weapon_throw"
                if (context.item.properties.qualities.includes(game.i18n.localize("PROPERTY.Hack")))
                  file = "weapon_axe_throw"
              }
            }
            else if (group == game.i18n.localize("SPEC.Entangling").toLowerCase() && context.action != "swing")
              file = "weapon_entangling"
            else
              file = "weapon-"
            break;
          case "armour":
            if (context.action.includes("equip")) {
              group = context.item.data.armorType.value;
              file = group.includes("Leather") ? "leather" : group;
            }
            else if (context.action == "hit") {
              group = context.item.type
              file = context.outcome || "";
            }
            break;
          case "trapping":
            file = context.item.data.trappingType.value.includes("clothing") ? "cloth" : "item";
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

      return { file: files[new Roll(`1d${files.length}-1`).roll().total], global: globalSound }
    }
    catch (e) {
      console.log("wfrp4e | Sound Context Error: " + e)
    }
  }
}