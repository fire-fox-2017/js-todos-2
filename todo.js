const fs = require("fs");


class Data {
  constructor() {
    this.taskList = [];
    this.helpList = [
      " node todo.js list                   to show the to do list",
      " node todo.js add <task>             to add new task to the list",
      " node todo.js delete <task id>       to delete a task from the list",
      " node todo.js complete <task id>     to mark a task as completed",
      " node todo.js uncomplete <task id>   to unmark a task if it is not completed",
      " node todo.js task <task id>         to show the task with corresponding id",
      " node todo.js tag <task id> <tags>   to add tags to the task with corresponding id",
      " node todo.js filter:<tag_name>      to show the filtered tasks based on the tag",
      " node todo.js list:outstanding       to show the outstanding tasks",
      "node todo.js list:outstanding asc   to show the outstanding tasks from the oldest to the most recent",
      "node todo.js list:outstanding desc  to show the outstanding tasks from the most recent to the oldest",
      "node todo.js list:completed         to show the completed tasks",
      "node todo.js list:completed asc     to show the completed tasks from the oldest to the most recent",
      "node todo.js list:completed desc    to show the completed tasks from the most recent to the oldest"];
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
        if (argv[3]) {
          this.listOutstanding(argv[3])
        } else {
          this.listOutstanding();
        }
      } else if (argv[2] === "list:completed") {
        if (argv[3]) {
          this.listCompleted(argv[3])
        } else {
          this.listCompleted();
        }
      } else if (argv[2] === "tag") {
        let tags = [];
        for (let i = 4; i < argv.length; i++) {
          tags.push(argv[i]);
        }
        if (tags.length > 0) {
          this.addTags(argv[3], tags);
          this.saveToFile(file);
        } else {
          this.view.requireTags();
        }
      } else if (/filter/.test(argv[2])) {
        let rawInput = argv[2].split(":");
        let targetTags = rawInput[1].split(" ");
        this.filterTasks(targetTags);
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
      this.view.showList(ascSorted, "created");
    } else if (sort === "desc") {
      let ascSorted = outstandingList.sort(function(a,b) {return b.timeCreated > a.timeCreated});
      this.view.showList(ascSorted, "created");
    }
  }

  listCompleted(sort = "noSort") {
    let data = this.data.taskList;
    let completedList = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].marked) {
        completedList.push(data[i]);
      }
    }

    if (sort === "noSort") {
      this.view.showList(completedList);
    } else if (sort === "asc") {
      let ascSorted = completedList.sort(function(a,b) {return a.timeCompleted > b.timeCompleted});
      this.view.showList(ascSorted, "completed");
    } else if (sort === "desc") {
      let ascSorted = completedList.sort(function(a,b) {return b.timeCompleted > a.timeCompleted});
      this.view.showList(ascSorted, "completed");
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
    if (index !== null) {
      this.view.showTask(this.data.taskList[index]);
    } else {
      this.view.noIDErr();
    }
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
       data[index].timeCompleted = null;
       this.view.unMarkedMsg(data[index].item, taskID);
     } else {
     this.view.noIDErr();
     }
  } else {
    this.view.emptyListErr();
  }
 }

 addTags(taskID, tags) {
   let index = this.searchIndex(taskID);
   if (index !== null) {
     let data = this.data.taskList;
     for (let i = 0; i < tags.length; i++) {
       data[index].tags.push(tags[i]);
     }
     let task = data[index].item;
     this.view.taggedMsg(task, taskID, tags)
   } else {
     this.view.noIDErr();
   }
 }

 searchTags(targetTags, taskID) {
   let data = this.data.taskList;
   let index = this.searchIndex(taskID);
   let taskTags = data[index].tags;
   let tagsFoundIndices = [];
   for (let i = 0; i < taskTags.length; i++) {
     for (let j = 0; j < targetTags.length; j++) {
       if (taskTags[i] === targetTags[j]) {
         tagsFoundIndices.push(i);
       }
     }
   }
   if (tagsFoundIndices.length > 0) {
     return tagsFoundIndices;
   } else {
     return null;
   }
 }

 filterTasks(targetTags) {
   let data = this.data.taskList;
   let filteredTasks = [];
   for (let i = 0; i < data.length; i++) {
     if (this.searchTags(targetTags, data[i].id)) {
       filteredTasks.push(data[i]);
     }
   }
   if (filteredTasks.length > 0) {
     this.view.showList(filteredTasks, "filtered");
   } else {
     this.view.noTagsFoundMsg(targetTags);
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

  showList(taskList, option = "none") {
    if (taskList.length > 0) {
      for(let i = 0; i < taskList.length; i++) {
        let mark = "";
        if(taskList[i].marked) {
          mark = "X";
        } else {
          mark = " ";
        }
        let addition = "";
        if (option === "created") {
          addition = ` created: ${taskList[i].timeCreated}`;
        } else if (option === "completed") {
          addition = ` completed: ${taskList[i].timeCompleted}`;
        } else if (option === "filtered") {
          addition = (` tags: ${taskList[i].tags}`);
        }
        console.log(`${i+1}. [${mark}] id: ${taskList[i].id} task: ${taskList[i].item} ${addition}`);
      }
    } else {
      console.log("no item in the list, type 'node todo.js help' to show the commands");
    }
  }

  showTask(taskObj) {
    console.log(taskObj);
  }

  emptyListErr() {
    console.log("no item to be in the list, please add some task first");
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

  taggedMsg(task, taskID, tags) {
    console.log(`task '${task}' with id ${taskID} is tagged with '${tags}'`);
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

  requireTags() {
    console.log("please input the tags");
  }

  noTagsFoundMsg(tag) {
    console.log(`no tasks has the '${tag}' tag`);
  }

  suggestHelp() {
    console.log("run 'node todo.js help' to show the commands")
  }


}

let argv = process.argv;
let file = "data.json";
let todo = new Control();
todo.appInit(argv);
