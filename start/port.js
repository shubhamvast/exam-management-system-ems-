module.exports = function(app) {

    const PORT = 3001

    app.listen(PORT,()=>{
        console.log("listening on "+PORT);
    })
}