import Advancement from "../../system/advancement.js";
import WFRP_Utility from "../../system/utility-wfrp4e.js";
import ActorSheetWFRP4e from "./actor-sheet.js";

/**
 * Provides the specific interaction handlers for Character Sheets.
 *
 * ActorSheetWFRP4eCharacter are assigned to character type actors, and the specific interactions
 * character type actors need are defined here, specifically for careers and spending exp.
 * 
 */
export default class ActorSheetWFRP4eCharacter extends ActorSheetWFRP4e {
  static get defaultOptions() {
    const options = super.defaultOptions;
    foundry.utils.mergeObject(options,
      {
        classes: options.classes.concat(["wfrp4e", "actor", "character-sheet"]),
        width: 610,
        height: 740,
      });
    return options;
  }

  advancementSemaphore = new Semaphore();

  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    if (!game.user.isGM && this.actor.limited) return "systems/wfrp4e/templates/actors/actor-limited.hbs";
    return "systems/wfrp4e/templates/actors/character/character-sheet.hbs";

  }

   /**
   * Provides the data to the template when rendering the actor sheet
   * 
   * This is called when rendering the sheet, where it calls the base actor class
   * to organize, process, and prepare all actor data for display. See ActorWFRP4e.prepare()
   * 
   * @returns {Object} sheetData    Data given to the template when rendering
   */
  async getData() {
    const sheetData = await super.getData();

    this.addCharacterData(sheetData);

    return sheetData;
  }

  addCharacterData(sheetData) {

    sheetData.career = {
      untrainedSkills: [],
      untrainedTalents: [],
      currentClass: "",
      currentCareer: "",
      currentCareerGroup: "",
      status: "",
      hasCurrentCareer: false
    }

    // For each career, find the current one, and set the details accordingly (top of the character sheet)
    // Additionally, set available characteristics, skills, and talents to advance (advancement indicator)
    for (let career of sheetData.actor.itemTags["career"]) {
      if (career.current.value) {
        sheetData.career.hasCurrentCareer = true; // Used to remove indicators if no current career

        // Setup Character detail values
        sheetData.career.currentClass = career.class.value;
        sheetData.career.currentCareer = career.name;
        sheetData.career.currentCareerGroup = career.careergroup.value;

        if (!sheetData.actor.details.status.value) // backwards compatible with moving this to the career change handler
          sheetData.career.status = game.wfrp4e.config.statusTiers[career.status.tier] + " " + career.status.standing;

        // Setup advancement indicators for characteristics
        let availableCharacteristics = career.system.characteristics
        for (let char in sheetData.system.characteristics) {
          if (availableCharacteristics[char]) {
            sheetData.system.characteristics[char].career = true;
            if (sheetData.system.characteristics[char].advances >= career.level.value * 5) {
              sheetData.system.characteristics[char].complete = true;
            }
          }
        }

        // Find skills that have been trained or haven't, add advancement indicators or greyed out options (untrainedSkills)
        for (let sk of career.skills.concat(career.system.addedSkills)) {
          let trainedSkill = sheetData.actor.itemTags["skill"].find(s => s.name.toLowerCase() == sk.toLowerCase())
          if (trainedSkill) 
            trainedSkill.system.addCareerData(career)
          else 
            sheetData.career.untrainedSkills.push(sk);
          
        }

        // Find talents that have been trained or haven't, add advancement button or greyed out options (untrainedTalents)
        for (let talent of career.talents) {
          let trainedTalent = sheetData.actor.itemTags["talent"].find(t => t.name == talent)
          if (trainedTalent) 
            trainedTalent.system.addCareerData(career)
          else 
            sheetData.career.untrainedTalents.push(talent);
          
        }
      }
    }

    sheetData.system.details.experience.log.forEach((entry, i) => { entry.index = i })
    sheetData.experienceLog = this._condenseXPLog(sheetData);

    sheetData.system.details.experience.canEdit = game.user.isGM || game.settings.get("wfrp4e", "playerExperienceEditing")
  }



  
  _condenseXPLog(sheetData) {
    let condensed= []
    for (
      let logIndex = 0, lastPushed, lastPushedCounter = 0;
      logIndex < sheetData.system.details.experience.log.length;
      logIndex++) {
      let condense = false;
      if ( // If last pushed exists, and is the same, type, same reason, and both are positiev or both are negative
        lastPushed &&
        lastPushed.type == sheetData.system.details.experience.log[logIndex].type &&
        lastPushed.reason == sheetData.system.details.experience.log[logIndex].reason &&
        ((lastPushed.amount >= 0 && sheetData.system.details.experience.log[logIndex].amount >= 0)
          || (lastPushed.amount <= 0 && sheetData.system.details.experience.log[logIndex].amount <= 0))) { condense = true; }

      if (condense) {
        lastPushed[lastPushed.type] = sheetData.system.details.experience.log[logIndex][lastPushed.type]
        lastPushed.amount += sheetData.system.details.experience.log[logIndex].amount
        lastPushed.index = sheetData.system.details.experience.log[logIndex].index
        lastPushed.spent = sheetData.system.details.experience.log[logIndex].spent
        lastPushed.total = sheetData.system.details.experience.log[logIndex].total
        lastPushed.counter++
      }
      else {
        lastPushed = foundry.utils.duplicate(sheetData.system.details.experience.log[logIndex]);
        lastPushed.counter = 1;
        condensed.push(lastPushed)
        lastPushedCounter = 0;

      }
    }
    for (let log of condensed) {
      if (log.counter && log.counter > 1)
        log.reason += ` (${log.counter})`
    }
    return condensed.reverse()
  }


  /* --------------------------------------------------------------------------------------------------------- */
  /* ------------------------------------ Event Listeners and Handlers --------------------------------------- */
  /* --------------------------------------------------------------------------------------------------------- */
  /**
   * This list of event handlers is focused on character interactions, such has spending exp and handling careers.
   * 
   *
  /* --------------------------------------------------------------------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html);

    // Career toggle click (current or complete)
    html.find('.career-toggle').click(this._onToggleCareer.bind(this));
    html.find(".add-career").click(ev => {new game.wfrp4e.apps.CareerSelector(this.actor).render(true)});
    html.find(".untrained-skill").mousedown(this._onUntrainedSkillClick.bind(this));
    html.find(".untrained-talent").mousedown(this._onUntrainedTalentClick.bind(this));
    html.find('.advancement-indicator').mousedown((ev) => this.advancementSemaphore.add(this._onAdvancementClick.bind(this), ev));
    html.find('.exp-delete').click(this._onExpLogDelete.bind(this));
    html.find("#input-status").mousedown(this._onStatusClick.bind(this));

  }

  async _onToggleCareer(ev) {
    let itemId = this._getId(ev);
    let type = $(ev.currentTarget).attr("toggle-type")
    let item = this.actor.items.get(itemId)

    // Only one career can be current - make all careers not current before changing selected one
    if (type == "current" && item.current.value == false) { 
      let updateCareers = this.actor.itemTags["career"].map(i => i.toObject())
      updateCareers.map(x => x.system.current.value = false)
      await this.actor.updateEmbeddedDocuments("Item", updateCareers)
    }
    return item.update({[`system.${type}.value`] : !item[type].value})
  }

    // Grayed-out skill click - prompt to add the skill
  async _onUntrainedSkillClick(ev) {
    let skill = await WFRP_Utility.findSkill(event.target.text);

    // Right click - show sheet
    if (ev.button == 2) {
      skill.sheet.render(true);
    }
    else {
      try {
        new Dialog(
          {
            title: game.i18n.localize("SHEET.AddSkillTitle"),
            content: `<p>${game.i18n.localize("SHEET.AddSkillPrompt")}</p>`,
            buttons:
            {
              yes:
              {
                label: game.i18n.localize("Yes"),
                callback: dlg => {
                  this.actor.createEmbeddedDocuments("Item", [skill.toObject()], {career : true});
                }
              },
              cancel:
              {
                label: game.i18n.localize("Cancel"),
                callback: dlg => {
                  return
                }
              },
            },
            default: 'yes'
          }).render(true);
      }
      catch
      {
        console.error(error)
        ui.notifications.error(error)
      }
    }
  }

    // Grayed-out talent click - prompt to add the talent
  async _onUntrainedTalentClick(ev) {
    let talent = await WFRP_Utility.findTalent(event.target.text);

    // Right click - show sheet
    if (ev.button == 2) {
      talent.sheet.render(true);
    }

    else {
      try {
        new Dialog(
          {
            title: game.i18n.localize("SHEET.AddTalentTitle"),
            content: `<p>${game.i18n.localize("SHEET.AddTalentPrompt")}</p>`,
            buttons:
            {
              yes:
              {
                label: game.i18n.localize("Yes"),
                callback: dlg => {
                  try {
                    Advancement.checkValidAdvancement(this.actor.details.experience.total, this.actor.details.experience.spent + 100, game.i18n.localize("ACTOR.ErrorAdd"), talent.name);
                    this.actor.createEmbeddedDocuments("Item", [talent.toObject()]);
                    let expLog = foundry.utils.duplicate(this.actor.details.experience.log || []) 
                    expLog.push({amount : 100, reason : talent.name, spent : this.actor.details.experience.spent + 100, total : this.actor.details.experience.total, type : "spent"})
                    ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : 100, reason : talent.name}))
                    this.actor.update( // Subtract experience if added
                      {
                        "system.details.experience.spent": this.actor.details.experience.spent + 100,
                        "system.details.experience.log": expLog
                      })
                  } catch(error) {
                    ui.notifications.error(error);
                  }
                }
              },
              yesNoExp:
              {
                label: game.i18n.localize("Free"),
                callback: dlg => { this.actor.createEmbeddedDocuments("Item", [talent.toObject()]); }
              },
              cancel:
              {
                label: game.i18n.localize("Cancel"),
                callback: dlg => { return }
              },
            },
            default: 'yes'
          }).render(true);
      }
      catch
      {
        console.error(error)
        ui.notifications(error)
      }
    }
  }

   // Advancement indicators appear next to characteristic, skills, and talents available to spend exp on
    // Left click spends exp - right click reverses
  async _onAdvancementClick(ev) {
    let data = this.actor.toObject().system;
    let type = $(ev.target).attr("data-target");
    ev.target.style.pointerEvents = "none"
    // Defer updating to the very end (except for talents) to prevent rerendering early, which allows fast clicking to cause errors in calculation
    let itemUpdates = [];
    let actorUpdate = {};
    // Skills
    if (type == "skill") {
      let itemId = this._getId(ev);
      let item = this.actor.items.get(itemId)

      if (ev.button == 0) {
        // Calculate the advancement cost based on the current number of advances, subtract that amount, advance by 1
        let cost = Advancement.calculateAdvCost(item.system.advances.value, type, item.system.advances.costModifier)
        try {
          Advancement.checkValidAdvancement(data.details.experience.total, data.details.experience.spent + cost, game.i18n.localize("ACTOR.ErrorImprove"), item.name);
          data.details.experience.spent = Number(data.details.experience.spent) + cost;
          itemUpdates.push({_id : itemId, "system.advances.value" : item.system.advances.value + 1})

          let expLog = this.actor.system.addToExpLog(cost, item.name, data.details.experience.spent)
          ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : cost, reason: item.name}))
          actorUpdate = { "system.details.experience.spent": data.details.experience.spent, "system.details.experience.log" : expLog };
        } catch(error) {
          ui.notifications.error(error);
        }
      }
      else if (ev.button = 2) {
        // Do the reverse, calculate the advancement cost (after subtracting 1 advancement), add that exp back
        if (item.system.advances.value == 0)
            return this.render(true); // Rerender to allow clicking again
        let cost = Advancement.calculateAdvCost(item.system.advances.value - 1, type, item.system.advances.costModifier)
        data.details.experience.spent = Number(data.details.experience.spent) - cost;
        itemUpdates.push({_id : itemId, "system.advances.value" : item.system.advances.value - 1})

        let expLog = this.actor.system.addToExpLog(-1 * cost, item.name, data.details.experience.spent)
        ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : -1 * cost, reason : item.name}))
        actorUpdate = { "system.details.experience.spent": data.details.experience.spent, "system.details.experience.log" : expLog };
      }
    }
    // Talents
    else if (type == "talent") {
      if (ev.button == 0) {
        // All career talents are stored in flags, retrieve the one clicked - use to calculate exp
        let itemId = this._getId(ev);
        let item = this.actor.items.get(itemId)
        let advances = item.system.Advances
        let spent = 0;
        let cost = (advances + 1) * 100
        try {
          Advancement.checkValidAdvancement(this.actor.details.experience.total, this.actor.details.experience.spent + cost, game.i18n.localize("ACTOR.ErrorImprove"), item.name);
          if (advances < item.Max || item.Max == "-") {
            spent = this.actor.details.experience.spent + cost
          }
          else
            return
          await this.actor.createEmbeddedDocuments("Item", [item.toObject()])
          
          ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : cost, reason : item.name}))
          let expLog = this.actor.system.addToExpLog(cost, item.name, spent)
          await this.actor.update({"system.details.experience.spent": spent, "system.details.experience.log" : expLog})
        }  catch(error) {
          ui.notifications.error(error);
        }
      }
      // If right click, ask to refund EXP or not
      else if (ev.button == 2) {
        let itemId = this._getId(ev);
        let item = this.actor.items.get(itemId)
        let advances = item.system.Advances
        let spent = 0;
        let cost = (advances) * 100
        spent = this.actor.details.experience.spent - cost

        new Dialog(
          {
            title: game.i18n.localize("SHEET.RefundXPTitle"),
            content: `<p>${game.i18n.localize("SHEET.RefundXPPrompt")} (${(advances) * 100})</p>`,
            buttons:
            {
              yes:
              {
                label: game.i18n.localize("Yes"),
                callback: dlg => {
                  this.actor.deleteEmbeddedDocuments("Item", [itemId])
                  let expLog = this.actor.system.addToExpLog(-1 * cost, item.name, spent)
                  ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : -1 * cost, reason : item.name}))
                  this.actor.update({"system.details.experience.spent": spent, "system.details.experience.log" : expLog})
                }
              },
              no:
              {
                label: game.i18n.localize("No"),
                callback: dlg => {
                  this.actor.deleteEmbeddedDocuments("Item", [itemId])
                },
              },
              cancel:
              {
                label: game.i18n.localize("Cancel"),
                callback: dlg => { return }
              }
            },
            default: 'yes'
          }).render(true);
        // Reverse the cost, add to exp, and remove the talent

      }

    }
    // Characteristics
    else {
      let characteristic = type;
      let currentChar = this.actor.characteristics[characteristic];

      if (ev.button == 0) {
        // Calculate the advancement cost based on the current number of advances, subtract that amount, advance by 1
        let cost = Advancement.calculateAdvCost(currentChar.advances, "characteristic");
        try {
          Advancement.checkValidAdvancement(data.details.experience.total, data.details.experience.spent + cost, game.i18n.localize("ACTOR.ErrorImprove"), game.wfrp4e.config.characteristics[characteristic]);
          data.characteristics[characteristic].advances++;
          data.details.experience.spent = Number(data.details.experience.spent) + cost;

          let expLog = this.actor.system.addToExpLog(cost, game.wfrp4e.config.characteristics[characteristic], data.details.experience.spent)
          ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : cost, reason : game.wfrp4e.config.characteristics[characteristic]}))
          data.details.experience.log = expLog

          actorUpdate ={"system.characteristics": data.characteristics,"system.details.experience": data.details.experience};
        } catch(error) {
          ui.notifications.error(error);
        }
      }
      else if (ev.button == 2) {
        // Calculate the advancement cost based on advances -1, add that amount back into exp
        if (currentChar.advances == 0)
          return this.render(true); // Rerender to allow clicking again
        let cost = Advancement.calculateAdvCost(currentChar.advances - 1, "characteristic");

        data.characteristics[characteristic].advances--;
        data.details.experience.spent = Number(data.details.experience.spent) - cost;

        let expLog = this.actor.system.addToExpLog(-1 * cost, game.wfrp4e.config.characteristics[characteristic], data.details.experience.spent)
        ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : -1 * cost, reason : game.wfrp4e.config.characteristics[characteristic]}))
        data.details.experience.log = expLog


        actorUpdate = {"system.characteristics": data.characteristics, "system.details.experience": data.details.experience};
      }      
    }
    actorUpdate.items = itemUpdates;
    await this.actor.update(actorUpdate, {skipExperienceChecks : true});
  }

  _onExpLogDelete(ev) {
    let index = parseInt($(ev.currentTarget).parents(".exp-entry").attr("data-index"))
    let experience = foundry.utils.duplicate(this.actor.details.experience)
    let entry = experience.log[index];
    let exp = parseInt(entry.amount);
    let type = entry.type;
    experience.log.splice(index, 1)

    new Dialog({
      title: game.i18n.localize("RevertExperience"),
      content : `<p>${game.i18n.localize("DIALOG.RevertExperience")}</p>`,
      buttons : {
        yes : {
          label : game.i18n.localize("Yes"),
          callback : dlg => {
            experience[type] -= exp
            this.actor.update({"system.details.experience" : experience})
          }
        },
        no : {
          label : game.i18n.localize("No"),
          callback : dlg => {this.actor.update({"system.details.experience" : experience})}
        }
      }
    }).render(true)
  }

  _onStatusClick(ev) {
    let modifier = ev.button == 0 ? 1 : -1 // Increment if left click, decrement if right click
    this.actor.update({"system.details.status.modifier" : (this.actor.details.status.modifier || 0) + modifier})
  }

}