import WFRP_Utility from "../../system/utility-wfrp4e.js";
import { SpeciesStage } from "./species";
import { CareerStage } from "./career";
import { AttributesStage } from "./attributes";
import { SkillsTalentsStage } from "./skills-talents";
import { TrappingStage } from "./trappings";
import { DetailsStage } from "./details";


/**
 * This class is the center of character generation through the chat prompts (started with /char)
 */
export default class CharGenWfrp4e extends FormApplication {
  constructor(existing={}, options) {
    super(null, options);
    this.data = existing?.data || {
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
        short : "",
        long : "",
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

    // If using existing data, record which stages were already complete
    if (existing?.stages)
    {
      for(let existingStage of existing.stages)
      {
        let stage = this.stages.find(s => s.key == existingStage.key)
        if (stage)
        {
          stage.complete = existingStage.complete;
        }
      }
    }

    this.actor = {type: "character", system: foundry.utils.deepClone(game.system.template.Actor.character), items: [] }

    if (!game.user.isGM)
    {
      ChatMessage.create({content : game.i18n.format("CHARGEN.Message.Start", {user : game.user.name})}).then(msg => this.message = msg)
    }

    // Warn user if they won't be able to create a character
    if (!game.user.isGM && !game.settings.get("core", "permissions").ACTOR_CREATE.includes(game.user.role) && !game.users.find(u => u.isGM && u.active))
    {
      ui.notifications.warn(game.i18n.localize("CHARGEN.NoGMWarning"), {permanent : true})
    }

    let speciesTable = game.wfrp4e.tables.findTable("species");

    if (speciesTable.results.some(i => !i.name))
    {
      ui.notifications.warn("The configured Species table is from an older version and may not be compatible with character creation in V13. To ensure it works correctly, please delete and reimport the table from the compendium.", {permanent : true})
    }

    Hooks.call("wfrp4e:chargen", this)
  }


  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "chargen";
    options.template = "systems/wfrp4e/templates/apps/chargen/chargen.hbs"
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


    let allItems = []
    for(let key in this.data.items)
    {
      allItems = allItems.concat(this.data.items[key])
    }


    let allChanges = allItems
    .filter(i => i)
    .reduce((prev, current) => prev.concat(Array.from(current.effects)), []) // reduce items to effects
    .reduce((prev, current) => prev.concat(current.changes), [])      // reduce effects to changes
    .filter(c => c.key.includes("characteristics"))                   // filter changes to characteristics

    let characteristics = foundry.utils.duplicate(this.data.characteristics)

    for (let ch in characteristics)
    {
      // Apply modifiers from item effects
      let changes = allChanges.filter(c => c.key.includes(`characteristics.${ch}`))
      let initialChanges = changes.filter(c => c.key.includes(`characteristics.${ch}.initial`))
      let modifierChanges = changes.filter(c => c.key.includes(`characteristics.${ch}.modifier`))

      let initialSum = initialChanges.reduce((prev, current) => prev += Number(current.value), 0)
      let modifierSum = modifierChanges.reduce((prev, current) => prev += Number(current.value), 0)

      characteristics[ch].initial += initialSum
      characteristics[ch].total = characteristics[ch].initial + characteristics[ch].advances + modifierSum
    }



    for(let key in this.data.skillAdvances)
    {
      let skill = await WFRP_Utility.findSkill(key)
      if (skill)
      {
        let ch = characteristics[skill.system.characteristic.value]
        if (ch && this.data.skillAdvances[key] > 0)
        {
          skills.push(`${key} (+${this.data.skillAdvances[key]}) ${ch.initial + ch.advances + this.data.skillAdvances[key]}`)
        }
      }
    }

    let exp = 0
    for(let key in this.data.exp)
    {
      exp += this.data.exp[key]
    }

    this.data.fate.total = this.data.fate.allotted + this.data.fate.base
    this.data.resilience.total = this.data.resilience.allotted + this.data.resilience.base

    this.stages.forEach(stage => {
      stage.title ??= stage.class.title;
    })

    return {
      characteristics,
      speciesDisplay : this.data.subspecies ? `${game.wfrp4e.config.species[this.data.species]} (${game.wfrp4e.config.subspecies[this.data.species]?.[this.data.subspecies].name})` :  game.wfrp4e.config.species[this.data.species],
      stages: this.stages,
      data : this.data,
      stageHTML :  await this._getStageHTML(),
      skills : skills.join(", "),
      talents : this.data.items.talents?.map(i => i.name).join(", "),
      trappings : this.data.items.trappings?.map(i => i.name).join(", "),
      exp
    }
  }

  static async start()
  {
    let existing = localStorage.getItem("wfrp4e-chargen");
    if (existing)
    {
      let useExisting = await foundry.applications.api.DialogV2.confirm({title : game.i18n.localize("CHARGEN.UseExistingData"), content : game.i18n.localize("CHARGEN.UseExistingDataContent")})

      return new this(useExisting ? JSON.parse(existing) : null).render(true);
    }
    else
    {
      return new this().render(true);
    }
  }

  async _getStageHTML()
  {
    let html = []

    for(let stage of this.stages)
    {
      html.push(await stage.app?.addToDisplay())
    }

    return html.filter(i => i).join("")
  }

