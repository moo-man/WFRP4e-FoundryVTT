import WFRP_Utility from "../system/utility-wfrp4e.js";
import FoundryOverrides from "../system/overrides.js";
import MooHouseRules from "../system/moo-house.js"

export default function () {
  Hooks.on("ready", async () => {

    let theme = game.settings.get("wfrp4e", "theme");
    if (!theme.apps.enabled)
    {
      document.body.classList.add("no-theme")
    }
    else if (theme.apps.font == "classic")
    {
      if (theme.apps.font == "classic")
      {
        document.body.classList.add("classic-font");
      }
    }

    if (!theme.sidebar.enabled)
    {
      ui.sidebar.element.classList.add("no-theme")
      document.body.querySelector("#chat-notifications").classList.add("no-theme")
    }
    else if (theme.sidebar.font == "classic")
    {
      if (theme.sidebar.font == "classic")
      {
        ui.sidebar.element.classList.add("classic-font");
        document.body.querySelector("#chat-notifications").classList.add("classic-font")
      }
    }

    SocketHandlers.register.bind(SocketHandlers)();

    Object.defineProperty(game.user, "isUniqueGM", {
      get: function () { return game.user.id == game.users.activeGM.id }
    })

    // Automatically disable Auto Fill Advantage if group advantage is enabled
    if (game.settings.get("wfrp4e", "useGroupAdvantage") && 
      game.user.isGM && 
      game.settings.get("wfrp4e", "autoFillAdvantage"))
    {
      ui.notifications.notify(game.i18n.localize("AutoFillAdvantageDisabled"), {permanent : true})
      game.settings.set("wfrp4e", "autoFillAdvantage", false)
    }

    const MIGRATION_VERSION = 10;
    let needMigration = foundry.utils.isNewerVersion(MIGRATION_VERSION, game.settings.get("wfrp4e", "systemMigrationVersion"))
    if (needMigration && game.user.isGM) {
      ChatMessage.create({content: `
      <h1>WFRP4e in Foundry V13</h1>
      <p>As Foundry itself progresses in its adoption of its new application framework, so too has the WFRP system. <em>Tens of thousands</em> of lines of code, styling, and html dating back from the system's earliest renditions (2020s) have been removed have been removed and rewritten.</p>
      <p>However, the longbeards grumble that what's new is unproven and untested, so please be patient if issues arise as I try to bring the new sheets and menus up to match all the functionality of the old ones.</p>
      <p>In brief, the most notable changes are
      <ul>
      <li><p>The <em>monolithic</em> CSS file for the system's styling has been completely removed. Not to worry, this has been replaced with a much more flexible, cleaner, and customizable version. If you want to customize your WFRP theme, check out the <strong>Theme Config</strong> in the system settings</p></li>
      <li><p>Actor and Item Sheets in V2 have had their <em>right click</em> functionalities greatly expanded. You can right click any owned Item or Active Effect to see a context menu for various actions.</p></li>
      </ul>
      <hr>
      <h1>The Effect Refactor</h1>
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
  })

  FoundryOverrides();
}
