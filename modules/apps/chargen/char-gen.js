import WFRP_Utility from "../../system/utility-wfrp4e.js";
import { SpeciesStage } from "./species";
import { CareerStage } from "./career";
import { AttributesStage } from "./attributes";
import { SkillsTalentsStage } from "./skills-talents";
import { TrappingStage } from "./trappings";
import { DetailsStage } from "./details";


/**
 * This class is the center of character generation through the chat prompts (started with /char)
 * Each function usually corresponds with a specific action/button click, processing and rendering
 * a new card in response.
 */
export default class CharGenWfrp4e extends FormApplication {
  constructor(...args) {
    super(...args);
    this.data = {
      species: null,
      subspecies: null,
      exp: {
        species: 0,
        characteristics: 0,
        career: 0
      },
      items: {
        career: null,
      },
      skillAdvances: {

      },
      characteristics: {
        ws: {initial: 0, advances : 0},
        bs: {initial: 0, advances : 0},
        s: {initial: 0, advances : 0},
        t: {initial: 0, advances : 0},
        i: {initial: 0, advances : 0},
        ag: {initial: 0, advances : 0},
        dex: {initial: 0, advances : 0},
        int: {initial: 0, advances : 0},
        wp: {initial: 0, advances : 0},
        fel: {initial: 0, advances : 0}
      },
      fate: { base: 0, allotted: 0 },
      resilience: { base: 0, allotted: 0 },
      move: 4,
      details : {
        gender : "",
        name : "",
        age : null,
        height : "",
        hair : "",
        eyes : "",
      },
      misc : {
        // Object for stages to add whatever data they wish to be merged into actor data
        // e.g. "system.details.motivation.value" : "Courage"
      }
    }
    this.stages = [
      {
        class: SpeciesStage,
        key: "species",
        dependantOn: [],
        app: null,
        complete: false
      },
      {
        class: CareerStage,
        key: "career",
        dependantOn: ["species"],
        app: null,
        complete: false
      },
      {
        class: AttributesStage,
        key: "attributes",
        dependantOn: ["career"],
        app: null,
        complete: false
      },
      {
        class: SkillsTalentsStage,
        key: "skills-talents",
        dependantOn: ["career"],
        app: null,
        complete: false
      },
      {
        class: TrappingStage,
        app: null,
        key: "trappings",
        dependantOn: ["career"],
        complete: false
      },
      {
        class: DetailsStage,
        app: null,
        key: "details",
        dependantOn: ["species"],
        complete: false
      }
    ]

    this.actor = { name: "", type: "character", system: game.system.model.Actor.character, items: [] }
  }


  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "chargen";
    options.template = "systems/wfrp4e/templates/apps/chargen/chargen.html"
    options.classes = options.classes.concat("wfrp4e", "chargen");
    options.resizable = true;
    options.width = 1000;
    options.height = 600;
    options.minimizable = true;
    options.title = game.i18n.localize("CHARGEN.Title")
    return options;
  }


  async getData() {

    let skills = []

    for (let ch in this.data.characteristics)
    {
     this.data.characteristics[ch].total = this.data.characteristics[ch].initial + this.data.characteristics[ch].advances
    }

    //TODO Add talent bonuses?

    for(let key in this.data.skillAdvances)
    {
      let skill = await WFRP_Utility.findSkill(key)
      if (skill)
      {
        let ch = this.data.characteristics[skill.system.characteristic.value]
        if (ch && skill.system.advances.value > 0)
        {
          skills.push(`${key} (+${this.data.skillAdvances[key]}) ${ch.initial + ch.advances + this.data.skillAdvances[key]}`)
        }
      }
    }

    this.data.fate.total = this.data.fate.allotted + this.data.fate.base
    this.data.resilience.total = this.data.resilience.allotted + this.data.resilience.base

    return { 
      speciesDisplay : this.data.subspecies ? `${game.wfrp4e.config.species[this.data.species]} (${game.wfrp4e.config.subspecies[this.data.species]?.[this.data.subspecies].name})` :  game.wfrp4e.config.species[this.data.species],
      stages: this.stages,
      data : this.data, 
      stageHTML :  await this._getStageHTML(), 
      skills : skills.join(", "), 
      talents : this.data.items.talents?.map(i => i.name).join(", "),
      trappings : this.data.items.trappings?.map(i => i.name).join(", ")
    }
  }

  
  async _getStageHTML()
  {
    let html = []

    for(let stage of this.stages)
    {
      html.push(await stage.app?.addToDisplay())
    }

    return html.filter(i => i)
  }

  async _updateObject(ev, formData)
  {
    this.actor.system.details.species.value = this.data.species
    this.actor.system.details.species.subspecies = this.data.subspecies

    for(let exp in this.data.exp)
    {
      if (Number.isNumeric(this.data[exp]))
        this.actor.system.details.experience.total += Number(this.data[exp])
    }

    for(let key in this.data.items)
    {
      let items = this.data.items[key]
      if (!(items instanceof Array))
      {
        items = [items]
      }
      this.actor.items = this.actor.items.concat(items)
    }

    this.actor.items = this.actor.items.concat(await WFRP_Utility.allMoneyItems())

    // Get basic skills, add advancements (if skill advanced and isn't basic, find and add it)
    let skills = await WFRP_Utility.allBasicSkills();
    for(let skill in this.data.skillAdvances)
    {
      let adv = this.data.skillAdvances[skill]
      if (Number.isNumeric(adv))
      {
        let existing = skills.find(s => s.name == skill)
        
        if (!existing)
        {
          existing = await WFRP_Utility.findSkill(skill)
          existing = existing.toObject()
          skills.push(existing)
        }
        existing.system.advances.value += Number(adv)
      }
    }
    this.actor.items = this.actor.items.concat(skills);

    mergeObject(this.actor.system.characteristics, this.data.characteristics, {overwrite : true})
    this.actor.system.status.fate.value = this.data.fate.base + this.data.fate.allotted
    this.actor.system.status.resilience.value = this.data.resilience.base + this.data.resilience.allotted

    this.actor.system.status.fortune.value =  this.actor.system.status.fate.value
    this.actor.system.status.resolve.value =  this.actor.system.status.resilience.value

    this.actor.system.details.move.value = this.data.move

    this.actor.name = this.data.details.name
    this.actor.system.details.gender.value = this.data.details.gender
    this.actor.system.details.age.value = this.data.details.age
    this.actor.system.details.height.value = this.data.details.height
    this.actor.system.details.haircolour.value = this.data.details.hair
    this.actor.system.details.eyecolour.value = this.data.details.eyes
    mergeObject(this.actor, expandObject(this.data.misc), {overwrite : true})


    // Don't add items inline, as that will not create active effects
    let items = this.actor.items;
    this.actor.items = this.actor.items.filter(i => i.type == "skill");
    items = items.filter(i => i.type != "skill").concat(await WFRP_Utility.allMoneyItems())
    // Except skills, as new characters without items create blank skills
    // We want to add ours to prevent duplicates

    let document = await Actor.create(this.actor);
    document.createEmbeddedDocuments("Item", items);
    document.sheet.render(true);

  }


  complete(stageIndex) {
    this.stages[stageIndex].complete = true;
    this.render(true)
  }

  canStartStage(stage)
  {
    if (!stage)
      return false
    
    let dependancies = stage.dependantOn.map(i => this.stages.find(s => s.key == i))
    return dependancies.every(stage => stage.complete)

  }


  activateListeners(html) {
    super.activateListeners(html);

    html.find(".chargen-button").on("click", ev => {
      let stage = this.stages[Number(ev.currentTarget.dataset.stage)]

      if (!this.canStartStage(stage))
      {
        return ui.notifications.error(`Cannot start this stage: Need to complete ${stage.dependantOn.toString()} first`)
      }

      if (stage.app)
        stage.app.render(true)
      else {
        stage.app = new stage.class(this.data, {complete : this.complete.bind(this), index : Number(ev.currentTarget.dataset.stage)})
        stage.app.render(true)
      }
    })
  }
}



