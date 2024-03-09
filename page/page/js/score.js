const tableBody = document.getElementById('table');
var dataArray

//Call the data from the score in order to display
// For now it show only the first score, but we plan to show the user and below the five highest user
    $.get('http://localhost:3010/getScore',function(data){
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

//Set the logout 
document.getElementById("user").addEventListener("click", function(event){
    console.log("here")
    $.get('/logout')
})

//Show user if connected
$.get('/user', function(data){
    if(!(data === 'undefined')){
        $('#user').text(data);
    }
})