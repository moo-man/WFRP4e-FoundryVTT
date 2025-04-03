import {BaseItemModel} from "./components/base";

let fields = foundry.data.fields;

/**
 * Represents an Item used by both Patrons and Characters/NPCs
 */
export class DiseaseModel extends BaseItemModel {

  static LOCALIZATION_PREFIXES = ["WH.Models.disease"];

  static defineSchema() {
    let schema = super.defineSchema();
    schema.contraction = new fields.SchemaField({
      value: new fields.StringField(),
    });

    schema.incubation = new fields.SchemaField({
      value: new fields.StringField(),
      unit: new fields.StringField(),
      text : new fields.StringField()
    });

    schema.duration = new fields.SchemaField({
      value: new fields.StringField(),
      unit: new fields.StringField(),
      active: new fields.BooleanField(),
      text : new fields.StringField()
    });

    schema.symptoms = new fields.SchemaField({
      value: new fields.StringField(),
    });

    schema.diagnosed = new fields.BooleanField({initial: false});

    schema.permanent = new fields.SchemaField({
      value: new fields.StringField(),
    });

    return schema;
  }

  static get compendiumBrowserFilters() {
    return new Map([
      ...Array.from(super.compendiumBrowserFilters),
      ["symptoms", {
        label: this.LOCALIZATION_PREFIXES + ".FIELDS.symptoms.value.label",
        type: "text",
        config: {
          keyPath: "system.symptoms.value",
          multiple: true
        }
      }]
    ]);
  }

  async _onUpdate(data, options, user)
  {
    await super._onUpdate(data, options,user)
    if (data.system?.active && user == game.user.id)
    {
      this.start("duration");
    }

    if (foundry.utils.hasProperty(options, "changed.system.symptoms.value") && !options.skipSymptomHandling)
    {
      this.updateSymptoms(this.symptoms.value);
    }
  }

  async _onCreate(data, options, user)
  {
    await super._onCreate(data, options,user)
    if (this.parent.isOwned && user == game.user.id)
    {
      if (!this.duration.active)
      {
        this.start("incubation");
      }
    }
  }

  /**
   * Used to identify an Item as one being a child or instance of DiseaseModel
   *
   * @final
   * @returns {boolean}
   */
  get isDisease() {
    return true;
  }

  async expandData(htmlOptions) {
    let data = await super.expandData(htmlOptions);
    data.properties.push(`<b>${game.i18n.localize("Contraction")}:</b> ${this.contraction.value}`);
    data.properties.push(`<b>${game.i18n.localize("Incubation")}:</b> ${this.incubation.value} ${this.incubation.unit}`);
    data.properties.push(`<b>${game.i18n.localize("Duration")}:</b> ${this.duration.value} ${this.duration.unit}`);
    data.properties = data.properties.concat(this.parent.effects.map(i => i = "<a class='clickSymptom' data-action='action-link'><i class='fas fa-user-injured'></i> " + i.name.trim() + "</a>").join(", "));

    if (this.permanent.value)
      data.properties.push(`<b>${game.i18n.localize("Permanent")}:</b> ${this.permanent.value}`);

    return data;
  }

  chatData() {
    let properties = [];
    properties.push(`<b>${game.i18n.localize("Contraction")}:</b> ${this.contraction.value}`);
    properties.push(`<b>${game.i18n.localize("Incubation")}:</b> <a class = 'chat-roll'><i class='fas fa-dice'></i> ${this.incubation.value}</a>`);
    properties.push(`<b>${game.i18n.localize("Duration")}:</b> <a class = 'chat-roll'><i class='fas fa-dice'></i> ${this.duration.value}</a>`);
    properties.push(`<b>${game.i18n.localize("Symptoms")}:</b> ${(this.symptoms.value.split(",").map(i => i = "<a class='clickSymptom' data-action='action-link'><i class='fas fa-user-injured'></i> " + i.trim() + "</a>")).join(", ")}`);

    if (this.permanent.value)
      properties.push(`<b>${game.i18n.localize("Permanent")}:</b> ${this.permanent.value}`);

    return properties;
  }

  get show()
  {
    return this.diagnosed || game.user.isGM
  }

  async updateSymptoms(text)
  {
      // Alright get ready for some shit

      // Get all symptoms user inputted
      let symptomText = text.split(",").map(i => i.trim());
  
      // Extract just the name (with no severity)
      let symtomNames = symptomText.map(s => {
        if (s.includes("("))
          return s.substring(0, s.indexOf("(") - 1)
        else return s
      })
  
      // take those names and lookup the associated symptom key
      let symptomKeys = symtomNames.map(s => warhammer.utility.findKey(s, game.wfrp4e.config.symptoms))
  
      // Map those symptom keys into effects, renaming the effects to the user input
      let symptomEffects = symptomKeys.map((s, i) => {
        if (game.wfrp4e.config.symptomEffects[s])
        {
          let effect = foundry.utils.duplicate(game.wfrp4e.config.symptomEffects[s])
          effect.name = symptomText[i];
          return effect
  
        }
      }).filter(i => !!i)
  
      // Remove all previous symptoms from the item
      let effects = this.parent.effects.map(i => i.toObject()).filter(e => foundry.utils.getProperty(e, "flags.wfrp4e.symptom"))
  
      // Delete previous symptoms
      await this.parent.deleteEmbeddedDocuments("ActiveEffect", effects.map(i => i._id))
  
      // Add symptoms from input
      await this.parent.createEmbeddedDocuments("ActiveEffect", symptomEffects)
  
      return this.parent.update({ "system.symptoms.value": text }, {skipSymptomHandling : true})
  }

