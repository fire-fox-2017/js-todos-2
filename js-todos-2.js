"use strict"

const fs = require('fs')
// let this.model.data =

// console.log(data);
class Model {
  constructor() {
    this.data = JSON.parse(fs.readFileSync('data.json', 'UTF-8'))
  }
  add(data){
    fs.writeFileSync('data.json', JSON.stringify(data), 'UTF-8')
  }
  complete(data){
    fs.writeFileSync('data.json', JSON.stringify(data), 'UTF-8')
  }
  uncomplete(data){
    fs.writeFileSync('data.json', JSON.stringify(data), 'UTF-8')
  }
  delete(data){
    fs.writeFileSync('data.json', JSON.stringify(data), 'UTF-8')
  }
  task(data){
    fs.writeFileSync('data.json', JSON.stringify(data), 'UTF-8')
  }
}

class Controler {
  constructor(input) {
    this.input = input
    this.model = new Model()
    this.view = new View()
  }
  run() {
    switch(this.input[2]){
      case 'help': this.view.help(); break;
      case 'list': this.list(this.model.data); break;
      case 'add': this.add(); break;
      case 'complete': this.complete(); break;
      case 'uncomplete': this.uncomplete(); break;
      case 'delete': this.delete(); break;
      case 'task': this.task(); break;
      case 'list:outstanding': this.list( this.outstandingList(this.input[3], this.model.data));break;
      case 'list:completed': this.list( this.completedList(this.input[3], this.model.data));break;
      case 'tag' : this.addtags(this.input);break;
      case 'filter:' : this.list(this.tagslist(this.input, this.model.data));break;
      default: this.view.help();
    }
  }
  tagslist(userInput, data) {
    let tagsArr = []
    for(let i = 0; i < data.length; i++){
      if(data[i].tags.includes(userInput[3])){
        tagsArr.push(data[i]);
      }
    }
    return tagsArr
  }
  addtags(input){
    for (let i = 0; i < this.model.data.length; i++) {
      if (this.model.data[i].id == input[3]) {
        this.model.data[i].tags = input.slice(4)
        this.model.complete(this.model.data)
      }
    }
  }
  outstandingList(userInput, data) {
    switch (userInput) {
      case 'asc': data.sort( (a,b) => new Date(b.created_at) < new Date(a.created_at) ); break;
      case 'desc': data.sort( (a,b) => new Date(b.created_at) > new Date(a.created_at) ); break;
      default: data.sort( (a,b) => new Date(b.created_at) < new Date(a.created_at) ); break;
    }
    return data
  }

  completedList(userInput, data) {
    let completedarr = []
    for(let i = 0; i < data.length; i++){
      if(data[i].status == "complete"){
        completedarr.push(data[i]);
      }
    }
    data = completedarr
    switch (userInput) {
      case 'asc': data.sort( (a,b) => new Date(b.completed_at) < new Date(a.completed_at) ); break;
      case 'desc': data.sort( (a,b) => new Date(b.completed_at) > new Date(a.completed_at) ); break;
      default: data.sort( (a,b) => new Date(b.completed_at) < new Date(a.completed_at) ); break;
    }
    // console.log(completedarr);
    return data
  }


  list(data) {
    for (let i = 0; i < data.length; i++){
      if(data[i].status == "complete") {
        this.view.list(data[i], "X")
      } else {
        this.view.list(data[i], " ")
      }
    }
  }

  add() {
    let arr = []
    for (let i = 3; i < input.length; i++){
      arr.push(this.input[i])
    }
    let Things = arr

    this.model.data.push({"id": this.model.data.length+1, "task": Things, "status": "uncomplete", "created_at": new Date(), "tags": []})
    this.model.add(this.model.data)
    this.view.add(Things)
  }

  complete() {
    for (let i = 0; i < this.model.data.length; i++) {
      if (this.model.data[i].id == this.input[3]) {
        this.model.data[i].status = "complete"
        this.model.data[i].completed_at = new Date()
        this.model.complete(this.model.data)
      }
    }
  }

  uncomplete() {
    for (let i = 0; i < this.model.data.length; i++) {
      if (this.model.data[i].id == this.input[3]) {
        this.model.data[i].status = "uncomplete"
        this.model.uncomplete(this.model.data)
      }
    }
  }

  delete() {
    this.model.data.splice(this.input[3]-1, 1)
      this.view.delete(this.input[3])
    this.model.delete(this.model.data)
  }

  task(){
    for (let i =0; i<this.model.data.length; i++) {
      if (this.model.data[i].id == this.input[3]) {
        this.view.task(this.model.data[i])
        this.model.task(this.model.data)
      }
    }
  }
}

class View {
  constructor(){}
  help(){
    let menu = `             HELP MENU
    ============================
    - node todo.js add <task content>
    - node todo.js list
    - node todo.js help
    - node todo.js delete <task_id>
    - node todo.js complete <task_id>
    - node todo.js uncomplete <task_id>
    - node todo.js task <task_id>
    - node todo.js list:completed
    - node todo.js list:outstanding`
    console.log(menu);
  }
  list(data, status) {
    for (let i = 0; i < data.length; i++){
      data.id = i+1
    }
    console.log(`${data.id}. [${status}] ${data.task} ${data.created_at}`);
  }
  add(Things){
    console.log(`"${Things}" Added!`);
  }
  delete(data){
    console.log(data + " Deleted!");
  }
  task(data){
    console.log(data);
  }
}


let input = process.argv
let todos = new Controler(input)
todos.run()
