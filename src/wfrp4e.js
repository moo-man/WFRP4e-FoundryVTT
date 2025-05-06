
// Import Modules
import ActorSheetWFRP4eCharacter from "./sheets/actor/character-sheet.js";
import ActorSheetWFRP4eNPC from "./sheets/actor/npc-sheet.js";
import ActorSheetWFRP4eCreature from "./sheets/actor/creature-sheet.js";
import ActorSheetWFRP4eVehicle from "./sheets/actor/vehicle-sheet.js";
import ActorWFRP4e from "./documents/actor.js";
import registerHooks from "./system/hooks.js"
import CharGenWfrp4e from "./apps/chargen/char-gen.js"
import MarketWFRP4e from "./apps/market-wfrp4e.js";
import NameGenWfrp from "./apps/name-gen.js";
import StatBlockParser from "./apps/stat-parser.js";
import BrowserWfrp4e from "./apps/wfrp-browser.js";
import WFRP_Audio from "./system/audio-wfrp4e.js";
import WFRP4E from "./system/config-wfrp4e.js"
import ChatWFRP from "./system/chat-wfrp4e.js";
import WFRP_Tables from "./system/tables-wfrp4e.js";
import WFRP_Utility from "./system/utility-wfrp4e.js";
import ActorSettings from "./apps/actor-settings.js";
import WFRPActiveEffectConfig from "./apps/effect-config.js";
import Migration from "./system/migrations.js";
import HomebrewSettings from "./apps/homebrew-settings.js"
import CareerSelector from "./apps/career-selector.js"
import TagManager from "./system/tag-manager.js";
import ItemProperties from "./apps/item-properties.js"
import TestWFRP from "./system/rolls/test-wfrp4e.js";
import CharacteristicTest from "./system/rolls/characteristic-test.js";
import SkillTest from "./system/rolls/skill-test.js";
import WeaponTest from "./system/rolls/weapon-test.js";
import CastTest from "./system/rolls/cast-test.js";
import WomCastTest from "./system/rolls/wom-cast-test.js";
import ChannelTest from "./system/rolls/channel-test.js";
import PrayerTest from "./system/rolls/prayer-test.js";
import TraitTest from "./system/rolls/trait-test.js";
import { ChargenStage } from "./apps/chargen/stage.js";
import { CharacterModel } from "./model/actor/character.js";
import { VehicleModel } from "./model/actor/vehicle.js";
import { NPCModel } from "./model/actor/npc.js";
import { CreatureModel } from "./model/actor/creature.js";
import { AmmunitionModel } from "./model/item/ammunition.js";
import { ArmourModel } from "./model/item/armour.js";
import { CareerModel } from "./model/item/career.js";
import { ContainerModel } from "./model/item/container.js";
import { CriticalModel } from "./model/item/critical.js";
import { DiseaseModel } from "./model/item/disease.js";
import { InjuryModel } from "./model/item/injury.js";
import { MoneyModel } from "./model/item/money.js";
import { MutationModel } from "./model/item/mutation.js";
import { PrayerModel } from "./model/item/prayer.js";
import { PsychologyModel } from "./model/item/psychology.js";
import { TalentModel } from "./model/item/talent.js";
import { TrappingModel } from "./model/item/trapping.js";
import { SkillModel } from "./model/item/skill.js";
import { SpellModel } from "./model/item/spell.js";
import { TraitModel } from "./model/item/trait.js";
import { WeaponModel } from "./model/item/weapon.js";
import { ExtendedTestModel } from "./model/item/extendedTest.js";
import { VehicleModModel } from "./model/item/vehicleMod.js";
import { CargoModel } from "./model/item/cargo.js";
import WFRP4eActiveEffectConfig from "./apps/effect-config.js";
import ActiveEffectWFRP4e from "./system/effect-wfrp4e.js";
import loadScripts from "../loadScripts.js"
import { VehicleRoleModel } from "./model/item/vehicleRole.js";
import { VehicleTestModel } from "./model/item/vehicleTest.js";
import TradeManager from "./system/trade/trade-manager.js";
import { WFRP4eActiveEffectModel } from "./model/effect/effect.js";
import socketHandlers from "./system/socket-handlers.js";
import { WFRPTestMessageModel } from "./model/message/test.js";
import { OpposedTestMessage } from "./model/message/opposed-result.js";
import { OpposedHandlerMessage } from "./model/message/oppose-handler.js";
import  OpposedHandler from "./system/opposed-handler.js";
import CombatHelpersWFRP from "./system/combat.js";
import ActorSheetWFRP4eCharacterV2 from "./sheets/actor/character-sheet.js";
import { GenericAspectModel } from "./model/item/generic.js";
import ActorSheetWFRP4eNPCV2 from "./sheets/actor/npc-sheet.js";
import ActorSheetWFRP4eCreatureV2 from "./sheets/actor/creature-sheet.js";
import TalentSheet from "./sheets/item/talent-sheet.js";
import MutationSheet from "./sheets/item/mutation-sheet.js";
import CriticalSheet from "./sheets/item/critical-sheet.js";
import InjurySheet from "./sheets/item/injury-sheet.js";
import AmmunitionSheet from "./sheets/item/ammunition-sheet.js";
import SkillSheet from "./sheets/item/skill-sheet.js";
import ArmourSheet from "./sheets/item/armour-sheet.js";
import CareerSheet from "./sheets/item/career-sheet.js";
import CargoSheet from "./sheets/item/cargo.js";
import ContainerSheet from "./sheets/item/container-sheet.js";
import ExtendedTestSheet from "./sheets/item/extendedTest-sheet.js";
import DiseaseSheet from "./sheets/item/disease-sheet.js";
import MoneySheet from "./sheets/item/money.js";
import PrayerSheet from "./sheets/item/prayer-sheet.js";
import PsychologySheet from "./sheets/item/psychology-sheet.js";
import SpellSheet from "./sheets/item/spell-sheet.js";
import TraitSheet from "./sheets/item/trait-sheet.js";
import TrappingSheet from "./sheets/item/trapping-sheet.js";
import VehicleModSheet from "./sheets/item/vehicleMod-sheet.js";
import VehicleRoleSheet from "./sheets/item/vehicleRole-sheet.js";
import VehicleTestSheet from "./sheets/item/vehicleTest-sheet.js";
import WeaponSheet from "./sheets/item/weapon-sheet.js";
import { TemplateModel } from "./model/item/template.js";
import TemplateSheet from "./sheets/item/template-sheet.js";
import ActorSheetWFRP4eVehicleV2 from "./sheets/actor/vehicle-sheet.js";
import ChatMessageWFRP from "./documents/message.js";
import calendar from "./system/calendar.js";
import ItemWFRP4e from "./documents/item.js";
import { PostedItemMessageModel } from "./model/message/posted-item.js";
import { PayMessageModel } from "./model/message/pay.js";
import { CreditMessageModel } from "./model/message/credit.js";
import { XPMessageModel } from "./model/message/xp.js";
import { CorruptionMessageModel } from "./model/message/corruption.js";
import { PsychMessageModel } from "./model/message/psych.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", function () {

  // #if _ENV === "development"
  CONFIG.debug.wfrp4e = true;
  warhammer.utility.log("Development Mode: Logs on")
  //#endif

  let DocumentSheetConfig = foundry.applications.apps.DocumentSheetConfig

  // Register sheet application classes
  DocumentSheetConfig.unregisterSheet(Actor, "core", ActorSheet);
  DocumentSheetConfig.registerSheet(Actor, "wfrp4e", ActorSheetWFRP4eCharacterV2, { types: ["character"], makeDefault: true, label : "SHEET.Actor.character"});
  DocumentSheetConfig.registerSheet(Actor, "wfrp4e", ActorSheetWFRP4eNPCV2, { types: ["npc"], makeDefault: true, label : "SHEET.Actor.npc"});
  DocumentSheetConfig.registerSheet(Actor, "wfrp4e", ActorSheetWFRP4eCreatureV2, { types: ["creature"], makeDefault: true, label : "SHEET.Actor.creature"});
  DocumentSheetConfig.registerSheet(Actor, "wfrp4e", ActorSheetWFRP4eVehicleV2, { types: ["vehicle"], makeDefault: true, label : "SHEET.Actor.vehicle"});
  
  DocumentSheetConfig.unregisterSheet(Item, "core", ItemSheet);
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", AmmunitionSheet, { types: ["ammunition"], makeDefault: true, label : "SHEETS.Item.ammunition"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", ArmourSheet, { types: ["armour"], makeDefault: true, label : "SHEETS.Item.armour"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", CareerSheet, { types: ["career"], makeDefault: true, label : "SHEETS.Item.career"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", CargoSheet, { types: ["cargo"], makeDefault: true, label : "SHEETS.Item.cargo"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", ContainerSheet, { types: ["container"], makeDefault: true, label : "SHEETS.Item.container"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", CriticalSheet, { types: ["critical"], makeDefault: true, label : "SHEETS.Item.critical"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", DiseaseSheet, { types: ["disease"], makeDefault: true, label : "SHEETS.Item.disease"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", ExtendedTestSheet, { types: ["extendedTest"], makeDefault: true, label : "SHEETS.Item.extendedTest"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", InjurySheet, { types: ["injury"], makeDefault: true, label : "SHEETS.Item.injury"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", MoneySheet, { types: ["money"], makeDefault: true, label : "SHEETS.Item.money"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", MutationSheet, { types: ["mutation"], makeDefault: true, label : "SHEETS.Item.mutation"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", PrayerSheet, { types: ["prayer"], makeDefault: true, label : "SHEETS.Item.prayer"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", PsychologySheet, { types: ["psychology"], makeDefault: true, label : "SHEETS.Item.psychology"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", SkillSheet, { types: ["skill"], makeDefault: true, label : "SHEETS.Item.skill"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", SpellSheet, { types: ["spell"], makeDefault: true, label : "SHEETS.Item.spell"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", TalentSheet, { types: ["talent"], makeDefault: true, label : "SHEETS.Item.talent"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", TraitSheet, { types: ["trait"], makeDefault: true, label : "SHEETS.Item.trait"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", TrappingSheet, { types: ["trapping"], makeDefault: true, label : "SHEETS.Item.trapping"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", VehicleModSheet, { types: ["vehicleMod"], makeDefault: true, label : "SHEETS.Item.vehicleMod"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", VehicleRoleSheet, { types: ["vehicleRole"], makeDefault: true, label : "SHEETS.Item.vehicleRole"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", VehicleTestSheet, { types: ["vehicleTest"], makeDefault: true, label : "SHEETS.Item.vehicleTest"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", WeaponSheet, { types: ["weapon"], makeDefault: true, label : "SHEETS.Item.weapon"});
  DocumentSheetConfig.registerSheet(Item, "wfrp4e", TemplateSheet, { types: ["template"], makeDefault: true, label : "SHEETS.Item.template"});
  DocumentSheetConfig.registerSheet(ActiveEffect, "wfrp4e", WFRP4eActiveEffectConfig, {makeDefault :true})

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
  CONFIG.ChatMessage.dataModels["item"] = PostedItemMessageModel;
  CONFIG.ChatMessage.dataModels["pay"] = PayMessageModel;
  CONFIG.ChatMessage.dataModels["credit"] = CreditMessageModel;
  CONFIG.ChatMessage.dataModels["xp"] = XPMessageModel;
  CONFIG.ChatMessage.dataModels["corruption"] = CorruptionMessageModel;
  CONFIG.ChatMessage.dataModels["psych"] = PsychMessageModel;

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

  CONFIG.cursors.default = "systems/wfrp4e/ui/cursors/normal.png"
  CONFIG.cursors["default-down"] = "systems/wfrp4e/ui/cursors/normal.png"
  CONFIG.cursors.pointer = "systems/wfrp4e/ui/cursors/active.png"
  CONFIG.cursors["pointer-down"] = "systems/wfrp4e/ui/cursors/active.png"
});

registerHooks()
loadScripts();
socketHandlers();