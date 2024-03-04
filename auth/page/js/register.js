$.get('/user', function(data){
    if(!(data === 'undefined')){
        $('#user').text(data);
    }
})

document.getElementById("creation").addEventListener("click", function(event){
    event.preventDefault();
   var id = $('#log').val();
    var passW = $('#pass').val();
    var passW2 = $('#pass2').val();
    const form = new FormData(event.target)
    const formData = Object.fromEntries(form.entries());
    if (id.trim() === "" || passW.trim() === ""|| passW2.trim() === "") {
        alert("Veuillesz remplir les 3 champs");
        return; // Stop further execution
    }
    if(passW===passW2){
        console.log(formData)
        //const res = await fetch('redisCall',{
        //    body: JSON
        //})
        
        $.get('/create?user='+id +'&pass='+passW,function(data){
            $('#reponse').html(data);
        })

    }
    else{
        alert("Les 2 mots de passe rentré ne sont pas identique");
        return; // Stop further execution
    }
})