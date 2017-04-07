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

    showListOutStanding(data){
      if(data.length > 0){
        for (var i = 0; i < data.length; i++) {
            console.log(`${i + 1}. [] ${data[i].id} : ${data[i].task}`);
        }
      } else {
        console.log('Tidak ada task yang belum complete');
      }
    }

    showListCompleted(data){
      if(data.length > 0){
        for (var i = 0; i < data.length; i++) {
            console.log(`${i + 1}. [x] ${data[i].id} : ${data[i].task}`);
        }
      } else {
        console.log('Tidak ada task yang complete');
      }
    }

    showTagMessage(task, data){
      var kataTag = data.join(',');
      console.log(`Tagged task "${task}" with tags: ${data} `);
    }

    showTagMessageErr(){
      console.log('Data Tidak Ditemukan');
    }

    showFilter(data){
      if (data.length > 0) {
          for (var i = 0; i < data.length; i++) {
              if (data[i].marked == false) {
                  console.log(`${i + 1}. [] ${data[i].id} : ${data[i].task} ${data[i].tag}`);
              } else {
                  console.log(`${i + 1}. [x] ${data[i].id} : ${data[i].task} [${data[i].tag}]`);
              }
          }
      } else {
          console.log('Data Tidak Ditemukan');
      }
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
            date_created: dateBaru,
            date_completed: 0,
            tag : []};
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
        if(tmpId !== 1){
          let nomorID = tmpId.slice(2);
          let idBaru = id + (+nomorID + 1);
          return idBaru;
        } else {
          var idPertama = 'ID1';
          return idPertama;
        }
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

    listOutstanding(){
      let listOutstanding = this._model.getListOutstanding();

      let dataSorted1 =  listOutstanding.sort(function(a,b) {return a.date_created > b.date_created});
      this._view.showListOutStanding(dataSorted1);
    }

    listOutstandingAsc(){
      let listOutstandingAsc = this._model.getListOutstanding();
      let dataSortedAsc1 = listOutstandingAsc.sort(function(a,b) {return a.date_created > b.date_created});
      this._view.showListOutStanding(dataSortedAsc1);
    }

    listOutstandingDesc(){
      let listOutstandingDesc = this._model.getListOutstanding();
      let dataSortedDesc1 = listOutstandingDesc.sort(function(a,b) {return b.date_created > a.date_created});
      this._view.showListOutStanding(dataSortedDesc1);
    }

    listCompleted(){
      let listCompleted = this._model.getlistCompleted();
      let dataSorted2 =  listCompleted.sort(function(a,b) {return a.date_created > b.date_created});
      this._view.showListCompleted(dataSorted2);
    }

    listCompletedAsc(){
      let listCompletedAsc = this._model.getlistCompleted();
      let dataSortedAsc2 =  listCompletedAsc.sort(function(a,b) {return a.date_created > b.date_created});
      this._view.showListCompleted(dataSortedAsc2);
    }

    listCompletedDesc(){
      let listCompletedDesc = this._model.getlistCompleted();
      let dataSortedDsc2 =  listCompletedDesc.sort(function(a,b) {return b.date_created > a.date_created});
      this._view.showListCompleted(dataSortedDsc2);
    }

    tag(data){
      var task = this._model.addTag(data[0],data);
      if(task != ''){
        this._view.showTagMessage(task, data);
      } else {
        this._view.showTagMessageErr();
      }

    }

    filter(data){
      var dataFilter = this._model.filterTag(data);
      this._view.showFilter(dataFilter);
    }

    chooseMenu() {
        let input = this._argv;
        input.shift();
        input.shift();

        let input2 = input.join(' ');
        let input3 = input.join('').split(':');

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
        } else if (input2 === 'list:outstanding') {
            this.listOutstanding();
        } else if (input2 === 'list:outstanding asc'){
            this.listOutstandingAsc();
        } else if (input2 === 'list:outstanding desc'){
            this.listOutstandingDesc();
        } else if (input2 === 'list:completed'){
          this.listCompleted();
        } else if (input2 === 'list:completed asc'){
          this.listCompletedAsc();
        } else if (input2 === 'list:completed desc'){
          this.listCompletedDesc();
        } else if (input[0] === 'tag'){
          input.shift();
          this.tag(input);
        } else if (input3[0] === 'filter'){
          input3.shift();
          this.filter(input3);
        }
        else {
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

    findIdTask() {
      if(this._data.length == 0){
        return 1;
      } else {
        return this._data[this._data.length - 1].id;
      }

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
              this._data[i].date_completed = dateBaru;
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

    getListOutstanding(){
      let dataOutstanding = [];
      for (var i = 0; i < this._data.length; i++) {
        if(this._data[i].marked == false){
          dataOutstanding.push(this._data[i]);
        }
      }
      return dataOutstanding;
    }

    getlistCompleted(){
      let dataCompleted = [];
      for (var i = 0; i < this._data.length; i++) {
        if(this._data[i].marked == true){
          dataCompleted.push(this._data[i]);
        }
      }
      return dataCompleted;
    }

    addTag(id, data){
      var namaTask = '';
      data.shift();
      for (var i = 0; i < this._data.length; i++) {
        if (this._data[i].id == id) {
            for (var j = 0; j < data.length; j++) {
              this._data[i].tag.push(data[j]);
              namaTask = this._data[i].task;
            }
        }
      }
      this.saveFile(this._data);
      return namaTask;

    }

    filterTag(data){
      var dataTag = [];
      var kataTag = String(data);

      for (var i = 0; i < this._data.length; i++) {
        if(this._data[i].tag.includes(kataTag)){
          dataTag.push(this._data[i]);
        }
      }

      return dataTag;

    }

    saveFile(dataTask) {
        fs.writeFile('data.json', JSON.stringify(dataTask), function (err) {
            if (err) return console.log(err);
        });
    }

    getData() {
        return this._data;
    }

}

let appToDo = new toDoController();
appToDo.chooseMenu();
