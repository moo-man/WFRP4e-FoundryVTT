
// Import Modules
import ActorSheetWFRP4e from "./modules/actor/sheet/actor-sheet.js"
import ActorSheetWFRP4eCharacter from "./modules/actor/sheet/character-sheet.js";
import ActorSheetWFRP4eNPC from "./modules/actor/sheet/npc-sheet.js";
import ActorSheetWFRP4eCreature from "./modules/actor/sheet/creature-sheet.js";
import ActorSheetWFRP4eVehicle from "./modules/actor/sheet/vehicle-sheet.js";
import ItemSheetWfrp4e from "./modules/item/item-sheet.js";
import ActorWFRP4e from "./modules/actor/actor-wfrp4e.js";
import ItemWfrp4e from "./modules/item/item-wfrp4e.js";
import registerHooks from "./modules/system/hooks.js"
import CharGenWfrp4e from "./modules/apps/chargen/char-gen.js"
import MarketWFRP4e from "./modules/apps/market-wfrp4e.js";
import NameGenWfrp from "./modules/apps/name-gen.js";
import StatBlockParser from "./modules/apps/stat-parser.js";
import BrowserWfrp4e from "./modules/apps/wfrp-browser.js";
import WFRP_Audio from "./modules/system/audio-wfrp4e.js";
import WFRP4E from "./modules/system/config-wfrp4e.js"
import ChatWFRP from "./modules/system/chat-wfrp4e.js";
import WFRP_Tables from "./modules/system/tables-wfrp4e.js";
import WFRP_Utility from "./modules/system/utility-wfrp4e.js";
import ActorSettings from "./modules/apps/actor-settings.js";
import WFRPActiveEffectConfig from "./modules/apps/effect-config.js";
import Migration from "./modules/system/migrations.js";
import HomebrewSettings from "./modules/apps/homebrew-settings.js"
import CareerSelector from "./modules/apps/career-selector.js"
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
import WFRPTableConfig from "./modules/apps/table-config.js";
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
import ActiveEffectWFRP4e from "./modules/system/effect-wfrp4e.js";
import loadScripts from "./loadScripts.js"
import { VehicleRoleModel } from "./modules/model/item/vehicleRole.js";
import { VehicleTestModel } from "./modules/model/item/vehicleTest.js";
import TradeManager from "./modules/system/trade/trade-manager.js";
import { WFRP4eActiveEffectModel } from "./modules/model/effect/effect.js";
import socketHandlers from "./modules/system/socket-handlers.js";
import { WFRPTestMessageModel } from "./modules/model/message/test.js";
import { OpposedTestMessage } from "./modules/model/message/opposed-result.js";
import { OpposedHandlerMessage } from "./modules/model/message/oppose-handler.js";
import  OpposedHandler from "./modules/system/opposed-handler.js";
import CombatHelpersWFRP from "./modules/system/combat.js";
import ActorSheetWFRP4eCharacterV2 from "./src/apps/sheets/actor/character-sheet.js";
import { GenericAspectModel } from "./modules/model/item/generic.js";
import ActorSheetWFRP4eNPCV2 from "./src/apps/sheets/actor/npc-sheet.js";
import ActorSheetWFRP4eCreatureV2 from "./src/apps/sheets/actor/creature-sheet.js";
import TalentSheet from "./src/apps/sheets/item/talent-sheet.js";
import MutationSheet from "./src/apps/sheets/item/mutation-sheet.js";
import CriticalSheet from "./src/apps/sheets/item/critical-sheet.js";
import InjurySheet from "./src/apps/sheets/item/injury-sheet.js";
import AmmunitionSheet from "./src/apps/sheets/item/ammunition-sheet.js";
import SkillSheet from "./src/apps/sheets/item/skill-sheet.js";
import ArmourSheet from "./src/apps/sheets/item/armour-sheet.js";
import CareerSheet from "./src/apps/sheets/item/career-sheet.js";
import CargoSheet from "./src/apps/sheets/item/cargo.js";
import ContainerSheet from "./src/apps/sheets/item/container-sheet.js";
import ExtendedTestSheet from "./src/apps/sheets/item/extendedTest-sheet.js";
import DiseaseSheet from "./src/apps/sheets/item/disease-sheet.js";
import MoneySheet from "./src/apps/sheets/item/money.js";
import PrayerSheet from "./src/apps/sheets/item/prayer-sheet.js";
import PsychologySheet from "./src/apps/sheets/item/psychology-sheet.js";
import SpellSheet from "./src/apps/sheets/item/spell-sheet.js";
import TraitSheet from "./src/apps/sheets/item/trait-sheet.js";
import TrappingSheet from "./src/apps/sheets/item/trapping-sheet.js";
import VehicleModSheet from "./src/apps/sheets/item/vehicleMod-sheet.js";
import VehicleRoleSheet from "./src/apps/sheets/item/vehicleRole-sheet.js";
import VehicleTestSheet from "./src/apps/sheets/item/vehicleTest-sheet.js";
import WeaponSheet from "./src/apps/sheets/item/weapon-sheet.js";
import { TemplateModel } from "./modules/model/item/template.js";
import TemplateSheet from "./src/apps/sheets/item/template-sheet.js";
import ActorSheetWFRP4eVehicleV2 from "./src/apps/sheets/actor/vehicle-sheet.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", function () {

  // #if _ENV === "development"
  CONFIG.debug.wfrp4e = true;
  warhammer.utility.log("Development Mode: Logs on")
  //#endif

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wfrp4e", ActorSheetWFRP4eCharacter, { types: ["character"], makeDefault: true });
  Actors.registerSheet("wfrp4e", ActorSheetWFRP4eCharacterV2, { types: ["character"] });
  Actors.registerSheet("wfrp4e", ActorSheetWFRP4eNPC, { types: ["npc"], makeDefault: true });
  Actors.registerSheet("wfrp4e", ActorSheetWFRP4eNPCV2, { types: ["npc"]});
  Actors.registerSheet("wfrp4e", ActorSheetWFRP4eCreature, { types: ["creature"], makeDefault: true });
  Actors.registerSheet("wfrp4e", ActorSheetWFRP4eCreatureV2, { types: ["creature"]});
  Actors.registerSheet("wfrp4e", ActorSheetWFRP4eVehicle, { types: ["vehicle"], makeDefault: true });
  Actors.registerSheet("wfrp4e", ActorSheetWFRP4eVehicleV2, { types: ["vehicle"]});
  
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wfrp4e", ItemSheetWfrp4e, { makeDefault: true });
  Items.registerSheet("wfrp4e", AmmunitionSheet, { types: ["ammunition"], makeDefault: false });
  Items.registerSheet("wfrp4e", ArmourSheet, { types: ["armour"], makeDefault: false });
  Items.registerSheet("wfrp4e", CareerSheet, { types: ["career"], makeDefault: false });
  Items.registerSheet("wfrp4e", CargoSheet, { types: ["cargo"], makeDefault: false });
  Items.registerSheet("wfrp4e", ContainerSheet, { types: ["container"], makeDefault: false });
  Items.registerSheet("wfrp4e", CriticalSheet, { types: ["critical"], makeDefault: false });
  Items.registerSheet("wfrp4e", DiseaseSheet, { types: ["disease"], makeDefault: false });
  Items.registerSheet("wfrp4e", ExtendedTestSheet, { types: ["extendedTest"], makeDefault: false });
  Items.registerSheet("wfrp4e", InjurySheet, { types: ["injury"], makeDefault: false });
  Items.registerSheet("wfrp4e", MoneySheet, { types: ["money"], makeDefault: false });
  Items.registerSheet("wfrp4e", MutationSheet, { types: ["mutation"], makeDefault: false });
  Items.registerSheet("wfrp4e", PrayerSheet, { types: ["prayer"], makeDefault: false });
  Items.registerSheet("wfrp4e", PsychologySheet, { types: ["psychology"], makeDefault: false });
  Items.registerSheet("wfrp4e", SkillSheet, { types: ["skill"], makeDefault: false });
  Items.registerSheet("wfrp4e", SpellSheet, { types: ["spell"], makeDefault: false });
  Items.registerSheet("wfrp4e", TalentSheet, { types: ["talent"], makeDefault: false });
  Items.registerSheet("wfrp4e", TraitSheet, { types: ["trait"], makeDefault: false });
  Items.registerSheet("wfrp4e", TrappingSheet, { types: ["trapping"], makeDefault: false });
  Items.registerSheet("wfrp4e", VehicleModSheet, { types: ["vehicleMod"], makeDefault: false });
  Items.registerSheet("wfrp4e", VehicleRoleSheet, { types: ["vehicleRole"], makeDefault: false });
  Items.registerSheet("wfrp4e", VehicleTestSheet, { types: ["vehicleTest"], makeDefault: false });
  Items.registerSheet("wfrp4e", WeaponSheet, { types: ["weapon"], makeDefault: false });
  Items.registerSheet("wfrp4e", TemplateSheet, { types: ["template"], makeDefault: true });
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
  CONFIG.Item.dataModels["vehicleTest"] = VehicleTestModel
  CONFIG.Item.dataModels["vehicleRole"] = VehicleRoleModel
  CONFIG.Item.dataModels["extendedTest"] = ExtendedTestModel
  CONFIG.Item.dataModels["cargo"] = CargoModel
  CONFIG.Item.dataModels["template"] = TemplateModel

  CONFIG.ActiveEffect.dataModels["base"] = WFRP4eActiveEffectModel
  CONFIG.ChatMessage.dataModels["test"] = WFRPTestMessageModel;
  CONFIG.ChatMessage.dataModels["handler"] = OpposedHandlerMessage;
  CONFIG.ChatMessage.dataModels["opposed"] = OpposedTestMessage;

  game.wfrp4e = {
    apps: {
      ActorSheetWFRP4e,
      ActorSheetWFRP4eCharacter,
      ActorSheetWFRP4eCreature,
      ActorSheetWFRP4eNPC,
      ActorSheetWFRP4eVehicle,
      ItemSheetWfrp4e,
      CharGenWfrp4e,
      StatBlockParser,
      BrowserWfrp4e,
      ActorSettings,
      WFRPActiveEffectConfig,
      HomebrewSettings,
      CareerSelector,
      ItemProperties,
      ChargenStage
    },
    documents: {
      ActorWFRP4e,
      ItemWfrp4e,
      GenericAspectModel
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
    market: MarketWFRP4e,
    audio: WFRP_Audio,
    names: NameGenWfrp,
    migration: Migration,
    opposedHandler: OpposedHandler,
    tags : new TagManager(),
    trade : new TradeManager()
  }

  CombatHelpersWFRP.registerHelpers();

  CONFIG.Actor.documentClass = ActorWFRP4e;
  CONFIG.Item.documentClass = ItemWfrp4e;
  CONFIG.ActiveEffect.documentClass = ActiveEffectWFRP4e;
  CONFIG.RollTable.documentClass = WarhammerRollTable;
  CONFIG.ActiveEffect.legacyTransferral = false;
});

registerHooks()
loadScripts();
socketHandlers();