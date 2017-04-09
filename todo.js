'use strict'
const fs = require('fs');

class Model {
  constructor() {
    this.file = JSON.parse(fs.readFileSync('data.json', 'utf-8'))
  }
  write(data){
    fs.writeFileSync('data.json', JSON.stringify(data))
  }
}

class Controller {
  constructor() {
    this.model = new Model()
    this.view = new View()
  }

  process(){
    switch(process.argv[2]){
      case "help":
        this.view.help();
      break;
      case "list":
        this.view.list(this.model.file);
      break;
      case "add":
        this.add_task(process.argv[3]);
      break;
      case "task":
        this.task();
      break;
      case "delete":
        this.delete(process.argv[3]);
      break;
      case "complete":
        this.complete(process.argv[3]);
      break;
      case "uncomplete":
        this.uncomplete(process.argv[3]);
      break;
      case "list:outstanding":
        this.outstanding(process.argv[3]);
      break;
      case "list:complete":
        this.list_completed(process.argv[3]);
      break;
      case "tag":
        this.tag(process.argv[3],process.argv.slice(4));
      break;
      case "filter":
        this.filter(process.argv[3]);
      break;
    }
  }

  add_task(input){
    let filedata = this.model.file
    filedata.push({
      task:input,
      complete:false,
      create_at:new Date().toISOString()
    })
    this.model.write(filedata)
    this.view.add(input)
  }

  task(){
    let filedata = this.model.file
    filedata.filter((element)=>{
        this.view.task(element)
    })
  }

  delete(input){
    let filedata = this.model.file
    filedata.splice(input-1,1)
    this.model.write(filedata)
    this.view.delete(input)
  }

  complete(input){
    let filedata = this.model.file
    if(filedata[input-1].complete == false){
      filedata[input-1].complete = true;
      this.model.write(filedata)
      this.view.complete(input)
    }
  }

  uncomplete(input){
    let filedata = this.model.file
    if(filedata[input-1].complete == true){
      filedata[input-1].complete = false;
      this.model.write(filedata)
      this.view.uncomplete(input)
    }
  }

  outstanding(input){
    let filedata = this.model.file

    if(input == 'asc' || input == undefined){
      let final = filedata.sort((a,b)=>{
        if (a.create_at < b.create_at){
          return -1;
        }
        if (a.create_at > b.create_at){
          return 1;
        }
        return 0;
      })
      this.view.asc_desc(final)
    } else {
      let final = filedata.sort((a,b)=>{
        if (a.create_at < b.create_at){
          return 1;
        }
        if (a.create_at > b.create_at){
          return -1;
        }
        return 0;
      })
      this.view.asc_desc(final)
    }
  }

  list_completed(input){
    let filedata = this.model.file

    if(input == 'asc' || input == undefined){
      let final = filedata.sort((a,b)=>{
        if (a.create_at < b.create_at){
          return -1;
        }
        if (a.create_at > b.create_at){
          return 1;
        }
        return 0;
      })
      this.view.asc_desc(final)
    } else {
      let final = filedata.sort((a,b)=>{
        if (a.create_at < b.create_at){
          return 1;
        }
        if (a.create_at > b.create_at){
          return -1;
        }
        return 0;
      })
      this.view.asc_desc(final)
    }
  }

  tag(input,value){
    let filedata = this.model.file
    filedata[input-1].tag = value
    this.model.write(filedata)
    this.view.tag(filedata[input-1].task, value)
  }

  filter(input){
    let filedata = this.model.file
    filedata.filter((element)=>{
      if(element.hasOwnProperty("tag")){
          element.tag.forEach((value)=>{
            if(input == value){
              this.view.filter(element)
            }
          })
      }
    })
  }
}

class View {
  constructor() {

  }

  help(){
    console.log("- help");
    console.log("- list");
    console.log("- add <task_content>");
    console.log("- task <task_id>");
    console.log("- delete <task_id>");
    console.log("- complete <task_id>");
    console.log("- uncomplete <task_id>");
    console.log("- list:outstanding asc|desc");
    console.log("- list:complete asc|desc");
    console.log("- tag <id> <name_1> <name_2>");
    console.log("- filter <tag_name>");
  }

  list(input){
    for(let i=0;i<input.length;i++){
      if(input[i].complete == true){
      console.log(`${i+1}. [X]${input[i].task}`);
      }else{
      console.log(`${i+1}. [ ]${input[i].task}`);
      }
    }
  }

  add(input){
    console.log(`Task added in your list`)
  }

  task(input){
    console.log(input);
  }

  delete(input){
    console.log(`Task has been delete`);
  }

  complete(input){
    console.log(`Task has been complete`)
  }

  uncomplete(input){
    console.log(`Task change to be uncomplete`)
  }
  asc_desc(input){
    console.log(input);
  }
  tag(task, content){
    console.log(`Tagged task "${task}" with tags: ${content}`)
  }
  filter(input){
    console.log(`Task: ${input.task} tags: ${input.tag}`)
  }
}

let start = new Controller()
start.process()
