
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
import CharGenWfrp4e from "./modules/apps/chargen/char-gen.js"
import MarketWfrp4e from "./modules/apps/market-wfrp4e.js";
import NameGenWfrp from "./modules/apps/name-gen.js";
import StatBlockParser from "./modules/apps/stat-parser.js";
import BrowserWfrp4e from "./modules/apps/wfrp-browser.js";
import WFRP_Audio from "./modules/system/audio-wfrp4e.js";
import WFRP4E from "./modules/system/config-wfrp4e.js"
import ChatWFRP from "./modules/system/chat-wfrp4e.js";
import OpposedWFRP from "./modules/system/opposed-wfrp4e.js";
import OpposedTest from "./modules/system/opposed-test.js";
import WFRP_Tables from "./modules/system/tables-wfrp4e.js";
import WFRP_Utility from "./modules/system/utility-wfrp4e.js";
import AOETemplate from "./modules/system/aoe.js"
import ActorSettings from "./modules/apps/actor-settings.js";
import WFRPActiveEffectConfig from "./modules/apps/effect-config.js";
import Migration from "./modules/system/migrations.js";
import HomebrewSettings from "./modules/apps/homebrew-settings.js"
import CareerSelector from "./modules/apps/career-selector.js"
import CombatHelpers from "./modules/system/combat.js"
import TagManager from "./modules/system/tag-manager.js";
import ItemProperties from "./modules/apps/item-properties.js"
import TestWFRP from "./modules/system/rolls/test-wfrp4e.js";
import CharacteristicTest from "./modules/system/rolls/characteristic-test.js";
import SkillTest from "./modules/system/rolls/skill-test.js";
import WeaponTest from "./modules/system/rolls/weapon-test.js";
import CastTest from "./modules/system/rolls/cast-test.js";
import WomCastTest from "./modules/system/rolls/wom-cast-test.js";
import ChannelTest from "./modules/system/rolls/channel-test.js";
import PrayerTest from "./modules/system/rolls/prayer-test.js";
import TraitTest from "./modules/system/rolls/trait-test.js";
import ModuleUpdater from "./modules/apps/module-updater.js"
import ModuleInitializer from "./modules/apps/module-initialization.js";
import WFRPTableConfig from "./modules/apps/table-config.js";
import ItemDialog from "./modules/apps/item-dialog.js";
import ValueDialog from "./modules/apps/value-dialog.js";
import { WFRPJournalTextPageSheet } from "./modules/system/journal-sheet.js";
import { ChargenStage } from "./modules/apps/chargen/stage.js";
import { CharacterModel } from "./modules/model/actor/character.js";
import { VehicleModel } from "./modules/model/actor/vehicle.js";
import { NPCModel } from "./modules/model/actor/npc.js";
import { CreatureModel } from "./modules/model/actor/creature.js";
import { AmmunitionModel } from "./modules/model/item/ammunition.js";
import { ArmourModel } from "./modules/model/item/armour.js";
import { CareerModel } from "./modules/model/item/career.js";
import { ContainerModel } from "./modules/model/item/container.js";
import { CriticalModel } from "./modules/model/item/critical.js";
import { DiseaseModel } from "./modules/model/item/disease.js";
import { InjuryModel } from "./modules/model/item/injury.js";
import { MoneyModel } from "./modules/model/item/money.js";
import { MutationModel } from "./modules/model/item/mutation.js";
import { PrayerModel } from "./modules/model/item/prayer.js";
import { PsychologyModel } from "./modules/model/item/psychology.js";
import { TalentModel } from "./modules/model/item/talent.js";
import { TrappingModel } from "./modules/model/item/trapping.js";
import { SkillModel } from "./modules/model/item/skill.js";
import { SpellModel } from "./modules/model/item/spell.js";
import { TraitModel } from "./modules/model/item/trait.js";
import { WeaponModel } from "./modules/model/item/weapon.js";
import { ExtendedTestModel } from "./modules/model/item/extendedTest.js";
import { VehicleModModel } from "./modules/model/item/vehicleMod.js";
import { CargoModel } from "./modules/model/item/cargo.js";
import WFRP4eActiveEffectConfig from "./modules/apps/effect-config.js";
import EffectWfrp4e from "./modules/system/effect-wfrp4e.js";
import SocketHandlers from "./modules/system/socket-handlers.js";
import loadScripts from "./loadScripts.js"

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", function () {

  // #if _ENV === "development"
  CONFIG.debug.wfrp4e = true;
  WFRP_Utility.log("Development Mode: Logs on")
  //#endif

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wfrp4e", ActorSheetWfrp4eCharacter, { types: ["character"], makeDefault: true });
  Actors.registerSheet("wfrp4e", ActorSheetWfrp4eNPC, { types: ["npc"], makeDefault: true });
  Actors.registerSheet("wfrp4e", ActorSheetWfrp4eCreature, { types: ["creature"], makeDefault: true });
  Actors.registerSheet("wfrp4e", ActorSheetWfrp4eVehicle, { types: ["vehicle"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wfrp4e", ItemSheetWfrp4e, { makeDefault: true });
  DocumentSheetConfig.registerSheet(RollTable, "wfrp4e", WFRPTableConfig, {makeDefault: true})
  DocumentSheetConfig.registerSheet(ActiveEffect, "wfrp4e", WFRP4eActiveEffectConfig, {makeDefault :true})
  // DocumentSheetConfig.registerSheet(JournalEntry, "wfrp4e", WFRPJournalSheet, {makeDefault :true})
  DocumentSheetConfig.registerSheet(JournalEntryPage, "wfrp4e", WFRPJournalTextPageSheet, {types: ["text"], makeDefault: true, label : "WFRP Journal Sheet (ProseMirror)"})

  CONFIG.Actor.dataModels["character"] = CharacterModel;
  CONFIG.Actor.dataModels["npc"] = NPCModel;
  CONFIG.Actor.dataModels["creature"] = CreatureModel;
  CONFIG.Actor.dataModels["vehicle"] = VehicleModel;

  CONFIG.Item.dataModels["ammunition"] = AmmunitionModel
  CONFIG.Item.dataModels["armour"] = ArmourModel
  CONFIG.Item.dataModels["career"] = CareerModel
  CONFIG.Item.dataModels["container"] = ContainerModel
  CONFIG.Item.dataModels["critical"] = CriticalModel
  CONFIG.Item.dataModels["disease"] = DiseaseModel
  CONFIG.Item.dataModels["injury"] = InjuryModel
  CONFIG.Item.dataModels["money"] = MoneyModel
  CONFIG.Item.dataModels["mutation"] = MutationModel
  CONFIG.Item.dataModels["prayer"] = PrayerModel
  CONFIG.Item.dataModels["psychology"] = PsychologyModel
  CONFIG.Item.dataModels["talent"] = TalentModel
  CONFIG.Item.dataModels["trapping"] = TrappingModel
  CONFIG.Item.dataModels["skill"] = SkillModel
  CONFIG.Item.dataModels["spell"] = SpellModel
  CONFIG.Item.dataModels["trait"] = TraitModel
  CONFIG.Item.dataModels["weapon"] = WeaponModel
  CONFIG.Item.dataModels["vehicleMod"] = VehicleModModel
  CONFIG.Item.dataModels["extendedTest"] = ExtendedTestModel
  CONFIG.Item.dataModels["cargo"] = CargoModel

  game.wfrp4e = {
    apps: {
      ActorSheetWfrp4e,
      ActorSheetWfrp4eCharacter,
      ActorSheetWfrp4eCreature,
      ActorSheetWfrp4eNPC,
      ActorSheetWfrp4eVehicle,
      ItemSheetWfrp4e,
      CharGenWfrp4e,
      StatBlockParser,
      BrowserWfrp4e,
      ActorSettings,
      WFRPActiveEffectConfig,
      HomebrewSettings,
      CareerSelector,
      ItemProperties,
      ModuleUpdater,
      ModuleInitializer,
      ItemDialog,
      ValueDialog,
      ChargenStage
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
      WomCastTest,
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
    opposedTest: OpposedTest,
    names: NameGenWfrp,
    combat: CombatHelpers,
    aoe: AOETemplate,
    migration: Migration,
    socket: SocketHandlers,
    tags : new TagManager()
  }

  CONFIG.Actor.documentClass = ActorWfrp4e;
  CONFIG.Item.documentClass = ItemWfrp4e;
  CONFIG.ActiveEffect.documentClass = EffectWfrp4e
  CONFIG.ActiveEffect.legacyTransferral = false;
});

registerHooks()
loadScripts();