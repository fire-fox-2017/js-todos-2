const fs = require('fs')
class Model {
  constructor(){
    this.data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
  }
  overWrite(list){
    fs.writeFileSync('data.json', JSON.stringify(list), 'utf8')
  }
}
class View {
  static helpList(){
    console.log('node todo.js (will call help)')
    console.log('node todo.js help')
    console.log('node todo.js list')
    console.log('node todo.js add <task_content>')
    console.log('node todo.js task <task_id>')
    console.log('node todo.js delete <task_id>')
    console.log('node todo.js complete <task_id>')
    console.log('node todo.js list:outstanding asc|desc')
    console.log('node todo.js list:completed asc|desc')
    console.log('node todo.js tag <task_id> <name_1> <name_2>')
    console.log('node todo.js filter: <tag_name>')
  }
  static add(task){
    console.log(`Added ${task} to your TODO list...`)
  }
  static delete(task){
    console.log(`Deleted ${task} from your TODO list...`)
  }
  static completed(con,num){
    console.log(`${con[num].id}. [X] ${con[num].task}`)
  } 
  static incomplete(con,num){
    console.log(`${con[num].id}. [ ] ${con[num].task}`)
  }
  static incompleteDate(con,num){
    console.log(`${con[num].id}. [ ] ${con[num].task}, created at ${con[num].createddate}`)
  }
  static completedDate(con,num){
    console.log(`${con[num].id}. [X] ${con[num].task}, completed at ${con[num].completeddate}`)
  }
  static filterTag(con,num){
    console.log(`${con[num].id}. ${con[num].task} [${con[num].tag}]`)
  }
}
var c = new Model
class Controller {
  constructor(){
    this.list = c.data
  }
  help(){
    View.helpList();
  }
  addTask(task){
    if(this.list.length===0){
      this.list.push(new Task(1, task, Date()))
      c.overWrite(this.list)
    } else { 
      this.list.push(new Task(this.list[this.list.length-1].id+1 , task, Date()))
      c.overWrite(this.list)
    }
    View.add(task)
  }
  listTasks(){
    for(let i=0; i<this.list.length; i++){
      if(this.list[i].status === true){
        View.completed(this.list,i)
      }
      if(this.list[i].status === false){
        View.incomplete(this.list,i)
      }
    }
  }
  viewTask(id){
    for(let i=0; i<this.list.length; i++){
      if(this.list[i].id === Number(id)){
        if(this.list[i].status === true){
          View.completed(this.list,i)
        }
        if(this.list[i].status === false){
          View.incomplete(this.list,i)
        }
      }
    }
  }
  deleteTask(id){
    for(let i=0; i<this.list.length; i++){
      if(this.list[i].id === Number(id)){
        View.delete(this.list[i].task)
        this.list.splice(i,1);
        c.overWrite(this.list)
      }
    }
  }
  completeTask(id){
    for(let i=0; i<this.list.length; i++){
      if(this.list[i].id === Number(id)){
        this.list[i].status = true
        this.list[i].completeddate = Date()
        c.overWrite(this.list)
      }
    }
  }
  incompleteTask(id){
    for(let i=0; i<this.list.length; i++){
      if(this.list[i].id === Number(id)){
        this.list[i].status = false
        this.list[i].completeddate = null
        c.overWrite(this.list)
      }
    }
  }
  listOutstanding(sort){
    if (sort==='asc'){
      for(let i=0; i<this.list.length; i++){
        if(this.list[i].status === false){
          View.incompleteDate(this.list,i)
        }
      }
    } else if(sort==='desc'){
      for(let i=this.list.length-1; i>=0; i--){
        if(this.list[i].status === false){
          View.incompleteDate(this.list,i)
        }
      }
    }
  }
  listCompleted(sort){
    let arr=[]
    for(let i=0; i<this.list.length; i++){
      if(this.list[i].status === true){
        arr.push(this.list[i])
      }
    }
    if(sort==='asc'){
      arr=arr.sort(function(a, b) { 
        return a.completeddate > b.completeddate;
      })
    } else if (sort==='desc'){
      arr=arr.sort(function(a, b) { 
        return a.completeddate < b.completeddate;
      })
    }
    for(let i=0; i<arr.length; i++){
      View.completedDate(arr,i)
    }
  }
  tag(id, arr){
    for(let i=0; i<this.list.length; i++){
      if(this.list[i].id === Number(id)){
        this.list[i].tag = arr;
        c.overWrite(this.list)
      }
    }
  }
  filter(tag){
    for(let i=0; i<this.list.length; i++){
      for(let j=0; j<this.list[i].tag.length; j++){
        if(this.list[i].tag[j] === tag){
          View.filterTag(this.list, i)
        }
      }
    }
  }
}
class Task {
  constructor(id, task, createddate, completeddate, status){
    this.id=id
    this.task=task
    this.createddate=createddate
    this.completeddate=completeddate || null
    this.status=status || false
    this.tag=[]
  }
}
var x = new Controller()
if(process.argv[2] === undefined || process.argv[2] === 'help'){
  x.help()
} else if(process.argv[2] === 'list'){
  x.listTasks()
} else if(process.argv[2] === 'add'){
  x.addTask(process.argv.slice(3).join(" "))
} else if(process.argv[2] === 'task'){
  x.viewTask(process.argv[3])
} else if(process.argv[2] === 'delete'){
  x.deleteTask(process.argv[3])
} else if(process.argv[2] === 'complete'){
  x.completeTask(process.argv[3])
} else if(process.argv[2] === 'incomplete'){
  x.incompleteTask(process.argv[3])
} else if(process.argv[2] === 'list:outstanding'){
  x.listOutstanding(process.argv[3])
} else if(process.argv[2] === 'list:completed'){
  x.listCompleted(process.argv[3])
} else if(process.argv[2] === 'tag'){
  x.tag(process.argv[3],process.argv.slice(4))
} else if(process.argv[2] === 'filter:'){
  x.filter(process.argv[3])
}