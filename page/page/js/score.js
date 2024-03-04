const tableBody = document.getElementById('table');
var dataArray
$.get('http://localhost:3002/getScore',function(data){
    dataArray = data;
    dataArray = dataArray.split(';');
    let row = document.createElement('tr');
    let pseu = document.createElement('th');
    let scor = document.createElement('td');
    let avg = document.createElement('td');
    pseu.append(dataArray[2]);
    scor.append(dataArray[0])
    avg.append(dataArray[1])
    row.appendChild(pseu)
    row.appendChild(scor)
    row.appendChild(avg)
    tableBody.appendChild(row)
})
$.get('/user', function(data){
    if(!(data === 'undefined')){
        $('#user').text(data);
    }
})