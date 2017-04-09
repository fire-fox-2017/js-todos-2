let fs = require('fs')

class Model {
    constructor() {
        this._data = []
        this._listHelp = [
            `help                   : Melihat daftar command yang bisa diakses`,
            `list                   : Melihat daftar TODO`,
            `add                    : Menambahkan TODO ke dalam list`,
            `task <id>              : Melihat detail TODO`,
            `delete                 : Menghapus TODO`,
            `complete <id>          : Menandai bahwa TODO selesai`,
            `uncomplete <id>        : Menandai bahwa TODO belum selesai`,
            `list:outstanding       : Melihat daftar TODO yang belum selesai`,
            `list:outstanding asc   : Melihat daftar TODO yang belum selesai diurutkan berdasarkan created_date`,
            `list:outstanding desc  : Melihat daftar TODO yang belum selesai diurutkan berdasarkan complete_date`,
            `clear                  : Menghapus semua daftar TODO`
        ]
    }
}

class View {
    constructor() {

    }

    displayTaskList(tempList, key = "null") {
        if (tempList.length > 0) {
            for (let i = 0; i < tempList.length; i++) {
                let text = "";
                if (key === "created") {
                    text = ` created: ${tempList[i].created_date}`;
                } else if (key === "completed") {
                    text = ` completed: ${tempList[i].complete_date}`;
                } else if (key === "filter") {
                    text = (` tags: ${tempList[i].tags}`);
                }

                let cekComplete = "";
                if (tempList[i].complete) {
                    cekComplete = "[X]";
                } else {
                    cekComplete = "[ ]";
                }
                console.log(`${i+1}. ${cekComplete} ID_task: ${tempList[i].id}, description task: ${tempList[i].description} ${text}`);
            }
        } else {
            console.log(`Your input is not found, please input 'node todo.js help' to show all commands`);
        }
    }

    displayHelp(listHelp) {
        for (let i = 0; i < listHelp.length; i++) {
            console.log(`${i+1}. ${listHelp[i]}`);
        }
    }

    messageTask(description, id) {
        console.log(`Task ${id}: ${description}`);
    }

    messageTaskErr() {
        console.log(`That task is not found!`);
    }

    messageAddNewData(task, id) {
        console.log(`Added "${task}" with id number ${id} to your TODO list`);
    }

    messageAddNewTag(description, id, tag) {
        console.log(`Task ${id}: '${description}' is tagged with '${tag}'`);
    }

    messageTaskDelete(description, id) {
        console.log(`Task ${id} ${description} has been deleted!`);
    }

    messageCompleteTask(description, id) {
        console.log(`Task ${id} ${description} has been completed!`);
    }

    messageUncompleteTask(description, id) {
        console.log(`Task ${id} ${description} has been uncompleted!`);
    }

    messageTaskEmpty() {
        console.log(`There is no list, add first!`);
    }

    messageInputIdDeletedErr() {
        console.log(`Put the task id want to be deleted!`);
    }

    messageInputIdTagErr() {
        console.log("Put the tag first!");
    }

    messageInputIdTaskErr() {
        console.log("Put the task first!");
    }

    messageTagNotFound(tag) {
        console.log(`The '${tag}' tag don't have tasks`);
    }

    messageDeleteAll() {
        console.log(`List is empty!`);
    }

    messageFileErr() {
        console.log(`Data is not found!`);
    }

    messageCommandErr() {
        console.log(`Command is not found!`);
    }
}

class Controller {
    constructor() {
        this._argv = process.argv
        this._model = new Model()
        this._view = new View()
    }

    help() {
        this._view.displayHelp(this._model._listHelp)
    }

    add(task) {
        let id = 0
        do {
            id++;
        } while (!this.cekID(id));

        let obj = {
            id: id,
            description: task,
            complete: false,
            created_date: this.generateDate(),
            complete_date: null,
            tags: []
        }
        this._model._data.push(obj)
        this._view.messageAddNewData(task, id)
    }

    addTag(id, tag) {
        let taskId = this.searchId(id)
        let tempList = this._model._data
        if (taskId !== 0) {
            for (let i = 0; i < tag.length; i++) {
                tempList[taskId].tags.push(tag[i])
            }
            let description = tempList[taskId].description
            this._view.messageAddNewTag(description, id, tag)
        } else {
            this._view.messageTaskErr()
        }
    }

    generateDate() {
        return Date()
    }

    getFile() {
        let data = JSON.parse(fs.readFileSync('data.json'))
        this._model._data = data
    }

    saveToFile() {
        fs.writeFile('data.json', JSON.stringify(this._model._data), (err) => {
            if (err) {
                this._view.messageFileErr()
            }
        })
    }

    cekID(id_task) {
        let count = 0;
        let tempList = this._model._data
        for (let i = 0; i < tempList.length; i++) {
            if (tempList[i].id == id_task) {
                count++;
            }
        }

        if (count > 0) {
            return false;
        } else {
            return true;
        }
    }

    searchId(id) {
        let taskId = 0
        for (let i = 0; i < this._model._data.length; i++) {
            if (+(this._model._data[i].id) === +id) {
                taskId = i
            }
        }
        return taskId
    }

    searchTag(tagDest, id) {
        let tempList = this._model._data
        let taskId = this.searchId(id)
        let tagTask = tempList[taskId].tags;
        let tempTag = [];
        for (let i = 0; i < tagTask.length; i++) {
            for (let j = 0; j < tagDest.length; j++) {
                if (tagTask[i] === tagDest[j]) {
                    tempTag.push(i);
                }
            }
        }
        if (tempTag.length > 0) {
            return tempTag;
        } else {
            return null;
        }
    }

