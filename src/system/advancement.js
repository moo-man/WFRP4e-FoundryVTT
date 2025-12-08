import WFRP_Utility from "./utility-wfrp4e";

export default class Advancement
{
    actor = null;

    constructor(actor, career)
    {
        this.actor = actor;
        this.career = career
    }


    //#region Utility Functions

    
      /**
  * Checks that the selected advancement can be afforded by the actor
  *
  * @param {Integer} total: the xp total for the actor
  * @param {Integer} spent: the spent xp plus cost
  * @param {String} action: the action, buy or improve for example
  * @param {String} item: the title of the skill, talent or characteristic
  */
  static checkValidAdvancement(total, spent, action, item) {
    if(total - spent < 0) {
       throw new Error(game.i18n.format("ACTOR.AdvancementError", { action: action, item: item }));
    }
  }

     /**
   * Looks up advancement cost based on current advancement and type.
   *
   * @param {Number} currentAdvances   Number of advances currently
   * @param {String} type              "characteristic" or "skill"
   * @param {Number} modifier          Cost modifier per advancement
   */
  static calculateAdvCost(currentAdvances, type, modifier = 0) {
    let index = Math.floor(currentAdvances / 5);
    index = index < 0 ? 0 : index; // min 0

    if (index >= game.wfrp4e.config.xpCost[type].length)
      return game.wfrp4e.config.xpCost[type][game.wfrp4e.config.xpCost[type].length - 1] + modifier;
    return game.wfrp4e.config.xpCost[type][index] + modifier;
  }

  /**
   * Looks up a bulk advancement cost based on current advancement and type.
   *
   * @param {Number} start        Number of current advances
   * @param {Number} end          Target number of advances
   * @param {String} type         "characteristic" or "skill"
   * @param {Number} modifier     Cost modifier of the skill
   */
  static calculateAdvRangeCost(start, end, type, modifier = 0) {
    let cost = 0

    let multiplier = 1

    // If reverse advance, multiply by -1 to grant XP back
    if (end < start) {
      multiplier = -1
      let temp = end
      end = start
      start = temp;
    }

    while (start < end) {
      cost += this.calculateAdvCost(start, type, modifier)
      start++;
    }
    return cost * multiplier
  }

  static advancementDialog(item, advances, type, actor)
  {
    let start = item instanceof Item ? item.advances.value : actor.system.characteristics[item].advances
    let end = advances;
    let name = item instanceof Item ? item.name : game.wfrp4e.config.characteristics[item]

    let career = false;
    try 
    {

      if (item instanceof Item)
      {
        let currentCareer = actor.currentCareer
        if (currentCareer.system.skills.concat(currentCareer.system.addedSkills).find(i => i == item.name))
        {
          career = true;
        }
      }
      else 
      {
        career = actor.system.characteristics[item].career
      }
    }
    catch(e)
    {
      career = false;
    }
    return new Promise(resolve => {
      let xp = this.calculateAdvRangeCost(start, end, type, item.advances?.costModifier)
      if (!career)
      {
        xp *= 2;
      }
      if (xp) {
        new foundry.applications.api.DialogV2({
          window : { title: game.i18n.localize("DIALOG.Advancement")},
          content: 
          `
          <p>${game.i18n.localize("DIALOG.AdvancementContent")}</p>
          <div class="form-group">
          <input type="number" name="xp" value=${xp}>
          </div>
          `,
          buttons: [
            {action : "ok",
              label: game.i18n.localize("Ok"),
              callback: async (ev, button) => {
                xp = parseInt(button.form.elements.xp.value) || xp;
                if (xp != 0)
                {
                  try {

                    let newSpent = actor.details.experience.spent + xp
                    this.checkValidAdvancement(actor.details.experience.total, newSpent, game.i18n.localize("ACTOR.ErrorImprove"), name);
                    let log = actor.system.addToExpLog(xp, `${name} (${end-start})`, newSpent)
                    actor.update({ "system.details.experience.spent": newSpent, "system.details.experience.log": log })
                    resolve(true)
                  }
                  catch (e)
                  {
                    ui.notifications.error(e)
                    resolve(false)
                  }
                }
              }
            },
            {
              action : "free",
              label: game.i18n.localize("Free"),
              callback: () => {
                  let newSpent = actor.details.experience.spent
                  let log = actor.system.addToExpLog(0, `${name} (${end-start})`, newSpent)
                  actor.update({ "system.details.experience.spent": newSpent, "system.details.experience.log": log })
                  resolve(true) 
                }
            }],
          close : () => {resolve(false)}
        }).render(true)
      }
      else resolve(true)
    })
  }

