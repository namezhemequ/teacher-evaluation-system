const fs = require('fs');
const path = require('path');

// JSON 文件数据库，适用于 Railway 等云环境
class JsonDB {
  constructor(filename = 'database.json', version = 1) {
    this.filename = filename;
    // 版本化文件名：database_v3.json
    const nameParts = filename.split('.');
    this.versionedName = `${nameParts[0]}_v${version}.${nameParts[1]}`;
    this.data = this.load();
  }

  getFilePath() {
    const dir = process.env.RAILWAY_ENVIRONMENT ? '/tmp' : path.join(__dirname, '../../');
    return path.join(dir, this.versionedName);
  }

  load() {
    const filepath = this.getFilePath();
    if (fs.existsSync(filepath)) {
      try {
        return JSON.parse(fs.readFileSync(filepath, 'utf8'));
      } catch (e) {
        return { roles: [], users: [], plans: [], evaluations: [], evaluationDimensions: [] };
      }
    }
    return { roles: [], users: [], plans: [], evaluations: [], evaluationDimensions: [] };
  }

  save() {
    const filepath = this.getFilePath();
    fs.writeFileSync(filepath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  // ID 生成器
  generateId(collection) {
    const items = this.data[collection] || [];
    const maxId = items.reduce((max, item) => Math.max(max, item.id || 0), 0);
    return maxId + 1;
  }

  // CRUD 操作
  create(collection, item) {
    if (!this.data[collection]) this.data[collection] = [];
    item.id = this.generateId(collection);
    item.createdAt = new Date().toISOString();
    item.updatedAt = new Date().toISOString();
    this.data[collection].push(item);
    this.save();
    return item;
  }

  findAll(collection, where = {}) {
    let items = this.data[collection] || [];
    Object.keys(where).forEach(key => {
      items = items.filter(item => item[key] === where[key]);
    });
    return items;
  }

  findOne(collection, where = {}) {
    return this.findAll(collection, where)[0] || null;
  }

  findById(collection, id) {
    const items = this.data[collection] || [];
    return items.find(item => item.id === parseInt(id)) || null;
  }

  update(collection, id, updates) {
    const items = this.data[collection] || [];
    const index = items.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
      this.save();
      return items[index];
    }
    return null;
  }

  delete(collection, id) {
    const items = this.data[collection] || [];
    const index = items.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
      items.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  count(collection, where = {}) {
    return this.findAll(collection, where).length;
  }

  bulkCreate(collection, items) {
    if (!this.data[collection]) this.data[collection] = [];
    items.forEach(item => {
      item.id = this.generateId(collection);
      item.createdAt = new Date().toISOString();
      item.updatedAt = new Date().toISOString();
      this.data[collection].push(item);
    });
    this.save();
    return items;
  }
}

const version = parseInt(process.env.DATA_VERSION) || 3;
module.exports = new JsonDB('database.json', version);
