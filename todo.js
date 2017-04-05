class ToDo {
  constructor(){
    let strJson=fs.readFileSync('data.json');
    this.listDo = JSON.parse(strJson);
  }
  newTask(str){
    let list={};
    list.action="[ ]";
    list.detail=str;
    this.listDo.push(list);
    let temp=JSON.stringify(this.listDo);
    fs.writeFile('data.json',temp,(err)=>{
      if(err) throw err;
        console.log('The Task has been saved');
    });
  }
  getTask(){
    for(let i=0;i<this.listDo.length;i++){
      console.log(`${(i+1)}. ${this.listDo[i].action} ${this.listDo[i].detail}`);
    }
  }
  task(value){
    if(value<=this.listDo.length){
      for(let i=0;i<this.listDo.length;i++){
        if((i+1)==value){
          console.log(`${(i+1)}. ${this.listDo[i].action} ${this.listDo[i].detail}`);
        }
      }
    }else {
      console.log("Not Found!");
    }
  }
  deleteTask(value){
    let tempArr=[];
    for(let i=0;i<this.listDo.length;i++){
      if((i+1)!==value){
        tempArr.push(this.listDo[i]);
      }
    }
    let temp=JSON.stringify(tempArr);
    fs.writeFile('data.json',temp,(err)=>{
      if(err) throw err;
        console.log('Succes Delete Task');
    });
  }
  actionTask(params,value){
    let tempArr=[];
    for(let i=0;i<this.listDo.length;i++){
      if((i+1)==value){
        if(params){
          this.listDo[i].action="[X]";
        }else {
          this.listDo[i].action="[ ]";
        }
      }
      tempArr.push(this.listDo[i]);
    }
    let temp=JSON.stringify(tempArr);
    fs.writeFile('data.json',temp,(err)=>{
      if(err) throw err;
      console.log('Task Complete');
    });
  }

}
const fs=require('fs');
let argv=process.argv;

if(argv.length>2){
  let myToDo = new ToDo();
  argv.shift();
  argv.shift();
  if(argv[0]=="help"){
    console.log("list");
    console.log("add <task_content>");
    console.log("task <task_id>");
    console.log("delete <task_id>");
    console.log("complete <task_id>");
    console.log("uncomplete <task_id>");
  }else if (argv[0]=="list") {
    let str=argv.join();
    str=str.replace(/,/g," ");
    myToDo.getTask();
  }else if (argv[0]=="add") {
    argv.shift();
    let str=argv.join();
    str=str.replace(/,/g," ");
    myToDo.newTask(str);
  }else if (argv[0]=="task") {
    let temp=Number(argv[1]);
    myToDo.task(temp);
  }else if (argv[0]=="delete") {
    let temp=Number(argv[1]);
    myToDo.deleteTask(temp);
  }else if (argv[0]=="complete") {
    let temp=Number(argv[1]);
    myToDo.actionTask(true,temp);
  }else if (argv[0]=="uncomplete") {
    let temp=Number(argv[1]);
    myToDo.actionTask(false,temp);
  }else {
    console.log("Check your command or type 'help'");
  }
}else{
  console.log("You not type command");
}
