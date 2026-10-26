import WFRP_Utility from "../../system/utility-wfrp4e.js";
import WFRPEffectMessageMixin from "./effect-message.js";
let fields = foundry.data.fields;

export class ItemUseModel5e extends WFRPEffectMessageMixin(WarhammerMessageModel) {
  static defineSchema() 
  {
      let schema = {};

      // Item data for the spell or miracle
      schema.itemData = new fields.ObjectField();

      // How many times this item can be dragged from chat
      schema.sourceData = new fields.SchemaField({
        item : new fields.DocumentUUIDField(), // If spell came  from an Item (like a ring or scroll)
        actor : new fields.DocumentUUIDField(), // Actor UUID
      });

      schema.targetSpeakers = new fields.ArrayField(new fields.SchemaField({
        actor: new fields.StringField(),
        token: new fields.StringField(),
        scene: new fields.StringField(),
        alias: new fields.StringField()
      }))


      return schema;
  }
  get actor()
  {
    return fromUuidSync(this.sourceData.actor);
  }

  static get actions() {
    return foundry.utils.mergeObject(super.actions, {
      expandItem: this._onExpandItem,
      rollTest: this._onRollTest
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

  static getTestLabel(item)
  {
    let effects = item.targetEffects.concat(item.areaEffects);
    if (effects.some(e => e.system.transferData.avoidTest.value == "item"))
    {
      return false
    }
    else
    {
      return item.system.getTestModel()?.targetLabel;
    }
  }

  async renderMessage()
  {
    let content = await this.constructor._renderHTMLContent({
      item: this.item, 
      targetSpeakers: this.parent.system .targetSpeakers  // need to go through parent because `this.targetSpeakers` doesn't get changed immediately for some reason
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

  static _onRollTest(ev, target) {
    let actors = selectedWithFallback();

    actors.forEach(a => {
      this.item.system.getTestModel().setup(a, this.item, {}, "target");
    })
  }

  static async _renderHTMLContent({item, targetSpeakers}={})
  {
    let targets = targetSpeakers.map(i => WFRP_Utility.getToken(i));
    return await foundry.applications.handlebars.renderTemplate("systems/wfrp4e/templates/chat/item-use.hbs", {
      item, 
      noImage: item.img.includes("blank.png") || item.img.includes("item-bag.svg"), 
      testLabel: this.getTestLabel(item),
      targetEffects: item.targetEffects, 
      areaEffects: item.areaEffects, 
      targets, 
      description : {
        public: await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description.value, {relativeTo: item}),
        gm: await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.gmdescription.value, {relativeTo: item})
      }})
  }

    static async create({item, source, actor}) 
    {
      actor = actor || source?.actor;
      if (!item.parent)
      {
        item = new Item.implementation(item.toObject(), {parent: actor || source?.parent})
      }

      let itemData = item.toObject();
      let targets = Array.from(game.user.targets).map(i => i.document).filter(i => i.actor).map(token => ({token: token.id, actor: token.actor.id, scene: token.parent.id, alias: token.name}))

      await Promise.all(item.runScripts("useItem", {item, source, targetSpeakers : targets}));

      let content = await this._renderHTMLContent({item, targetSpeakers: targets});
      return await ChatMessage.create(ChatMessage.applyRollMode({
        type : "item-use",
        content,
        system : {
          itemData, 
          sourceData: {
            item: item.uuid,
            actor: actor.uuid
          },
          targetSpeakers: targets,
        },
        speaker : {alias: actor.prototypeToken.name}
      }, game.settings.get("core", "rollMode")))
    }


}