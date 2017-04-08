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
////////////////////////////////////////////////////////////////////////////////
class View {
  constructor(){}
  help(){
    let node = "$ node todo.js"
    let menu = `\n HELP MENU \n ============================\n ${node} add <task content> \n ${node} list \n ${node} help \n ${node} delete <task_id> \n ${node} complete <task_id> \n ${node} uncomplete <task_id> \n ${node} task <task_id>`
    console.log(menu);
  }
  list(data, status) {
    console.log(`${data.id}. [${status}] ${data.task}`);
  }
  add(string){
    console.log(`"${string}" berhasil ditambahkan`);
  }
  delete(data){
    console.log(data);
  }
  task(data){
    console.log(data);
  }
}
////////////////////////////////////////////////////////////////////////////////
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
    // console.log(tagsArr);
    return tagsArr
  }
  addtags(input){
    for (let i = 0; i < this.model.data.length; i++) {
      if (this.model.data[i].id == input[3]) {
        this.model.data[i].tags = input.slice(4)
        this.model.complete(this.model.data)
        // fs.writeFileSync('this.model.data.json', JSON.stringify(this.model.data), 'UTF-8')
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
        // console.log(`${data[i].id}. [X] ${data[i].task}`);
        this.view.list(data[i], "X")
      } else {
        this.view.list(data[i], " ")
        // console.log(`${data[i].id}. [ ] ${data[i].task}`);
      }
    }
  }

  add() {
    let arr = []
    for (let i = 3; i < input.length; i++){
      arr.push(this.input[i])
    }
    let string = arr.join(" ")

    this.model.data.push({"id": this.model.data.length+1, "task": string, "status": "uncomplete", "created_at": new Date(), "tags": []})
    // this.model.data[i].complete_at = new Date()
    this.model.add(this.model.data)
    // fs.writeFileSync('this.model.data.json', JSON.stringify(this.model.data), 'UTF-8')
    // console.log(`"${string}" berhasil ditambahkan`);
    this.view.add(string)
  }

  complete() {
    for (let i = 0; i < this.model.data.length; i++) {
      if (this.model.data[i].id == this.input[3]) {
        this.model.data[i].status = "complete"
        this.model.data[i].completed_at = new Date()
        this.model.complete(this.model.data)
        // fs.writeFileSync('this.model.data.json', JSON.stringify(this.model.data), 'UTF-8')
      }
    }
  }

  uncomplete() {
    for (let i = 0; i < this.model.data.length; i++) {
      if (this.model.data[i].id == this.input[3]) {
        this.model.data[i].status = "uncomplete"
        this.model.uncomplete(this.model.data)
        // fs.writeFileSync('this.model.data.json', JSON.stringify(this.model.data), 'UTF-8')
      }
    }
  }

  delete() {
    this.model.data.splice(this.input[3]-1, 1)
    for (let i = this.input[3]-1; i < this.model.data.length;i++) {
      this.view.delete(this.model.data)
      // console.log(this.model.data);
      this.model.data[i].id--
    }
    this.model.delete(this.model.data)
    // fs.writeFileSync('this.model.data.json', JSON.stringify(this.model.data), 'UTF-8')
  }

  task(){
    for (let i =0; i<this.model.data.length; i++) {
      if (this.model.data[i].id == this.input[3]) {
        this.view.task(this.model.data[i])
        // console.log(this.model.data[i]);
        this.model.task(this.model.data)
        // fs.writeFileSync('this.model.data.json', JSON.stringify(this.model.data), 'UTF-8')
      }
    }
  }
}
// class Todo{
//
// }

let input = process.argv
let todos = new Controler(input)
todos.run()
