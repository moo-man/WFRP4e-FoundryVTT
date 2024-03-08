export default class ValueDialog extends Dialog 
{
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        options.classes.push("value-dialog");
        return options;
    }


    static create(text, title, defaultValue)
    {
        return Dialog.wait({
            title : title || "Value Dialog",
            content : `<div class="value-dialog"><p>${text || "Enter Value"}</p><input type="text" value="${defaultValue}"></div>`,
            buttons : {
                submit : {
                    label : "Submit",
                    callback: (html) => {
                        return html.find("input")[0]?.value;
                    }
                }                
            },
            close : () => {
                return null
            }
        })
    }
}