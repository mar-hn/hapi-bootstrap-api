//====================
// Dependencies
//====================
const securityCtrl = fw.getController('security');

//====================
// Dependencies
//====================
module.exports = 
[
    { 
        method: 'POST', path: '/auth', 
        options: 
        { 
            handler: securityCtrl.validateAuth.bind(securityCtrl), // Use bind if you want to have access to 'this' keyword inside class
            validate:
            {
                payload:
                {
                    username: fw.joi.string().required(),
                    password: fw.joi.string().required()
                }
            }
        } 
    }
];