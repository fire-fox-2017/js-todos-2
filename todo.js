'use strict'

const fs = require('fs');

class Model {
  constructor() {
    this.database = JSON.parse(fs.readFileSync('data.json', 'utf-8')); // read to typeof obj
  }

  writeFile(data) {
    fs.writeFileSync('data.json', JSON.stringify(this.database), 'utf-8');
  }
}

class Controller {
  constructor() {
    this.argv = process.argv;
    this.model = new Model();
    this.view = new View();
  }

  start() {
    switch(this.argv[2]) {
      case 'help':
      default:
        this.help();
        break;
      case 'add':
        this.add(this.getUserInput(3).join(' '))
        break;
      case 'list':
        this.list();
        break;
      case 'task':
        this.task(this.getUserInput(3).join(' '));
        break;
      case 'delete':
        this.delete(this.getUserInput(3).join(' '));
        break;
      case 'complete':
        this.complete(this.getUserInput(3).join(' '));
        break;
      case 'uncomplete':
        this.uncomplete(this.getUserInput(3).join(' '));
        break;
      case 'list:outstanding':
        this.listOutstanding(this.getUserInput(3).join(' '));
        break;
      case 'list:complete':
        this.listComplete(this.getUserInput(3).join(' '));
        break;
      case 'tag':
        this.tag(this.getUserInput(3).join(' '));
        break;
      case 'filter':
        this.filter(this.getUserInput(3).join(' '));
        break;
    }
  }

  getUserInput(startingIdx) {
    let result = [];
    for (let i = startingIdx; i < this.argv.length; i++) {
       result.push(this.argv[i]);
    }
    return result;
  }

 help() {
  console.log(`Command List:
    node todo.js help
    node todo.js list
    node todo.js add <task_content>
    node todo.js task <task_id>
    node todo.js delete <task_id>
    node todo.js complete <task_id>
    node todo.js uncomplete <task_id>
    node todo.js list:outstanding asc|desc
    node todo.js list:complete asc|desc
    node todo.js tag <id> <name_1> <name_2>
    node todo.js filter <tag_name>`
    );
  }
  
  getTaskId() {
    let tasks = this.model.database;
    let lastId = tasks.length === 0 ? null : tasks[tasks.length-1].id; // get the id num
    let newId = lastId === null ? 1 : lastId + 1;
    return newId;
  }

  //add
  add(content) {
    let tasks = this.model.database;
    let newId = this.getTaskId();
    let newTask = new Task({'id': newId, 'content': content});
    tasks.push(newTask);
    this.model.writeFile();
    this.view.addMsg(content);
  }
  
  //list
  list() {
    let tasks = this.model.database;
    tasks.forEach((el, idx) => {
      this.view.listMsg(el);
    });
  }
  
  //task (show task in detail)
  task(id) {
    let tasks = this.model.database;
    tasks.filter((el) => { // filter create new array, in this case stored in let tasks
      if(el.id == id) //el.id number, id string
        this.view.taskMsg(el);
    });
  }

  //delete
  delete(id) {
    let tasks = this.model.database;
    tasks.forEach((el, idx) => { //for each execute provided function once for each arr element
      if(el.id == id) {
        tasks.splice(idx, 1);
        this.view.deleteMsg(el.content);
        this.model.writeFile();
      }
    });
  }

  //complete
  complete(id) {
    let tasks = this.model.database;
    tasks.forEach((el, idx) => {
      if(el.id == id) {
        el.isCompleted = true;
        el.completedAt = Task.getTime();
        this.view.completeMsg(el.content);
        this.model.writeFile();
      }
    });
  }

  uncomplete(id) {
    let tasks = this.model.database;
    tasks.forEach((el, idx) => {
      if(el.id == id) {
        el.isCompleted = false;
        el.completedAt = null;
        this.view.uncompleteMsg(el.content);
        this.model.writeFile();
      }
    });
  }
  
  // list uncomplete
  listOutstanding(option) {
    let tasks = this.model.database;
    let outstanding = this.getOutstandingTask(tasks);
    if(option === 'asc' || option === 'undefined') {
      this.ascOrDefault(outstanding);
    } else {
      this.desc(outstanding);
    }
  }

