import WFRP_Utility from "../../system/utility-wfrp4e.js";
import { ChargenStage } from "./stage";

export class SkillsTalentsStage extends ChargenStage {
  journalId = "Compendium.wfrp4e-core.journals.JournalEntry.IQ0PgoJihQltCBUU.JournalEntryPage.f5Y4XenZVtDU2GUo"
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.resizable = true;
    options.width = 450;
    options.height = 800;
    options.classes.push("skills-talents");
    options.minimizable = true;
    options.cannotResubmit = true
    options.title = game.i18n.localize("CHARGEN.StageSkillsTalents");
    return options;
  }

  static get title() { return game.i18n.localize("CHARGEN.StageSkillsTalents"); }


  constructor(...args) {
    super(...args);
    let { skills, talents, randomTalents  } = WFRP_Utility.speciesSkillsTalents(this.data.species, this.data.subspecies);

    for (let [key, value] of Object.entries(randomTalents)) {
      this.context.speciesTalents.tables.set(key, {
        key: key,
        count: Number(value),
        rolled: false,
        talents: []
      });
    }

    for (let skill of skills) {
      this.context.speciesSkills[skill] = 0;
    }

    for (let talent of talents) {

      // Set random talent count
      if (Number.isNumeric(talent)) {
        // this.context.speciesTalents.tables.get('talents').count = Number(talent);
        this.context.speciesTalents.tables.get('talents').count = 10;
      }

      // Comma means it's a choice
      else if (talent.includes(",")) {
        this.context.speciesTalents.choices.push(talent);
        this.context.speciesTalents.chosen.push("");
      }

      else
        this.context.speciesTalents.normal.push(talent);
    }

    for (let skill of this.data.items.career.system.skills) {
      this.context.careerSkills[skill] = 0;
    }

    for (let talent of this.data.items.career.system.talents) {
      this.context.careerTalents[talent] = false;
    }
  }


  get template() {
    return "systems/wfrp4e/templates/apps/chargen/skills-talents.hbs";
  }


  // @todo remove obsolete entries after all code is rewritten
  context = {
    speciesSkills: {},
    speciesTalents: {
      normal: [],
      chosen: [],
      random: [],
      rolled: false,
      randomCount: 0,
      choices: [],
      tables: new Map()
    },
    careerSkills: {},
    careerTalents: {}
  };

  async getData() {
    let data = await super.getData();
    data.speciesSkillAllocation = {
      0: [],
      3: [],
      5: []
    };

    /**#region species talents*/

    // @todo most likely obsolete, check later
    data.randomCount = this.context.speciesTalents.randomCount - this.context.speciesTalents.random.length;

    data.talents = {
      normal: this.context.speciesTalents.normal,

      // Separate choices ("Savvy,Suave") into {name : Suave, chosen : true/false}, {name : Savvy, chosen : true/false}
      // @todo rewrite the `random[x]` to work again
      choices: this.context.speciesTalents.choices.map((choice, index) => {
        return choice.split(",").map(i => {
          let name = i.trim();
          let regex = /random\[(\d)\]/gm
          let match = Array.from(name.matchAll(regex))[0];
          let chosen = this.context.speciesTalents.chosen[index] == name

          // Check if talent is an additional random (syntax => random[x] where x is the number of random talents to roll)
          if (match) {
            if (match[1] == "1")
              name = game.i18n.localize("CHARGEN.AdditionalRandomTalent")
            else
              name = game.i18n.format("CHARGEN.XAdditionalRandomTalents", { x: match[1] })

            chosen = this.context.speciesTalents.chosen[index] == name

            // If random is selected, add number to random talents to roll
            if (chosen) {
              data.randomCount += Number(match[1])
            }
          }
          return {
            name,
            chosen: this.context.speciesTalents.chosen[index] == name
          };
        });
      }),
      // Determine duplicates later
      // @todo remove this later
      random: this.context.speciesTalents.random.map(i => {
        return {
          name : i,
          duplicate: false
        }
      }),
      chosen: this.context.speciesTalents.chosen
    };

    // Convert table data from Map to Array for Handlebars
    let tablesArray = Array.from(this.context.speciesTalents.tables.values());
    tablesArray = foundry.utils.duplicate(tablesArray);
    let tables = tablesArray.map(t => {
      t.left = t.count - t.talents.length;
      t.talents = t.talents.map(i => {
        return {
          name : i,
          duplicate: false
        };
      });

      return t;
    });

    // Create a reference array of all talents across all tables for easy duplicate checking
    let allTalents = tables.reduce((acc, table) => {
      acc.push(...table.talents.map(talent => talent.name));
      return acc;
    }, []);
    // Add chosen talents (if they were chosen = not empty)
    allTalents.push(...data.talents.chosen.filter(t => t));

    // Check and mark duplicates
    tables.forEach(table => table.talents.forEach(talent => talent.duplicate = allTalents.filter(t => t === talent.name).length >= 2));

    data.talents.tables = tables;

    /**#endregion species talents*/

    // Sort into arrays
    for (let skill in this.context.speciesSkills) {
      data.speciesSkillAllocation[this.context.speciesSkills[skill]].push(skill);
    }

    // This case happens when user chose to roll an additional random talent, then changed their mind. Remove the extra talents
    // @todo rewrite it along with `random[x]` to work with tables
    if (data.randomCount < 0) {
      let spliceIndex = this.context.speciesTalents.random.length - Math.abs(data.randomCount)
      this.context.speciesTalents.random.splice(spliceIndex) // Remove talents in context
      data.talents.random.splice(spliceIndex)                // Reflect removed talents in template data
      data.randomCount = this.context.speciesTalents.randomCount - this.context.speciesTalents.random.length; // Should be 0
    }

    data.careerSkills = this.context.careerSkills;
    data.careerTalents = this.context.careerTalents;
    data.pointsAllocated = 40 - Object.values(this.context.careerSkills).reduce((prev, current) => prev + current, 0)

    return data;
  }

  async _updateObject(ev, formData) {
    // Merge career/species skill advances into data
    for (let skill in this.context.speciesSkills) {
      if (isNaN(this.data.skillAdvances[skill]))
        this.data.skillAdvances[skill] = 0;
      this.data.skillAdvances[skill] += this.context.speciesSkills[skill];
    }
    for (let skill in this.context.careerSkills) {
      if (isNaN(this.data.skillAdvances[skill]))
        this.data.skillAdvances[skill] = 0;
      this.data.skillAdvances[skill] += this.context.careerSkills[skill];
    }
    let careerTalent;
    for (let talent in this.context.careerTalents) {
      if (this.context.careerTalents[talent])
        careerTalent = talent;
    }

    // @todo check and most likely rewrite this
    let talents = await Promise.all((this.context.speciesTalents.normal.concat(this.context.speciesTalents.chosen, this.context.speciesTalents.random, careerTalent)).map(async i => {
      try {
        return await WFRP_Utility.findTalent(i);
      }
      catch(e)
      {
        // Ignore not found.
        // This is mainly important because when a user chooses "Additional Random Talent" as a talent, it won't be found
      }
    }))
    this.data.items.talents = talents.filter(i => i);
    super._updateObject(ev, formData)

  }


  async validate() {
    let valid = super.validate();

    if (!this.validateSkills())
      valid = false

    // @todo change validation to check all tables
    if (this.context.speciesTalents.randomCount > 0 && !this.context.speciesTalents.rolled) {
      this.showError("SpeciesTalentsNotRolled")
      valid = false
    }

    if (this.context.speciesTalents.chosen.filter(i => i).length < this.context.speciesTalents.choices.length) {
      this.showError("SpeciesTalentsNotChosen")
      valid = false
    }

    if (Object.values(this.context.careerTalents).every(i => i == false)) {
      this.showError("CareerTalentNotChosen")
      valid = false
    }

    if (Object.values(this.context.careerSkills).reduce((prev, current) => prev + current, 0) > 40) {
      this.showError("CareerSkillAllocation")
      valid = false
    }

    return valid
  }

  validateSkills() {
    let skills = Object.values(this.context.speciesSkills)
    let threes = skills.filter(i => i == 3).length
    let fives = skills.filter(i => i == 5).length

    if (threes > 3 || fives > 3) {
      this.showError("SpeciesSkillAdvancements")
      return false
    }
    else return true
  }



  activateListeners(html) {
    super.activateListeners(html);
    const dragDrop = new DragDrop({
      dragSelector: '.drag-skill',
      dropSelector: '.drag-area',
      permissions: { dragstart: () => true, drop: () => true },
      callbacks: { drop: this.onDropSkill.bind(this), dragstart: this.onDragSkill.bind(this) },
    });

    dragDrop.bind(html[0]);


    html.find(".talent-choice input").click(ev => {
      let target = ev.currentTarget.name?.split("-")[1];

      if (target == "career") {
        for (let talent of this.data.items.career.system.talents) {
          this.context.careerTalents[talent] = (talent == ev.currentTarget.value);
        }
      }
      else {
        this.context.speciesTalents.chosen[target] = ev.currentTarget.value;
      }

      this.render(true);

    });

    html.find(".career-skills input").change(ev => {
      ev.currentTarget.value = Math.max(0, Number(ev.currentTarget.value))
      if (ev.currentTarget.value > 10) {
        ev.currentTarget.value = 0;
        this.showError("CareerSkillAllocationBounds")
      }
      this.context.careerSkills[ev.currentTarget.dataset.skill] = Number(ev.currentTarget.value);
      this.render(true);
    });

    html.find(".reroll-duplicate").click(async ev => {
      ev.stopPropagation();
      let index = Number(ev.currentTarget.dataset.index);
      let key = ev.currentTarget.dataset.table;
      let table = this.context.speciesTalents.tables.get(key);

      let talent = await game.wfrp4e.tables.rollTable(table.key);
      table.talents[index] = talent.text;
      this.updateMessage("RerolledDuplicateTalent", { rolled: talent.text })
      this.render(true);
    })
  }


  onDropSkill(ev) {
    let skill = JSON.parse(ev.dataTransfer.getData("text/plain")).skill;
    this.context.speciesSkills[skill] = Number(ev.currentTarget.dataset.advance);
    if (!this.validateSkills()) {
      this.context.speciesSkills[skill] = 0
    }

    this.render(true);
  }

  onDragSkill(ev) {
    ev.dataTransfer.setData("text/plain", JSON.stringify({ skill: ev.currentTarget.textContent.trim() }));
  }

  async rollRandomTalents(ev) {
    let number = Number(ev.currentTarget.dataset.number) || 0;
    let key = ev.currentTarget.dataset.table || "talents";
    let table = this.context.speciesTalents.tables.get(key);
    if (!table) return;

    for (let i = 0; i < number; i++) {
      let talent = await game.wfrp4e.tables.rollTable(table.key);
      table.talents.push(talent.text);
    }

    table.rolled = true;
    this.updateMessage("Rolled", { rolled: this.context.speciesTalents.random.join(", ") })
    this.render(true);
  }
}
