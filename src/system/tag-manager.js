
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

  getPacksWithTag(tags)
  {

    if (!tags || tags.length == 0)
      return Object.keys(this.tags).map(k => game.packs.get(k))

    if (!Array.isArray(tags))
      tags = [tags]
    
    let keys = []

    for(let key in this.tags)
      if (this.tags[key].some(t => tags.includes(t)))
        keys.push(key)

    return keys.map(k => game.packs.get(k))
  }

}
