import WFRP_Utility from "../system/utility-wfrp4e.js";
import FoundryOverrides from "../system/overrides.js";
import MooHouseRules from "../system/moo-house.js"

export default function () {
  Hooks.on("ready", async () => {

    SocketHandlers.register.bind(SocketHandlers)();

    Object.defineProperty(game.user, "isUniqueGM", {
      get: function () { return game.user.id == game.users.activeGM.id }
    })

    //***** Change cursor styles if the setting is enabled *****

    if (game.settings.get('wfrp4e', 'customCursor')) {
      warhammer.utility.log('Using custom cursor', true)
      if (await srcExists("systems/wfrp4e/ui/cursors/pointer.png")) {
        let link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet')
        link.type = 'text/css'
        link.href = 'systems/wfrp4e/css/cursor.css'

        document.head.appendChild(link);
      }
      else {
        warhammer.utility.log('No custom cursor found', true)
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

    const body = $("body");
    body.on("dragstart", "a.condition-chat", WFRP_Utility._onDragConditionLink)

    // if (game.modules.get("about-time") && game.modules.get("about-time").active && game.user.isUniqueGM)
    //   game.Gametime.doEvery(GM{hours:24}, () => {
    //     game.actors.contents.filter(a => a.hasPlayerOwner).forEach(a => {
    //       a.decrementDiseases()
    //       a.decrementInjuries()
    //     })
    //   })




    const MIGRATION_VERSION = 10;
    let needMigration = foundry.utils.isNewerVersion(MIGRATION_VERSION, game.settings.get("wfrp4e", "systemMigrationVersion"))
    if (needMigration && game.user.isGM) {
      ChatMessage.create({content: `<h1>The Effect Refactor</h1>
        <p>If you are updating from pre-WFRP4e Version 7.1.0, Active Effect scripting has been greatly reworked, and all the automation you're used to has been vastly improved! However, existing Actors need to be updated manually. The automatic migration handles the basics, but won't update your Actors with the new Items.</p>
        
        <p><strong>Minimum</strong>: Make sure your preimum modules are updated! Delete module content you've imported in your world, then replace every Talent on your unique Actors, like Player Characters or other ones you've created yourself. Reimport the module content you wish to use, which should be updated with the latest Items.</p>
        
        <p>If Talents aren't replaced in this way, you may notice that the Roll Dialog won't have the selectable SL bonuses from the Talents.<p/>
        
        <p><a href="https://moo-man.github.io/WFRP4e-FoundryVTT/pages/effects/effect-refactor.html">Read more about the Effect Refactor</a></p>

        <p>Note that if this is a brand new world, you can disregard this message.</p>
        `
      }, {speaker : {alias : "ATTENTION - PLEASE READ"}}
        )
      game.wfrp4e.migration.migrateWorld()
    }
    game.settings.set("wfrp4e", "systemMigrationVersion", MIGRATION_VERSION)




    // Some entities require other entities to be loaded to prepare correctly (vehicles and mounts)
    for (let e of game.wfrp4e.postReadyPrepare)
      e.prepareData();

    CONFIG.statusEffects = game.wfrp4e.config.statusEffects;

    MooHouseRules();
    canvas.tokens.placeables.forEach(t => t.drawEffects())

    game.wfrp4e.tags.createTags();

    if (game.mErr)
    {
      warhammer.utility.error("Failed to load compendium data", true)
    }
  })

  FoundryOverrides();
}
