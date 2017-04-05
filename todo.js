const fs = require("fs");


class Data {
  constructor() {
    this.taskList = [];
    this.helpList = ["node todo.js list                 to show the to do list",
                     "node todo.js add <task>           to add new task to the list",
                     "node todo.js delete <task id>     to delete a task from the list",
                     "node todo.js complete <task id>   to mark a task as completed",
                     "node todo.js uncomplete <task id> to unmark a task if it is not yet completed",
                     "node todo.js task <task id>       to show the task with corresponding id",
                     "node todo.js list:outstanding     to show the outstanding tasks"];
  }
}

class Control {
  constructor() {
    this.data = new Data();
    this.view = new View();
  }

  appInit(argv) {
    this.loadList(file);
    if (argv.length > 2) {
      if (argv[2] === "help") {
        this.help();
      } else if (argv[2] === "list") {
        this.list();
      } else if (argv[2] === "add") {
        if (argv[3].length > 0 && /\w+/.test(argv[3])) {
          let newItem = [];
          for (let i = 3; i < argv.length; i++) {
            newItem.push(argv[i]);
          }
          this.add(newItem.join(" "));
          this.saveToFile(file);
        } else {
          this.view.requireTask();
        }
      } else if (argv[2] === "delete") {
        if (/[0-9]+/.test(argv[3])) {
          this.delete(argv[3]);
          this.saveToFile(file);
        } else {
          this.view.requireTaskID();
        }
      } else if (argv[2] === "complete") {
        this.complete(argv[3]);
        this.saveToFile(file);
      } else if (argv[2] === "uncomplete") {
        this.unComplete(argv[3]);
        this.saveToFile(file);
      } else if (argv[2] === "task") {
        this.task(argv[3]);
      } else if (argv[2] === "clear") {
        this.clear();
        this.saveToFile(file);
      } else if (argv[2] === "list:outstanding") {
        if (argv[3].length > 0) {
          this.listOutstanding(argv[3])
        } else {
          this.listOutstanding();
        }
      }
    } else {
      this.view.suggestHelp();
    }

  }

  loadList(file) {
    let data = JSON.parse(fs.readFileSync(file));
    this.data.taskList = data;
  }

  saveToFile(file) {
    fs.writeFile(file, JSON.stringify(this.data.taskList), (err) => {
      if (err) {
        this.view.savingFileErrMsg();
      }
    });
  }

  help() {
    this.view.showHelp(this.data.helpList);
  }

  list() {
    this.view.showList(this.data.taskList);
  }

  listOutstanding(sort = "noSort") {
    let data = this.data.taskList;
    let outstandingList = [];
    for (let i = 0; i < data.length; i++) {
      if (!data[i].marked) {
        outstandingList.push(data[i]);
      }
    }

    if (sort === "noSort") {
      this.view.showList(outstandingList);
    } else if (sort === "asc") {
      let ascSorted = outstandingList.sort(function(a,b) {return a.timeCreated > b.timeCreated});
      this.view.showList(ascSorted);
    } else if (sort === "desc") {
      let ascSorted = outstandingList.sort(function(a,b) {return b.timeCreated > a.timeCreated});
      this.view.showList(ascSorted);
    }

  }

  checkID(taskID) { //check if ID exists
    let list = this.data.taskList;
    let found = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === taskID) {
        found ++;
      }
    }
    if (found > 0) {
      return false;
    } else {
      return true;
    }
  }

  searchIndex(taskID) { // search list index which match the ID
    let index = null;
    for (let i = 0; i < this.data.taskList.length; i++) {
      if (Number(this.data.taskList[i].id) === Number(taskID)) {
        index = i;
      }
    }
    return index;
  }

  task(taskID) {
    let index = this.searchIndex(taskID);
    this.view.showTask(this.data.taskList[index]);
  }

  insertTime() {
    return Date();
  }

  add(task) {
    let taskID = 0;
    do {
      taskID++;
    } while (!this.checkID(taskID));
    let newTask = {id: taskID,
                   item: task,
                   marked: false,
                   timeCreated: this.insertTime(),
                   timeCompleted: null,
                   tags: []};
    this.data.taskList.push(newTask);
    this.view.addedMsg(task, taskID);
  }

  delete(taskID) {
    let data = this.data.taskList;
    let index = this.searchIndex(taskID);
    if (data.length > 0) {
      if (index === null) {
        this.view.noIDErr();
      } else {
        let task = data[index].item;
        data.splice(index, 1);
        this.view.deletedMsg(task, taskID);
      }
    } else {
      this.view.emptyListErr();
    }
  }

  complete(taskID) {
    let data = this.data.taskList;
    let index = this.searchIndex(taskID);
    if (data.length > 0) {
      if (index === null) {
        this.view.noIDErr();
      } else if (data[index].item.length > 0) {
        data[index].marked = true;
        data[index].timeCompleted = this.insertTime();
        this.view.markedMsg(data[index].item, taskID);
      } else {
        this.view.noIDErr();
      }
   } else {
     this.view.emptyListErr();
   }
 }

 unComplete(taskID) {
   let data = this.data.taskList;
   let index = this.searchIndex(taskID);
   if (data.length > 0) {
     if (index === null) {
       this.view.noIDErr();
     } else if (data[index].item.length > 0) {
       data[index].marked = false;
       this.view.unMarkedMsg(data[index].item, taskID);
     } else {
     this.view.noIDErr();
     }
  } else {
    this.view.emptyListErr();
  }
 }

 clear() {
   this.data.taskList = [];
   this.view.clearedDataMsg();
 }

}

class View {
  constructor() {
    this.userInput = [];
  }

  showHelp(helpList) {
    for (let i = 0; i < helpList.length; i++) {
      console.log(`${i+1}. ${helpList[i]}`);
    }
  }

  showList(taskList) {
    if (taskList.length > 0) {
      for(let i = 0; i < taskList.length; i++) {
        let mark = "";
        if(taskList[i].marked) {
          mark = "X";
        } else {
          mark = " ";
        }
        console.log(`${i+1}. [${mark}] id: ${taskList[i].id} task: ${taskList[i].item}`);
      }
    } else {
      console.log("no item in the list, type 'node todo.js add <task>' to add task");
    }
  }

  showTask(taskObj) {
    console.log(taskObj);
  }

  emptyListErr() {
    console.log("no item to be deleted from the list, please add some task first");
  }

  noIDErr() {
    console.log(`task ID cannot be found in the list`);
  }

  addedMsg(task, taskID) {
    console.log(`task '${task}' is added with id number of ${taskID}`)
  }

  deletedMsg(task, taskID) {
    console.log(`task '${task}' with id ${taskID} has been deleted from the list`);
  }

  markedMsg(task, taskID) {
    console.log(`task '${task}' with id ${taskID} is marked as completed`);
  }

  unMarkedMsg(task, taskID) {
    console.log(`task '${task}' with id ${taskID} is unmarked or still an outstanding`);
  }

  savingFileErrMsg() {
    console.log("error occured when saving the change to the file");
  }

  clearedDataMsg() {
    console.log("the list is now empty");
  }

  requireTask() {
    console.log("please input the task");
  }

  requireTaskID() {
    console.log("please input task id");
  }

  suggestHelp() {
    console.log("run 'node todo.js help' to show the commands")
  }


}

let argv = process.argv;
let file = "data.json";
let todo = new Control();
todo.appInit(argv);
