export default function () {
  // Needs to be syncrhonous to return false
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (data.type == "Item" || data.type == "Actor") {
      handleMacroCreation(bar, data, slot)
      return false;
    }
  })
}

async function handleMacroCreation(bar, data, slot) {
  let document = await fromUuid(data.uuid)

  if (!document)
    return

  let macro
  if (document.documentName == "Item") {
    if (document.type != "weapon" && document.type != "spell" && document.type != "prayer" && document.type != "trait" && document.type != "skill")
      return
    if (!document)
      return false;

    let command = `game.wfrp4e.utility.rollItemMacro("${document.name}", "${document.type}");`;
    macro = game.macros.contents.find(m => (m.name === document.name) && (m.command === command) && m.canExecute);
    if (!macro) {
      macro = await Macro.create({
        name: document.name,
        type: "script",
        img: document.img,
        command: command
      }, {displaySheet: false})
    }
  } else if (document.documentName == "Actor") {
    let command = `Hotbar.toggleDocumentSheet("${document.uuid}")`
    macro = game.macros.contents.find(m => (m.name === document.name) && (m.command === command));
    if (!macro) {
      macro = await Macro.create({
        name: "Display " + document.name,
        type: "script",
        img: document.prototypeToken.texture.src,
        command: command
      }, {displaySheet: false})
    }
  }

  game.user.assignHotbarMacro(macro, slot);
}
