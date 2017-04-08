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
        this.add(this.getUserInput())
        break;
      case 'list':
        this.list();
        break;
      case 'task':
        this.task(this.getUserInput());
        break;
      case 'delete':
        this.delete(this.getUserInput());
        break;
      case 'complete':
        this.complete(this.getUserInput());
        break;
      case 'uncomplete':
        this.uncomplete(this.getUserInput());
        break;
      case 'list:outstanding':
        this.listOutstanding(this.getUserInput());
        break;
      case 'list:complete':
        this.listComplete(this.getUserInput());
    }
  }

  getUserInput() {
    let result = [];
    for (let i = 3; i < this.argv.length; i++) {
       result.push(this.argv[i]);
    }
    return result.join(' ');
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

  //add
  add(content) {
    let tasks = this.model.database;
    let lastId = tasks.length === 0 ? null : tasks[tasks.length-1].id; // get the id num
    let newId = lastId === null ? 1 : lastId + 1;
    let newTask = new Task({
      'id': newId,
      'content': content
    });
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
        this.view.uncompleteMsg(el.content);
        this.model.writeFile();
      }
    });
  }

  listOutstanding(option) {
    let tasks = this.model.database;
    let outstanding = tasks.filter((el, idx) => {
      if(!el.isCompleted) {
        return el;
      }
    });
    if(option === 'asc' || option === 'undefined') {
      let ascOrDefault = outstanding.sort((a, b) => {
        if(a.createdAt < b.createdAt) {
          return -1;
        }
        if(a.createdAt > b.createdAt) {
          return 1;
        }
        return 0;
      });
      ascOrDefault.forEach((el, idx) => {
        this.view.outstandingMsg(el);
      });
    } else {
      let desc = outstanding.sort((a, b) => {
        if(a.createdAt < b.createdAt) {
          return 1;
        }
        if(a.createdAt > b.createdAt) {
          return -1;
        }
        return 0;
      });
      desc.forEach((el, idx) => {
        this.view.outstandingMsg(el);
      });
    }
  }

  listComplete(option) {
    let tasks = this.model.database;
    let complete = tasks.filter((el, idx) => {
      if(el.isCompleted) {
        return el;
      }
    });
    if(option === 'asc' || option === 'undefined') { // default: 'undefined' is desc. change to '' for asc
      let ascOrDefault = complete.sort((a, b) => {
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
    } else {
      let desc = complete.sort((a, b) => {
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