//show the user if connected
$.get('/user', function(data){
    if(!(data === 'undefined')){
        $('#users').text(data);
    }
})

$.get('/mess', function(data){
    if(!(data === 'undefined')){
        $('#mess').text(data);
    }
})

function validateForm() {
    var id = $('#user').val();
    var passW = $('#pass').val();
    if (id.trim() === "" || passW.trim() === "") {
        alert("Veuillez entrer des valeurs dans les 2 cases");
        return false; // Stop further execution
    }
    else{
        return true;
    }
  } 