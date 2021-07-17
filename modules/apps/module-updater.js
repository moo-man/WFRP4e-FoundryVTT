

export default class ModuleUpdater extends Dialog {

    constructor(module, html) 
    {

        super({
            title: `Update ${module.data.title} Content`,
            content: html,
            module,
            buttons:
            {
              update:
              {
                label: game.i18n.localize("Update"),
                callback: html => {
                    let settings = this.getUpdateSettings(html)
                    this.updateImportedContent(settings)
                }
              }
            },
            default: "update"
          })
    }

    static async create(module)
    {
        let html = await renderTemplate("systems/wfrp4e/templates/apps/module-updater.html", module)

        return new this(module, html)
    }

    getUpdateSettings(html)
    {
        let updateSettings = {}
        updateSettings.actors = html.find('[name="actors"]').is(':checked')
        updateSettings.journals = html.find('[name="journals"]').is(':checked')
        updateSettings.items = html.find('[name="items"]').is(':checked')
        updateSettings.scenes = html.find('[name="scenes"]').is(':checked')
        updateSettings.excludeNameChange = html.find('[name="excludeNameChange"]').is(':checked')
        return updateSettings
    }

    async updateImportedContent(settings)
    {
        let documents = await this.getDocuments()
        this.count = {created : 0, updated : 0}
        for(let type in settings)
        {
            if (type != "excludeNameChange" && settings[type])
                await this.updateDocuments(documents[type], settings)
        }
        ui.notifications.notify(`Created ${this.count.created} and updated ${this.count.updated} documents from ${this.data.module.data.name} - ${this.data.module.data.version}`)

    }

    async updateDocuments(documents, settings)
    {
        if (!documents.length)
            return
        let toCreate = []
        let toDelete = []
        let documentClass
        for (let document of documents)
        {
            if (!documentClass)
                documentClass = CONFIG[document.documentName].documentClass
            if (game[document.collectionName].has(document.id))
            {
                let existingDoc = game[document.collectionName].get(document.id)
                if (!settings.excludeNameChange || (settings.excludeNameChange && document.name == existingDoc.name))
                {
                    let folder = existingDoc.data.folder
                    toDelete.push(existingDoc.id)
                    let newDoc = document.toObject()
                    newDoc.folder = folder;
                    toCreate.push(newDoc)
                    game.wfrp4e.utility.log(`Updated Document ${document.name}`)
                    this.count.updated++;
                }
            }
            else 
            {
                let folder = document.getFlag(this.data.module.data.name, "initialization-folder")
                folder = game.folders.getName(folder)
                let newDoc = document.toObject()
                newDoc.folder = folder.id
                toCreate.push(newDoc)
                game.wfrp4e.utility.log(`Imported Document ${document.name}`)
                this.count.created++;
            }
        }
        await documentClass.deleteDocuments(toDelete)
        let created = await documentClass.createDocuments(toCreate)

        if (documentClass.name == "Scene")
        {
            created.forEach(async s => {
                let thumb = await s.createThumbnail();
                s.update({ "thumb": thumb.thumb })
            })
        }
    }

    async getDocuments()
    {
        let module = this.data.module;
        let packs = module.data.flags.initializationPacks.map(i => game.packs.get(i))
        let documents = {
            actors : [],
            journals : [],
            items : [],
            scenes : []
        };
        for (let pack of packs)
        {
            let docs = await pack.getDocuments();
            switch (pack.metadata.entity)
            {
                case "Actor": documents.actors = documents.actors.concat(docs)
                    break;
                case "JournalEntry": documents.journals = documents.journals.concat(docs)
                    break;
                case "Item": documents.items = documents.items.concat(docs)
                    break;
                case "Scene": documents.scenes = documents.scenes.concat(docs)
                    break;
            }
        }
        return documents
    }
}