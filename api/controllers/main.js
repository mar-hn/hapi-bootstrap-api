//====================
// Dependencies
//====================
// - None

class mainController 
{
    async main()
    {
        return fw.promise(async (resolve, reject) => 
        {
            // Make response object
            let stResponse = { success: true, message: 'Hello World!' };
            
            //Do something ...

            //Return response
            resolve(stResponse);
        });
    }

    async greet(request,h)
    {
        return fw.promise(async (resolve, reject) => 
        {
            // Make response object
            let stResponse = { success: true, message: '' };
            
            stResponse.message = `Hello ${request.params.name}!`;
    
            //Return response
            resolve(stResponse);
        });
    }
}

module.exports = new mainController();