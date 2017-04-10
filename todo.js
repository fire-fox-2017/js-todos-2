"use strict"

const fs = require('fs');
class Model {
    constructor() {

        this._listData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    }

    save() {
        let tasks = JSON.stringify(this._listData);
        fs.writeFile('data.json', tasks, 'utf8', (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
    }

    delete(n) {
        for (let i = 0; i < this._listData.length; i++) {
            if (String(this._listData[i].id) === n) {
                this._listData.splice(i, 1);
                break;
            }
        }
        this.arrangeID();
        this.save();
    }

    filter(tag) {

        let data = [];
        for (let i = 0; i < this._listData.length; i++) {

            if (this._listData[i].tag.indexOf(tag) > -1) {
                data.push(this._listData[i]);
            }
        }

        if (data.length !== 0) {
            return data;

        } else {
            return false
        }


    }

    get data() {
        return this._listData;
    }

    done(n) {
        var tanggal = new Date();
        for (let i = 0; i < this._listData.length; i++) {
            if (String(this._listData[i].id) === n) {
                this._listData[i].complete = '[X]';
                this._listData[i].done = tanggal;
                break;
            }
        }
        this.save();
    }

    task(n) {
        for (let i = 0; i < this._listData.length; i++) {
            if (String(this._listData[i].id) === n) {
                return this._listData[i]
            }
        }
        return 'not found'
    }

    arrangeID() {
        for (let i = 0; i < this._listData.length; i++) {
            this._listData[i].id = (i + 1);
        }
    }

    add(string) {
        var tanggal = new Date();
        var tgl = `${tanggal.getDate()}-${tanggal.getMonth()}-${tanggal.getFullYear()}`;
        let iD = 0;
        this._listData.push({
            id: iD,
            task: string,
            complete: '[ ]',
            date: tanggal,
            done: '',
            tag: []
        });
        this.arrangeID();
        this.save();
    }

    notDone(n) {
        for (let i = 0; i < this._listData.length; i++) {

            if (String(this._listData[i].id) === n) {
                this._listData[i].complete = '[ ]';
                this._listData[i].done = '';
                break;
            }
        }
        this.save();
    }

    tag(n, data) {
        for (let i = 0; i < this._listData.length; i++) {
            if (String(this._listData[i].id) === n) {
                for (let j = 0; j < data.length; j++) {
                    this._listData[i].tag.push(data[j]);

                }


            }

        }
        this.save();
    }

}

class View {
    constructor() {

    }

    showList(data) {
        console.log(`${data.id}. ${data.complete} ${data.task}`);
    }

    showListComplete(data) {
        console.log(`${data.id}. ${data.complete} ${data.task} ${data.done}`);
    }

    showListOutstanding(data) {
        console.log(`${data.id}. ${data.complete} ${data.task} ${data.date}`);
    }

    showDataTag(data) {
        console.log(`${data.id}. ${data.task} [${data.tag}]`);

    }

    help() {
        console.log('1. Melihat daftar TODO dengan : list');
        console.log('2. Menambahkan TODO ke dalam list dengan : add <todo>');
        console.log('3. Melihat detail TODO dengan : task <id>');
        console.log('4. Menghapus TODO dengan : delete <id>');
        console.log('5. Menandai bahwa TODO selesai dengan dengan : complete <id>');
        console.log('6. Menandai bahwa TODO belum selesai dengan : uncomplete <id>');
        console.log('7. list completed : list:completed asc|desc');
        console.log('8. list outstanding : list:outstanding asc|desc');
        console.log('9. Melihat teks bantuan dengan : help');

    }

    tagged(id, data) {
        console.log(`Tagged task "${id.task} with tags: ${data}"`);

    }
}

class Controller {
    constructor() {
        this._model = new Model();
        this._view = new View();

    }
    initController() {
        let argv = process.argv

        if (argv.length > 1) {
            argv.shift();
            argv.shift();

            if (argv[0] == 'add') {
                argv.shift();
                let str = argv.join();
                str = str.replace(/,/g, " ");
                this.TambahTask(str);
            }

            if (argv[0] == 'task') {
                argv.shift();
                this.LihatTask(argv[0]);
            }

            if (argv[0] == 'list') {
                this.List();
            }

            if (argv[0] == 'delete') {
                argv.shift();
                this.hapus(argv[0]);
            }

            if (argv[0] == 'complete') {
                argv.shift();
                this.kelar(argv[0]);
            }

            if (argv[0] == 'uncomplete') {
                argv.shift();
                this.gKelar(argv[0]);
            }

            if (argv[0] == 'help') {
                this.tolong();
            }

            if (argv[0] == 'list:outstanding' && argv[1] == 'asc') {
                this.sortAsc();
            }
            if (argv[0] == 'list:outstanding' && argv[1] == 'desc') {
                this.sortDesc();
            }
            if (argv[0] == 'list:completed' && argv[1] == 'asc') {
                this.yangKelarAsc();
            }
            if (argv[0] == 'list:completed' && argv[1] == 'desc') {
                this.yangKelarDesc();
            }
            if (argv[0] == 'tag') {
                let data = argv.slice(2, argv.length);
                this.pasangTag(argv[1], data);
            }

            if (/filter/.test(argv[0])) {

                let tags = argv[0].slice(argv[0].indexOf(':') + 1, argv[0].length);
                this.saring(tags);
            }


        } else {
            console.log("no word detected");
        }

    }
    sortAsc() {
        let data = this._model.data;

        data.sort(function(a, b) {
            if (a.date < b.date)
                return -1;
            if (a.date > b.date)
                return 1;
            return 0;
        });

        for (let i = 0; i < data.length; i++) {
            this._view.showListOutstanding(data[i]);
        }
    }

    saring(tag) {

        let data = this._model.filter(tag);
        if (data == false) {

        } else {
            for (let i = 0; i < data.length; i++) {
                this._view.showDataTag(data[i]);

            }
        }


    }

    sortDesc() {
        let data = this._model.data;

        data.sort(function(a, b) {
            if (a.date < b.date)
                return -1;
            if (a.date > b.date)
                return 1;
            return 0;
        });

        for (let i = 0; i < data.length; i++) {
            this._view.showListOutstanding(data[i]);
        }
    }
    yangKelarAsc() {
        let data = this._model.data;
        data.sort(function(a, b) {
            if (a.done < b.done)
                return -1;
            if (a.done > b.done)
                return 1;
            return 0;
        });
        for (let i = 0; i < data.length; i++) {

            if (data[i].complete === '[X]') {

                this._view.showListComplete(data[i]);
            }
        }
    }
    yangKelardesc() {
        let data = this._model.data;
        data.sort(function(a, b) {
            if (a.done < b.done)
                return -1;
            if (a.done > b.done)
                return 1;
            return 0;
        });
        for (let i = 0; i < data.length; i++) {

            if (data[i].complete === '[X]') {

                this._view.showListComplete(data[i]);
            }
        }
    }

    pasangTag(id, data) {
        this._model.tag(id, data);
        let join = data.join();
        this._view.tagged(this._model.task(id), join);
    }


    TambahTask(data) {
        this._model.add(data);
    }

    hapus(n) {
        this._model.delete(n);
    }

    LihatTask(n) {
        this._view.showList(this._model.task(n));
    }

    kelar(n) {
        this._model.done(n);
    }
    gKelar(n) {
        this._model.notDone(n);

    }

    List() {
        let data = this._model.data;
        for (let i = 0; i < data.length; i++) {
            this._view.showList(data[i]);
        }
    }

    tolong() {
        this._view.help();

    }

}

let toDo = new Controller();
toDo.initController();
