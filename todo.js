"use strict"
let fs = require('fs');

class Model {
  static readDataFile() {
    let data = require('./data.json')
    return data;
  }

  static writeDataFile(data) {
    let dataToJSON = JSON.stringify(data);
    fs.writeFileSync('data.json', dataToJSON, 'utf-8');
  }
}

class Task {
  constructor(task, id, cek) {
    this.task = task;
    this.id = id;
    this.cek = cek;
    this.date = new Date();
    this.tags = [];
  }
}

class Controller {
  constructor() {
    this.list = Model.readDataFile();
  }

  displayToDoList(comm) {
    if (comm[2] === 'delete' && comm[3] !== null && (/[0-9]/g).test(comm[3])) {
      this.deleteTask(comm[3]);
      Model.writeDataFile(this.list);
      return View.deleteTask();
    } else if (comm[2] === 'add') {
      let str = [];
      for (let i = 3; i < comm.length; i++) {
        str.push(comm[i])
      }
      let strObj = {
        task: str.join(' ')
      }
      //mencari id maks dari list data
      let max = 0;
      for (let j = 0; j < this.list.length; j++) {
        if (this.list[j].id > max) {
          max = this.list[j].id;
        }
      }
      this.addTask(strObj.task, (max + 1), false);
      Model.writeDataFile(this.list)
      return View.showAllTask(this.list)
    } else if (comm[2] === 'help') {
      return View.displayHelp();
    } else if (comm[2] === 'list') {
      return View.showAllTask(this.list)
    } else if (comm[2] === 'task' && comm[3] !== null) {
      return View.show1Task(this.list, comm[3]);
    } else if (comm[2] === 'complete' && comm[3] !== null) {
      this.isComplete(comm[3]);
      Model.writeDataFile(this.list)
      return View.showAllTask(this.list)
    } else if (comm[2] === 'uncomplete' && comm[3] !== null) {
      this.isUncomplete(comm[3]);
      Model.writeDataFile(this.list)
      return View.showAllTask(this.list)
    } else if (comm[2] === 'tag' && comm[3] !== null) {
      let name = this.addTags(comm[3], comm.slice(4));
      return `Tags added`;
    } else if (comm[2] == 'list:outstanding') {
      return View.displayList(this.sorting(comm[3], this.outstandingTask()))
    } else if (comm[2] == 'list:completed') {
      return View.displayList(this.sorting(comm[3], this.completedTask()))
    } else if (comm[2] == 'filter') {
      return View.displayList(this.filterTags(comm[3]))
    } else {
      return View.displayHelp();
    }
    return '';
  }

  addTask(task, id, cek) {
    this.list.push(new Task(task, id, cek));
  }

  deleteTask(id) {
    this.list.splice(id - 1, 1);
  }

  isComplete(id) {
    for (let i = 0; i < this.list.length; i++) {
      if (i == (id - 1)) {
        this.list[id - 1].cek = true;
      }
    }
  }

  isUncomplete(id) {
    for (let i = 0; i < this.list.length; i++) {
      if (i == (id - 1)) {
        this.list[id - 1].cek = false;
      }
    }
  }

  sorting(comm, data) {
    switch (comm) {
      case 'asc':
        data.sort((a, b) => new Date(b.date) < new Date(a.date));
        break;
      case 'desc':
        data.sort((a, b) => new Date(b.date) > new Date(a.date));
        break;
      default:
        data.sort((a, b) => new Date(b.date) < new Date(a.date));
    }
    return data;
  }

  outstandingTask() {
    let listBaru = [];
    for (let i = 0; i < this.list.length; i++) {
      //if (this.list[i].cek == false) {
        listBaru.push(this.list[i]);
      //}
    }
    return listBaru;
  }

  completedTask() {
    let listBaru = [];
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].cek == true) {
        listBaru.push(this.list[i]);
      }
    }
    return listBaru;
  }

  addTags(idTask, tag) {
    let tagNames = [];
    // Iterate list to find id
    for (let i = 0; i < this.list.length; i++) {
      if (i + 1 == idTask) {
        tagNames.push(this.list[i].task);
        for (let j = 0; j < tag.length; j++) {
          this.list[i].tags.push(tag[j]);
          tagNames.push(tag[j]);
        }
      }
    }
    Model.writeDataFile(this.list);
    return tagNames;
  }

  filterTags(tag) {
    let taskName = [];
    // Iterate list to find tag
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i].tags.includes(tag)) {
        taskName.push(this.list[i]);
      }
    }
    return taskName;
  }
}

class View {
  static displayHelp() {
    console.log('==================================');
    console.log('$ node todo.js list');
    console.log('$ node todo.js add <task_content>');
    console.log('$ node todo.js task <task_id>');
    console.log('$ node todo.js delete <task_id>');
    console.log('$ node todo.js complete <task_id>');
    console.log('$ node todo.js list:outstanding asc|desc');
    console.log('$ node todo.js list:completed asc|desc');
    console.log('$ node todo.js uncomplete <task_id>');
    console.log('$ node todo.js tag <task_id> <task_tag1> <task_tag2>')
    console.log('$ node todo.js filter <nameTag>'); // node todo.js filter:kucing
    console.log('==================================');
    return '';
  }

  static showAllTask(list) {
    let strAllTask = '';
    for (let i = 0; i < list.length; i++) {
      if (list[i].cek == true) {
        strAllTask += `${list[i].id}. [X] ${list[i].task}\n`;
      } else {
        strAllTask += `${list[i].id}. [ ] ${list[i].task}\n`;
      }
    }
    return strAllTask;
  }

  static show1Task(list, id) {
    let dis1List = `Task: ${list[id-1].task} Tags: ${list[id-1].tags}`
    // return list[id-1].task;
    return dis1List;
  }

  static displayList(data) {
    let displayData = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].cek == false) {
        displayData.push(`Task : ${data[i].task} [ ] tags: ${data[i].tags}`)
      } else {
        displayData.push(`Task : ${data[i].task} [X] tags: ${data[i].tags}`)
      }
    }
    return displayData.join('\n');
  }
  static deleteTask(){
    console.log('Delete task success !')
  }
}



let data = new Controller();
let arrCommand = process.argv;
console.log(data.displayToDoList(arrCommand))