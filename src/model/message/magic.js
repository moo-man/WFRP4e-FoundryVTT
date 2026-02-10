/** 
 * Decouples the use of spells and miracles from their Test, allowing them to be "cast" without the need of a Test
 */
import CastTest from "../../system/rolls/cast-test.js";
import WFRP_Utility from "../../system/utility-wfrp4e.js";
let fields = foundry.data.fields;

export class MagicUseMessageModel extends WarhammerMessageModel {
  static defineSchema() 
  {
      let schema = {};

      // Item data for the spell or miracle
      schema.itemData = new fields.ObjectField();

      // How many times this item can be dragged from chat
      schema.sourceData = new fields.SchemaField({
        test : new fields.StringField(), // Message ID for casting test
        uuid : new fields.DocumentUUIDField(), // If spell came  from an Item (like a ring or scroll)
        item : new fields.DocumentUUIDField(), // Spell UUID
      });

      schema.testData = new fields.SchemaField({
        damage : new fields.NumberField(),
        range: new fields.SchemaField({
          value: new fields.NumberField({}),
          unit: new fields.StringField({}),
          text: new fields.StringField({})
        }),
        duration: new fields.SchemaField({
          value: new fields.NumberField({}),
          unit: new fields.StringField({}),
          text: new fields.StringField({})
        }),
        target: new fields.SchemaField({
          value: new fields.NumberField({}),
          unit: new fields.StringField({}),
          text: new fields.StringField({}),
          AoE: new fields.BooleanField({}),
        }),
        other: new fields.ArrayField(new fields.StringField()),
        loreChosen: new fields.StringField(),
        hitloc: new fields.SchemaField({
          description: new fields.StringField(),
          result: new fields.StringField(),
          roll: new fields.NumberField()
        })
      })

      schema.targetSpeakers = new fields.ArrayField(new fields.SchemaField({
        actor: new fields.StringField(),
        token: new fields.StringField(),
        scene: new fields.StringField(),
        alias: new fields.StringField()
      }))

      schema.damageApplied = new fields.ObjectField({}) // Token IDs mapped to their damage confirmations

      return schema;
  }
  
  get sourceTest()
  {
    return game.messages.get(this.sourceData.test)?.system.test;
  }

  get test() 
  {
    return this.sourceTest;
  }

  get actor()
  {
    return this.test?.actor || this.item.actor || fromUuidSync(this.sourceData.uuid)?.actor;
  }

  static get actions() {
    return foundry.utils.mergeObject(super.actions, {
      expandItem: this._onExpandItem,
      applyDamage : this.onApplyDamage
    });
  }

  get item()
  {
    return new Item.implementation(this.itemData);
  }

  get damageEffects() 
  {
      return this.item?.damageEffects || [];
  }

  get targetEffects() 
  {
      return this.item?.targetEffects || [];
  }

  get areaEffects() 
  {
      return this.item?.areaEffects || [];
  }

  static async onApplyDamage(ev)
  {
    let targets = Array.from(game.user.targets).map(i => i.document).filter(i => i.actor)

    let addSpeakers = [];
    let damageApplied = foundry.utils.deepClone(this.damageApplied);
    for(let token of targets.length ? targets : (this.targetSpeakers.map(t => WFRP_Utility.getToken(t))))
    {
      if (!token.isOwner)
      {
        return ui.notifications.error("ErrorDamagePermission", {localize: true})
      }
      if (!this.targetSpeakers.find(t => t.token == token.id))
      {
        addSpeakers.push({token: token.id, actor: token.actor.id, scene: token.parent.id, alias: token.name})
      }

      damageApplied[token.id] = await token.actor.applyDamage(this.testData.damage);
    }
    let targetSpeakers = this.targetSpeakers.concat(addSpeakers)
    await this.parent.update({"system.damageApplied" : damageApplied, "system.targetSpeakers" : targetSpeakers});
    // Update locally because above update doesn't finish in time for rendering (not sure why)
    this.renderMessage();
  }

  async renderMessage()
  {
    let content = await this.constructor._renderHTMLContent({
      item: this.item, 
      actor: this.actor,
      testData: this.testData,
      targetSpeakers: this.parent.system .targetSpeakers,  // need to go through parent because `this.targetSpeakers` doesn't get changed immediately for some reason
      damageApplied: this.parent.system .damageApplied 
    });
    this.parent.update({content});
  }

