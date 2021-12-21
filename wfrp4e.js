
// Import Modules
import ActorSheetWfrp4e from "./modules/actor/sheet/actor-sheet.js"
import ActorSheetWfrp4eCharacter from "./modules/actor/sheet/character-sheet.js";
import ActorSheetWfrp4eNPC from "./modules/actor/sheet/npc-sheet.js";
import ActorSheetWfrp4eCreature from "./modules/actor/sheet/creature-sheet.js";
import ActorSheetWfrp4eVehicle from "./modules/actor/sheet/vehicle-sheet.js";
import ItemSheetWfrp4e from "./modules/item/item-sheet.js";
import ActorWfrp4e from "./modules/actor/actor-wfrp4e.js";
import ItemWfrp4e from "./modules/item/item-wfrp4e.js";
import registerHooks from "./modules/system/hooks.js"
import GeneratorWfrp4e from "./modules/apps/char-gen.js";
import MarketWfrp4e from "./modules/apps/market-wfrp4e.js";
import NameGenWfrp from "./modules/apps/name-gen.js";
import StatBlockParser from "./modules/apps/stat-parser.js";
import BrowserWfrp4e from "./modules/apps/wfrp-browser.js";
import WFRP_Audio from "./modules/system/audio-wfrp4e.js";
import WFRP4E from "./modules/system/config-wfrp4e.js"
import ChatWFRP from "./modules/system/chat-wfrp4e.js";
import OpposedWFRP from "./modules/system/opposed-wfrp4e.js";
import WFRP_Tables from "./modules/system/tables-wfrp4e.js";
import WFRP_Utility from "./modules/system/utility-wfrp4e.js";
import AOETemplate from "./modules/system/aoe.js"
import ActorSettings from "./modules/apps/actor-settings.js";
import WFRPActiveEffectConfig from "./modules/apps/active-effect.js";
import Migration from "./modules/system/migrations.js";
import Wfrp4eTableSheet from "./modules/apps/table-sheet.js";
import HomebrewSettings from "./modules/apps/homebrew-settings.js"
import CareerSelector from "./modules/apps/career-selector.js"
import CombatHelpers from "./modules/system/combat.js"
import ActiveEffectWfrp4e from "./modules/system/effect-wfrp4e.js"
import TagManager from "./modules/system/tag-manager.js";
import ItemProperties from "./modules/apps/item-properties.js"
import TestWFRP from "./modules/system/rolls/test-wfrp4e.js";
import CharacteristicTest from "./modules/system/rolls/characteristic-test.js";
import SkillTest from "./modules/system/rolls/skill-test.js";
import WeaponTest from "./modules/system/rolls/weapon-test.js";
import CastTest from "./modules/system/rolls/cast-test.js";
import ChannelTest from "./modules/system/rolls/channel-test.js";
import PrayerTest from "./modules/system/rolls/prayer-test.js";
import TraitTest from "./modules/system/rolls/trait-test.js";
import ModuleUpdater from "./modules/apps/module-updater.js"
import ModuleInitializer from "./modules/apps/module-initialization.js";
import WFRPTableConfig from "./modules/apps/table-config.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function () {

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wfrp4e", ActorSheetWfrp4eCharacter, { types: ["character"], makeDefault: true });
  Actors.registerSheet("wfrp4e", ActorSheetWfrp4eNPC, { types: ["npc"], makeDefault: true });
  Actors.registerSheet("wfrp4e", ActorSheetWfrp4eCreature, { types: ["creature"], makeDefault: true });
  Actors.registerSheet("wfrp4e", ActorSheetWfrp4eVehicle, { types: ["vehicle"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wfrp4e", ItemSheetWfrp4e, { makeDefault: true });
  DocumentSheetConfig.registerSheet(RollTable, "wfrp4e", WFRPTableConfig, {makeDefault: true})
  DocumentSheetConfig.registerSheet(ActiveEffect, "wfrp4e", WFRPActiveEffectConfig, {makeDefault :true})

  game.wfrp4e = {
    apps: {
      ActorSheetWfrp4e,
      ActorSheetWfrp4eCharacter,
      ActorSheetWfrp4eCreature,
      ActorSheetWfrp4eNPC,
      ActorSheetWfrp4eVehicle,
      ItemSheetWfrp4e,
      GeneratorWfrp4e,
      StatBlockParser,
      BrowserWfrp4e,
      ActorSettings,
      WFRPActiveEffectConfig,
      Wfrp4eTableSheet,
      HomebrewSettings,
      CareerSelector,
      ItemProperties,
      ModuleUpdater,
      ModuleInitializer
    },
    entities: {
      ActorWfrp4e,
      ItemWfrp4e
    },
    rolls : {
      TestWFRP,
      CharacteristicTest,
      SkillTest,
      WeaponTest,
      CastTest,
      ChannelTest,
      PrayerTest,
      TraitTest
    },
    utility: WFRP_Utility,
    tables: WFRP_Tables,
    config: WFRP4E,
    chat: ChatWFRP,
    market: MarketWfrp4e,
    audio: WFRP_Audio,
    opposed: OpposedWFRP,
    names: NameGenWfrp,
    config: WFRP4E,
    combat: CombatHelpers,
    aoe: AOETemplate,
    migration: Migration,
    tags : new TagManager()
  }

  // Assign the actor class to the CONFIG
  CONFIG.Actor.documentClass = ActorWfrp4e;
  CONFIG.Item.documentClass = ItemWfrp4e;
  CONFIG.ActiveEffect.documentClass = ActiveEffectWfrp4e
});

registerHooks()