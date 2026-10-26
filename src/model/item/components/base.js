import { ItemUseModel5e } from "../../message/item-use";

let fields = foundry.data.fields;

 export class BaseItemModel extends BaseWarhammerItemModel 
 {

     static defineSchema() 
     {
        return {
            description : new fields.SchemaField({
                value: new fields.HTMLField()
            }),
            gmdescription : new fields.SchemaField({
                value: new fields.HTMLField()
            }),
        } 
     }

     get tags()
     {
        return new Set().add(this.parent.type);
     }

     /** @override */
     static get compendiumBrowserFilters() {
       return new Map([
         ["description", {
           label: "Description",
           type: "text",
           config: {
             keyPath: "system.description.value",
           }
         }]
       ]);
     }

     static _deriveSource(uuid) {
       const source = super._deriveSource(uuid);

       if (game.wfrp4e.config.premiumModules[source.slug])
         source.value = game.wfrp4e.config.premiumModules[source.slug];

       return source;
     }

     async _preCreate(data, options, user)
     {
        await super._preCreate(data, options, user);

        if (!data.img || data.img == "icons/svg/item-bag.svg")
        {
            this.parent.updateSource({img : "systems/wfrp4e/icons/blank.png"});
        }
     }

    get skillToUse() {
        return this.getSkillToUse(this.parent.actor)
    }

    get isMagical() {
        return false;
    }

    async use(actor, {context={}, options={}}={})
    {
      if (this.spend?.momentum && game.settings.get("wfrp4e", "editionSettings")?.use5e)
      {
        if (await actor.spend("system.status.momentum"))
        {
          ui.notifications.notify(`<strong>${this.parent.name}</strong>: Spent Momentum!`)
        }
        else 
        {
          return ui.notifications.error("No Momentum!");
        }
      }
      else if (this.spend?.advantage && !game.settings.get("wfrp4e", "editionSettings")?.use5e)
      {
        if (await actor.spend("system.status.advantage.value", this.spend.advantage))
        {
          ui.notifications.notify(`<strong>${this.parent.name}</strong>: Spent ${this.spend.advantage} Advantage!`)
        }
        else 
        {
          return ui.notifications.error("Not enough Advantage!");
        }

      }
      if (this.test?.hasSelf)
      {
        return this.test.setup(actor, this.parent, {context, options});
      }
      else
      {
        ItemUseModel5e.create({item: this.parent, actor: actor || this.parent.actor});
      }
    }

    /** @override */
    getAvoidTestData()
    {
        return this.getTestModel().target;
    }

    // Some models may not use a root level test property, so should be able to be overridden 
    getTestModel()
    {
      return this.test;
    }

  /**
   * Sometimes a weapon isn't being used by its owning actor (namely: vehicles)
   * So the simple getter BaseItemModel#skillToUse isn't sufficient, we need to provide
   * an actor to use their skills instead
   * 
   * @abstract
   * @param {Object} actor Actor whose skills are being used
   */
    getSkillToUse(actor)
    {
        
    }


    async expandData(htmlOptions) {
        htmlOptions.async = true;
        const data = this.parent.toObject().system;
        data.properties = [];
        data.other = [];
        data.description.value = data.description.value || "";
        data.description.value = await foundry.applications.ux.TextEditor.implementation.enrichHTML(data.description.value, htmlOptions);
        data.manualScripts = this.parent.manualScripts;
        data.independentEffects = this.parent.testIndependentEffects
        return data;
      }

    /**
     * @abstract
     */
    chatData()
    {
        
    } 
 }