  async onRender(html)
  {
    warhammer.utility.replacePopoutTokens(html);

    html.querySelectorAll(".targets .target").forEach(e => {
      e.addEventListener("mouseenter", ev => TokenHelpers.highlightToken(ev.target.dataset.id))
      e.addEventListener("mouseleave", ev => TokenHelpers.unhighlightToken(ev.target.dataset.id))
    })
  }

  static _onExpandItem(ev, target) {
    target.parentElement.querySelector(".item-description").classList.toggle("expanded");
  }

  static async _renderHTMLContent({item, testData, targetSpeakers, damageApplied}={})
  {
    let targets = targetSpeakers.map(i => WFRP_Utility.getToken(i));
    return await foundry.applications.handlebars.renderTemplate("systems/wfrp4e/templates/chat/magic.hbs", {item, targetEffects: item.targetEffects, damageApplied, areaEffects: item.areaEffects, testData, targets, description : {
      public: await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description.value, {relativeTo: item}),
      gm: await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.gmdescription.value, {relativeTo: item})
    }})
  }

  /**
   * 
   * @param {Object} test Casting Test
   * @param {*} testData Customized test data
   */
  static async _formatTestResult({test, testData={}, item}={})
  {
      let range;
      let duration;
      let target;

      // If range is standard (X yards) and is overcastable
      if (test.result.overcast.usage.range)
      {
        range = {
          value: test.result.overcast.usage.range.current,
          unit: test.result.overcast.usage.range.unit,
          text: `${test.result.overcast.usage.range.current} ${test.result.overcast.usage.range.unit}`
        }
      }
      // Not standard range, just use text description in item
      else 
      {
        range = {
          text: item.system.range.value
        }
      }


      // If duration is standard (X yards) and is overcastable
      if (test.result.overcast.usage.duration)
      {
        duration = {
          value: test.result.overcast.usage.duration.current,
          unit: test.result.overcast.usage.duration.unit,
          text: `${test.result.overcast.usage.duration.current} ${test.result.overcast.usage.duration.unit}`
        }
      }
      // Not standard duration, just use text description in item
      else       
      {
        duration = {
          text: item.system.duration.value
        }
      }


      // If target is standard (numeric or AoE) and is overcastable
      if (test.result.overcast.usage.target)
      {

        if (test.result.overcast.usage.target)

        target = {
          value: test.result.overcast.usage.target.current,
          unit: test.result.overcast.usage.target.unit,
          text: `${test.result.overcast.usage.target.current} ${test.result.overcast.usage.target.unit}`,
          AoE: test.result.overcast.usage.target.AoE
        }

        if (target.AoE)
        {
          target.text = `AoE (${target.text})`
        }
      }
      // Not standard target, just use text description in item
      else       
      {
        target = {
          text: item.system.target.value
        }
      }

      return {
        damage: test.result.damage || 0,
        range,
        duration,
        target,
        lore: test.context.loreChosen,
        other: [],
        hitloc: test.result.hitloc
      }
  }

    /**
     * 
     * @param {Object} test Spellcasting or miracle test
     * @param {Item} item Create directly from spell or miracle item
     * @param {Item} source Source of the spell, if any (like a magic item that casts a spell)
     */
    static async create({test, item, source}, testData={}) 
    {
      if (test instanceof CastTest)
      {
         item = test.spell;
      }
      else if (!["prayer", "spell"].includes(item?.type))
      {
        throw Error("Spell or prayer not provided")
      }

      let itemData = item.toObject();
      let actor = test?.actor || source?.actor;
      let targeted = Array.from(game.user.targets).map(i => i.document).filter(i => i.actor).map(token => ({token: token.id, actor: token.actor.id, scene: token.parent.id, alias: token.name}))
      let targets = targeted.length ? targeted : (test?.context._targets || [])
      testData = await this._formatTestResult({test, testData, item})

      await Promise.all(item.runScripts("castSpellPrayer", {test, source, testData, targetSpeakers : targets}));
      let content = await this._renderHTMLContent({item, testData, actor, targetSpeakers: targets});
      return await ChatMessage.create(ChatMessage.applyRollMode({
        type : "magic",
        content,
        system : {
          itemData, 
          sourceData: {
            test: test?.message?.id,
            uuid : source?.uuid,
            item: item.uuid,
          },
          testData,
          targetSpeakers: targets,
        },
        speaker : test.context.speaker
      }, game.settings.get("core", "rollMode")))
    }


}