  static async memorizeCostDialog(spell, actor) {
    let xp = this.calculateSpellCost(spell, actor)
    if (xp) {
        return await foundry.applications.api.DialogV2.wait({
          window : {title: game.i18n.localize("DIALOG.MemorizeSpell")},
          content: `<p>${game.i18n.format("DIALOG.MemorizeSpellContent", { xp })}</p>`,
          buttons: [
            {
              action : "ok",
              label: game.i18n.localize("Ok"),
              callback: () => {
                let newSpent = actor.details.experience.spent + xp
                let log = actor.system.addToExpLog(xp, game.i18n.format("LOG.MemorizedSpell", { name: spell.name }), newSpent)
                actor.update({ "system.details.experience.spent": newSpent, "system.details.experience.log": log })
              }
            },
            {
              action : "free",
              label: game.i18n.localize("Free"),
              callback: () => { 
                let newSpent = actor.details.experience.spent;
                let log = actor.system.addToExpLog(0, game.i18n.format("LOG.MemorizedSpell", { name: spell.name }), newSpent)
                actor.update({ "system.details.experience.spent": newSpent, "system.details.experience.log": log })
              }
            }
          ],
        })
    }
  }


  
  static async miracleGainedDialog(miracle, actor)
  {
    let xp = 100 * (actor.itemTags["prayer"].filter(p => p.prayerType.value == "miracle").length)
    if (xp) {
      return await foundry.applications.api.DialogV2.wait({
        window : {title: game.i18n.localize("DIALOG.GainPrayer")},
        content: `<p>${game.i18n.format("DIALOG.GainPrayerContent", { xp })}</p>`,
        buttons: [
          {
            action : "ok",
            label: game.i18n.localize("Ok"),
            callback: () => {
              let newSpent = actor.details.experience.spent + xp
              let log = actor.system.addToExpLog(xp, game.i18n.format("LOG.GainPrayer", { name: miracle.name }), newSpent)
              actor.update({ "system.details.experience.spent": newSpent, "system.details.experience.log": log })
            }
          },
          {
            action : "free",
            label: game.i18n.localize("Free"),
            callback: () => { }
          }
        ]
      })
    }
  }

  static calculateSpellCost(spell, actor)
  {
    let cost = 0
    let bonus = 0
    let currentlyKnown = 0

    if (spell.system.ritual.value)
    {
      return spell.system.ritual.xp;
    }


    if (["slaanesh", "tzeentch", "nurgle"].includes(spell.lore.value))
      return 0

    if (spell.lore.value == "petty" || spell.lore.value == game.i18n.localize("WFRP4E.MagicLores.petty"))
      bonus = actor.characteristics.wp.bonus
    else 
      bonus = actor.characteristics.int.bonus

    if (spell.lore.value != "petty" && spell.lore.value != game.i18n.localize("WFRP4E.MagicLores.petty"))
    {
      currentlyKnown = actor.itemTags["spell"].filter(i => i.lore.value == spell.lore.value && i.memorized.value).length;
    }
    else if (spell.lore.value == "petty" || spell.lore.value == game.i18n.localize("WFRP4E.MagicLores.petty"))
    {
      currentlyKnown = actor.itemTags["spell"].filter(i => i.lore.value == spell.lore.value).length;
      if (currentlyKnown < bonus)
        return 0 // First WPB petty spells are free
    }

    let costKey = currentlyKnown
    if (spell.lore.value != "petty" && spell.lore.value != game.i18n.localize("WFRP4E.MagicLores.petty"))
      costKey-- // Not sure if this is right, but arcane and petty seem to scale different per th example given

    cost = Math.ceil(Math.max(1, costKey) / bonus) * 100

    if (spell.lore.value == "petty" || spell.lore.value == game.i18n.localize("WFRP4E.MagicLores.petty")) cost *= 0.5 // Petty costs 50 each instead of 100

    return cost
  }
  //#endregion


    //#region Auto Advancement
    /* --------------------------------------------------------------------------------------------------------- */
  /* -------------------------------------- Auto-Advancement Functions --------------------------------------- */
  /* --------------------------------------------------------------------------------------------------------- */
  /**
   * These functions are primarily for NPCs and Creatures and their automatic advancement capabilities. 
   *
  /* --------------------------------------------------------------------------------------------------------- */



