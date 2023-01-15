export default class ItemDialog extends Dialog {

    constructor(data)
    {
        super(data);
        this.chosen = 0;
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        options.classes.push("item-dialog");
        return options;
    }

    static async create(items, count = 1, text)
    {
        let html = await renderTemplate("systems/wfrp4e/templates/apps/item-dialog.hbs", {items, count, text})
        return new Promise((resolve) => {
            new ItemDialog({
                title : "Item Dialog",
                content : html,
                system : {items, count, text},
                buttons : {
                    submit : {
                        label : "Submit",
                        callback: (html) => {
                            resolve(Array.from(html.find(".active")).map(element => items[element.dataset.index]));
                        }
                    }                
                }
            }).render(true)
        })
    }

    static async createFromFilters(filters, count, text)
    {
        let items = await ItemDialog.filterItems(filters)
        return new Promise(async (resolve) => {
            let choice = await ItemDialog.create(items, count, text);    
            resolve(choice)
        })
    }

    async getData() {
        let data = super.getData();
        return data;
    }

    static async filterItems(filters)
    {
        let items = game.items.contents;

        for (let p of game.packs) {
            if (p.metadata.type == "Item") {
              items = items.concat((await p.getDocuments()).filter(i => !items.find(existing => existing.id == i.id)))
            }
          }

        for (let f of filters)
        {

            // TODO remove data. -> system. replacement when OWB updates to v10

            if (f.regex)
            {
                items = items.filter(i => Array.from(getProperty(i, f.property.replace("data.", "system.")).matchAll(f.value)).length)
            }
            else 
            {
                let value = f.value
                if (!Array.isArray(value))
                value = [value]
                items = items.filter(i => value.includes(getProperty(i, f.property.replace("data.", "system."))))
            }
        }

        return items.sort((a, b) => a.name > b.name ? 1 : -1)
    }


    activateListeners(html) {
        super.activateListeners(html);
        html.find(".document-name").click(ev => {


            let document = $(ev.currentTarget).parents(".document")[0]
            if (document.classList.contains("active"))
            {
                document.classList.remove("active")
                this.chosen--;
            }
            else if (this.data.system.count - this.chosen > 0) {
                document.classList.add("active")
                this.chosen++;
            } 

        })

        html.find(".document-name").contextmenu(ev => {
            let document = $(ev.currentTarget).parents(".document")
            let id = document.attr("data-id")

            game.items.get(id).sheet.render(true, {editable: false})
        })
    }
}