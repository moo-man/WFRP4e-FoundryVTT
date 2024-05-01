import WFRP_Utility from "../system/utility-wfrp4e.js";
import FoundryOverrides from "../system/overrides.js";
import MooHouseRules from "../system/moo-house.js"
import OpposedWFRP from "../system/opposed-wfrp4e.js";
import OpposedTest from "../system/opposed-test.js";

export default function () {
  Hooks.on("ready", async () => {


    Object.defineProperty(game.user, "isUniqueGM", {
      get: function () { return game.user.id == game.users.find(u => u.active && u.isGM)?.id }
    })

    CONFIG.ChatMessage.documentClass.prototype.getTest = function () {
      if (hasProperty(this, "flags.testData"))
        return game.wfrp4e.rolls.TestWFRP.recreate(this.flags.testData)   
    }
    CONFIG.ChatMessage.documentClass.prototype.getOppose = function () {
      if (hasProperty(this, "flags.wfrp4e.opposeData"))
        return new OpposedWFRP(getProperty(this, "flags.wfrp4e.opposeData"))
    }

    CONFIG.ChatMessage.documentClass.prototype.getOpposedTest = function () {
      if (hasProperty(this, "flags.wfrp4e.opposeTestData"))
        return OpposedTest.recreate(getProperty(this, "flags.wfrp4e.opposeTestData"))
    }

    CONFIG.MeasuredTemplate.documentClass.prototype.areaEffect = function () {
      if (this.getFlag("wfrp4e", "effectUuid"))
      {
        let effect = fromUuidSync(this.getFlag("wfrp4e", "effectUuid"))
        if (effect && effect.applicationData.type != "aura")
        {
          effect.updateSource({"flags.wfrp4e.fromMessage" : this.getFlag("wfrp4e", "messageId")})
          effect.updateSource({"flags.wfrp4e.fromArea" : this.uuid})
          return effect;
        }
      }
    }

    //***** Change cursor styles if the setting is enabled *****

    if (game.settings.get('wfrp4e', 'customCursor')) {
      WFRP_Utility.log('Using custom cursor', true)
      if (await srcExists("systems/wfrp4e/ui/cursors/pointer.png")) {
        let link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet')
        link.type = 'text/css'
        link.href = 'systems/wfrp4e/css/cursor.css'

        document.head.appendChild(link);
      }
      else {
        WFRP_Utility.log('No custom cursor found', true)
      }
    }

    // Automatically disable Auto Fill Advantage if group advantage is enabled
    if (game.settings.get("wfrp4e", "useGroupAdvantage") && 
      game.user.isGM && 
      game.settings.get("wfrp4e", "autoFillAdvantage"))
    {
      ui.notifications.notify(game.i18n.localize("AutoFillAdvantageDisabled"), {permanent : true})
      game.settings.set("wfrp4e", "autoFillAdvantage", false)
    }

    game.wfrp4e.socket.register();

    const body = $("body");
    body.on("dragstart", "a.condition-chat", WFRP_Utility._onDragConditionLink)

    // if (game.modules.get("about-time") && game.modules.get("about-time").active && game.user.isUniqueGM)
    //   game.Gametime.doEvery(GM{hours:24}, () => {
    //     game.actors.contents.filter(a => a.hasPlayerOwner).forEach(a => {
    //       a.decrementDiseases()
    //       a.decrementInjuries()
    //     })
    //   })




    const MIGRATION_VERSION = 9;
    let needMigration = isNewerVersion(MIGRATION_VERSION, game.settings.get("wfrp4e", "systemMigrationVersion"))
    if (needMigration && game.user.isGM) {
      ChatMessage.create({content: `<h1>The Effect Refactor</h1>
        <p>WFRP4e Version 7.1.0 has entirely reworked how Active Effects are implemented, and all the automation you're used to has been vastly improved! However, existing Actors need to be updated manually. The automatic migration handles the basics, but won't update your Actors with the new Items.</p>
        
        <p><strong>Minimum</strong>: Make sure your preimum modules are updated! Delete module content you've imported in your world, then replace every Talent on your unique Actors, like Player Characters or other ones you've created yourself. Reimport the module content you wish to use, which should be updated with the latest Items.</p>
        
        <p>If Talents aren't replaced in this way, you may notice that the Roll Dialog won't have the selectable SL bonuses from the Talents.<p/>
        
        <p><a href="https://moo-man.github.io/WFRP4e-FoundryVTT/pages/effects/effect-refactor.html">Read more about the Effect Refactor</a></p>
        `
      }, {speaker : {alias : "ATTENTION"}}
        )
      game.wfrp4e.migration.migrateWorld()
    }
    game.settings.set("wfrp4e", "systemMigrationVersion", MIGRATION_VERSION)




    // Some entities require other entities to be loaded to prepare correctly (vehicles and mounts)
    for (let e of game.wfrp4e.postReadyPrepare)
      e.prepareData();

    game.wfrp4e.config.PrepareSystemItems();
    CONFIG.statusEffects = game.wfrp4e.config.statusEffects;

    MooHouseRules();
    canvas.tokens.placeables.forEach(t => t.drawEffects())

    game.wfrp4e.tags.createTags();

  })

  FoundryOverrides();

}
