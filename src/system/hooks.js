import controlButtons from "../hooks/getSceneControlButtons.js"
import settings from "../hooks/settings.js"
import i18n from "../hooks/i18n.js"
import init from "../hooks/init.js"
import ready from "../hooks/ready.js"
import canvas from "../hooks/canvas.js"
import chat from "../hooks/chat.js"
import combat from "../hooks/combat.js"
import hotbarDrop from "../hooks/hotbarDrop.js"
import journal from "../hooks/journal.js"
import sidebar from "../hooks/sidebar.js"
import rolltable from "../hooks/rolltable.js"
import entryContext from "../hooks/entryContext.js"
import token from "../hooks/token.js"

export default function registerHooks() {
    init()
    ready()
    canvas()
    chat()
    combat()
    controlButtons()
    hotbarDrop()
    journal()
    sidebar()
    rolltable()
    entryContext()
    token()
    i18n();
    settings();


    // #if _ENV === "development"
    Hooks.on("renderApplication", (app, html, data) => {
        warhammer.utility.log(`Rendering ${app.constructor.name}: `, undefined, data)
    })
    //#endif

}