
// Import Modules
import ActorSheetWFRP4eCharacter from "./src/sheets/actor/character-sheet.js";
import ActorSheetWFRP4eNPC from "./src/sheets/actor/npc-sheet.js";
import ActorSheetWFRP4eCreature from "./src/sheets/actor/creature-sheet.js";
import ActorSheetWFRP4eVehicle from "./src/sheets/actor/vehicle-sheet.js";
import ActorWFRP4e from "./src/documents/actor.js";
import registerHooks from "./src/system/hooks.js"
import CharGenWfrp4e from "./src/apps/chargen/char-gen.js"
import MarketWFRP4e from "./src/apps/market-wfrp4e.js";
import NameGenWfrp from "./src/apps/name-gen.js";
import StatBlockParser from "./src/apps/stat-parser.js";
import BrowserWfrp4e from "./src/apps/wfrp-browser.js";
import WFRP_Audio from "./src/system/audio-wfrp4e.js";
import WFRP4E from "./src/system/config-wfrp4e.js"
import ChatWFRP from "./src/system/chat-wfrp4e.js";
import WFRP_Tables from "./src/system/tables-wfrp4e.js";
import WFRP_Utility from "./src/system/utility-wfrp4e.js";
import ActorSettings from "./src/apps/actor-settings.js";
import WFRPActiveEffectConfig from "./src/apps/effect-config.js";
import Migration from "./src/system/migrations.js";
import HomebrewSettings from "./src/apps/homebrew-settings.js"
import CareerSelector from "./src/apps/career-selector.js"
import TagManager from "./src/system/tag-manager.js";
import ItemProperties from "./src/apps/item-properties.js"
import TestWFRP from "./src/system/rolls/test-wfrp4e.js";
import CharacteristicTest from "./src/system/rolls/characteristic-test.js";
import SkillTest from "./src/system/rolls/skill-test.js";
import WeaponTest from "./src/system/rolls/weapon-test.js";
import CastTest from "./src/system/rolls/cast-test.js";
import WomCastTest from "./src/system/rolls/wom-cast-test.js";
import ChannelTest from "./src/system/rolls/channel-test.js";
import PrayerTest from "./src/system/rolls/prayer-test.js";
import TraitTest from "./src/system/rolls/trait-test.js";
import { WFRPJournalTextPageSheet } from "./src/system/journal-sheet.js";
import { ChargenStage } from "./src/apps/chargen/stage.js";
import { CharacterModel } from "./src/model/actor/character.js";
import { VehicleModel } from "./src/model/actor/vehicle.js";
import { NPCModel } from "./src/model/actor/npc.js";
import { CreatureModel } from "./src/model/actor/creature.js";
import { AmmunitionModel } from "./src/model/item/ammunition.js";
import { ArmourModel } from "./src/model/item/armour.js";
import { CareerModel } from "./src/model/item/career.js";
import { ContainerModel } from "./src/model/item/container.js";
import { CriticalModel } from "./src/model/item/critical.js";
import { DiseaseModel } from "./src/model/item/disease.js";
import { InjuryModel } from "./src/model/item/injury.js";
import { MoneyModel } from "./src/model/item/money.js";
import { MutationModel } from "./src/model/item/mutation.js";
import { PrayerModel } from "./src/model/item/prayer.js";
import { PsychologyModel } from "./src/model/item/psychology.js";
import { TalentModel } from "./src/model/item/talent.js";
import { TrappingModel } from "./src/model/item/trapping.js";
import { SkillModel } from "./src/model/item/skill.js";
import { SpellModel } from "./src/model/item/spell.js";
import { TraitModel } from "./src/model/item/trait.js";
import { WeaponModel } from "./src/model/item/weapon.js";
import { ExtendedTestModel } from "./src/model/item/extendedTest.js";
import { VehicleModModel } from "./src/model/item/vehicleMod.js";
import { CargoModel } from "./src/model/item/cargo.js";
import WFRP4eActiveEffectConfig from "./src/apps/effect-config.js";
import ActiveEffectWFRP4e from "./src/system/effect-wfrp4e.js";
import loadScripts from "./loadScripts.js"
import { VehicleRoleModel } from "./src/model/item/vehicleRole.js";
import { VehicleTestModel } from "./src/model/item/vehicleTest.js";
import TradeManager from "./src/system/trade/trade-manager.js";
import { WFRP4eActiveEffectModel } from "./src/model/effect/effect.js";
import socketHandlers from "./src/system/socket-handlers.js";
import { WFRPTestMessageModel } from "./src/model/message/test.js";
import { OpposedTestMessage } from "./src/model/message/opposed-result.js";
import { OpposedHandlerMessage } from "./src/model/message/oppose-handler.js";
import  OpposedHandler from "./src/system/opposed-handler.js";
import CombatHelpersWFRP from "./src/system/combat.js";
import ActorSheetWFRP4eCharacterV2 from "./src/sheets/actor/character-sheet.js";
import { GenericAspectModel } from "./src/model/item/generic.js";
import ActorSheetWFRP4eNPCV2 from "./src/sheets/actor/npc-sheet.js";
import ActorSheetWFRP4eCreatureV2 from "./src/sheets/actor/creature-sheet.js";
import TalentSheet from "./src/sheets/item/talent-sheet.js";
import MutationSheet from "./src/sheets/item/mutation-sheet.js";
import CriticalSheet from "./src/sheets/item/critical-sheet.js";
import InjurySheet from "./src/sheets/item/injury-sheet.js";
import AmmunitionSheet from "./src/sheets/item/ammunition-sheet.js";
import SkillSheet from "./src/sheets/item/skill-sheet.js";
import ArmourSheet from "./src/sheets/item/armour-sheet.js";
import CareerSheet from "./src/sheets/item/career-sheet.js";
import CargoSheet from "./src/sheets/item/cargo.js";
import ContainerSheet from "./src/sheets/item/container-sheet.js";
import ExtendedTestSheet from "./src/sheets/item/extendedTest-sheet.js";
import DiseaseSheet from "./src/sheets/item/disease-sheet.js";
import MoneySheet from "./src/sheets/item/money.js";
import PrayerSheet from "./src/sheets/item/prayer-sheet.js";
import PsychologySheet from "./src/sheets/item/psychology-sheet.js";
import SpellSheet from "./src/sheets/item/spell-sheet.js";
import TraitSheet from "./src/sheets/item/trait-sheet.js";
import TrappingSheet from "./src/sheets/item/trapping-sheet.js";
import VehicleModSheet from "./src/sheets/item/vehicleMod-sheet.js";
import VehicleRoleSheet from "./src/sheets/item/vehicleRole-sheet.js";
import VehicleTestSheet from "./src/sheets/item/vehicleTest-sheet.js";
import WeaponSheet from "./src/sheets/item/weapon-sheet.js";
import { TemplateModel } from "./src/model/item/template.js";
import TemplateSheet from "./src/sheets/item/template-sheet.js";
import ActorSheetWFRP4eVehicleV2 from "./src/sheets/actor/vehicle-sheet.js";
import ChatMessageWFRP from "./src/documents/message.js";
import calendar from "./src/system/calendar.js";
import ItemWFRP4e from "./src/documents/item.js";

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
  Actors.registerSheet("wfrp4e", ActorSheetWFRP4eCharacterV2, { types: ["character"], makeDefault: true, label : "SHEET.CharacterSheet" });
  Actors.registerSheet("wfrp4e", ActorSheetWFRP4eNPCV2, { types: ["npc"], makeDefault: true, label : "SHEET.NPCSheet"});
  Actors.registerSheet("wfrp4e", ActorSheetWFRP4eCreatureV2, { types: ["creature"], makeDefault: true, label : "SHEET.CreatureSheet"});
  Actors.registerSheet("wfrp4e", ActorSheetWFRP4eVehicleV2, { types: ["vehicle"], makeDefault: true, label : "SHEET.VehicleSheet" });
  
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wfrp4e", AmmunitionSheet, { types: ["ammunition"], makeDefault: true });
  Items.registerSheet("wfrp4e", ArmourSheet, { types: ["armour"], makeDefault: true });
  Items.registerSheet("wfrp4e", CareerSheet, { types: ["career"], makeDefault: true });
  Items.registerSheet("wfrp4e", CargoSheet, { types: ["cargo"], makeDefault: true });
  Items.registerSheet("wfrp4e", ContainerSheet, { types: ["container"], makeDefault: true });
  Items.registerSheet("wfrp4e", CriticalSheet, { types: ["critical"], makeDefault: true });
  Items.registerSheet("wfrp4e", DiseaseSheet, { types: ["disease"], makeDefault: true });
  Items.registerSheet("wfrp4e", ExtendedTestSheet, { types: ["extendedTest"], makeDefault: true });
  Items.registerSheet("wfrp4e", InjurySheet, { types: ["injury"], makeDefault: true });
  Items.registerSheet("wfrp4e", MoneySheet, { types: ["money"], makeDefault: true });
  Items.registerSheet("wfrp4e", MutationSheet, { types: ["mutation"], makeDefault: true });
  Items.registerSheet("wfrp4e", PrayerSheet, { types: ["prayer"], makeDefault: true });
  Items.registerSheet("wfrp4e", PsychologySheet, { types: ["psychology"], makeDefault: true });
  Items.registerSheet("wfrp4e", SkillSheet, { types: ["skill"], makeDefault: true });
  Items.registerSheet("wfrp4e", SpellSheet, { types: ["spell"], makeDefault: true });
  Items.registerSheet("wfrp4e", TalentSheet, { types: ["talent"], makeDefault: true });
  Items.registerSheet("wfrp4e", TraitSheet, { types: ["trait"], makeDefault: true });
  Items.registerSheet("wfrp4e", TrappingSheet, { types: ["trapping"], makeDefault: true });
  Items.registerSheet("wfrp4e", VehicleModSheet, { types: ["vehicleMod"], makeDefault: true });
  Items.registerSheet("wfrp4e", VehicleRoleSheet, { types: ["vehicleRole"], makeDefault: true });
  Items.registerSheet("wfrp4e", VehicleTestSheet, { types: ["vehicleTest"], makeDefault: true });
  Items.registerSheet("wfrp4e", WeaponSheet, { types: ["weapon"], makeDefault: true });
  Items.registerSheet("wfrp4e", TemplateSheet, { types: ["template"], makeDefault: true });
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
      ActorSheetWFRP4eCharacter,
      ActorSheetWFRP4eCreature,
      ActorSheetWFRP4eNPC,
      ActorSheetWFRP4eVehicle,
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
      ItemWFRP4e,
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
  CONFIG.Item.documentClass = ItemWFRP4e;
  CONFIG.ActiveEffect.documentClass = ActiveEffectWFRP4e;
  CONFIG.ChatMessage.documentClass = ChatMessageWFRP;
  CONFIG.RollTable.documentClass = WarhammerRollTable;
  CONFIG.ActiveEffect.legacyTransferral = false;

  CONFIG.calendar = calendar();
});

registerHooks()
loadScripts();
socketHandlers();