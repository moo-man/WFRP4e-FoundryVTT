
export default class TagManager  {
  createTags()
  {
    this.tags = {}
    Array.from(game.packs.keys()).forEach(packKey => {
      this.tags[packKey] = this.findTagsFromIndex(game.packs.get(packKey).index)
    })
  }

  findTagsFromIndex(index)
  {
    let tags = []
    index.forEach(i => {
      if (!tags.includes(i.type))
        tags.push(i.type)
    })
    return tags
  }

  getPacksWithTag(tag)
  {
    let keys = []

    for(let key in this.tags)
      if (this.tags[key].includes(tag))
        keys.push(key)

    return keys.map(k => game.packs.get(k))
  }

}