  async _updateObject(ev, formData)
  {
    try {

      if (this.message)
        this.message.update({content : this.message.content + game.i18n.format("CHARGEN.Message.Created", {name : this.data.details.name})})

      this.actor.system.details.species.value = this.data.species
      this.actor.system.details.species.subspecies = this.data.subspecies

      for(let exp in this.data.exp)
      {
        if (Number.isNumeric(this.data.exp[exp]))
          this.actor.system.details.experience.total += Number(this.data.exp[exp])
      }

      for(let key in this.data.items)
      {
        let items = this.data.items[key]
        if (!(items instanceof Array))
        {
          items = [items]
        }
        this.actor.items = this.actor.items.concat(items.filter(i => i))
      }

      let money = await WFRP_Utility.allMoneyItems()

      money.forEach(m => m.system.quantity.value = 0)

      this.actor.items = this.actor.items.concat(money.filter(m => !this.actor.items.find(existing => existing.name == m.name)))

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

      foundry.utils.mergeObject(this.actor.system.characteristics, this.data.characteristics, {overwrite : true})
      this.actor.system.status.fate.value = this.data.fate.base + this.data.fate.allotted
      this.actor.system.status.resilience.value = this.data.resilience.base + this.data.resilience.allotted

      this.actor.system.status.fortune.value =  this.actor.system.status.fate.value
      this.actor.system.status.resolve.value =  this.actor.system.status.resilience.value

      this.actor.system.details.move.value = this.data.move

      this.actor.name = this.data.details.name || "New Character"
      this.actor.system.details.gender.value = this.data.details.gender
      this.actor.system.details.age.value = this.data.details.age
      this.actor.system.details.height.value = this.data.details.height
      this.actor.system.details.haircolour.value = this.data.details.hair
      this.actor.system.details.eyecolour.value = this.data.details.eyes
      this.actor.system.details.motivation.value = this.data.details.motivation
      this.actor.system.details["personal-ambitions"] = {
        "short-term" : this.data.details.short,
        "long-term" : this.data.details.long
      }

      foundry.utils.mergeObject(this.actor, foundry.utils.expandObject(this.data.misc), {overwrite : true})


      this.actor.items = this.actor.items.filter(i => {
        if (i.type == "skill")
        {
          // Include any skill with advances
          if (i.system.advances.value > 0)
          {
            return true
          }
          // or include any basic skill that isn't a specialization
          if (i.system.advanced.value == "bsc" && i.system.grouped.value == "noSpec")
          {
            return true;
          }
          // or include any basic skill that IS a specialisation (but not specialised, i.e. Art, or Ride)
          if(i.system.advanced.value == "bsc" && i.system.grouped.value == "isSpec" && !i.name.includes("(") && !i.name.includes(")")) 
          {
            return true
          }
          else return false;
        }
        else // Return true if any other item besides skills
        {
          return true
        };
      }).map(i => {
        return i instanceof Item.implementation ? i.toObject() : i
      })


      // Must create items separately so preCreate scripts run
      let actorItems = this.actor.items;
      this.actor.items = [];

      if (game.user.isGM || game.settings.get("core", "permissions").ACTOR_CREATE.includes(game.user.role))
      {

        let document = await Actor.implementation.create(this.actor, {skipItems : true});
        await document.createEmbeddedDocuments("Item", actorItems, {skipSpecialisationChoice : true})
        // for(let i of document.items.contents)
        // {
        //   // Run onCreate scripts
        //   await i._onCreate(i._source, {}, game.user.id);
        // }
        document.sheet.render(true);
        localStorage.removeItem("wfrp4e-chargen")
      }
      else {
        const payload =  {id : game.user.id, data : this.actor, options : {skipSpecialisationChoice : true, skipItems : true}}
        let id = await SocketHandlers.executeOnUserAndWait("GM", "createActor", payload);
        let actor = game.actors.get(id);
        await actor.createEmbeddedDocuments("Item", actorItems, {skipSpecialisationChoice : true,})
        if (actor && actor.isOwner) 
        {
          // for(let i of actor.items.contents)
          // {
          //   // Run onCreate scripts
          //   await i._onCreate(i._source, {}, game.user.id);
          // }
          actor.sheet.render(true)
          localStorage.removeItem("wfrp4e-chargen")
        }
      }
    }
    catch(e)
    {
      ui.notifications.error(game.i18n.format("CHARGEN.ERROR.Create", {error: e}))
    }
  }

  complete(stageIndex) {
    this.stages[stageIndex].complete = true;
    Hooks.call("wfrp4e:chargenStageCompleted", this, this.stages[stageIndex]);
    localStorage.setItem("wfrp4e-chargen", JSON.stringify({data : this.data, stages : this.stages}));
    this.render(true);
  }

  canStartStage(stage)
  {
    if (!stage)
      return false

    let dependancies = stage.dependantOn.map(i => this.stages.find(s => s.key == i))
    return dependancies.every(stage => stage.complete)

  }

  addStage(stage, index, stageData = {}) {
    let stageObj = stage.stageData();
    stageObj = foundry.utils.mergeObject(stageObj, stageData);

    if (index === undefined) {
      this.stages.push(stageObj)
    } else { // Insert new stage in specified index
      let newStages = this.stages.slice(0, index);
      newStages.push(stageObj);
      newStages = newStages.concat(this.stages.slice(index));
      this.stages = newStages;
    }
  }

  replaceStage(key, stage)
  {
    let existing = this.stages.find(i => i.key == key);
    if (existing)
    {
      existing.class = stage;
    }
  }


  activateListeners(html) {
    super.activateListeners(html);

    html.find(".chargen-button").on("click", ev => {
      let stage = this.stages[Number(ev.currentTarget.dataset.stage)]

      if (!this.canStartStage(stage))
      {
        return ui.notifications.error(game.i18n.format("CHARGEN.ERROR.StageStart", {stage : stage.dependantOn.toString()}))
      }

      if (stage.app)
        stage.app.render(true)
      else {
        stage.app = new stage.class(
          this.data,
          {
            complete : this.complete.bind(this), // Function used by the stage to complete itself
            index : Number(ev.currentTarget.dataset.stage),
            message : this.message
          })
        stage.app.render(true)
      }
    })
  }
}



