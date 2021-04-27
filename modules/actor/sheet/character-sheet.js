import WFRP_Utility from "../../system/utility-wfrp4e.js";

import ActorSheetWfrp4e from "./actor-sheet.js";
import actor from "../../hooks/actor.js";

/**
 * Provides the specific interaction handlers for Character Sheets.
 *
 * ActorSheetWfrp4eCharacter are assigned to character type actors, and the specific interactions
 * character type actors need are defined here, specifically for careers and spending exp.
 * 
 */
export default class ActorSheetWfrp4eCharacter extends ActorSheetWfrp4e {
  static get defaultOptions() {
    const options = super.defaultOptions;
    mergeObject(options,
      {
        classes: options.classes.concat(["wfrp4e", "actor", "character-sheet"]),
        width: 610,
        height: 740,
      });
    return options;
  }


  /**
   * Get the correct HTML template path to use for rendering this particular sheet
   * @type {String}
   */
  get template() {
    if (!game.user.isGM && this.actor.limited) return "systems/wfrp4e/templates/actors/actor-limited.html";
    return "systems/wfrp4e/templates/actors/character/character-sheet.html";

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
    html.find('.career-toggle').click(async ev => {
      let itemId = $(ev.currentTarget).parents(".item").attr("data-item-id");
      let type = $(ev.currentTarget).attr("toggle-type")
      let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
      item.data[type].value = !item.data[type].value; // Toggle the value

      // "Current" is the toggle that actually means something, so needs more processing
      if (type == "current") {
        let availableCharacteristics = item.data.characteristics
        let characteristics = this.actor.data.data.characteristics;

        // If current was toggled on
        if (item.data.current.value) {
          // Assign characteristics to be available or not based on the current career
          for (let char in characteristics) {
            characteristics[char] = {career: false};
            if (availableCharacteristics.includes(char))
              characteristics[char].career = true;
          }
        }
        else {
          for (let char in characteristics) {
            characteristics[char] = {career: false};
          }
        }
        this.actor.update({ "data.characteristics": characteristics })
      }

      // Only one career can be current - make all other careers not current
      if (type == "current" && item.data.current.value == true) {
        let updateCareers = duplicate(this.actor.data.careers.filter(c => c._id != item._id))
        updateCareers.map(x => x.data.current.value = false)
        await this.actor.updateEmbeddedEntity("OwnedItem", updateCareers)
      }
      this.actor.updateEmbeddedEntity("OwnedItem", item);
    });

    html.find(".add-career").click(ev => {
      new game.wfrp4e.apps.CareerSelector(this.actor).render(true)
    })

    // Grayed-out skill click - prompt to add the skill
    html.find(".untrained-skill").mousedown(async ev => {
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
                    this.actor.createEmbeddedEntity("OwnedItem", skill.data);
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
    })

    // Grayed-out talent click - prompt to add the talent
    html.find(".untrained-talent").mousedown(async ev => {
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
                    this.actor.createEmbeddedEntity("OwnedItem", talent.data);
                    let expLog = duplicate(this.actor.data.data.details.experience.log || []) 
                    expLog.push({amount : 100, reason : talent.name, spent : this.actor.data.data.details.experience.spent + 100, total : this.actor.data.data.details.experience.total, type : "spent"})
                    ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : 100, reason : talent.name}))
                    this.actor.update( // Subtract experience if added
                      {
                        "data.details.experience.spent": this.actor.data.data.details.experience.spent + 100,
                        "data.details.experience.log": expLog
                      })
                  }
                },
                yesNoExp:
                {
                  label: game.i18n.localize("Free"),
                  callback: dlg => { this.actor.createEmbeddedEntity("OwnedItem", talent.data); }
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
    })

    // Advancement indicators appear next to characteristic, skills, and talents available to spend exp on
    // Left click spends exp - right click reverses
    html.find('.advancement-indicator').mousedown(async ev => {
      let data = duplicate(this.actor._data.data);
      let type = $(ev.target).attr("data-target");

      // Skills
      if (type == "skill") {
        let itemId = $(ev.currentTarget).parents(".item").attr("data-item-id");
        let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))

        if (ev.button == 0) {
          // Calculate the advancement cost based on the current number of advances, subtract that amount, advance by 1
          let cost = WFRP_Utility._calculateAdvCost(item.data.advances.value, type, item.data.advances.costModifier)
          data.details.experience.spent = Number(data.details.experience.spent) + cost;
          item.data.advances.value++;
          await this.actor.updateEmbeddedEntity("OwnedItem", { _id: itemId, "data.advances.value": item.data.advances.value });

          let expLog = this.actor._addToExpLog(cost, item.name, data.details.experience.spent)
          ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : cost, reason: item.name}))
          this.actor.update({ "data.details.experience.spent": data.details.experience.spent, "data.details.experience.log" : expLog });
        }
        else if (ev.button = 2) {
          // Do the reverse, calculate the advancement cost (after subtracting 1 advancement), add that exp back
          if (item.data.advances.value == 0)
            return;
          item.data.advances.value--;
          let cost = WFRP_Utility._calculateAdvCost(item.data.advances.value, type, item.data.advances.costModifier)
          data.details.experience.spent = Number(data.details.experience.spent) - cost;
          this.actor.updateEmbeddedEntity("OwnedItem", { _id: itemId, "data.advances.value": item.data.advances.value });

          let expLog = this.actor._addToExpLog(-1 * cost, item.name, data.details.experience.spent)
          ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : -1 * cost, reason : item.name}))
          this.actor.update({ "data.details.experience.spent": data.details.experience.spent, "data.details.experience.log" : expLog });
        }
      }
      // Talents
      else if (type == "talent") {
        if (ev.button == 0) {
          // All career talents are stored in flags, retrieve the one clicked - use to calculate exp
          let itemId = $(ev.currentTarget).parents(".item").attr("data-item-id");
          let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
          let preparedTalent = this.actor.data.flags.careerTalents.find(t => t.name == item.name)
          let spent = 0;
          let cost = (preparedTalent.data.advances.value + 1) * 100
          if (preparedTalent.data.advances.value < preparedTalent.numMax || preparedTalent.numMax == "-") {
            spent = this.actor.data.data.details.experience.spent + cost
          }
          else
            return
          this.actor.createEmbeddedEntity("OwnedItem", item)
          
          ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : cost, reason : item.name}))
          let expLog = this.actor._addToExpLog(cost, item.name, spent)
          this.actor.update({"data.details.experience.spent": spent, "data.details.experience.log" : expLog})
        }
        // If right click, ask to refund EXP or not
        else if (ev.button == 2) {
          let itemId = $(ev.currentTarget).parents(".item").attr("data-item-id");
          let item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", itemId))
          let preparedTalent = this.actor.data.flags.careerTalents.find(t => t.name == item.name)
          let spent = 0;
          let cost = (preparedTalent.data.advances.value) * 100
          spent = this.actor.data.data.details.experience.spent - cost

          new Dialog(
            {
              title: game.i18n.localize("SHEET.RefundXPTitle"),
              content: `<p>${game.i18n.localize("SHEET.RefundXPPrompt")} (${(preparedTalent.data.advances.value) * 100})</p>`,
              buttons:
              {
                yes:
                {
                  label: "Yes",
                  callback: dlg => {
                    this.actor.deleteEmbeddedEntity("OwnedItem", itemId)
                    let expLog = this.actor._addToExpLog(-1 * cost, item.name, spent)
                    ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : -1 * cost, reason : item.name}))
                    this.actor.update({"data.details.experience.spent": spent, "data.details.experience.log" : expLog})
                  }
                },
                no:
                {
                  label: "No",
                  callback: dlg => {
                    this.actor.deleteEmbeddedEntity("OwnedItem", itemId)
                  },
                },
                cancel:
                {
                  label: "Cancel",
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
        let currentChar = this.actor.data.data.characteristics[characteristic];

        if (ev.button == 0) {
          // Calculate the advancement cost based on the current number of advances, subtract that amount, advance by 1
          let cost = WFRP_Utility._calculateAdvCost(currentChar.advances, "characteristic");
          data.characteristics[characteristic].advances++;
          data.details.experience.spent = Number(data.details.experience.spent) + cost;

          let expLog = this.actor._addToExpLog(cost, game.wfrp4e.config.characteristics[characteristic], data.details.experience.spent)
          ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : cost, reason : game.wfrp4e.config.characteristics[characteristic]}))
          data.details.experience.log = expLog

          await this.actor.update({"data.characteristics": data.characteristics,"data.details.experience": data.details.experience});
        }
        else if (ev.button == 2) {
          // Calculate the advancement cost based on advances -1, add that amount back into exp
          if (currentChar.advances == 0)
            return
          let cost = WFRP_Utility._calculateAdvCost(currentChar.advances - 1, "characteristic");

          data.characteristics[characteristic].advances--;
          data.details.experience.spent = Number(data.details.experience.spent) - cost;

          let expLog = this.actor._addToExpLog(-1 * cost, game.wfrp4e.config.characteristics[characteristic], data.details.experience.spent)
          ui.notifications.notify(game.i18n.format("ACTOR.SpentExp", {amount : -1 * cost, reason : game.wfrp4e.config.characteristics[characteristic]}))
          data.details.experience.log = expLog


          await this.actor.update({"data.characteristics": data.characteristics, "data.details.experience": data.details.experience});
        }
      }
    });


    html.find('.exp-delete').click(async ev => {
      let index = parseInt($(ev.currentTarget).parents(".exp-entry").attr("data-index"))
      let experience = duplicate(this.actor.data.data.details.experience)
      let entry = experience.log[index];
      let exp = parseInt(entry.amount);
      let type = entry.type;
      experience.log.splice(index, 1)

      new Dialog({
        content : `<p>${game.i18n.localize("DIALOG.RevertExperience")}</p>`,
        buttons : {
          yes : {
            label : game.i18n.localize("Yes"),
            callback : dlg => {
              experience[type] -= exp
              this.actor.update({"data.details.experience" : experience})
            }
          },
          no : {
            label : game.i18n.localize("No"),
            callback : dlg => {this.actor.update({"data.details.experience" : experience})}
          }
        }
      }).render(true)
    })
  }
}