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

    const MIGRATION_VERSION = 12;
    let currentMigration = game.settings.get("wfrp4e", "systemMigrationVersion")
    let needMigration = foundry.utils.isNewerVersion(MIGRATION_VERSION, currentMigration)
    if (needMigration && game.user.isGM) {
        game.wfrp4e.migration.migrateWorld()
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

  Hooks.on("wfrp4e:firstLoad", () => {
    ChatMessage.create({content: `
    <h1>New Users - Read This!</h1>
    <p>Welcome! Before you dive in, it may be best to browse the Wiki, below are some important topics:</p>
    <ul>
    <li><p><a href="https://moo-man.github.io/WFRP4e-FoundryVTT/pages/faq.html">FAQ</a></p></li>
    <li><p><a href="https://moo-man.github.io/WFRP4e-FoundryVTT/pages/basics/basics.html">Basics</a></p></li>
    <li><p><a href="https://moo-man.github.io/WFRP4e-FoundryVTT/pages/premium.html">Premium Content</a> (this will tell you how to use any official content you've purchased!)</p></li>
    <li><p><a href="https://moo-man.github.io/WFRP4e-FoundryVTT/pages/troubleshooting.html">Troubleshooting</a></p></li>
    </ul>
    <p><strong>Note</strong>: Documentation is always a work in progress, some things may be incomplete, if you have questions, see the Discords linked in the home page</p>
    <p><strong>Also Note</strong>: While Character creation should be functional, it may be rather ugly until it gets updated to ApplicationV2</p>
      `,
    speaker : {alias : "INFO"}}
      )
  })
}
