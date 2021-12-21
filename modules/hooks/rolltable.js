export default function() {
    Hooks.on("preCreateTableResult", (result, data) => {
        if (!data.img)
            result.data.update({"img" : "icons/svg/d10-grey.svg"})
    })

    Hooks.on("preCreateRollTable", (table, data) => {
        if (!data.img)
            table.data.update({"img" : "systems/wfrp4e/ui/buttons/d10.webp"})
    })
}