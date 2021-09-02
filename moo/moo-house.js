
export default function () {

  let config = game.wfrp4e.config


  if (game.settings.get("wfrp4e", "mooDifficulty")) {

    config.difficultyModifiers["veasy"] = 40
    config.difficultyModifiers["easy"] = 30
    config.difficultyModifiers["average"] = 20
    config.difficultyModifiers["challenging"] = 0
    config.difficultyModifiers["difficult"] = -20
    config.difficultyModifiers["hard"] = -30
    config.difficultyModifiers["vhard"] = -40

    config.difficultyLabels["veasy"] = "Very Easy (+40)"
    config.difficultyLabels["easy"] = "Easy (+30)"
    config.difficultyLabels["average"] = "Average (+20)"
    config.difficultyLabels["challenging"] = "Challenging (+0)"
    config.difficultyLabels["difficult"] = "Difficult (-20)"
    config.difficultyLabels["hard"] = "Hard (-30)"
    config.difficultyLabels["vhard"] = "Very Hard (-40)"

    if (config.difficultyModifiers["futile"]) {
      config.difficultyLabels["futile"] = "Futile (-50)"
      config.difficultyModifiers["futile"] = -50

      config.difficultyLabels["impossible"] = "Impossible (-60)"
      config.difficultyModifiers["impossible"] = -60
    }
  }

  if (game.settings.get("wfrp4e", "mooConditions"))
  {
    config.conditionDescriptions["prone"] += "<br><br><b>Moo's House Rule</b>: You are considered one range band farther away when determining ranged attacks."
    config.conditionDescriptions["broken"] = "You are terrified, defeated, panicked, or otherwise convinced you are going to die. On your turn, your Move and Action must be used to run away as fast as possible until you are in a good hiding place beyond the sight of any enemy; then you can use your Action on a Skill that allows you to hide more effectively. You also receive a penalty of –10 to all Tests not involving running and hiding.<br><br>You cannot Test to rally from being Broken if you are Engaged with an enemy. If you are unengaged, at the end of each Round, you may attempt a Cool Test to remove a Broken Condition, with each SL removing an extra Broken Condition, and the Difficulty determined by the circumstances you currently find yourself: it is much easier to rally when hiding behind a barrel down an alleyway far from danger (Average +20) than it is when three steps from a slavering Daemon screaming for your blood (Very Hard –30).<br><br>If you spend a full Round in hiding out of line-of-sight of any enemy, you remove 1 Broken Condition.<br><br><strikethrough>Once all Broken Conditions are removed, gain 1 Fatigued Condition.</strikethrough>"
    config.conditionDescriptions["bleeding"] = "You are bleeding badly. Lose 1 Wound at the end of every Round, ignoring all modifiers. Further, suffer a penalty of –10 to any Tests to resist Festering Wounds, Minor Infection, or Blood Rot. If you reach 0 Wounds, immediately make the Endurance Test to stay standing (with a -10 penalty for each Bleeding Condition), otherwise you fall @Condition[Unconscious], and you must remake this test every time you take damage from Bleeding. If you are at 0 Wounds, regardless of if you are unconscious or not, at the end of Round, you have a 10% chance of dying per Bleeding Condition you have; so, if you had 3 Bleeding Conditions, you would die from blood loss on a roll of 0–30. If a double is scored on this roll, your wound clots a little: lose 1 Bleeding.You cannot regain consciousness until all Bleeding Conditions are removed (see Injury)<br><br>A Bleeding Condition can be removed with: a successful Heal Test, with each SL removing an extra Bleeding Condition; or with any spell or prayer that heals Wounds, with one Condition removed per Wound healed.<br><br>Once all Bleeding Conditions are removed, gain one @Condition[Fatigued] Condition."
  }

  if (game.settings.get("wfrp4e", "mooConditionTriggers"))
  {
    config.statusEffects.forEach(e => {
      if (e.flags.wfrp4e.trigger == "endRound")
        e.flags.wfrp4e.trigger = "endTurn"
    })

    config.conditionDescriptions.bleeding = config.conditionDescriptions.bleeding.replace("Round", "Turn")
    config.conditionDescriptions.bleeding = config.conditionDescriptions.bleeding.replace("Round", "Turn")
    config.conditionDescriptions.poisoned = config.conditionDescriptions.poisoned.replace("Round", "Turn")
    config.conditionDescriptions.ablaze = config.conditionDescriptions.ablaze.replace("Round", "Turn")

  }

  if (game.settings.get("wfrp4e", "mooPenetrating"))
  {
    config.propertyHasValue.penetrating = true
    config.qualityDescriptions.penetrating = "The weapon is highly effective at penetrating armor. It ignores (Rating) AP."
  }

  if (game.settings.get("wfrp4e", "mooQualities"))
  {
    config.weaponQualities.simple = "Simple"
    config.qualityDescriptions.simple = "Simple weapons can be used with Melee (Basic) with no penalty"
    config.propertyHasValue.simple = false

    config.weaponQualities.momentum = "Momentum"
    config.qualityDescriptions.momentum = "These weapons are hefty and require momentum to bring fully to bear. They gain the specified properties when the wielder has Advantage"
    config.propertyHasValue.momentum = true
  }

  if (game.settings.get("wfrp4e", "mooHomebrewItemChanges"))
  {
    fetch("systems/wfrp4e/moo/items.json").then(r => r.json()).then(async records => {
      for (let id in records)
      {
        let data = records[id]
        try {
          let item = await fromUuid(id)
          if (item)
          {
            item.data.update(data)
            game.wfrp4e.utility.logHomebrew("mooHomebrewItemChanges: " + id + ` (${item.name})`)
          }
        }
        catch {
          game.wfrp4e.utility.log("Could not find item " + id)
        }
      }
      game.wfrp4e.utility.log("Compendium changes will revert if homebrew items is deactivated and the game is refreshed")
    })
    if (game.user.isGM)
    {
      ui.notifications.notify("Homebrew item changes have been applied to the compendium. See console for details.")
    }
  }

}
