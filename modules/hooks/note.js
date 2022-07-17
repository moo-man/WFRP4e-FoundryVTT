

export default function () {
    Hooks.on("activateNote", (note, options) => {
        options.anchor = note.document.flags.anchor?.slug
    })
}