$.get('/user', function(data){
    if(!(data === 'undefined')){
        $('#user').text(data);
    }
})

document.getElementById("connexion").addEventListener("click", function(event){
    event.preventDefault();
    var id = $('#log').val();
    var passW = $('#pass').val();
    if (id.trim() === "" || passW.trim() === "") {
        alert("Veuillez entrer des valeurs dans les 2 cases");
        return; // Stop further execution
    }
    $.get('/login?user='+id +'&pass='+passW,function(data){
        $('#reponse').html(data);
    })
})