    list() {
        this._view.displayTaskList(this._model._data);
    }

    task(id) {
        let taskId = this.searchId(id)
        if (taskId !== null) {
            let description = this._model._data[taskId].description
            this._view.messageTask(description, id)
        } else {
            this._view.messageTaskErr()
        }
    }

    complete(id) {
        let taskId = this.searchId(id)
        let tempList = this._model._data
        if (tempList.length > 0) {
            if (tempList[taskId].description.length > 0) {
                tempList[taskId].complete = true
                tempList[taskId].complete_date = this.generateDate()
                this._view.messageCompleteTask(tempList[taskId].description, id)
            } else {
                this._view.messageTaskErr()
            }
        } else {
            this._view.messageTaskErr()
        }
    }

    uncomplete(id) {
        let taskId = this.searchId(id)
        let tempList = this._model._data
        if (tempList.length > 0) {
            if (tempList[taskId].description.length > 0) {
                tempList[taskId].complete = false
                tempList[taskId].complete_date = null
                this._view.messageUncompleteTask(tempList[taskId].description, id)
            } else {
                this._view.messageTaskErr()
            }
        } else {
            this._view.messageTaskErr()
        }
    }

    listOutstanding(type = "none") {
        let tempList = this._model._data
        let tempListOustanding = [];
        for (let i = 0; i < tempList.length; i++) {
            if (!tempList[i].complete) {
                tempListOustanding.push(tempList[i]);
            }
        }

        if (type === "none") {
            this._view.displayTaskList(tempListOustanding);
        } else if (type === "asc") {
            let asc = tempListOustanding.sort((a, b) => {
                return a.created_date > b.created_date
            })
            this._view.displayTaskList(asc, "created");
        } else if (type === "desc") {
            let desc = tempListOustanding.sort((a, b) => {
                return b.created_date > a.created_date
            })
            this._view.displayTaskList(desc, "created");
        }
    }

    listCompleted(type = "none") {
        let tempList = this._model._data
        let tempListCompleted = [];
        for (let i = 0; i < tempList.length; i++) {
            if (tempList[i].complete) {
                tempListCompleted.push(tempList[i]);
            }
        }

        if (type === "none") {
            this._view.displayTaskList(tempListCompleted);
        } else if (type === "asc") {
            let asc = tempListCompleted.sort((a, b) => {
                return a.complete_date > b.complete_date
            })
            this._view.displayTaskList(asc, "created");
        } else if (type === "desc") {
            let desc = tempListCompleted.sort((a, b) => {
                return b.complete_date > a.complete_date
            })
            this._view.displayTaskList(desc, "created");
        }
    }

    filterTask(tag) {
        let tempList = this._model._data
        let tempFilterTask = [];
        for (let i = 0; i < tempList.length; i++) {
            if (this.searchTag(tag, tempList[i].id)) {
                tempFilterTask.push(tempList[i]);
            }
        }
        if (tempFilterTask.length > 0) {
            this._view.displayTaskList(tempFilterTask, "filter")
        } else {
            this._view.messageTagNotFound(tag);
        }
    }

    delete(id) {
        let taskId = this.searchId(id)
        let tempList = this._model._data
        if (tempList.length > 0) {
            if (taskId !== 0) {
                let description = tempList[taskId].description
                tempList.splice(taskId, 1)
                this._view.messageTaskDelete(description, id)
            }
        } else {
            this._view.messageTaskEmpty()
        }
    }

    deleteAll() {
        this._model._data = [];
        this._view.messageDeleteAll();
    }

    cekArgv() {
        this.getFile()
        if (this._argv[2] == "add") {
            this.add(String(this._argv.slice(3)).replace(/,/g, ' '))
            this.saveToFile();
        } else if (this._argv[2] == "list") {
            this.list()
        } else if (this._argv[2] == "delete") {
            if (/[0-9]+/.test(this._argv[3])) {
                this.delete(this._argv[3])
                this.saveToFile()
            } else {
                this._view.messageInputIdDeleted()
            }
        } else if (this._argv[2] == "task") {
            this.task(this._argv[3])
        } else if (this._argv[2] == "complete") {
            this.complete(this._argv[3])
            this.saveToFile()
        } else if (this._argv[2] == "uncomplete") {
            this.uncomplete(this._argv[3])
            this.saveToFile()
        } else if (this._argv[2] == "help") {
            this.help()
        } else if (this._argv[2] == "clear") {
            this.deleteAll()
            this.saveToFile()
        } else if (this._argv[2] == "list:outstanding") {
            if (this._argv[3]) {
                this.listOutstanding(this._argv[3])
            } else {
                this.listOutstanding()
            }
        } else if (this._argv[2] == "list:completed") {
            if (this._argv[3]) {
                this.listCompleted(this._argv[3])
            } else {
                this.listCompleted()
            }
        } else if (this._argv[2] == "tag") {
            let tags = [];
            for (let i = 4; i < this._argv.length; i++) {
                tags.push(this._argv[i]);
            }
            if (tags.length > 0) {
                this.addTag(this._argv[3], tags);
                this.saveToFile();
            } else {
                this._view.messageInputIdTagErr();
            }
        } else if (/filter/.test(this._argv[2])) {
            let splitInput = this._argv[2].split(":");
            let tagFilter = splitInput[1].split(" ");
            this.filterTask(tagFilter);
        } else {
            this._view.messageCommandErr()
        }
    }
}

let controller = new Controller()
controller.cekArgv()
