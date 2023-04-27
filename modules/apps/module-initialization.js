

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

        this.folders = {
            "Scene": {},
            "Item": {},
            "Actor": {},
            "JournalEntry": {},
            "RollTable" : {}
        }

        this.journals = {};
        this.actors = {};
        this.scenes = {};
        this.tables = {};
        this.moduleKey = module
    }

    async initialize() {
        return new Promise((resolve) => {
            fetch(`modules/${this.moduleKey}/initialization.json`).then(async r => r.json()).then(async json => {
                let createdFolders = await Folder.create(json)
                for (let folder of createdFolders)
                    this.folders[folder.type][folder.name] = folder;

                for (let folderType in this.folders) {
                    for (let folder in this.folders[folderType]) {

                        let parent = this.folders[folderType][folder].getFlag(this.moduleKey, "initialization-parent")
                        if (parent) {
                            let parentId = this.folders[folderType][parent].id
                            await this.folders[folderType][folder].update({ parent: parentId })
                        }
                    }
                }

                await this.initializeDocuments()
                resolve()
            })
        })
    }

    async initializeDocuments() {

        let packList = this.data.module.flags.initializationPacks

        for (let pack of packList) {
            let documents = await game.packs.get(pack).getDocuments();
            for (let document of documents) {
                let folder = document.getFlag(this.moduleKey, "initialization-folder")
                if (folder)
                    document.updateSource({ "folder": this.folders[document.documentName][folder].id })
                if (document.getFlag(this.moduleKey, "sort"))
                    document.updateSource({ "sort": document.flags[this.moduleKey].sort })
            }
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

    async createOrUpdateDocuments(documents, collection, )
    {
        let existingDocuments = documents.filter(i => collection.has(i.id))
        let newDocuments = documents.filter(i => !collection.has(i.id))
        await collection.documentClass.create(newDocuments)
        for (let doc of existingDocuments)
        {
            let existing = collection.get(doc.id)
            await existing.update(doc.toObject())
            ui.notifications.notify(`Updated existing document ${doc.name}`)
        }
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