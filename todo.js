var fs = require('fs');

class List {
  constructor (file) {
    this._file = file;
    this._list = [];
  }

  get list () {
    return this._list;
  }

  loadJsonFile() {
    let data = fs.readFileSync(this._file)
    .toString()
    .split("\n");

    // console.log(data);
    // console.log(JSON.parse(data));
    this._list = JSON.parse(data);
  }

  saveJsonFile() {
    let testfile = this._file;

    fs.writeFile(testfile, JSON.stringify(this._list), (err, fd) => {
      if (err)
        return console.error(err);
      console.log(`List has been saved to "${this._file}"`);
    });
  }

  addTask (task) {
    this._list.push(task);
    this.saveJsonFile();
  }

  // return Task object with correct ID/index from List
  getTask (id) {
    if (id > this._list.length)
      return null;
    else {
      return this._list[id-1];
    }
  }

  isIdValid (id) {
    if (id > this._list.length)
      return false;
    else
      return true;
  }

  deleteTask (id) {
    if (id > this._list.length)
      return null;
    else {
      this._list.splice(id-1,1);
      this.saveJsonFile();
      return true;
    }

  }

  completeTask (id) {
    if (id > this._list.length)
      return false;
    else {
      this._list[id-1].completed = true;
      this._list[id-1].completed_at = Date.now();

      this.saveJsonFile();
      return true;
    }
  }

  uncompleteTask (id) {
    if (id > this._list.length)
      return false;
    else {
        this._list[id-1].completed = false;
        this._list[id-1].completed_at = null;

        this.saveJsonFile();
        return true;
    }
  }

  assignTags (id, tag_array) {
    if (id > this._list.length)
      return false;
    else {
      for (let i = 0 ; i < tag_array.length ; i++) {
        this._list[id-1].tags.push(tag_array[i]);
      }

      // dont' forget to save to file
      this.saveJsonFile();
      return true;
    }
  }

  filterTag (tag) {
    let index_arr = []; // get the index
    for (let i = 0 ; i < this._list.length ; i++) {
      if (this._list[i].tags.indexOf(tag) >= 0)
        index_arr.push(i);
    }

    return index_arr;
  }

}



class Task {
  constructor (args) {
    this.task = args['task']

    this.completed = false;
    if(args && args.hasOwnProperty('complete'))
      this.completed = args['complete'];

    this.created_at = Date.now();
    this.completed_at = null;
    this.tags = []; //array of string;
  }
}


class Todo {
  constructor (file) {
    this._file = file;
    this._list = [];

    this._listObj = new List(file);
    this._listObj.loadJsonFile();

    this._view = new View();
  }

  loadJsonFile() {
    let data = fs.readFileSync(this._file)
    .toString()
    .split("\n");

    // data.pop();
    // console.log(data);
    // console.log(JSON.parse(data));
    this._list = JSON.parse(data);
  }

  save() {
    this._listObj.saveJsonFile();
  }

  help() {
    this._view.displayHelp();
  }

  list () {
    this._view.displayAll(this._listObj.list);
  }

  listOutstanding (option) {
    this._view.displayOutstanding(this._listObj.list, option);
  }

  listCompleted (option) {
    this._view.displayCompleted(this._listObj.list, option);
  }

  add (task) {
    // this._list.push(task);
    // console.log(`Added  "${task.task}" to the TODO list.`);
    // this.save();
    this._listObj.addTask(task);
    console.log(`Added  "${task.task}" to the TODO list.`)
  }

  taskInfo(id) {
    // id == the order of the task in the list
    let task = this._listObj.getTask(id);

    if (!task)
      console.log("Sorry, you have entered invalid task ID.")
    else {
      // let complete = (task.completed) ? "[X]" : "[ ]";
      // console.log(`${id}. ${complete} ${task.task}`);
      this._view.displayTask(task);
    }
  }


  delete(id) {
    if (!this._listObj.isIdValid(id))
      console.log("Sorry, you have entered invalid task ID.")
    else {
      let task = this._listObj.getTask(id);

      if(this._listObj.deleteTask(id)) {
        console.log(`Deleted "${task.task}" from TODO List.`);
      }
      else
        console.log(`Deleting task failed.`)
    }
  }


  complete(id) {
    if (!this._listObj.isIdValid(id))
      console.log("Sorry, you have entered invalid task ID.")
    else {
      let task = this._listObj.getTask(id);

      if(this._listObj.completeTask(id)){
        console.log(`Mark task:${id}. ${task.task} to complete.`);
      }
      else
        console.log(`Cannot mark complete task`)
    }
  }


  uncomplete(id) {
    if (!this._listObj.isIdValid(id))
      console.log("Sorry, you have entered invalid task ID.")
    else {
      let task = this._listObj.getTask(id);

      if(this._listObj.uncompleteTask(id)){
        console.log(`Mark task:${id}. ${task.task} to incomplete.`);
      }
      else
        console.log(`Cannot mark complete task`)
    }
  }

