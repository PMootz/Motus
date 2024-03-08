//show the user if connected
$.get('/user', function(data){
    if(!(data === 'undefined')){
        $('#users').text(data);
    }
})

$.get('/mess2', function(data){
    if(!(data === 'undefined')){
        $('#mess').text(data);
    }
})

//create the new user in the json
function validateForm() {
   var id = $('#log').val();
    var passW = $('#pass').val();
    var passW2 = $('#pass2').val();
    //check if all the input data are completed
    if (id.trim() === "" || passW.trim() === ""|| passW2.trim() === "") {
        alert("Veuillesz remplir les 3 champs");
        return false; // Stop further execution
    }
    //check if the password and confirmation are the same
    if(passW===passW2){
        console.log(pass)
        return true;

    }
    else{
        alert("Les 2 mots de passe rentré ne sont pas identique");
        return false; // Stop further execution
    }
}