  ascOrDefault(filteredTask) {
    let ascOrDefault = filteredTask.sort((a, b) => {
      if(a.createdAt < b.createdAt) {
        return -1;
      }
      if(a.createdAt > b.createdAt) {
        return 1;
      }
      return 0;
    });
    ascOrDefault.forEach((el, idx) => {
      this.view.listCompleteMsg(el);
    });
  }

  desc(filteredTask) {
    let desc = filteredTask.sort((a, b) => {
      if(a.createdAt < b.createdAt) {
        return 1;
      }
      if(a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    });
    desc.forEach((el, idx) => {
      this.view.listCompleteMsg(el);
    });
  }

  listComplete(option) {
    let tasks = this.model.database;
    let complete = this.getCompletedTask(tasks);
    if(option === 'asc' || option === 'undefined') { // default: 'undefined' is desc. change to '' for asc
      this.ascOrDefault(complete);
    } else {
      this.desc(complete);
    }
  }

  getOutstandingTask(database) {
    let outstanding = database.filter((el, idx) => {
      if(!el.isCompleted) {
        return el;
      }
    });
    return outstanding;
  }

  getCompletedTask(database) {
    let complete = database.filter((el, idx) => {
      if(el.isCompleted) {
        return el;
      }
    });
    return complete;
  }

  tag(id) {
    let tasks = this.model.database;
    id = this.argv[3];
    tasks.forEach((el, idx) => {
      if(this.argv.length >= 4) {
        if(id == el.id) {
          let tags = this.getUserInput(4); // arr
          el.tags = tags;
          this.view.tagMsg(el);
          this.model.writeFile();
        }
      }
    });
  }

  filter(tag) { //tag hasilnya array
    let tasks = this.model.database;
    tasks.forEach((el, idx) => {
      let elTagLength = el.tags.length;
        for(let i = 0; i < elTagLength; i++) {
          if(tag === el.tags[i]) {
            this.view.filterMsg(el)
          }
        }
    });
  }

}

class View {
  constructor() {

  }
  
  addMsg(task) {
    console.log(`${task} is added!`);
  }

  listMsg(tasks) {
      console.log(`${tasks.id} [${(tasks.isCompleted ? 'X' : ' ')}] : ${tasks.content} | ${tasks.createdAt}`);
  }

  taskMsg(task) {
    console.log(task);
  }

  deleteMsg(deletedTask) {
    console.log(`Succesfully delete '${deletedTask}' from your todo list`);
  }

  completeMsg(completedTask) {
    console.log(`You have marked '${completedTask}' as done from your todo list`);
  }

  uncompleteMsg(uncompletedTask) {
    console.log(`You have marked '${uncompletedTask}' as uncompleted from your todo list`);
  }

  outstandingMsg(outstandingTask) {
    console.log(`${outstandingTask.id} [${(outstandingTask.isCompleted ? 'X' : ' ')}] : ${outstandingTask.content} | ${outstandingTask.createdAt}`);
  }
  listCompleteMsg(completedTask) {
    console.log(`${completedTask.id} [${(completedTask.isCompleted ? 'X' : ' ')}] : ${completedTask.content} | ${completedTask.createdAt}`);
  }

  tagMsg(task) {
    console.log(`Tagged task '${task.content}' with tags: ${task.tags}`);
  }

  filterMsg(tag) {
    console.log(`id: ${tag.id}. Task: ${tag.content}. tags: ${tag.tags}. status: ${(tag.isCompleted ? 'completed' : 'uncomplete')}.`);
  }
}

class Task {
  constructor(components) {
    this.id = components.id;
    this.content = components.content;
    this.isCompleted = components.isCompleted || false;
    this.createdAt = Task.getTime();
    this.completedAt = null;
    this.tags = [];
  }
  
  // dd:mm:yy: h:m
  static getTime() {
    let date = new Date();
    let day = date.getDay();
    let month = date.getMonth();
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}

let todo = new Controller();
todo.start();