  async start(type, update=false)
  {
    if (!type)
    {
      throw new Error("Must provide incubation or duration as type")
    }

    try
    {
      let roll = await new Roll(this[type].value, this.parent).roll({allowInteractive : false});
      let update = {[`system.${type}.value`] : roll.total};
      if (type == "duration")
      {
        update["system.duration.active"] = true;
      }
      await this.parent.update(update);

      let messageData = this.getMessageData()

      messageData.speaker.alias += " " + type;

      roll.toMessage(messageData, {rollMode : "gmroll"})
    } 
    catch (e) 
    {
      ChatMessage.create(this.getMessageData(game.i18n.localize("CHAT.DiseaseRollError")));
    }
  }

  async increment()
  {
    if (this.duration.active)
    {
      return await this.parent.update({"system.duration.value" : Number(this.duration.value) + 1})
    }
    else 
    {
      return await this.parent.update({"system.incubation.value" : Number(this.incubation.value) + 1})
    }
  }

  async decrement()
  {
    let update = {}
    if (this.duration.active)
    {
      if (isNaN(this.duration.value))
      {
        return await this.start("duration");
      }
      let duration = Number(this.duration.value) - 1;
      if (duration == 0)
      {
        return await this.finishDuration();
      }
      else 
      {
        update = {"system.duration.value" : duration}
      }
    }
    else
    {
      if (isNaN(this.incubation.value))
      {
        return await this.start("incubation");
      }
      let incubation = Number(this.incubation.value) - 1;
      if (incubation == 0)
      {
        update = {"system.incubation.value" : incubation};
        await this.start("duration");
      }
      else 
      {
        update = {"system.incubation.value" : incubation};
      }
    }
    return await this.parent.update(update);
  }

  async finishDuration() {
    let disease = this.parent;
    let msg = game.i18n.format("CHAT.DiseaseFinish", { disease: disease.name });
    let removeDisease = true;
    const symptoms = disease.system.symptoms.value.toLowerCase();

    if (symptoms.includes(game.i18n.localize("NAME.Lingering").toLowerCase())) 
    {
      let lingering = disease.effects.find(e => e.name.includes(game.i18n.localize("WFRP4E.Symptom.Lingering")));
      if (lingering) 
      {
        let difficultyname = lingering.specifier;
        let difficulty = warhammer.utility.findKey(difficultyname, game.wfrp4e.config.difficultyNames, { caseInsensitive: true }) || "challenging"
	  
        let test = await this.parent.actor.setupSkill(game.i18n.localize("NAME.Endurance"), {appendTitle: ` - ${game.i18n.localize("NAME.Lingering")}`, fields: {difficulty : difficulty} }, {skipTargets: true});
        await test.roll();

        if (test.failed) 
        {
          let negSL = Math.abs(test.result.SL);
          let lingeringDisease;

          if (negSL <= 1) 
          {
            let roll = (await new Roll("1d10").roll({allowInteractive : false})).total;
            msg += "<br>" + game.i18n.format("CHAT.LingeringExtended", { roll });
            removeDisease = false;
            disease.system.duration.value = roll;
          } 
          else if (negSL <= 5) 
          {
            msg += "<br>" + game.i18n.localize("CHAT.LingeringFestering");
            lingeringDisease = await fromUuid("Compendium.wfrp4e-core.items.kKccDTGzWzSXCBOb");
          } 
          else if (negSL >= 6) 
          {
            msg += "<br>" + game.i18n.localize("CHAT.LingeringRot");
            lingeringDisease = await fromUuid("Compendium.wfrp4e-core.items.M8XyRs9DN12XsFTQ");
          }

          if (lingeringDisease) 
          {
            lingeringDisease = lingeringDisease.toObject();
            lingeringDisease.system.incubation.value = 0;
            lingeringDisease.system.duration.active = true;

            await Item.create(lingeringDisease, {parent : disease.actor});
          }
        }
      }
    }

    ChatMessage.create(foundry.utils.mergeObject(this.getMessageData(msg), {whisper : ChatMessage.getWhisperRecipients("GM")}));

    if (removeDisease) 
    {
      await disease.delete();
    }

    return disease;
  }

  // Effects from this disease should transfer if it is not a symptom, or if it is, only if the disease is active
  shouldTransferEffect(effect)
  {
    return !effect.getFlag("wfrp4e", "symptom") || this.duration.active === true;
  }

  getMessageData(content="")
  {
    return {content, speaker : {alias: this.parent.name}, flavor : this.parent.actor.name};
  }
}