//show the user if connected
$.get('/user', function(data){
    if(!(data === 'undefined')){
        $('#user').text(data);
    }
})

//
document.getElementById("connexion").addEventListener("click", function(event){
    //cancel the defaut action of the button
    event.preventDefault();
    var id = $('#log').val();
    var passW = $('#pass').val();
    //check if all the field are completed
    if (id.trim() === "" || passW.trim() === "") {
        alert("Veuillez entrer des valeurs dans les 2 cases");
        return; // Stop further execution
    }
    //check if the connection input are right or not
    $.get('/login?user='+id +'&pass='+passW,function(data){
        $('#reponse').html(data);
    })
})