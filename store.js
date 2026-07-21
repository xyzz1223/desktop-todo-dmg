const { app } = require('electron');
const fs = require('fs');
const path = require('path');

class TodoStore {
  constructor() {
    this.file = path.join(app.getPath('userData'), 'todos.json');
    this.todos = this.load();
  }

  load() {
    try { return JSON.parse(fs.readFileSync(this.file, 'utf8')); }
    catch { return []; }
  }

  save() {
    fs.writeFileSync(this.file, JSON.stringify(this.todos, null, 2));
  }

  getAll() {
    return this.todos;
  }

  add(todo) {
    this.todos.push(todo);
    this.save();
    return todo;
  }

  remove(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.save();
  }

  update(id, patch) {
    this.todos = this.todos.map(t => t.id === id ? { ...t, ...patch } : t);
    this.save();
  }
}

module.exports = TodoStore;