    /**
   * Advance NPC based on given career
   * 
   * A specialized function used by NPC type Actors that triggers when you click on a 
   * career to be "complete". This takes all the career data and uses it (and the helpers
   * defined above) to advance the actor accordingly. It adds all skills (advanced to the 
   * correct amount to be considered complete), advances all characteristics similarly, and 
   * adds all talents.
   * 
   * Note: This adds *all* skills and talents, which is not necessary to be considered complete.
   * However, I find deleting the ones you don't want to be much easier than trying to pick and 
   * choose the ones you do want.
   *
   */
    async advance() {
        let updateObj = {items : []};
        let advancesNeeded = this.career.system.level.value * 5; // Tier 1 needs 5, 2 needs 10, 3 needs 15, 4 needs 20 in all characteristics and skills
      
        // Update all necessary characteristics to the advancesNeeded
        for (let advChar of Object.keys(this.career.system.characteristics).filter(i => this.career.system.characteristics[i]))
          if (this.actor.system.characteristics[advChar].advances < 5 * this.career.system.level.value)
            updateObj[`system.characteristics.${advChar}.advances`] = 5 * this.career.system.level.value;
    
        // Advance all skills in the career
        for (let skill of this.career.system.skills)
          updateObj.items.push(await this._advanceSkill(skill, advancesNeeded));
    
        // Add all talents in the career
        for (let talent of this.career.system.talents)
          updateObj.items.push(await this._advanceTalent(talent));
    
        ui.notifications.notify(`Advancing ${this.career.name} Characteristics, Skills, and Talents...`)
        this.actor.update(updateObj);
      }

    async advanceSpeciesCharacteristics()
    {

      let species = this.actor.details.species.value;
      let subspecies = this.actor.details.species.subspecies;
         
      let creatureMethod = false;
      let characteristics = this.actor.toObject().system.characteristics;
      if (this.actor.type == "creature" || !species) creatureMethod = true;

      if (!creatureMethod) 
      {
        let averageCharacteristics = await WFRP_Utility.speciesCharacteristics(species, true, subspecies);
        for (let char in characteristics) 
        {
          if (characteristics[char].initial != averageCharacteristics[char].value) creatureMethod = true
        }
      }
      if (!creatureMethod) 
      {
        let rolledCharacteristics = await WFRP_Utility.speciesCharacteristics(species, false, subspecies);
        for (let char in rolledCharacteristics) 
        {
          characteristics[char].initial = rolledCharacteristics[char].value
        }
        await this.actor.update({ "system.characteristics": characteristics })
      }
      else if (creatureMethod) 
      {
        let roll = new Roll("2d10");
        await roll.roll({allowInteractive : false});
        let characteristics = this.actor.toObject().system.characteristics;
        for (let char in characteristics) 
        {
          if (characteristics[char].initial == 0)
            continue
          characteristics[char].modifier = -10;
          characteristics[char].modifier += (await roll.reroll()).total;
        }
        await this.actor.update({ "system.characteristics": characteristics })
      }
      return
    }

  /**
   * Advances an actor's skills based on their species and character creation rules
   * 
    * Per character creation, 3 skills from your species list are advanced by 5, and 3 more are advanced by 3.
    * This functions uses the Foundry Roll class to randomly select skills from the list (defined in config.js)
    * and advance the first 3 selected by 5, and the second 3 selected by 3. This function uses the advanceSkill()
    * helper defined below.
   */
  async advanceSpeciesSkills() {
    let skillList

    // A species may not be entered in the actor, so use some error handling.
    try {
      let { skills } = game.wfrp4e.utility.speciesSkillsTalents(this.actor.system.details.species.value, this.actor.system.details.species.subspecies)
      skillList = skills
      if (!skillList) {
        throw game.i18n.localize("ErrorSpeciesSkills") + " " + this.actor.system.details.species.value;
      }
    }
    catch (error) {
      ui.notifications.info(`${game.i18n.format("ERROR.Species", { name: this.actor.system.details.species.value })}`)
      warhammer.utility.log("Could not find species " + this.actor.system.details.species.value + ": " + error, true);
      throw error
    }
    // The Roll class used to randomly select skills
    let skillSelector = new Roll(`1d${skillList.length}- 1`);
    await skillSelector.roll({allowInteractive : false})

    // Store selected skills
    let skillsSelected = [];
    while (skillsSelected.length < 6) {
      skillSelector = await skillSelector.reroll()
      if (!skillsSelected.includes(skillSelector.total)) // Do not push duplicates
        skillsSelected.push(skillSelector.total);
    }

    let skills = [];
    // Advance the first 3 by 5, advance the second 3 by 3.
    for (let skillIndex = 0; skillIndex < skillsSelected.length; skillIndex++) {
      if (skillIndex <= 2)
        skills.push(await this._advanceSkill(skillList[skillsSelected[skillIndex]], 5))
      else
        skills.push(await this._advanceSkill(skillList[skillsSelected[skillIndex]], 3))
    }
    this.actor.update({items : skills});
  }


