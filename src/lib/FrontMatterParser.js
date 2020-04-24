const matter = require('gray-matter');

class FrontMatterParser {

  constructor(content) {
    this._parse(content);
  }

  _parse(content) {
    let tags = [];
    try {
      const file = matter(content);
      if (file.data && file.data.tags && Array.isArray(file.data.tags)) {
        tags = file.data.tags.filter(tag => tag != null).map(tag => tag.trim());
      }
    } catch (e) {
      console.error(e);
    }
    this.tags = tags;
  }
}

module.exports = FrontMatterParser
