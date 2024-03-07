//show the user if connected
$.get('/user', function(data){
    if(!(data === 'undefined')){
        $('#user').text(data);
    }
})