  assignTags(id, tag_array) {
    if(!this._listObj.isIdValid(id))
      console.log("Sorry, you have entered invalid task ID.")
    else {
      this._listObj.assignTags(id, tag_array);
      let task = this._listObj.getTask(id);
      console.log(`Tagged task "${task.task}" with tags: ${tag_array}`);
    }
  }

  filterTag(tag) {
    // get the index of task that has the specified tag
    let index_arr = this._listObj.filterTag(tag);
    // console.log(index_arr);

    // pas it to the view
    this._view.displayTaskWithTag(this._listObj.list, index_arr);
  }

  initApp() {

    let params = [];
    process.argv.forEach( (val, index, array) => {
      if(index > 1) {
        params.push(val);
      }
    });

    // console.log(`params = ${params}`)

    if(params.length > 0) {
      switch(params[0]) {
        case 'help':
          todo.help();
          break;
        case 'list':
          console.log("Todo List:")
          todo.list();
          break;
        case 'add':
          // let task_str = "";
          // params.forEach((val, index, arr) => {
          //   if(index > 0)
          //     task_str += val + " ";
          // });

          let task_str = params.slice(1,params.length);
          // console.log(`task_str = '${task_str}'`);
          task_str = task_str.join(' ');
          // console.log(`task_str = '${task_str}'`);

          todo.add(new Task({task: task_str}));

          break;
        case 'task':
          todo.taskInfo(params[1]);
          break;

        case 'delete':
          todo.delete(params[1]);
          break;
        case 'complete':
          todo.complete(params[1]);
          break;
        case 'uncomplete':
          todo.uncomplete(params[1]);
          break;
        case 'list:outstanding':
          todo.listOutstanding(params[1]);
          break;
        case 'list:completed':
          todo.listCompleted(params[1]);
          break;
        case 'tag':
          let id = params[1];
          let tag_arr = params.slice(2,params.length);

          // check tag?

          todo.assignTags(id, tag_arr);
          break;
        case 'r':
          console.log(todo._listObj.list);
          break;
        default:
          if(/^filter:/.test(params[0])) {
            // console.log("filter");
            let filter_tag = params[0].split(":")[1];
            // console.log(`filter_tag = "${filter_tag}"`)
            todo.filterTag(filter_tag);
          } else {
            console.log(`Sorry, wrong command.`);
          }

      }

    }

  }
}


class View {
  constructor () {

  }

  displayHelp () {
    let help_msg =
      "node todo.js help\nnode todo.js list\nnode todo.js add <task_content>\nnode todo.js task <task_id>\nnode todo.js delete <task_id>\nnode todo.js complete <task_id>\nnode todo.js uncomplete <task_id>\nnode todo.js list:outstanding asc|desc\nnode todo.js list:completed asc|desc\nnode todo.js tag <task_id> <tag_name1> <tag_name2> .. <tag_name_N>\nnode todo.js filter:<tag_name>";
    console.log(help_msg);
  }

  displayAll (list) {
    if(list.length > 0) {
      for (let i = 0 ; i < list.length ; i++) {
        let complete = (list[i].completed) ? "[X]" : "[ ]";
        console.log(`${i+1}. ${complete} ${list[i].task}`);
      }
    } else {
      console.log(`*** List is empty. ***`);
    }
  }

  displayTask (task) {
    // let complete = (task.completed) ? "[X]" : "[ ]";
    // console.log(`${id}. ${complete} ${task.task}`);
    console.log(task);
  }

  displayOutstanding (list, option) {
    let sorted_list = this.sortListByCreatedDate(list, option);

    // console.log("sorted list", sorted_list);
    // this.displayAll(sorted_list);

    sorted_list.forEach((val, index, array) => {
      if(!val.completed) {
        this.displaySingleTask(index, val);
      }
    });
  }

  displayCompleted (list, option) {
    let sorted_list = this.sortListByCompletedDate(list, option);
    // console.log("sorted list", sorted_list);
    // this.displayAll(sorted_list);

    sorted_list.forEach((val, index, array) => {

      if(val.completed) {
        this.displaySingleTask(index, val);
      }
    });

  }

  sortListByCreatedDate (list, option) {
    let sorted_list = list.sort(function(a,b) {
      if(option == 'desc')
        return a.created_at < b.created_at;
      else if (option == 'asc')
        return a.created_at > b.created_at;
    });
    return sorted_list;
  }

  sortListByCompletedDate (list, option) {
    let sorted_list = list.sort(function(a,b) {
      if(option == 'desc')
        return a.completed_at < b.completed_at;
      else if (option == 'asc')
        return a.completed_at > b.completed_at;
    });
    return sorted_list;
  }

  displaySingleTask (index, task) {
    let complete = (task.completed) ? "[X]" : "[ ]";
    console.log(`${index+1}. ${complete} ${task.task}`);
  }

  displayTaskWithTag (list, index_arr) {
    for (let i = 0 ; i < index_arr.length ; i++) {
      console.log(`${index_arr[i]+1}. ${list[index_arr[i]].task} [${list[index_arr[i]].tags}]`)
    }

  }

}


let todo = new Todo('data.json');
todo.initApp();


//
