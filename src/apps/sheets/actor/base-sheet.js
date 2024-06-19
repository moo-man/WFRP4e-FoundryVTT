const { ActorSheetV2 } = foundry.applications.sheets
const { HandlebarsApplicationMixin } = foundry.applications.api

export default class BaseActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) 
{
    static DEFAULT_OPTIONS = {
        classes: ["wfrp4e", "actor"],
        actions: {
            
        },
        window : {
          resizable : true
        }
      }

      static TABS = {
        main : {
          id : "main",
          group : "primary",
          label : "Main",
        },
        skills : {
          id : "skills",
          group : "primary",
          label : "Skills",
        },
        talents : {
          id : "talents",
          group : "primary",
          label : "Talents",
        },
        combat : {
          id : "combat",
          group : "primary",
          label : "Combat",
        },
        effects : {
          id : "effects",
          group : "primary",
          label : "Effects",
        },
        religion : {
          id : "religion",
          group : "primary",
          label : "Religion",
        },
        magic : {
          id : "magic",
          group : "primary",
          label : "Magic",
        },
        notes : {
          id : "notes",
          group : "primary",
          label : "Notes",
        }
      }

      async _prepareContext(options)
      {
        let context = await super._prepareContext(options);
        context.actor = this.actor;
        context.system = this.actor.system;
        context.items = this.actor.itemTypes;
        context.tabs = this._prepareTabs(options);
        return context;
      }

      async _preparePartContext(partId, context) {
        context.partId = `${this.id}-${partId}`;
        context.tab = context.tabs[partId];
        return context;
      }

      _prepareTabs(options)
      {
        let tabs = foundry.utils.deepClone(this.constructor.TABS);

        if (!this.actor.hasSpells)
        {
          delete tabs.magic;
        }

        if (!this.actor.hasPrayers)
        {
          delete tabs.religion;
        }

        for(let t in tabs)
        {
          tabs[t].active = this.tabGroups[tabs[t].group] === tabs[t].id,
          tabs[t].cssClass = tabs[t].active ? "active" : "";
        }

        if (!Object.values(tabs).some(t => t.active))
        {
          tabs.main.active = true;
          tabs.main.cssClass = "active";
        }

        return tabs;
      }
}