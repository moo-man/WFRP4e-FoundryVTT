export default function() {
    Hooks.on("preCreateTableResult", (table, result) => {
        result.img = "icons/svg/d10-grey.svg"
    })

    Hooks.on("preCreateRollTable", (table) => {
        table.img = "systems/wfrp4e/ui/buttons/d10.png"
    })
}