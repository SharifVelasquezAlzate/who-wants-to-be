let columns = document.getElementsByClassName('horizontalColumn');
let horizontalColumn = '';
let score = '';
let username = '';
let heightReference = columns[0].getBoundingClientRect().height;
let y = heightReference + 15;
let counter = 0;

const leaderboardColumns = [];

//Functions
function sortByKey(array, key){
    return array.sort(function(a, b){
        var x = a[key]; var y = b[key];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}

for(let i = 0; i < columns.length; i++){
    horizontalColumn = columns.item(i);
    score = horizontalColumn.querySelector('.score').innerText;
    username = horizontalColumn.querySelector('.username').innerText;
    //horizontalColumn.style.width = `${parseInt(score)*10}%`;
    console.log("AND THIS IS THE WIDTH:", horizontalColumn.style.width);
    leaderboardColumns.push({'username' : username, 'score' : parseInt(score)});
}

sortByKey(leaderboardColumns, 'score');

leaderboardColumns.forEach(element => {
    for(let i = 0; i < columns.length; i++){
        horizontalColumn = columns.item(i);
        username = horizontalColumn.querySelector('.username').innerText;
        if (element.username === username){
            horizontalColumn.style.transform = `translateY(${(counter) * y - (i + 1) * y + 55}px)`;
        }
    }
    counter++;
})
