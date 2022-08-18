export class WFRPJournalTextPageSheet extends ProseMirrorJournalPageSheet {

    async getData() {
        let data = await super.getData();
        data.headingLevels[4] = "Level 4"
        return data
    }


    // Extend buildTOC to not include headers that have the `no-toc` class
    _buildTOC(html) {
        let toc = super._buildTOC(html)
        for(let slug in toc)
        {
            if (toc[slug].element.classList.contains("no-toc"))
                delete toc[slug]
        }
        return toc
    }
}
