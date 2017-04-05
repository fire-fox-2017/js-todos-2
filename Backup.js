"use strict"

const fs =require('fs');


class ToDo {
  constructor() {
    this.listData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
  }

  add(string){
    let cek=true;
    let iD;
    if(this.listData.length===0){
      iD = Math.floor((Math.random() * 900) + 100);
      this.listData.push({id:iD,task:string,complete:'[ ]'});
    }else{
      while (cek==true) {
        iD = Math.floor((Math.random() * 900) + 100);
        for (var i = 0; i <=this.listData.length; i++) {
          if(i==this.listData.length){
            this.listData.push({id:iD,task:string,complete:'[ ]'});
            cek=false;
            break
          }
          if(this.listData[i].id===iD){
            break
          }
        }
      }
    }
    return this;
  }

  help(){
    console.log('1. Melihat daftar TODO dengan : list');
    console.log('2. Menambahkan TODO ke dalam list dengan : add <todo>');
    console.log('3. Melihat detail TODO dengan : task <id>');
    console.log('4. Menghapus TODO dengan : delete <id>');
    console.log('5. Menandai bahwa TODO selesai dengan dengan : complete <id>');
    console.log('6. Menandai bahwa TODO belum selesai dengan : uncomplete <id>');
    console.log('7. Melihat teks bantuan dengan : help');
  }
  
  List(){

    for(let i=0;i<this.listData.length;i++){
      console.log(`${i+1}. ${this.listData[i].complete} ${this.listData[i].task} id:${this.listData[i].id}`);
    }
  }

  task(n){
    for(let i=0;i<this.listData.length;i++){

        if(String(this.listData[i].id)===n){


          return this.listData[i]
        }
    }
    return 'not found'
  }

  delete(n){
    for(let i=0;i<this.listData.length;i++){

        if(String(this.listData[i].id)===n){
          this.listData.splice(i,1);
          break;
        }
    }
    return this
  }

  kelar(n){
    for(let i=0;i<this.listData.length;i++){

        if(String(this.listData[i].id)===n){
          this.listData[i].complete='[X]';
          break;
        }
    }
    return this
  }

  gKelar(n){
    for(let i=0;i<this.listData.length;i++){

        if(String(this.listData[i].id)===n){
          this.listData[i].complete='[ ]';
          break;
        }
    }
    return this

  }

  save(){
    let tasks = JSON.stringify(this.listData);
    fs.writeFile('data.json', tasks,'utf8', (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
  }

}

let toDo= new ToDo();


let argv=process.argv;
if(argv.length>1){
  argv.shift();
  argv.shift();

  if(argv[0]=='add'){
    argv.shift();
    let str=argv.join();
    str=str.replace(/,/g," ");
    toDo.add(str).save();
  }

  if(argv[0]=='task'){
    argv.shift();
    console.log(toDo.task(argv[0]));
  }

  if(argv[0]=='list'){
    toDo.List();
  }

  if(argv[0]=='delete'){
    argv.shift();
   toDo.delete(argv[0]).save();
  }

  if(argv[0]=='complete'){
    argv.shift();
   toDo.kelar(argv[0]).save();
  }

  if(argv[0]=='uncomplete'){
    argv.shift();
   toDo.gKelar(argv[0]).save();
  }

  if(argv[0]=='help'){
   toDo.help();
  }

}else{
  console.log("no word detected");
}
