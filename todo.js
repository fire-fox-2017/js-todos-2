'use strict'
const fs = require('fs');

class Model {
  constructor() {
    this.file = JSON.parse(fs.readFileSync('data.json', 'utf-8'))
  }
  add(data){
    fs.writeFileSync('data.json', JSON.stringify(data))
  }
  delete(data){
    fs.writeFileSync('data.json', JSON.stringify(data))
  }
  complete(data){
    fs.writeFileSync('data.json', JSON.stringify(data))
  }
  uncomplete(data){
    fs.writeFileSync('data.json', JSON.stringify(data))
  }
  tag(data){
    fs.writeFileSync('data.json', JSON.stringify(data))
  }
}

'========================================================================================================'

class Controller {
  constructor(exec, content1, content2) {
    this.exec = exec
    this.content = content1
    this.value = content2
    this.model = new Model()
    this.view = new View()
  }

  process(){
    if(this.exec == undefined || this.exec == 'help'){
      console.log(this.view.help());
    } else if(this.exec == 'list'){
      this.view.list(this.model.file)
    } else if(this.exec == 'add'){
      this.add_task(this.content)
    } else if(this.exec == 'task'){
      this.task(this.content)
    } else if(this.exec == 'delete'){
      this.delete(this.content)
    } else if(this.exec == 'complete'){
      this.complete(this.content)
    } else if(this.exec == 'uncomplete'){
      this.uncomplete(this.content)
    } else if(this.exec == 'list:outstanding'){
      this.outstanding(this.content)
    } else if(this.exec == 'list:complete'){
      this.list_completed(this.content)
    } else if(this.exec == 'tag'){
      this.tag(this.content,this.value)
    } else if(this.exec == 'filter'){
      this.filter(this.content)
    }
  }

  add_task(input){
    let filedata = this.model.file
    let save = {
      id:filedata[filedata.length-1].id + 1,
      task:input,
      complete:false,
      create_at:new Date().toISOString()
    }
    filedata.push(save)
    this.model.add(filedata)
    this.view.add(input)
    // fs.writeFileSync('data.json', JSON.stringify(this.file))
  }

  task(input){
    let filedata = this.model.file
    filedata.filter((element)=>{
      if(element.id == input){
        this.view.task(element)
      }
    })
  }

  delete(input){
    let filedata = this.model.file
    for(let i=0; i<filedata.length; i++){
      if(filedata[i].id == input){
        filedata.splice(i,1)
        this.model.delete(filedata)
        this.view.delete(input)
        // fs.writeFileSync('data.json', JSON.stringify(this.file))
      }
    }
  }

  complete(input){
    let filedata = this.model.file
    for(let i=0; i<filedata.length; i++){
      if(filedata[i].id == input){
        filedata[i].complete = true
        this.model.complete(filedata)
        this.view.complete(input)
        // fs.writeFileSync('data.json', JSON.stringify(this.file))
      }
    }
  }

  uncomplete(input){
    let filedata = this.model.file
    for(let i=0; i<filedata.length; i++){
      if(filedata[i].id == input){
        filedata[i].complete = false
        this.model.uncomplete(filedata)
        this.view.uncomplete(input)
        // fs.writeFileSync('data.json', JSON.stringify(this.file))
      }
    }
  }

  outstanding(input){
    let filedata = this.model.file
    let save = filedata.filter((element)=>{
      if(false == element.complete){
        return element
      }
    })
    if(input == 'asc' || input == undefined){
      let final = save.sort((a,b)=>{
        if (a.create_at < b.create_at){
          return -1;
        }
        if (a.create_at > b.create_at){
          return 1;
        }
        return 0;
      })
      this.view.show_asc_desc(final)
    } else {
      let final = save.sort((a,b)=>{
        if (a.create_at < b.create_at){
          return 1;
        }
        if (a.create_at > b.create_at){
          return -1;
        }
        return 0;
      })
      this.view.show_asc_desc(final)
    }
  }

  list_completed(input){
    let filedata = this.model.file
    let save = filedata.filter((element)=>{
      if(true == element.complete){
        return element
      }
    })
    // console.log(save);
    if(input == 'asc' || input == undefined){
      let final = save.sort((a,b)=>{
        if (a.create_at < b.create_at){
          return -1;
        }
        if (a.create_at > b.create_at){
          return 1;
        }
        return 0;
      })
      this.view.show_asc_desc(final)
    } else {
      let final = save.sort((a,b)=>{
        if (a.create_at < b.create_at){
          return 1;
        }
        if (a.create_at > b.create_at){
          return -1;
        }
        return 0;
      })
      this.view.show_asc_desc(final)
    }
  }

  tag(input,value){
    // console.log(value);
    let getId = input[0]
    let seperated = value
    let filedata = this.model.file
    for(let i=0; i<filedata.length; i++){
      if(filedata[i].id == getId){
        filedata[i].tag = seperated
        this.model.tag(filedata)
        this.view.tag(filedata[i].task, seperated)
      }
    }
  }

  filter(input){
    // console.log(typeof(input));
    let filedata = this.model.file
    let save = filedata.filter((element)=>{
                  if(element.hasOwnProperty("tag")){
                      element.tag.forEach((value)=>{
                        if(input == value){
                          this.view.filter(element)
                        }
                      })
                  }
                })
    // console.log(save);
  }
}

'=========================================================================================================='

class View {
  constructor() {

  }

  help(){
    return `============JS Todo List============\n$ node todo.js help\n$ node todo.js list\n$ node todo.js add <task_content>\n$ node todo.js task <task_id>\n$ node todo.js delete <task_id>\n$ node todo.js complete <task_id>\n$ node todo.js uncomplete <task_id>\n$ node todo.js list:outstanding asc|desc\n$ node todo.js list:complete asc|desc\n$ node todo.js tag <id> <name_1> <name_2>\n$ node todo.js filter <tag_name>`;
  }

  list(input){
    input.forEach((element)=>{
      console.log(`${element.id} ${element.complete ? '[x]':'[ ]'} ${element.task}`)
    })
  }

  add(input){
    console.log(`Added ${input} in your list`)
  }

  task(input){
    console.log(input);
  }

  delete(input){
    console.log(`id : ${input} has been delete`);
  }

  complete(input){
    console.log(`id : ${input} has been complete`)
  }

  uncomplete(input){
    console.log(`id : ${input} change to be uncomplete`)
  }
  show_asc_desc(input){
    console.log(input);
  }
  tag(task, content){
    console.log(`Tagged task "${task}" with tags: ${content}`)
  }
  filter(input){
    console.log(`id: ${input.id}. Task: ${input.task} tags: ${input.tag}`)
  }
}

let exec = process.argv[2]
let content1 = process.argv[3]
let content2 = process.argv.slice(4)
let doing = new Controller(exec, content1, content2)
doing.process()
