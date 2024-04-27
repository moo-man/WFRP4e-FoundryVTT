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

    static _items = [];

    static async create(items, count = 1, text)
    {

        if (typeof items == "object" && !Array.isArray(items) && !(items instanceof Collection))
        {
            items = this.objectToArray(items);
        }

        if (count == 0 || items.length == 0)
        {
            return [];
        }

        let html = await renderTemplate("systems/wfrp4e/templates/apps/item-dialog.hbs", {items, count, text})
        return new Promise((resolve) => {
            new ItemDialog({
                title : game.i18n.localize("DIALOG.ItemDialog"),
                content : html,
                system : {items, count, text},
                buttons : {
                    submit : {
                        label : game.i18n.localize("Submit"),
                        callback: (html) => {
                            resolve(Array.from(html.find(".active")).map(element => items[element.dataset.index]));
                        }
                    }                
                }
            }).render(true)
        })
    }

    static async createFromFilters(filters, count, text, items)
    {
        items = await ItemDialog.filterItems(filters, items)
        return new Promise(async (resolve, reject) => {
            let choice = await ItemDialog.create(items, count, text);    
            if (choice.length == 0)
                reject(ui.notifications.error(game.i18n.localize("DIALOG.ErrorMustSelectItem")))
            else 
                resolve(choice)
        })
    }

    
    // simulate document structure with key as the ID and the value as the name
    static objectToArray(object, img = "systems/wfrp4e/icons/blank.png")
    {
        return Object.keys(foundry.utils.deepClone(object)).map(key => 
        {
            return {
                id : key,
                name : object[key],
                img
            };
        });

    }

    async getData() {
        let data = super.getData();
        return data;
    }

    static async filterItems(filters=[], items)
    {
        if (!items)
        {
            items = await this._fetchItems()
        }

        for (let f of filters)
        {
            if (f.regex)
            {
                items = items.filter(i => Array.from(getProperty(i, f.property).matchAll(f.value)).length)
            }
            else 
            {
                let value = f.value
                if (!Array.isArray(value))
                {
                    value = [value]
                }
                items = items.filter(i => value.includes(getProperty(i, f.property)))
            }
        }

        return items.sort((a, b) => a.name > b.name ? 1 : -1)
    }

    static async _fetchItems()
    {
        // If we've already fetched items, don't fetch again
        // This causes a slight bug in that new items won't be shown without refreshing
        if (this._items.length)
        {
            return this._items;
        }
        
        this._items = game.items.contents;
            
        for (let p of game.packs) {
            if (p.metadata.type == "Item") {
                this._items = this._items.concat((await p.getDocuments()).filter(i => !this._items.find(existing => existing.id == i.id)))
            }
        }
        return this._items;
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
            else if (this.data.system.count == "unlimited" || (this.data.system.count - this.chosen > 0)) {
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