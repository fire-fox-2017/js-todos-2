
const fs = require('fs');

// CLASS MODEL ..................................................................................
class Model{
  static initData(){
    return JSON.parse(fs.readFileSync('data.json', 'utf8'));
  }

  static inserData(input_user){
     fs.writeFileSync('data.json', JSON.stringify(input_user), 'utf8') ;
  }
}


//CLASS VIEW ..................................................................................
class View{

  static bantuan(){
    console.log('[+] node todo.js help');
    console.log('[+] node todo.js list');
    console.log('[+] node todo.js add <DATA>');
    console.log('[+] node todo.js task <ID>');
    console.log('[+] node todo.js delete <ID>');
    console.log('[+] node todo.js completed <ID>');
    console.log('[+] node todo.js uncomplete <ID>');
    console.log('[+] node todo.js list:outstanding ASC/DESC');
    console.log('[+] node todo.js list:complete ASC/DESC');
    console.log('[+] node todo.js tag <ID> <string>');
    console.log('[+] node todo.js filter <string>');
  }

  static tampilListData(listData){
    console.log('TODO LIST DATA')
    let value;
    for(let i=0;i<listData.length;i++){
      if(listData[i].completed == true){
        value = 'X';
      }
      else{
        value = ' ' ;
      }
      console.log(`[${listData[i].id}][${value}] ${listData[i].task}`)
    }
  }

  static outstanding(dataSort){
    for(let i = 0; i < dataSort.length; i++) {
      if (dataSort[i].completed == false) {
        console.log(`[ ] ${dataSort[i].task} create at : ${dataSort[i].date_create} `);
      }
    }
  }

  static tag(data, tagNya){
    console.log(`Tagged task ${data.task} with tags ${tagNya}`)
  }

  static tampilFilterTag(data){
    for(let i=data.length-1; i>=0;i--){
      console.log(`${data[i].id} ${data[i].task} [${data[i].tag}]`);
    }
  }

  static completedData(dataSort){
    for(let i = 0; i < dataSort.length; i++) {
      if (dataSort[i].completed == true) {
        console.log(`[${dataSort[i].id}][X] ${dataSort[i].task} completed at : ${dataSort[i].date_complete} `);
      }
    }
  }

}

// CLASS CONTROLLER.........................................................................
class Controller{
  constructor(masukan){
    this._data = Model.initData();
    this._inputan = masukan[2];
  }


  outstandingData() {
    let sort = masukan[3]
    // console.log(sort);
    let dataSort = ""
    if (sort == "desc") {
      dataSort = this._data.sort(function(a, b) { return b.date_create > a.date_create })
    }
    else {
      dataSort = this._data.sort(function(a, b) { return a.date_create > b.date_create })
    }
    View.outstanding(dataSort)
  }

  completedData() {
    let sort = masukan[3]


    let dataSort = ""
    if (sort == "desc") {
      dataSort = this._data.sort(function(a, b) { return b.date_complete > a.date_complete })
    }

    else {
      dataSort = this._data.sort(function(a, b) { return a.date_complete > b.date_complete })
    }

    View.completedData(dataSort)
  }

  dataTask(masukan){
    let task = masukan.slice(3).join(' ')
    let idPalingUjung = this._data[this._data.length-1].id
    let jsonPush = {
      id: idPalingUjung+1,
      task: task,
      completed: false,
      date_create : Date(),
      date_complete: '',
      tag:[]
    }
    return jsonPush;
  }

  dataTag(masukan){
    let tagNya='';
    for(let i=0;i<this._data.length;i++){
      if(masukan[3] == this._data[i].id){
        for(let j=4; j<masukan.length; j++)
        {
          tagNya+=' '+masukan[j]
          this._data[i].tag.push(masukan[j])
        }
        View.tag(this._data[i], tagNya);
      }
    }
  }

  filterTag(tagNya){
    let arrObjek = []
    for(let i=0;i<this._data.length;i++){
      for(let j=0;j<this._data[i].tag.length;j++){
        if(tagNya == this._data[i].tag[j]){
          arrObjek.push(this._data[i])
        }
      }
    }
    View.tampilFilterTag(arrObjek);
  }

  deleteData(input_id){
    for(let i=0;i<this._data.length;i++){
      if(input_id == this._data[i].id)
        this._data.splice(i, 1);
    }
    fs.writeFileSync('data.json', JSON.stringify(this._data), 'utf8') ;
  }

  print(){

    switch (this._inputan){
      //MENCETAK bantuan
      case 'help' :
        View.bantuan();
        break;

      //MENAMPILKAN LIST TASK YG BELUM completed
      case 'list:outstanding':
        this.outstandingData()
        break;

      //MENAMPILkAN LIST YANG completed
      case 'list:completed':
        this.completedData()
        break;

      //MENAMPILKAN LIST TASK
      case 'list':
        View.tampilListData(this._data)
        break;

      //MENAMBAH TASK
      case 'add':
        let jsonPush = this.dataTask(masukan)
        this._data.push(jsonPush)
        Model.inserData(this._data);
        console.log('TODO LIST DATA')
        for(let i=0;i<this._data.length;i++){
          console.log(`[${this._data[i].id}] ${this._data[i].task}`)
        }
        break;

      //MENAMPILKAN TASK
      case 'task':
        console.log('DATA')
        for(let i=0;i<this._data.length;i++){
          if(masukan[3] == this._data[i].id)
            console.log(`[${this._data[i].id}] ${this._data[i].task}`)
        }
        break;

      //MENGHAPUS TASK
      case 'delete':
        this.deleteData(masukan[3]);
        break;

      //MENGUBAH TASK MENJADI UNCOMPLETE
      case 'uncomplete':
        for(let i=0;i<this._data.length;i++){
          if(masukan[3] == this._data[i].id){
            this._data[i].completed = false;
            this._data[i].date_complete = ' ';
          }
        }
        fs.writeFileSync('data.json', JSON.stringify(this._data), 'utf8') ;
        break;

      //MENGUBAH TASK MENJADI COMPLETE
      case 'complete':
      for(let i=0;i<this._data.length;i++){
        if(masukan[3] == this._data[i].id){
          this._data[i].completed = true;
          this._data[i].date_complete = Date();
        }
      }
      fs.writeFileSync('data.json', JSON.stringify(this._data), 'utf8') ;
        break;


      //MENAMBAH TAG
      case 'tag':
        this.dataTag(masukan)
        Model.inserData(this._data);
        break;


      //MENAMPILKAN TAG FILTER
      case 'filter:':
        this.filterTag(masukan[3])
        break;
      }
  }
}

let masukan = process.argv

let todo = new Controller(masukan);
todo.print();