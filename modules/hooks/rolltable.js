export default function() {
    Hooks.on("preCreateTableResult", (table, result) => {
        result.img = "icons/svg/d10-grey.svg"
    })
}