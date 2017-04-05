const fs = require('fs');
let argv = process.argv;

class Model {
    constructor() {
        let strJson = fs.readFileSync('data.json');
        this.listDo = JSON.parse(strJson);
    }
}

class Controller {
    constructor() {
        this.model = new Model();
        this.view = new View();
        this.date = new Date().toLocaleString();
    }
    infoHelp() {
        this.view.detailHelp();
    }
    infoList() {
        let temp;
        for (let i = 0; i < this.model.listDo.length; i++) {
            if (this.model.listDo[i].complete) {
                temp = "[X]";
            } else {
                temp = "[ ]";
            }
            this.view.detailList((i + 1), i, temp, this.model.listDo);
        }
    }

    addTask(arr) {
        arr.shift();
        let str = arr.join();
        str = str.replace(/,/g, " ");
        let list = {};
        list.name = str;
        list.complete = false;
        list.create_at = this.date;
        list.completed_at = null;
        list.tags = [];
        this.model.listDo.push(list);
        let temp = JSON.stringify(this.model.listDo);
        fs.writeFile('data.json', temp, (err) => {
            if (err) throw err;
            this.view.succesSaved();
        });
    }
    infoTask(value) {
        if (value <= this.model.listDo.length) {
            for (let i = 0; i < this.model.listDo.length; i++) {
                if ((i + 1) == value) {
                    this.view.detailTask(i, this.model.listDo[i]);
                }
            }
        } else {
            this.view.notFound();
        }
    }

    Delete(value) {
        let tempArr = [];
        for (let i = 0; i < this.model.listDo.length; i++) {
            if ((i + 1) !== Number(value)) {
                tempArr.push(this.model.listDo[i]);
            }
        }
        let temp = JSON.stringify(tempArr);
        fs.writeFile('data.json', temp, (err) => {
            if (err) throw err;
            this.view.succesDelete();
        });
    }

    taskDo(params, value) {
        let tempArr = [];
        for (let i = 0; i < this.model.listDo.length; i++) {
            if ((i + 1) == Number(value)) {
                if (params) {
                    this.model.listDo[i].complete = true;
                    this.model.listDo[i].completed_at = this.date;
                } else {
                    this.model.listDo[i].complete = false;
                    this.model.listDo[i].completed_at = null;
                }
            }
            tempArr.push(this.model.listDo[i]);
        }
        let temp = JSON.stringify(tempArr);
        fs.writeFile('data.json', temp, (err) => {
            if (err) throw err;
            this.view.changeTask();
        });
    }

    sortView(value) {
        if (value == "asc") {
            this.model.listDo = this.model.listDo.sort(function(a, b) {
                return a.create_at > b.create_at ? 1 : -1;
            });
        } else {
            this.model.listDo = this.model.listDo.sort(function(a, b) {
                return a.create_at < b.create_at ? 1 : -1;
            });
        }
    }

    otherInfoList(value) {
        let temp;
        let a = 1,
            b = 1;
        for (let i = 0; i < this.model.listDo.length; i++) {

            if (value) {
                if (this.model.listDo[i].complete) {
                    this.view.detailList(a, i, "[X]", this.model.listDo);
                    a++;
                }
            } else {
                if (this.model.listDo[i].complete) {} else {
                    this.view.detailList(b, i, "[ ]", this.model.listDo);
                    b++;
                }
            }
        }
    }

    insertTag(arr) {
        let tempArr = [];
        let str = arr[1];
        let ind = Number(str);
        for (let i = 0; i < this.model.listDo.length; i++) {
            if ((i + 1) == ind) {
                for (let j = 2; j < arr.length; j++) {
                    this.model.listDo[i].tags.push(arr[j]);
                }
            }
            tempArr.push(this.model.listDo[i]);
        }
        let temp = JSON.stringify(tempArr);
        fs.writeFile('data.json', temp, (err) => {
            if (err) throw err;
            this.view.succesSaved();
        });
    }
    filterTag(value) {
        let a = value[0].toString().indexOf(":");
        let temp = value[0].toString().slice(a + 1, value[0].length);
        let ind = 1;
        for (let i = 0; i < this.model.listDo.length; i++) {
            for (let j = 0; j < this.model.listDo[i].tags.length; j++) {
                if (this.model.listDo[i].tags[j] == temp) {
                    this.view.filterView(ind, this.model.listDo[i].name, this.model.listDo[i].tags);
                    ind++;
                }
            }
        }
    }
}
class View {
    constructor() {}
    detailHelp() {
        console.log("list");
        console.log("add <task_content>");
        console.log("task <task_id>");
        console.log("delete <task_id>");
        console.log("complete <task_id>");
        console.log("uncomplete <task_id>");
        console.log("list:outstanding asc|desc");
        console.log("list:completed asc|desc");
        console.log("tag <task_id> <tag_name_1> <tag_name_2> ... <tag_name_N>");
        console.log("filter:<tag_name>");
    }
    detailList(no, i, temp, list) {
        console.log(`${no}. ${temp} ${list[i].name}`);
    }
    detailTask(i, obj) {
        console.log(`${(i+1)}. Name : ${obj.name} \nComplete : ${obj.complete} \nCreated : ${obj.create_at} \nCompleted : ${obj.completed_at} \nTags : ${obj.tags}  `);
    }
    succesSaved() {
        console.log('The Task Has Been Saved');
    }
    succesDelete() {
        console.log('Succes Delete Task');
    }
    changeTask() {
        console.log('Task Change');
    }
    notFound() {
        console.log("Not Found!");
    }
    filterView(ind, name, tags) {
        console.log(`${ind}. ${name} ${tags}`);
    }
}

class ToDo {
    constructor() {
        this.controller = new Controller();
    }
    getHelp() {
        this.controller.infoHelp();
    }
    getList() {
        this.controller.infoList();
    }
    newTask(arr) {
        this.controller.addTask(arr);
    }
    task(value) {
        this.controller.infoTask(value);
    }
    deleteTask(value) {
        this.controller.Delete(value);
    }
    actionTask(params, value) {
        this.controller.taskDo(params, value);
    }
    outStanding(value) {
        this.controller.sortView(value);
        this.controller.otherInfoList(false);
    }
    completeList(value) {
        this.controller.sortView(value);
        this.controller.otherInfoList(true);
    }
    addTag(arr) {
        this.controller.insertTag(arr);
    }
    filter(value) {
        this.controller.filterTag(value);
    }
}

if (argv.length > 2) {
    let myToDo = new ToDo();
    argv.shift();
    argv.shift();
    if (argv[0] == "help") {
        myToDo.getHelp();
    } else if (argv[0] == "list") {
        myToDo.getList();
    } else if (argv[0] == "add") {
        myToDo.newTask(argv);
    } else if (argv[0] == "task") {
        myToDo.task(argv[1]);
    } else if (argv[0] == "delete") {
        myToDo.deleteTask(argv[1]);
    } else if (argv[0] == "complete") {
        myToDo.actionTask(true, argv[1]);
    } else if (argv[0] == "uncomplete") {
        myToDo.actionTask(false, argv[1]);
    } else if (argv[0] == "list:outstanding") {
        myToDo.outStanding(argv[1]);
    } else if (argv[0] == "list:completed") {
        myToDo.completeList(argv[1]);
    } else if (argv[0] == "tag") {
        myToDo.addTag(argv);
    } else if (argv[0].slice(0, 6) === "filter") {
        myToDo.filter(argv);
    } else {
        console.log("Check your command or type 'help'");
    }
} else {
    console.log("You not type command");
}
