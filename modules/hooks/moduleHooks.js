
export default function () {

    Hooks.on("popout:renderSheet", (sheet) => {
        sheet.element.css({ width: "610px", height: "740px", padding: "0px" })
    })

   
}