  /**
   * Advances an actor's talents based on their species and character creation rules
   * 
   * Character creation rules for talents state that you get all talents in your species, but there
   * are a few where you must choose between two instead. See config.js for how the species talent 
   * object is set up for support in this. Basically species talents are an array of strings, however
   * ones that offer a choice is formatted as "<talent1>, <talent2>", each talent being a choice. Finally,
   * the last element of the talent list is a number denoting the number of random talents. This function uses
   * the advanceTalent() helper defined below.
   */
  async advanceSpeciesTalents() {
    // A species may not be entered in the actor, so use some error handling.
    let talentList
    try {
      let { talents } = game.wfrp4e.utility.speciesSkillsTalents(this.actor.system.details.species.value, this.actor.system.details.species.subspecies)
      talentList = talents
      if (!talentList) {
      }
    }
    catch (error) {
      ui.notifications.info(`${game.i18n.format("ERROR.Species", { name: this.actor.system.details.species.value })}`)
      warhammer.utility.log("Could not find species " + this.actor.system.details.species.value + ": " + error, true);
      throw error
    }
    let talentSelector;
    let talentsToAdd = [];
    for (let talent of talentList) {
      if (!isNaN(talent)) // If is a number, roll on random talents
      {
        for (let i = 0; i < talent; i++) {
          let result = await game.wfrp4e.tables.rollTable("talents")
          talentsToAdd.push(await this._advanceTalent(result.object.name));
        }
        continue
      }
      // If there is a comma, talent.split() will yield an array of length > 1
      let talentOptions = talent.split(',').map(function (item) {
        return item.trim();
      });

      // Randomly choose a talent option and advance it.
      if (talentOptions.length > 1) {
        talentSelector = await new Roll(`1d${talentOptions.length} - 1`).roll({allowInteractive : false})
        talentsToAdd.push(await this._advanceTalent(talentOptions[talentSelector.total]));
      }
      else // If no option, simply advance the talent.
      {
        talentsToAdd.push(await this._advanceTalent(talent));
      }
    }

    this.actor.createEmbeddedDocuments("Item", talentsToAdd);

  }


  /**
   * Adds (if needed) and advances a skill by the specified amount.
   * 
   * As the name suggests, this function advances any given skill, if 
   * the actor does not currently have that skill, it will be added 
   * from the compendium and advanced. Note that this function is neither
   * used by manually advancing skills nor when clicking on advancement 
   * indicators. This will simply add the advancement value with no
   * other processing.
   * 
   * @param {String} skillName    Name of the skill to advance/add
   * @param {Number} advances     Advances to add to the skill
   */
  async _advanceSkill(skillName, advances) {
    // Look through items and determine if the actor has the skill
    let existingSkill = this.actor.has(skillName, "skill")
    // If so, simply update the skill with the new advancement value. 
    if (existingSkill) {
      existingSkill = existingSkill.toObject();
      existingSkill.system.advances.value = (existingSkill.system.advances.value < advances) ? advances : existingSkill.system.advances.value;
      return existingSkill;
    }

    // If the actor does not already own skill, search through compendium and add it
    try {
      // See findSkill() for a detailed explanation of how it works
      // Advanced find function, returns the skill the user expects it to return, even with skills not included in the compendium (Lore (whatever))
      let skillToAdd = (await game.wfrp4e.utility.findSkill(skillName)).toObject()
      skillToAdd.system.advances.value = advances;
      return skillToAdd;
    }
    catch (error) {
      console.error("Something went wrong when adding skill " + skillName + ": " + error);
      ui.notifications.error(game.i18n.format("CAREER.AddSkillError", { skill: skillName, error: error }));
    }
  }

  /**
   * Adds the given talent to the actor
   * 
   * In my implementation, adding a talent is the same as advancing a talent. See
   * prepareTalent() and you'll see that the total number of any given talent is the
   * advencement value.
   * 
   * @param {String} talentName     Name of the talent to add/advance.
   */
  async _advanceTalent(talentName) {
    try {
      // See findTalent() for a detailed explanation of how it works
      // Advanced find function, returns the Talent the user expects it to return, even with Talents not included in the compendium (Etiquette (whatever))
      let talent = await game.wfrp4e.utility.findTalent(talentName);
      return talent.toObject();
    }
    catch (error) {
      console.error("Something went wrong when adding talent " + talentName + ": " + error);
      ui.notifications.error(game.i18n.format("CAREER.AddTalentError", { talent: talentName, error: error }));
    }
  }

  //#endregion
}
