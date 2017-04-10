class Model{
  constructor(){
    this._list="";
  }

  get list()
  {
    var fs = require('fs');
    var str = fs.readFileSync('data.json');
    var list = JSON.parse(str);
    this._list=list;
    return this._list;
  }

  manipulasiOustandingAsc(){
    return this.list.sort(function(a,b) {
      return new Date(a.created_date).getTime()-new Date(b.created_date).getTime();});
    }
  manipulasiOustandingDesc(){
    return this.list.sort(function(b,a) {
      return new Date(a.created_date).getTime()-new Date(b.created_date).getTime();});
    }

    manipulasiCompletedAsc(){
      let hasil=[]
      for(let i=0; i<this.list.length;i++)
      {
        if(this.list[i]['complete']===true)
        hasil.push(this.list[i]);
      }
      return hasil.sort(function(a,b) {
        return new Date(a.completed_date).getTime()-new Date(b.completed_date).getTime();});
      }

    manipulasiCompletedDesc(){
      let hasil=[]
      for(let i=0; i<this.list.length;i++)
      {
        if(this.list[i]['complete']===true)
        hasil.push(this.list[i]);
      }
      return hasil.sort(function(b,a) {
        return new Date(a.completed_date).getTime()-new Date(b.completed_date).getTime();});
      }
    }


    class Control{
      constructor(){
        this._model = new Model();
        this._view = new View();
        this._argv =[];
      }

      argvProcess(){
        var arrPerintah=[];
        process.argv.forEach((val, index) => {
          let hasil=[];
          if(index>1)
          {
            arrPerintah.push(val)
          }
        });
        this._argv=arrPerintah;
      }
      tampilDataCtr(){
        if (this._argv[0]==="list") {
          let list = this._model.list;
          for (let i=0; i<list.length;i++) {
            if(list[i]["complete"]===true)
            this._view.tampilDataComplete(i,list[i]);
            else this._view.tampilDataUnComplete(i,list[i])
          }
        }
        else if (this._argv[0]==="outstanding") {
          if(this._argv[1]==="asc"){
            let list = this._model.manipulasiOustandingAsc();
            for (let i=0; i<list.length;i++) {
              if(list[i]["complete"]===true)
              this._view.tampilDataComplete(i,list[i]);
              else this._view.tampilDataUnComplete(i,list[i])
            }
          }else if(this._argv[1]==="desc"){
            let list = this._model.manipulasiOustandingDesc();
            for (let i=0; i<list.length;i++) {
              if(list[i]["complete"]===true)
              this._view.tampilDataComplete(i,list[i]);
              else this._view.tampilDataUnComplete(i,list[i])
            }
          }

        }
        else if (this._argv[0]==="completed") {
          if(this._argv[1]==="asc"){
            let list = this._model.manipulasiCompletedAsc();
            for (let i=0; i<list.length;i++)
            this._view.tampilDataComplete(i,list[i]);
          }
          else if(this._argv[1]==="desc"){
            let list = this._model.manipulasiCompletedDesc();
            for (let i=0; i<list.length;i++)
            this._view.tampilDataComplete(i,list[i]);
          }
        }
        else if(this._argv[0]==="add") {
          this.add(this._argv);
        }
        else if(this._argv[0]==="complete") {
          this.listComplete(this._argv[1]);
        }
        else if(this._argv[0]==="tag") {
          this.tag(this._argv);
        }
        else if(this._argv[0]==="delete") {
          this.hapus(this._argv[1]);
        }
        else if(this._argv[0]==="uncomplete") {
          this.uncomplete(this._argv[1]);
        }
        else this._view.tampilErrorOperasi();
      }

      add(input)
      {
        let obj={};
        let list = this._model.list
        input.shift();
        input = input.join(" ");
        obj.task=input;
        obj.complete=false;
        obj.created_date=Date();
        obj.completed_date=null;
        list.push(obj)
        var fs = require('fs');
        fs.writeFile("./data.json",JSON.stringify(list), function(err) {
          if(err)
          return console.log(err);
          console.log(list);
          console.log(`data ${input} berhasil ditambahkan`);
        });
      }
      listComplete(input)
      {
        let list = this._model.list
        let i=Number(input)-1;
        list[i].complete=true;
        list[i].completed_date= Date();
        var fs = require('fs');
        fs.writeFile("./data.json",JSON.stringify(list), function(err) {
          if(err)
          return console.log(err);
          console.log(list);
        });
      }
      tag(input)
      {
        let list = this._model.list;
        let index=+input[1]-1;
        input.shift();
        input.shift();
        for(let i=0; i<list.length;i++){
          if(index===i)
          list[i].tag=input;
        }
        var fs = require('fs');
        fs.writeFile("./data.json",JSON.stringify(list), function(err) {
          if(err)
          return console.log(err);
          console.log(`tag ${input} berhasil ditambahkan`);
        });
      }

      hapus(input)
      {
        let list = this._model.list;
        list.splice(Number(input-1),1);
        var fs = require('fs');
        fs.writeFile("./data.json",JSON.stringify(list), function(err) {
          if(err)
          return console.log(err);
          console.log(list);
        });
      }

      uncomplete(input)
      {
        let list = this._model.list;
        let i=Number(input)-1;
        list[i]["complete"]=false;
        list[i]["completed_date"]=null;
        var fs = require('fs');
        fs.writeFile("./data.json",JSON.stringify(list), function(err) {
          if(err)
          return console.log(err);
          console.log(list);
        });
      }


    }

    class View{
      constructor(){

      }
      tampilDataComplete(i,list){
        console.log(`\n${i+1}. [X] ${list["task"]}`);
        console.log(`Complete : ${list["complete"]}`);
        console.log(`Created_at : ${list["created_date"]}`);
        console.log(`Completed_at : ${list["completed_date"]}`);
        console.log(`Tag : ${list["tag"]}`);

      }
      tampilDataUnComplete(i,list){
        console.log(`\n${i+1}. [ ] ${list["task"]}`);
        console.log(`Complete : ${list["complete"]}`);
        console.log(`Created_at : ${list["created_date"]}`);
        console.log(`Completed_at : ${list["completed_date"]}`);
        console.log(`Tag : ${list["tag"]}`);
      }
      tampilErrorOperasi()
      {
        console.log(`Operasi yang diinputkan salah!`);
      }
    }

    var ctr = new Control();

    ctr.argvProcess();
    ctr.tampilDataCtr();

    //var model = new Model();
    //console.log(model.manipulasiOustanding())
