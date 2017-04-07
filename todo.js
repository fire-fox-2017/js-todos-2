const fs = require('fs');

class toDoView {
    constructor() {

    }

    showHelp() {
        console.log('---------- Aplikasi To Do List ----------');
        console.log('help : untuk melihat daftar perintah' + '\n' +
            'list : untuk melihat daftar task' + '\n' +
            'add <task_content> : untuk menambah task' + '\n' +
            'task <task_id> : untuk mencari task berdasarkan ID task' + '\n' +
            'delete <task_id> : untuk menghapus task berdasarkan ID' + '\n' +
            'complete <task_id> : untuk check mark task yang sudah selesai ' + '\n' +
            'uncomplete <task_id> : untuk uncheck mark task yang belum selesai' + '\n' +
            'list:outstanding asc|desc : untuk menampilkan task yang di buat secara ascending / descending sesuai tanggal pembuatan' + '\n' +
            'list:completed asc|desc : untuk menampilkan task yang sudah selesai secara ascending / descending sesuai tanggal' + '\n' +
            'tag <task_id> <tag_name> : untuk menambahkan tag pada task' + '\n' +
            'filter <tag_name> : untuk mencari task berdasarkan tag');
    }

    showHelpError() {
        console.log('Perintah Tidak Ditemukan');
    }

    showListTask(listTask) {
        if (listTask.length > 0) {
            for (var i = 0; i < listTask.length; i++) {
                if (listTask[i].marked == false) {
                    console.log(`${i + 1}. [] ${listTask[i].id} : ${listTask[i].task}`);
                } else {
                    console.log(`${i + 1}. [x] ${listTask[i].id} : ${listTask[i].task}`);
                }
            }
        } else {
            console.log(listTask);
        }
    }

    showTask(task) {
        if (task.length > 0) {
            if (task[0].marked == false) {
                console.log(`${1}. [] ${task[0].id} : ${task[0].task}`);
            } else {
                console.log(`${1}. [x] ${task[0].id} : ${task[0].task}`);
            }
        } else {
            console.log(task);
        }
    }

    showAddMessage(dataBaru) {
        console.log(`Data ${dataBaru.task} berhasil ditambah`);
    }

    showDeleteMessage(pesan) {
        if (pesan.length > 0) {
            console.log(`Data ${pesan} berhasil dihapus`);
        } else {
            console.log(pesan);
        }
    }

    showCompleteMessage(pesan){
      console.log(pesan);
    }

}

class toDoController {
    constructor() {
        this._model = new toDoModel();
        this._view = new toDoView();
        this._argv = process.argv;
        this._data = [];
    }

    insertTask(dataTask) {
        let idbaru = this.createIdTask(dataTask);
        let dateBaru = new Date();

        let dataBaru = {
            id: idbaru,
            task: dataTask,
            marked: false,
            date_created: dateBaru.toUTCString(),
            date_completed: 0
        };
        this._data = this._model.getData();
        this._data.push(dataBaru);
        this._model.saveFile(this._data);
        this._view.showAddMessage(dataBaru);
    }

    searchTask(dataTask) {
        var task = this._model.findTask(dataTask);
        if (task.length > 0) {
            this._view.showTask(task);
        } else {
            var pesan = 'Data Task Tidak Ditemukan';
            this._view.showTask(pesan);
        }
    }

    createIdTask(dataTask) {
        let id = 'ID';
        let tmpId = this._model.findIdTask();
        let nomorID = tmpId.slice(2);
        let idBaru = id + (+nomorID + 1);
        return idBaru;
    }

    deleteTask(input) {
        var data = this._model.removeTask(input);
        if (data.length == 0) {
            var pesan = "Data Tidak Ditemukan";
            this._view.showDeleteMessage(pesan);
        } else {
            this._view.showDeleteMessage(data);
        }
    }

    completeTask(input) {
        var data = this._model.markTask(input);
        var pesan = '';
        if(data !== 0){
          pesan = 'Task berhasil diselesaikan';
          this._view.showCompleteMessage(pesan);
        } else {
          pesan = 'Task tidak ditemukan';
          this._view.showCompleteMessage(pesan);
        }
    }

    unCompleteTask(input) {
      var data = this._model.unMarkTask(input);
      var pesan = '';
      if(data !== 0){
        pesan = 'Task berhasil di uncomplete';
        this._view.showCompleteMessage(pesan);
      } else {
        pesan = 'Task tidak ditemukan';
        this._view.showCompleteMessage(pesan);
      }
    }

    showTaskList() {
        var listTask = this._model.getTaskList();
        if (listTask.length > 0) {
            this._view.showListTask(listTask);
        } else {
            var pesan = 'Data Task Kosong';
            this._view.showListTask(pesan);
        }
    }

    chooseMenu() {
        let input = this._argv;
        input.shift();
        input.shift();

        if (input[0] === undefined || input[0] === 'help') {
            this._view.showHelp();
        } else if (input[0] === 'list') {
            this.showTaskList();
        } else if (input[0] === 'add') {
            input.shift();
            this.insertTask(input.join(' '));
        } else if (input[0] === 'task') {
            input.shift();
            this.searchTask(input);
        } else if (input[0] === 'delete') {
            input.shift();
            this.deleteTask(input);
        } else if (input[0] === 'complete') {
            input.shift();
            this.completeTask(input);
        } else if (input[0] === 'uncomplete') {
            input.shift();
            this.unCompleteTask(input);
        } else {
            this._view.showHelpError();
        }

    }
}

class toDoModel {
    constructor() {
        this._data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    }

    addTask(dataTask) {
        this.saveFile(dataTask);
    }

    getTaskList() {
        return this._data;
    }

    findTask(idTask) {
        let dataTask = [];
        for (var i = 0; i < this._data.length; i++) {
            if (this._data[i].id == idTask) {
                dataTask.push(this._data[i]);
                return dataTask;
            }
        }
    }

    removeTask(input) {
        let idBaru = input.join('');
        let dataHapus = [];
        for (var i = 0; i < this._data.length; i++) {
            if (this._data[i].id == input) {
                dataHapus.push(this._data[i].task);
                this._data.splice(i, 1);
            }
        }
        this.saveFile(this._data);
        return dataHapus;
    }

    markTask(input) {
      let dateBaru = new Date();
      let mark = 0;
      for (var i = 0; i < this._data.length; i++) {
          if (this._data[i].id == input) {
              this._data[i].marked = true;
              this._data[i].date_completed = dateBaru.toUTCString();
              mark++;
          }
      }

      this.saveFile(this._data);

      if(mark == 1){
        return 1;
      } else {
        return 0;
      }
    }

    unMarkTask(input) {
      let mark = 0;
      for (var i = 0; i < this._data.length; i++) {
          if (this._data[i].id == input) {
              this._data[i].marked = false;
              this._data[i].date_completed = 0;
              mark++;
          }
      }

      this.saveFile(this._data);

      if(mark == 1){
        return 1;
      } else {
        return 0;
      }
    }

    saveFile(dataTask) {
        fs.writeFile('data.json', JSON.stringify(dataTask), function (err) {
            if (err) return console.log(err);
        });
    }

    findIdTask() {
        return this._data[this._data.length - 1].id;
    }

    getData() {
        return this._data;
    }
}

let appToDo = new toDoController();
appToDo.chooseMenu();
