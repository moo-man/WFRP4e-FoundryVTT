import WFRP_Utility from "../system/utility-wfrp4e.js";
import FoundryOverrides from "../system/overrides.js";
import MooHouseRules from "../system/moo-house.js"
import socketHandlers from "../system/socket-handlers.js";

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

    SocketHandlers.register(socketHandlers);

    Object.defineProperty(game.user, "isUniqueGM", {
      get: function () { return game.user.id == game.users.activeGM.id }
    })

    // Automatically disable Auto Fill Advantage if group advantage is enabled
    if (game.settings.get("wfrp4e", "useGroupAdvantage") && game.user.isGM && game.settings.get("wfrp4e", "autoFillAdvantage"))
    {
      ui.notifications.info("AutoFillAdvantageDisabled", {localize: true, permanent : true})
      game.settings.set("wfrp4e", "autoFillAdvantage", false)
    }

    const MIGRATION_VERSION = 11;
    let currentMigration = game.settings.get("wfrp4e", "systemMigrationVersion")
    let needMigration = foundry.utils.isNewerVersion(MIGRATION_VERSION, currentMigration)
    if (needMigration && game.user.isGM) {
      ChatMessage.create({content: `
      <hr>
      <h1>New Users - Read This!</h1>
      <p>Welcome! Before you dive in, it may be best to browse the Wiki, below are some important topics:</p>
      <ul>
      <li><p><a href="https://moo-man.github.io/WFRP4e-FoundryVTT/pages/faq.html">FAQ</a></p></li>
      <li><p><a href="https://moo-man.github.io/WFRP4e-FoundryVTT/pages/basics/basics.html">Basics</a></p></li>
      <li><p><a href="https://moo-man.github.io/WFRP4e-FoundryVTT/pages/premium.html">Premium Content</a> (this will tell you how to use any official content you've purchased!</p></li>
      <li><p><a href="https://moo-man.github.io/WFRP4e-FoundryVTT/pages/troubleshooting.html">Troubleshooting</a></p></li>
      </ul>
      <p><strong>Note</strong>: Documentation is always a work in progress, some things may be incomplete, if you have questions, see the Discords linked in the home page</p>
      <p><strong>Also Note</strong>: While Character creation should be functional, it may be rather ugly until it gets updated to use the new features in V13</p>
      <hr>
      <h1>WFRP4e in Foundry V13</h1>
      <p>As Foundry itself progresses in its adoption of its new application framework, so too has the WFRP system. <em>Tens of thousands</em> of lines of code, styling, and html dating back from the system's earliest renditions (2020ish) have been removed and rewritten.</p>
      <p>However, the longbeards grumble that what's new is unproven and untested, so please be patient if issues arise as I try to bring the new sheets and menus up to match all the functionality of the old ones (particularly character creation!).</p>
      <p>In brief, the most notable changes are
      <ul>
      <li><p>The <em>monolithic</em> CSS file for the system's styling has been completely removed. Not to worry, this has been replaced with a much more flexible, cleaner, and customizable version. If you want to customize your WFRP theme, check out the <strong>Theme Config</strong> in the system settings</p></li>
      <li><p>Actor and Item Sheets in V2 have had their <em>right click</em> functionalities greatly expanded. You can right click any owned Item or Active Effect to see a context menu for various actions.</p></li>
      <li><p>Module Initialization has been centralized in the System settings, check the wiki link above!</p></li>
      </ul>
        `,
      speaker : {alias : "INFO"}}
        )

      if (currentMigration != 10) // No need to actually migrate if coming from 10, just display message
      {
        game.wfrp4e.migration.migrateWorld()
      }
    }
    game.settings.set("wfrp4e", "systemMigrationVersion", MIGRATION_VERSION)




    // Some entities require other entities to be loaded to prepare correctly (vehicles and mounts)
    for (let e of game.wfrp4e.postReadyPrepare)
      e.prepareData();

    CONFIG.statusEffects = game.wfrp4e.config.statusEffects;

    MooHouseRules();

    game.wfrp4e.tags.createTags();
  })

  FoundryOverrides();
}
