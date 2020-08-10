import * as initHooks from "./modules/hooks/init.js"
import * as readyHooks from "./modules/hooks/ready.js"
import * as canvasHooks from "./modules/hooks/canvas.js"
import * as chatHooks from "./modules/hooks/chat.js"
import * as combatHooks from "./modules/hooks/combat.js"
import * as controlButtonHooks from "./modules/hooks/getSceneControlButtons.js"
import * as hotbarHooks from "./modules/hooks/hotbarDrop.js"
import * as actorHooks from "./modules/hooks/actor.js"
import * as itemHooks from "./modules/hooks/ownedItems.js"
import * as journalHooks from "./modules/hooks/journal.js"
import * as sidebarHooks from "./modules/hooks/sidebar.js"
import * as rolltableHooks from "./modules/hooks/rolltable.js"
import * as contextHooks from "./modules/hooks/entryContext.js"
import * as tokenHooks from "./modules/hooks/tokenHUD.js"
import * as permissionConfig from "./modules/hooks/permissionConfig.js"
import * as moduleHooks from "./modules/hooks/moduleHooks.js"

export default function registerHooks() {
    initHooks()
    readyHooks()
    canvasHooks()
    chatHooks()
    combatHooks()
    controlButtonHooks()
    hotbarHooks()
    actorHooks()
    itemHooks()
    journalHooks()
    sidebarHooks()
    rolltableHooks()
    contextHooks()
    tokenHooks()
    permissionConfig()
    moduleHooks()
}