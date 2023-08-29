

export default class ModuleInitializer extends Dialog {

    constructor(module, title, html) {
        super({
            title: title,
            content: html,
            module: game.modules.get(module),
            buttons: {
                initialize: {
                    label: "Initialize",
                    callback: async () => {
                        game.settings.set(module, "initialized", true)
                        await this.initialize()
                        ui.notifications.notify(game.modules.get(module).title + ": Initialization Complete")
                    }
                },
                update: {
                    label: "Update",
                    condition : game.settings.get(module, "initialized"),
                    callback: async () => {
                        let updater = await game.wfrp4e.apps.ModuleUpdater.create(game.modules.get(module), this)
                        updater.render(true)
                    }
                },
                delete : {
                    label: "Delete",
                    condition : game.settings.get(module, "initialized"),
                    callback: async () => {
                        this.deleteModuleContent(module);
                    }
                },
                no: {
                    label: "No",
                    callback: () => {
                        game.settings.set(module, "initialized", true)
                        ui.notifications.notify("Skipped Initialization.")
                    }
                }
            }
        })
    }

    rootFolders = {}

    async initialize() {

        let packList = this.data.module.flags.initializationPacks

        for (let pack of packList.map(p => game.packs.get(p))) 
        {
            await this.createFolders(pack);
            let documents = await pack.getDocuments();
            try {
            switch (documents[0].documentName) {
                case "Actor":
                    ui.notifications.notify(this.data.module.title + ": Initializing Actors")
                    await this.createOrUpdateDocuments(documents, game.actors)
                    break;
                case "Item":
                    ui.notifications.notify(this.data.module.title + ": Initializing Items")
                    await this.createOrUpdateDocuments(documents, game.items)
                    break;
                case "JournalEntry":
                    ui.notifications.notify(this.data.module.title + ": Initializing Journals")
                    await this.createOrUpdateDocuments(documents, game.journal)
                    break;
                case "RollTable":
                    ui.notifications.notify(this.data.module.title + ": Initializing Tables")
                    await this.createOrUpdateDocuments(documents, game.tables)
                    break;
                case "Scene":
                    ui.notifications.notify(this.data.module.title + ": Initializing Scenes")
                    await this.createOrUpdateDocuments(documents, game.scenes)
                    break;
                }
            }
            catch(e)
            {
                console.error(e)
            }

        }
    }

    createFolders(pack)
    {
        let root = game.modules.get(pack.metadata.packageName).flags.folder
        root.type = pack.metadata.type;
        root._id = randomID();
        let packFolders = pack.folders.contents.map(f => f.toObject());
        for(let f of packFolders)
        {
            if (!f.folder)
            {
                f.folder = root._id;
            }
        }
        this.rootFolders[pack.metadata.id] = root._id;
        return Folder.create(packFolders.concat(root), {keepId : true})
    }

    async createOrUpdateDocuments(documents, collection, )
    {
        let existingDocuments = documents.filter(i => collection.has(i.id))
        let newDocuments = documents.filter(i => !collection.has(i.id))
        await collection.documentClass.create(this._addFolder(newDocuments))
        if (existingDocuments.length)
        {
            game.wfrp4e.utility.log("Pre Existing Documents: ", null, {args : existingDocuments})
            existingDocuments = await new Promise(resolve => new ModuleDocumentResolver(existingDocuments, {resolve}).render(true));
            game.wfrp4e.utility.log("Post Existing Documents: ", null, {args : existingDocuments})
        }
        this._addFolder(existingDocuments)
        for (let doc of existingDocuments)
        {
            let existing = collection.get(doc.id)
            await existing.update(doc.toObject())
            ui.notifications.notify(`Updated existing document ${doc.name}`)
        }
    }

    _addFolder(documents)
    {
        return documents.map(d => {
            if (!d.folder)
            {
                d.updateSource({folder : this.rootFolders[d.pack]});
            }
            return d;
        })
    }

    async deleteModuleContent(id)
    {
        let proceed = await Dialog.confirm({
            title : game.i18n.localize("UPDATER.DeleteModuleContent"),
            content : game.i18n.format("UPDATER.DeleteModuleContentPrompt", {id}),
            yes : () => {return true},
            no : () => {return false},
        })
        if (proceed)
        {
            ui.notifications.notify(this.data.module.title + ": Deleting Scenes")
            let moduleScenes = game.scenes.filter(doc => doc.flags[id]);
            moduleScenes.forEach(doc => {
                doc.folder?.folder?.delete();
                doc.folder?.delete()})
            Scene.deleteDocuments(moduleScenes.map(doc => doc.id));

            ui.notifications.notify(this.data.module.title + ": Deleting Actors")
            let moduleActors = game.actors.filter(doc => doc.flags[id] && !doc.hasPlayerOwner)
            moduleActors.forEach(doc => {
                doc.folder?.folder?.delete();
                doc.folder?.delete()})
            Actor.deleteDocuments(moduleActors.map(doc => doc.id));

            ui.notifications.notify(this.data.module.title + ": Deleting Items")
            let moduleItems = game.items.filter(doc => doc.flags[id])
            moduleItems.forEach(doc => {
                doc.folder?.folder?.delete();
                doc.folder?.delete()})
            Item.deleteDocuments(moduleItems.map(doc => doc.id));

            ui.notifications.notify(this.data.module.title + ": Deleting Journals")
            let moduleJournals = game.journal.filter(doc => doc.flags[id])
            moduleJournals.forEach(doc => {
                doc.folder?.folder?.delete();
                doc.folder?.delete()})
            JournalEntry.deleteDocuments(moduleJournals.map(doc => doc.id));

            ui.notifications.notify(this.data.module.title + ": Deleting Tables")
            let moduleTables = game.tables.filter(doc => doc.flags[id])
            moduleTables.forEach(doc => {
                doc.folder?.folder?.delete();
                doc.folder?.delete()})
            RollTable.deleteDocuments(moduleTables.map(doc => doc.id));
        }
    }
}


class ModuleDocumentResolver extends FormApplication
{
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        options.height = 600
        options.width = 400
        options.template = "systems/wfrp4e/templates/apps/document-resolver.hbs";
        options.classes.push("document-resolver");
        options.title = game.i18n.localize("INIT.ResolveDuplicates");
        return options;
    }


    _updateObject(ev, formData)
    {   
        this.options.resolve(this.object.filter(i => formData[i.id]))
    }
}